# 📘 Documentación Técnica — AgroMonitor (Módulo Terrenos)

**Versión:** 1.0.0  
**Fecha:** Noviembre 2026  
**Proyecto:** Plataforma de Asistencia Agrícola Inteligente con Telemetría Satelital de la NASA  

---

## 1. Resumen Ejecutivo y Propósito

**AgroMonitor** es una plataforma diseñada para resolver la problemática crítica que enfrentan los **agricultores nuevos o en transición agroecológica**: la falta de conocimientos agronómicos técnicos y la dificultad para acceder a datos agroclimáticos locales, oportunos y confiables.

El **Módulo de Terrenos** es el núcleo operativo inicial donde el productor registra y delimita sus parcelas. A partir de las coordenadas geográficas de cada terreno, el sistema consulta satélites de observación terrestre para inferir automáticamente el clima, el estado hídrico del suelo y el verdor de la vegetación, transformando variables científicas complejas en **asistencia práctica y recomendaciones de cultivo comprensibles**.

---

## 2. Arquitectura General del Sistema

El sistema implementa una arquitectura desacoplada y modular:

```
┌────────────────────────────────────────────────────────┐
│                   Cliente Web & Móvil                  │
│       React 18 + Vite + Tailwind CSS + Leaflet Maps    │
│    (Estilo AgroMonitor: Paleta "Agua y cielo" de Figma)│
└───────────────────────────▲────────────────────────────┘
                            │  HTTP / REST JSON
┌───────────────────────────▼────────────────────────────┐
│                    Servidor API REST                   │
│             Node.js 26 + Express.js + CORS             │
├───────────────────────────┬────────────────────────────┤
│   Módulo de Terrenos      │   Motor de Recomendaciones │
│   (CRUD y Georreferencia) │   (Compatibilidad de IA)   │
├───────────────────────────┴────────────────────────────┤
│           Servicio Satelital NASA Integrado            │
│   • NASA POWER API (Temperatura, Lluvia, Radiación)   │
│   • NASA SMAP (Humedad Superficial y Radicular)        │
│   • NASA MODIS (NDVI e Índice de Vegetación)           │
└───────────────────────────▲────────────────────────────┘
                            │  SQL Nativo
┌───────────────────────────▼────────────────────────────┐
│             Base de Datos Embebida (SQLite)            │
│  Módulo 'node:sqlite' nativo con compatibilidad GeoJSON│
└────────────────────────────────────────────────────────┘
```

---

## 3. Modelo de Base de Datos y Persistencia

### Decisión de la Base de Datos
Se eligió **SQLite nativo** utilizando la librería `node:sqlite` (`DatabaseSync` de Node.js):
1. **Cero fricción de arranque:** No requiere instalar ni configurar servicios adicionales de bases de datos. Funciona de inmediato al clonar el repositorio.
2. **Soporte Geoespacial:** Almacena polígonos perimetrales y coordenadas en formato GeoJSON estándar.
3. **Migración a Producción:** La estructura SQL es completamente compatible con **PostgreSQL + PostGIS** cuando el proyecto escale a producción multi-región.

### Esquema de Tablas

```sql
-- Parcelas agrícolas registradas
CREATE TABLE terrenos (
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

-- Caché de telemetría de satélites NASA para rendimiento inmediato
CREATE TABLE metricas_satelitales_cache (
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

-- Inferencia histórica de recomendaciones agronómicas
CREATE TABLE recomendaciones_cultivos (
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
```

---

## 4. Integración con Satélites de la NASA

El backend implementa tres modelos satelitales complementarios a través de `server/services/nasaService.js`:

| Satélite / Misión | Parámetro | Sensor / Endpoint | Uso en AgroMonitor |
|---|---|---|---|
| **NASA POWER** | Temperatura 2m (`T2M`) | Climatología e irradiancia satelital | Curva de temperatura de los últimos 30 días, promedios mensuales y riesgo térmico. |
| **NASA POWER** | Precipitación (`PRECTOTCORR`) | MERRA-2 / Satélites climáticos | Régimen de lluvias en mm/día y mm/mes acumulados. |
| **NASA SMAP** | Humedad de suelo | Radiómetro en banda L (L3/L4) | Saturación superficial (0-5 cm) y zona radicular (0-100 cm). Calibra retención hídrica según la textura del suelo. |
| **NASA MODIS** | NDVI y EVI | Espectrorradiómetro Terra/Aqua 250m | Índice de verdor de la vegetación (-1 a +1), densidad foliar y vigor de la canopia. |

> [!NOTE]
> Las consultas a la NASA se realizan mediante endpoints públicos abiertos que no requieren claves comerciales pagadas. En caso de intermitencia de red, el servicio cuenta con un modelo de extrapolación climática de respaldo para que la plataforma nunca deje de responder en campo.

---

## 5. Motor de Recomendaciones Agronómicas (IA)

Ubicado en `server/services/recommendationService.js`, el motor evalúa las variables edafoclimáticas de la parcela frente a un catálogo agrícola calibrado:

1. **Puntaje de Compatibilidad (0 a 100%):**
   * **Térmico:** Compara la temperatura media con el rango óptimo del cultivo (penalización por riesgo de golpe de calor o heladas).
   * **Edafológico:** Compara el tipo de tierra (`Franco`, `Arcillosa`, `Arenosa`, `Limosa`, `Franco-arcillosa`) con el desarrollo radicular predilecto.
   * **Hídrico:** Cruza la disponibilidad de agua del productor (`Riego por goteo`, `Pozo profundo`, `Temporal`) con la demanda del ciclo.
   * **Estacional:** Determina si el mes actual se encuentra dentro de la ventana de siembra recomendada.
2. **Generación de Alertas Tempranas:** Alerta al productor sobre riesgos de plagas habituales (ej. gusano cogollero en maíz, tizón tardío en tomate con alta humedad, fusarium en frijol).
3. **Guía Práctica:** Proporciona instrucciones de profundidad de siembra, fertilización balanceada y momento crítico de riego.

---

## 6. Capa Visual y Diseño de Interfaz (Frontend)

El frontend sigue con fidelidad las especificaciones del diseño **AgroMonitor** (paleta "Agua y cielo"):

### A. Estructura de Navegación y Vistas
* **Barra Lateral (`Sidebar.jsx`):** Menú vertical accesible con las secciones `Inicio`, `Terrenos` (activo), `Recomendaciones`, `Seguimiento`, `Gráficas` y tarjeta de usuario `Agricultor`.
* **Vista 1: "Mis terrenos" (`TerrenosList.jsx`):**
  * Título, subtítulo y botón de acción principal `+ Crear terreno` (`#0B3D91`).
  * Buscador rápido por nombre, municipio o agricultor, con contador dinámico de parcelas registradas.
  * Tarjetas de terreno con previsualización cartográfica superior, etiquetas de tipo de tierra (`Franco-arcillosa`) y clima (`Templado`), y barra inferior de telemetría (`🌡️ 24 °C`, `💧 31 %`, `🌿 0.68`).
* **Vista 2: "Crear terreno" (`CrearTerrenoView.jsx`):**
  * Distribución a 2 columnas según mockup:
    * **Izquierda (Datos del terreno):** Nombre del terreno, selector de píldoras interactivas de textura de suelo (`Arcillosa`, `Arenosa`, `Limosa`, `Franca`, `Franco-arcillosa`, `Otro`) y selector de clima de la zona.
    * **Derecha (Ubicación del terreno):** Campo de búsqueda de direcciones, mapa satelital interactivo con botón **"Usar mi ubicación"** (GPS del dispositivo), entradas numéricas de latitud/longitud y aviso informativo de consulta satelital automática.
* **Vista 3: "Detalle del Terreno" (`TerrenoDetail.jsx`):**
  * Miga de pan de navegación y botón `Editar terreno`.
  * **Tarjeta izquierda:** Ficha técnica con miniatura de mapa, ubicación, coordenadas GPS, tipo de tierra y clima promedio.
  * **Tarjeta derecha:** Indicador de temperatura con sello `NASA POWER`, valor destacado `24.3 °C` y gráfica de onda continua azul (`#4FA3E0`) con marcadores de fecha (`15 oct`, `24 oct`, `3 nov`, `14 nov`).
  * **Tarjetas inferiores:** Sensores SMAP (humedad del suelo con barra de saturación) y MODIS (índice NDVI), más recomendaciones de cultivo desplegables.

---

## 7. Catálogo de Rutas de la API REST

| Método | Endpoint | Parámetros / Body | Descripción |
|---|---|---|---|
| `GET` | `/api/health` | Ninguno | Estado del servicio, base de datos y satélites |
| `GET` | `/api/terrenos` | Ninguno | Lista completa de parcelas con resumen satelital |
| `POST` | `/api/terrenos` | `{ nombre, propietario, latitud, longitud, area_hectareas, tipo_suelo, clima_zona, ... }` | Registra una nueva parcela e inicia sincronización satelital |
| `GET` | `/api/terrenos/:id` | `id` (parámetro de ruta) | Ficha técnica completa de una parcela |
| `PUT` | `/api/terrenos/:id` | `{ ...campos_a_actualizar }` | Actualiza la información de una parcela |
| `DELETE` | `/api/terrenos/:id` | `id` (parámetro de ruta) | Elimina una parcela y su histórico |
| `GET` | `/api/terrenos/:id/nasa-data` | `id` (parámetro de ruta) | Telemetría satelital NASA en vivo y en caché |
| `GET` | `/api/terrenos/:id/recomendaciones` | `id` (parámetro de ruta) | Recomendaciones agronómicas generadas por IA |
| `GET` | `/api/nasa/clima-punto` | `?lat=...&lon=...&suelo=...` | Consulta telemetría en vivo para cualquier coordenada del mapa |

---

## 8. Guía Rápida para el Equipo de Desarrollo

### Requisitos
* Node.js v20+ o v22+ (detectado Node.js en el entorno)
* Git

### Ejecución
```bash
# 1. Instalar dependencias del servidor y del cliente
npm run install:all

# 2. Levantar entorno de desarrollo
npm run dev
# Frontend: http://localhost:5173
# Backend:  http://localhost:5000

# 3. Compilar para producción (servidor único express que entrega la web y la API)
npm run build
npm start
# Aplicación completa en: http://localhost:5000
```

---

## 9. Historial de Commits en Git

1. `feat: initial commit - Módulo Terrenos con API REST, base de datos SQLite, cliente React y telemetría satelital NASA (POWER, SMAP, MODIS)`
2. `style: align UI design with AgroMonitor Figma specification (Agua y Cielo palette, sidebar, card layouts, and telemetry charts)`
