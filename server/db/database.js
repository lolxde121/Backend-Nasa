const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'terrenos.db');

// Ensure db directory exists
const dbDir = path.dirname(dbPath);
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

// Enable foreign keys
db.exec('PRAGMA foreign_keys = ON;');

// Initialize schema
function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS terrenos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      propietario TEXT NOT NULL,
      descripcion TEXT,
      ubicacion TEXT,
      latitud REAL NOT NULL,
      longitud REAL NOT NULL,
      area_hectareas REAL NOT NULL,
      tipo_suelo TEXT DEFAULT 'Franco',
      clima_zona TEXT DEFAULT 'Templado',
      fuente_agua TEXT DEFAULT 'Temporal',
      cultivo_actual TEXT DEFAULT 'Sin cultivo',
      estado TEXT DEFAULT 'Activo',
      poligono_geojson TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS metricas_satelitales_cache (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      terreno_id INTEGER,
      latitud REAL NOT NULL,
      longitud REAL NOT NULL,
      temperatura_promedio REAL,
      temperatura_max REAL,
      temperatura_min REAL,
      precipitacion_acumulada REAL,
      humedad_relativa REAL,
      humedad_suelo_smap REAL,
      indice_vegetacion_ndvi REAL,
      radiacion_solar REAL,
      calidad_vegetacion TEXT,
      condicion_hidrica TEXT,
      fuente TEXT,
      datos_completos_json TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (terreno_id) REFERENCES terrenos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS recomendaciones_cultivos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      terreno_id INTEGER,
      cultivo TEXT NOT NULL,
      nombre_cientifico TEXT,
      compatibilidad_porcentaje INTEGER NOT NULL,
      nivel_aptitud TEXT NOT NULL,
      temporada_optima TEXT,
      requerimiento_agua TEXT,
      tiempo_cosecha_dias INTEGER,
      rendimiento_estimado_ton_ha REAL,
      alertas TEXT,
      consejos_practicos TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (terreno_id) REFERENCES terrenos(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS seguimientos (
      id TEXT PRIMARY KEY,
      terreno_id INTEGER NOT NULL,
      cultivo TEXT NOT NULL,
      fecha_siembra TEXT NOT NULL,
      ultimo_riego TEXT NOT NULL,
      lluvia_ayer INTEGER DEFAULT 0,
      pronostico_json TEXT,
      historial_json TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (terreno_id) REFERENCES terrenos(id) ON DELETE CASCADE
    );
  `);

  // Reset or initialize seed data to match AgroMonitor Figma design
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM terrenos');
  const result = countStmt.get();

  if (result.count === 0) {
    console.log('🌱 Inicializando terrenos del diseño AgroMonitor (Figma)...');
    seedFigmaTerrenos();
  }

  const countSegStmt = db.prepare('SELECT COUNT(*) as count FROM seguimientos');
  const segResult = countSegStmt.get();
  if (segResult.count === 0) {
    seedSeguimientos();
  }
}

function seedSeguimientos() {
  const insertStmt = db.prepare(`
    INSERT INTO seguimientos (
      id, terreno_id, cultivo, fecha_siembra, ultimo_riego, lluvia_ayer, pronostico_json, historial_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const initialSegs = [
    {
      id: 's1',
      terreno_id: 1,
      cultivo: 'Maíz',
      sow: '2026-06-20',
      lastWater: '2026-11-11',
      lluvia_ayer: 0,
      forecast: [[10, 0], [5, 0], [20, 1], [40, 2], [80, 12], [50, 4], [15, 0]],
      hist: [
        { id: 'h1', d: '2026-11-11', tone: 'ok', label: 'Seguiste la recomendación' },
        { id: 'h2', d: '2026-11-03', tone: 'ok', label: 'Seguiste la recomendación' },
        { id: 'h3', d: '2026-10-26', tone: 'warn', label: 'Un día después de lo sugerido' }
      ]
    },
    {
      id: 's2',
      terreno_id: 2,
      cultivo: 'Jitomate',
      sow: '2026-09-03',
      lastWater: '2026-11-08',
      lluvia_ayer: 0,
      forecast: [[3, 0], [0, 0], [5, 0], [2, 0], [4, 0], [0, 0], [5, 0]],
      hist: [
        { id: 'h4', d: '2026-11-08', tone: 'ok', label: 'Seguiste la recomendación' },
        { id: 'h5', d: '2026-11-01', tone: 'ok', label: 'Seguiste la recomendación' }
      ]
    },
    {
      id: 's3',
      terreno_id: 3,
      cultivo: 'Frijol',
      sow: '2026-08-15',
      lastWater: '2026-11-13',
      lluvia_ayer: 1,
      forecast: [[60, 6], [20, 1], [10, 0], [5, 0], [0, 0], [5, 0], [10, 0]],
      hist: [
        { id: 'h6', d: '2026-11-13', tone: 'ok', label: 'Seguiste la recomendación' },
        { id: 'h7', d: '2026-11-05', tone: 'ok', label: 'Seguiste la recomendación' }
      ]
    },
    {
      id: 's4',
      terreno_id: 1,
      cultivo: 'Chile',
      sow: '2026-10-10',
      lastWater: '2026-11-09',
      lluvia_ayer: 0,
      forecast: [[5, 0], [0, 0], [5, 0], [3, 0], [5, 0], [10, 1], [0, 0]],
      hist: [
        { id: 'h8', d: '2026-11-09', tone: 'ok', label: 'Seguiste la recomendación' },
        { id: 'h9', d: '2026-11-03', tone: 'warn', label: 'Un día después de lo sugerido' }
      ]
    }
  ];

  for (const s of initialSegs) {
    try {
      insertStmt.run(
        s.id,
        s.terreno_id,
        s.cultivo,
        s.sow,
        s.lastWater,
        s.lluvia_ayer,
        JSON.stringify(s.forecast),
        JSON.stringify(s.hist)
      );
    } catch (e) {
      // Ignorar si ya existía
    }
  }

}

function seedFigmaTerrenos() {
  const insertStmt = db.prepare(`
    INSERT INTO terrenos (
      nombre, propietario, descripcion, ubicacion, latitud, longitud, 
      area_hectareas, tipo_suelo, clima_zona, fuente_agua, cultivo_actual, estado, poligono_geojson
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const demoTerrenos = [
    {
      nombre: 'Parcela El Roble',
      propietario: 'Roberto Méndez (Agricultor)',
      descripcion: 'Suelo fértil con buen drenaje, cerca de la zona lacustre de Texcoco.',
      ubicacion: 'Texcoco, Edo. Méx.',
      latitud: 19.5124,
      longitud: -98.8828,
      area_hectareas: 8.5,
      tipo_suelo: 'Franco-arcillosa',
      clima_zona: 'Templado',
      fuente_agua: 'Pozo profundo y temporal',
      cultivo_actual: 'Maíz Blanco',
      estado: 'Activo',
      poligono: JSON.stringify([
        [19.5150, -98.8850],
        [19.5150, -98.8800],
        [19.5100, -98.8800],
        [19.5100, -98.8850]
      ]),
      metrics: { temp: 24.3, hum: 31, ndvi: 0.68 }
    },
    {
      nombre: 'Rancho Los Pinos',
      propietario: 'María Elena Salazar',
      descripcion: 'Llanura amplia con suelo arcilloso pesado.',
      ubicacion: 'Zumpango, Edo. Méx.',
      latitud: 19.7972,
      longitud: -99.0986,
      area_hectareas: 14.2,
      tipo_suelo: 'Arcillosa',
      clima_zona: 'Semiárido',
      fuente_agua: 'Canal de riego por gravedad',
      cultivo_actual: 'Frijol Pinto',
      estado: 'Activo',
      poligono: JSON.stringify([
        [19.8000, -99.1020],
        [19.8000, -99.0950],
        [19.7940, -99.0950],
        [19.7940, -99.1020]
      ]),
      metrics: { temp: 26.0, hum: 27, ndvi: 0.54 }
    },
    {
      nombre: 'Huerta La Esperanza',
      propietario: 'Carlos Gutiérrez',
      descripcion: 'Valle templado al pie de la montaña, excelente para hortalizas y frutales.',
      ubicacion: 'Atlixco, Puebla',
      latitud: 18.9083,
      longitud: -98.4322,
      area_hectareas: 5.0,
      tipo_suelo: 'Franco-arenosa',
      clima_zona: 'Templado',
      fuente_agua: 'Riego por goteo',
      cultivo_actual: 'Tomate Saladette',
      estado: 'Activo',
      poligono: JSON.stringify([
        [18.9110, -98.4350],
        [18.9110, -98.4290],
        [18.9050, -98.4290],
        [18.9050, -98.4350]
      ]),
      metrics: { temp: 22.0, hum: 35, ndvi: 0.72 }
    },
    {
      nombre: 'Terreno Norte',
      propietario: 'Antonio Flores',
      descripcion: 'Suelo limoso con topografía ligeramente ondulada.',
      ubicacion: 'Tulancingo, Hidalgo',
      latitud: 20.0833,
      longitud: -98.3667,
      area_hectareas: 10.0,
      tipo_suelo: 'Limosa',
      clima_zona: 'Semiárido',
      fuente_agua: 'Temporal',
      cultivo_actual: 'Cebada',
      estado: 'Activo',
      poligono: JSON.stringify([
        [20.0860, -98.3700],
        [20.0860, -98.3630],
        [20.0800, -98.3630],
        [20.0800, -98.3700]
      ]),
      metrics: { temp: 25.0, hum: 24, ndvi: 0.47 }
    }
  ];

  const insertMetricStmt = db.prepare(`
    INSERT INTO metricas_satelitales_cache (
      terreno_id, latitud, longitud, temperatura_promedio, temperatura_max, 
      temperatura_min, precipitacion_acumulada, humedad_relativa, humedad_suelo_smap, 
      indice_vegetacion_ndvi, radiacion_solar, calidad_vegetacion, condicion_hidrica, 
      fuente, datos_completos_json
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const t of demoTerrenos) {
    const res = insertStmt.run(
      t.nombre,
      t.propietario,
      t.descripcion,
      t.ubicacion,
      t.latitud,
      t.longitud,
      t.area_hectareas,
      t.tipo_suelo,
      t.clima_zona,
      t.fuente_agua,
      t.cultivo_actual,
      t.estado,
      t.poligono
    );

    const tid = res.lastInsertRowid;
    insertMetricStmt.run(
      tid,
      t.latitud,
      t.longitud,
      t.metrics.temp,
      t.metrics.temp + 4.5,
      t.metrics.temp - 5.5,
      18.4,
      48.0,
      t.metrics.hum,
      t.metrics.ndvi,
      21.5,
      'Favorable',
      'Adecuada',
      'NASA POWER API & SMAP',
      JSON.stringify({
        metadata: {
          fuente: 'NASA POWER Climatology (T2M) & SMAP',
          estado_fuente: 'NASA_LIVE',
          coordenadas: { lat: t.latitud, lon: t.longitud },
          elevacion_msnm: 2240,
          mes_evaluado: 'NOV',
          fecha_consulta: new Date().toISOString()
        },
        clima: {
          temperatura_actual_promedio_c: t.metrics.temp,
          temperatura_anual_promedio_c: t.metrics.temp - 1.2,
          temperatura_mensual: {
            OCT15: t.metrics.temp - 2.1,
            OCT24: t.metrics.temp - 1.0,
            NOV03: t.metrics.temp + 1.2,
            NOV14: t.metrics.temp
          },
          precipitacion_mes_actual_mm: 18.4,
          precipitacion_diaria_promedio_mm: 0.6,
          precipitacion_anual_acumulada_mm: 620,
          humedad_relativa_porcentaje: 48,
          radiacion_solar_mj_m2_dia: 21.5
        },
        smap: {
          mision: 'NASA SMAP (Soil Moisture Active Passive L3/L4)',
          humedad_superficie_porcentaje: t.metrics.hum,
          humedad_volumetrica_m3_m3: parseFloat((t.metrics.hum * 0.004).toFixed(3)),
          humedad_zona_radicular_porcentaje: Math.round(t.metrics.hum * 0.95),
          condicion_humedad: 'Adecuada',
          recomendacion_riego: 'Humedad en rango óptimo para desarrollo radicular.',
          nivel_alerta: 'normal'
        },
        modis: {
          sensor: 'NASA MODIS (Terra/Aqua MOD13Q1 250m NDVI)',
          ndvi_actual: t.metrics.ndvi,
          clasificacion_vigor: 'Vigor vegetal óptimo y activo',
          color_hex: '#2BB3A3',
          interpretacion_agronomica: 'Canopia vegetal activa, adecuada fotosíntesis y cobertura foliar.',
          evi_indice_mejorado: parseFloat((t.metrics.ndvi * 0.88).toFixed(2))
        }
      })
    );
  }
  console.log('✅ 4 terrenos del diseño AgroMonitor inicializados.');
}

initDatabase();

db.seedFigmaTerrenos = seedFigmaTerrenos;
module.exports = db;
