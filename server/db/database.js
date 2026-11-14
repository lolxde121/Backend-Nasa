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
  `);

  // Check if we need to seed initial demo plots
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM terrenos');
  const result = countStmt.get();

  if (result.count === 0) {
    console.log('🌱 Inicializando terrenos de muestra para agricultores...');
    const insertStmt = db.prepare(`
      INSERT INTO terrenos (
        nombre, propietario, descripcion, ubicacion, latitud, longitud, 
        area_hectareas, tipo_suelo, fuente_agua, cultivo_actual, estado, poligono_geojson
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const demoTerrenos = [
      {
        nombre: 'Parcela La Esperanza - Valle Central',
        propietario: 'Roberto Méndez (Agricultor principiante)',
        descripcion: 'Terreno plano de llanura aluvial, recién adquirido para proyecto de transición agroecológica.',
        ubicacion: 'Tlajomulco de Zúñiga, Jalisco',
        latitud: 20.4735,
        longitud: -103.4478,
        area_hectareas: 8.5,
        tipo_suelo: 'Franco arcilloso',
        fuente_agua: 'Pozo profundo y temporal',
        cultivo_actual: 'Maíz Blanco',
        estado: 'En producción',
        poligono: JSON.stringify([
          [20.4755, -103.4500],
          [20.4755, -103.4450],
          [20.4715, -103.4450],
          [20.4715, -103.4500]
        ])
      },
      {
        nombre: 'Rancho Las Palmas - Sector Norte',
        propietario: 'María Elena Salazar',
        descripcion: 'Ladera suave con buena exposición solar, ideal para granos y leguminosas.',
        ubicacion: 'Culiacán, Sinaloa',
        latitud: 24.8090,
        longitud: -107.3940,
        area_hectareas: 14.2,
        tipo_suelo: 'Franco limoso',
        fuente_agua: 'Canal de riego por gravedad',
        cultivo_actual: 'Frijol Pinto',
        estado: 'En preparación',
        poligono: JSON.stringify([
          [24.8120, -107.3970],
          [24.8120, -107.3910],
          [24.8060, -107.3910],
          [24.8060, -107.3970]
        ])
      },
      {
        nombre: 'Huerto El Mezquite',
        propietario: 'Carlos Gutiérrez',
        descripcion: 'Microclima templado semiárido con suelo bien drenado.',
        ubicacion: 'Celaya, Guanajuato (Bajío)',
        latitud: 20.5280,
        longitud: -100.8160,
        area_hectareas: 5.0,
        tipo_suelo: 'Franco arenoso',
        fuente_agua: 'Riego por goteo tecnificado',
        cultivo_actual: 'Tomate Saladette',
        estado: 'En producción',
        poligono: JSON.stringify([
          [20.5310, -100.8190],
          [20.5310, -100.8130],
          [20.5250, -100.8130],
          [20.5250, -100.8190]
        ])
      }
    ];

    for (const t of demoTerrenos) {
      insertStmt.run(
        t.nombre,
        t.propietario,
        t.descripcion,
        t.ubicacion,
        t.latitud,
        t.longitud,
        t.area_hectareas,
        t.tipo_suelo,
        t.fuente_agua,
        t.cultivo_actual,
        t.estado,
        t.poligono
      );
    }
    console.log('✅ 3 terrenos de prueba creados.');
  }
}

initDatabase();

module.exports = db;
