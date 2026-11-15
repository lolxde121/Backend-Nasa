const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { fetchAgroClimaticData } = require('../services/nasaService');
const { evaluateCropRecommendations } = require('../services/recommendationService');

// GET /api/terrenos - Lista todos los terrenos con telemetría satelital NASA
router.get('/', async (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM terrenos ORDER BY id DESC');
    const terrenos = stmt.all();

    // Enriquecer cada terreno con su última métrica satelital real de la NASA
    const cacheStmt = db.prepare('SELECT * FROM metricas_satelitales_cache WHERE terreno_id = ? ORDER BY updated_at DESC LIMIT 1');
    
    const enriched = await Promise.all(terrenos.map(async (t) => {
      let metric = cacheStmt.get(t.id);
      if (!metric) {
        try {
          await fetchAgroClimaticData(t.latitud, t.longitud, t.id, t.tipo_suelo);
          metric = cacheStmt.get(t.id);
        } catch (e) {
          // Ignorar si falla la llamada puntual
        }
      }
      let fullData = null;
      if (metric?.datos_completos_json) {
        try { fullData = JSON.parse(metric.datos_completos_json); } catch (e) {}
      }
      return {
        ...t,
        poligono: t.poligono_geojson ? JSON.parse(t.poligono_geojson) : null,
        resumen_satelital: metric ? {
          temperatura: metric.temperatura_promedio,
          precipitacion: metric.precipitacion_acumulada,
          humedad_smap: metric.humedad_suelo_smap,
          ndvi: metric.indice_vegetacion_ndvi,
          calidad_vegetacion: metric.calidad_vegetacion,
          condicion_hidrica: metric.condicion_hidrica,
          fuente: metric.fuente,
          elevacion: fullData?.metadata?.elevacion_msnm || null,
          clima_clasificacion: fullData?.clima?.clima_clasificacion || t.clima_zona || 'Templado',
          updated_at: metric.updated_at
        } : null
      };
    }));

    res.json({
      success: true,
      total: enriched.length,
      data: enriched
    });
  } catch (error) {
    console.error('Error al obtener terrenos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/terrenos/:id - Obtiene un terreno por ID
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM terrenos WHERE id = ?');
    const terreno = stmt.get(id);

    if (!terreno) {
      return res.status(404).json({ success: false, error: 'Terreno no encontrado' });
    }

    res.json({
      success: true,
      data: {
        ...terreno,
        poligono: terreno.poligono_geojson ? JSON.parse(terreno.poligono_geojson) : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/terrenos - Registra un nuevo terreno
router.post('/', async (req, res) => {
  try {
    const {
      nombre,
      propietario,
      descripcion = '',
      ubicacion = 'México',
      latitud,
      longitud,
      area_hectareas,
      tipo_suelo = 'Franco',
      clima_zona = 'Templado',
      fuente_agua = 'Temporal',
      cultivo_actual = 'Sin cultivo',
      estado = 'Activo',
      poligono = null
    } = req.body;

    const finalArea = (area_hectareas && parseFloat(area_hectareas) > 0) ? parseFloat(area_hectareas) : 5.0;
    const finalCultivo = cultivo_actual && cultivo_actual !== 'Sin cultivo' ? cultivo_actual : 'Por definir (Ver recomendaciones)';

    if (!nombre || latitud === undefined || longitud === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Los campos nombre, latitud y longitud son obligatorios.'
      });
    }

    const finalPropietario = propietario || 'Agricultor';
    const poligonoJson = poligono ? JSON.stringify(poligono) : null;

    const stmt = db.prepare(`
      INSERT INTO terrenos (
        nombre, propietario, descripcion, ubicacion, latitud, longitud,
        area_hectareas, tipo_suelo, clima_zona, fuente_agua, cultivo_actual, estado, poligono_geojson
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      nombre,
      finalPropietario,
      descripcion,
      ubicacion,
      parseFloat(latitud),
      parseFloat(longitud),
      finalArea,
      tipo_suelo,
      clima_zona,
      fuente_agua,
      finalCultivo,
      estado,
      poligonoJson
    );

    const newId = result.lastInsertRowid;

    // Obtener y cachear métricas reales de la NASA para este nuevo terreno
    let agroData = null;
    try {
      agroData = await fetchAgroClimaticData(parseFloat(latitud), parseFloat(longitud), newId, tipo_suelo);
      if (agroData && agroData.clima) {
        const realClima = agroData.clima.clima_clasificacion || clima_zona || 'Templado';
        db.prepare('UPDATE terrenos SET clima_zona = ? WHERE id = ?').run(realClima, newId);
      }
    } catch (err) {
      console.warn('Consulta a NASA durante registro:', err.message);
    }

    res.status(201).json({
      success: true,
      message: 'Terreno registrado exitosamente con telemetría NASA en vivo',
      data: {
        id: newId,
        nombre,
        propietario: finalPropietario,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
        area_hectareas: finalArea,
        tipo_suelo,
        clima_zona: agroData?.clima?.clima_clasificacion || clima_zona || 'Templado',
        resumen_satelital: agroData ? {
          temperatura: agroData.clima.temperatura_actual_promedio_c,
          precipitacion: agroData.clima.precipitacion_mes_actual_mm,
          humedad_smap: agroData.smap.humedad_superficie_porcentaje,
          ndvi: agroData.modis.ndvi_actual,
          calidad_vegetacion: agroData.modis.clasificacion_vigor,
          condicion_hidrica: agroData.smap.condicion_humedad,
          fuente: agroData.metadata.fuente
        } : null
      }
    });
  } catch (error) {
    console.error('Error al registrar terreno:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// PUT /api/terrenos/:id - Actualiza un terreno existente
router.put('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      propietario,
      descripcion,
      ubicacion,
      latitud,
      longitud,
      area_hectareas,
      tipo_suelo,
      clima_zona,
      fuente_agua,
      cultivo_actual,
      estado,
      poligono
    } = req.body;

    const currentStmt = db.prepare('SELECT * FROM terrenos WHERE id = ?');
    const existing = currentStmt.get(id);

    if (!existing) {
      return res.status(404).json({ success: false, error: 'Terreno no encontrado' });
    }

    const updatedPoligono = poligono !== undefined 
      ? (poligono ? JSON.stringify(poligono) : null) 
      : existing.poligono_geojson;

    const updateStmt = db.prepare(`
      UPDATE terrenos SET
        nombre = ?,
        propietario = ?,
        descripcion = ?,
        ubicacion = ?,
        latitud = ?,
        longitud = ?,
        area_hectareas = ?,
        tipo_suelo = ?,
        clima_zona = ?,
        fuente_agua = ?,
        cultivo_actual = ?,
        estado = ?,
        poligono_geojson = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      nombre || existing.nombre,
      propietario || existing.propietario,
      descripcion !== undefined ? descripcion : existing.descripcion,
      ubicacion || existing.ubicacion,
      latitud !== undefined ? parseFloat(latitud) : existing.latitud,
      longitud !== undefined ? parseFloat(longitud) : existing.longitud,
      area_hectareas !== undefined ? parseFloat(area_hectareas) : existing.area_hectareas,
      tipo_suelo || existing.tipo_suelo,
      clima_zona || existing.clima_zona || 'Templado',
      fuente_agua || existing.fuente_agua,
      cultivo_actual || existing.cultivo_actual,
      estado || existing.estado,
      updatedPoligono,
      id
    );

    res.json({
      success: true,
      message: 'Terreno actualizado correctamente'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/terrenos/:id - Elimina un terreno
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM terrenos WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Terreno no encontrado' });
    }

    res.json({ success: true, message: 'Terreno eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/terrenos/:id/nasa-data - Obtiene métricas satelitales NASA POWER, SMAP y MODIS
router.get('/:id/nasa-data', async (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM terrenos WHERE id = ?');
    const terreno = stmt.get(id);

    if (!terreno) {
      return res.status(404).json({ success: false, error: 'Terreno no encontrado' });
    }

    const data = await fetchAgroClimaticData(terreno.latitud, terreno.longitud, terreno.id, terreno.tipo_suelo);
    res.json({
      success: true,
      terreno_id: terreno.id,
      terreno_nombre: terreno.nombre,
      data
    });
  } catch (error) {
    console.error('Error al obtener datos NASA para el terreno:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/terrenos/:id/recomendaciones - Genera recomendaciones de cultivos y asistencia agronómica
router.get('/:id/recomendaciones', async (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('SELECT * FROM terrenos WHERE id = ?');
    const terreno = stmt.get(id);

    if (!terreno) {
      return res.status(404).json({ success: false, error: 'Terreno no encontrado' });
    }

    // Obtener datos agroclimáticos actuales de la NASA
    const agroData = await fetchAgroClimaticData(terreno.latitud, terreno.longitud, terreno.id, terreno.tipo_suelo);
    
    // Generar evaluación con el motor experto de recomendaciones
    const recommendations = evaluateCropRecommendations(terreno, agroData);

    res.json({
      success: true,
      data: recommendations
    });
  } catch (error) {
    console.error('Error al generar recomendaciones:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
