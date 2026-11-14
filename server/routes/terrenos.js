const express = require('express');
const router = express.Router();
const db = require('../db/database');
const { fetchAgroClimaticData } = require('../services/nasaService');
const { evaluateCropRecommendations } = require('../services/recommendationService');

// GET /api/terrenos - Lista todos los terrenos
router.get('/', async (req, res) => {
  try {
    const stmt = db.prepare('SELECT * FROM terrenos ORDER BY id DESC');
    const terrenos = stmt.all();

    // Enriquecer cada terreno con su última métrica satelital si existe
    const cacheStmt = db.prepare('SELECT * FROM metricas_satelitales_cache WHERE terreno_id = ? ORDER BY updated_at DESC LIMIT 1');
    
    const enriched = terrenos.map(t => {
      const metric = cacheStmt.get(t.id);
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
          updated_at: metric.updated_at
        } : null
      };
    });

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

    if (!nombre || !propietario || latitud === undefined || longitud === undefined || !area_hectareas) {
      return res.status(400).json({
        success: false,
        error: 'Los campos nombre, propietario, latitud, longitud y área en hectáreas son obligatorios.'
      });
    }

    const poligonoJson = poligono ? JSON.stringify(poligono) : null;

    const stmt = db.prepare(`
      INSERT INTO terrenos (
        nombre, propietario, descripcion, ubicacion, latitud, longitud,
        area_hectareas, tipo_suelo, clima_zona, fuente_agua, cultivo_actual, estado, poligono_geojson
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      nombre,
      propietario,
      descripcion,
      ubicacion,
      parseFloat(latitud),
      parseFloat(longitud),
      parseFloat(area_hectareas),
      tipo_suelo,
      clima_zona,
      fuente_agua,
      cultivo_actual,
      estado,
      poligonoJson
    );

    const newId = result.lastInsertRowid;

    // Obtener y cachear automáticamente métricas de la NASA para este nuevo terreno
    fetchAgroClimaticData(parseFloat(latitud), parseFloat(longitud), newId, tipo_suelo)
      .catch(err => console.warn('Consulta en background a NASA falló:', err.message));

    res.status(201).json({
      success: true,
      message: 'Terreno registrado exitosamente',
      data: {
        id: newId,
        nombre,
        propietario,
        latitud: parseFloat(latitud),
        longitud: parseFloat(longitud),
        area_hectareas: parseFloat(area_hectareas)
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
