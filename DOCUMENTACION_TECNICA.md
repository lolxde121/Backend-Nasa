# 📘 Documentación Técnica — Lum / AgroMonitor

**Versión:** 2.0.0 (Frontend Unificado con Backend Satelital)  
**Fecha:** Noviembre 2026  
**Proyecto:** Plataforma Integral de Gestión Agrícola y Asistencia Inteligente con Telemetría Satelital de la NASA  

---

## 1. Resumen Ejecutivo y Propósito

**Lum (AgroMonitor)** es una plataforma agronómica concebida para agricultores principiantes, pequeños productores y agricultores en transición agroecológica. Su objetivo principal es democratizar el acceso a la ciencia de datos espaciales y climáticos de la **NASA**, transformando variables satelitales complejas (temperatura de superficie, irradiancia, radiometría de microondas y reflectancia espectral) en **asistencia operativa práctica, alertas tempranas y recomendaciones de riego e itinerario de cultivos**.

El sistema integra:
1. **Presentación visual Lum:** Diseño centrado en el usuario, paleta institucional "Agua y cielo" (`#0B3D91`, `#4FA3E0`, `#2BB3A3`), interfaz basada en vidrio (`backdrop-blur`), tarjetas informativas, animaciones de retroalimentación inmediata, microinteracciones y adaptabilidad móvil.
2. **Capa Lógica y Backend REST:** Servidor en Node.js 26 y Express, base de datos persistente SQLite nativa con soporte GeoJSON, y servicios satelitales en vivo que consultan APIs de la NASA (POWER, SMAP y MODIS) con mecanismos de caché y respaldo.

---

## 2. Arquitectura General del Sistema

```
┌────────────────────────────────────────────────────────────────────────┐
│                   Cliente Web & Móvil — "Lum"                          │
│       React 18 + Vite + Tailwind CSS 3 + Recharts + Lucide Icons       │
├────────────────────────────────────────────────────────────────────────┤
│ • Dashboard de control agronómico con KPIs y ranking hídrico           │
│ • "Mis terrenos" con filtrado dinámico, búsqueda y ordenamiento         │
│ • Georreferenciación de parcelas con GPS móvil y trazado de límites    │
│ • Ficha técnica del terreno con telemetría NASA (POWER, SMAP, MODIS)   │
│ • Motor de recomendaciones de cultivo y rotación agronómica            │
│ • Asistencia de riego con IA: "Regar hoy", "Esperar lluvia", "No regar"│
│ • Gráficas multivariables a 30 días, 24 horas y pronóstico a 7 días    │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │  HTTP / REST JSON
┌───────────────────────────────────▼────────────────────────────────────┐
│                    Servidor API REST (Express.js)                      │
│                           Puerto: 5000                                 │
├───────────────────────┬────────────────────────┬───────────────────────┤
│  /api/terrenos        │  /api/seguimientos     │  /api/nasa            │
│  (CRUD parcelas)      │  (Control de riego IA) │  (Clima satelital)    │
├───────────────────────┴────────────────────────┴───────────────────────┤
│                Motor de Telemetría Satelital NASA                      │
│   • NASA POWER Climatology (T2M, PRECTOTCORR, RH2M, Solar Rad)         │
│   • NASA SMAP Radiometer L3/L4 (Humedad Superficial y Radicular)       │
│   • NASA MODIS Terra/Aqua 250m (Índice de Vegetación NDVI & EVI)       │
├────────────────────────────────────────────────────────────────────────┤
│                Motor Experto de Recomendaciones Agrícolas              │
│   • Compatibilidad edafoclimática (suelo, agua, ciclo, temperatura)    │
│   • Detección de riesgos fitosanitarios y consejos de manejo           │
└───────────────────────────────────▲────────────────────────────────────┘
                                    │  SQL Nativo (DatabaseSync)
┌───────────────────────────────────▼────────────────────────────────────┐
│             Base de Datos Embebida (SQLite 3 Nativo)                   │
│   Tablas: terrenos | metricas_satelitales_cache | seguimientos         │
│           | recomendaciones_cultivos                                   │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Capa de Presentación y Experiencia de Usuario (Frontend Lum)

El frontend adopta la estética de **Lum**:

### A. Paleta de Color Institucional y Tokens
* **Azul Marino Principal (`primary`):** `#0B3D91` — Inspirado en la identidad aeronáutica y satelital de la NASA; utilizado en botones primarios, títulos destacados y marcas activas.
* **Azul Cielo / Agua (`sky`):** `#4FA3E0` — Representa el recurso hídrico, lluvia y humedad; utilizado en gráficos de humedad, bordes de enfoque y acentos.
* **Menta / Vegetación (`mint`):** `#2BB3A3` — Estado óptimo de salud vegetal, éxito en riego y vigor de la vegetación (NDVI).
* **Fondo Niebla (`fog`):** `#F2F7FB` — Gradientes radiales suaves que reducen la fatiga visual en campo.
* **Tinta / Texto (`ink`):** `#0F1F33` — Alto contraste y legibilidad para condiciones de luz solar directa.
* **Tipografías:** `Sora` (títulos y números de impacto) y `Plus Jakarta Sans` (cuerpo de texto y fichas técnicas).

### B. Módulos y Vistas Implementadas

| Vista | Componente | Funcionalidad Clave | Conexión Backend |
|---|---|---|---|
| **Inicio / Dashboard** | `Dashboard.jsx` | Resumen ejecutivo del predio: temperatura media, humedad promedio, terrenos con necesidad hídrica, alertas activas y gráfico comparativo de tendencias. | Consolida datos de `/api/terrenos`. |
| **Mis Terrenos** | `Terrenos.jsx` | Lista interactiva de tarjetas con estado (`Saludable`, `Requiere riego`, `Monitoreando`), búsqueda por nombre/localidad, filtrado por cultivo y ordenamiento múltiple. | `GET /api/terrenos`. |
| **Crear / Editar Terreno** | `ParcelForm.jsx` | Formulario en dos paneles: a la izquierda datos agronómicos (cultivo, textura de suelo interactiva, riego, superficie) y a la derecha mapa interactivo con modos pin/polígono y botón de GPS **"Usar mi ubicación"**. | `POST /api/terrenos`, `PUT /api/terrenos/:id`. |
| **Detalle del Terreno** | `ParcelDetail.jsx` | Ficha técnica con KPIs interactivos (temperatura con sparkline, humedad SMAP, precipitación 30 días, último riego), pronóstico a 5 días, visualizador territorial, telemetría satelital NASA en vivo y modal de umbrales de alerta. | `GET /api/terrenos/:id`, `GET /api/terrenos/:id/nasa-data`. |
| **Recomendaciones** | `Recomendaciones.jsx` | Catálogo de cultivos recomendados calibrados por compatibilidad porcentual con la parcela activa, consejos de rotación tras maíz y filtros por demanda de agua o ciclo corto. | `GET /api/terrenos/:id/recomendaciones`. |
| **Detalle Recomendación** | `RecDetail` | Explicación técnica de la compatibilidad (por qué este cultivo, fijación de nitrógeno, ciclo) y ficha del cultivo con opción directa de siembra. | Vinculado a motor de recomendaciones. |
| **Seguimiento de Riego** | `Seguimiento.jsx` | Monitor de parcelas bajo seguimiento agronómico, clasificadas por la recomendación inteligente: *Regar hoy*, *Esperar lluvia* o *No regar*. | `GET /api/seguimientos`. |
| **Nuevo Seguimiento** | `SegForm.jsx` | Registro del cultivo sembrado, fecha de siembra y fecha del último riego (con accesos directos: "Hoy", "Ayer", "Hace 3 días"). | `POST /api/seguimientos`. |
| **Análisis Satelital** | `Analyzing.jsx` | Pantalla intermedia de transición animada que informa al agricultor sobre el procesamiento de la telemetría y el cálculo de evapotranspiración. | Transición a `/segdetail`. |
| **Detalle de Seguimiento** | `SegDetail.jsx` | Banner contextual hero con la recomendación de la IA, análisis de justificación (¿Por qué?), pronóstico de precipitación para los próximos 7 días con gráfico de milímetros, historial de riego y modal para **"Registrar riego"**. | `POST /api/seguimientos/:id/riego`. |
| **Gráficas Analíticas** | `Graficas.jsx` | Centro de telemetría gráfica con Recharts: curvas de temperatura, humedad, lluvia acumulada, variación en 24 horas, comparativas entre terrenos y pronósticos a 5 y 7 días. | Datos consolidados de terrenos y seguimientos. |

---

## 4. Persistencia y Base de Datos (SQLite Nativo)

El backend utiliza el módulo estándar `node:sqlite` (`DatabaseSync`), asegurando cero dependencias externas de bases de datos y compatibilidad directa en cualquier entorno.

### Esquema de Tablas

```sql
-- 1. Parcelas agrícolas registradas
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

-- 2. Caché y telemetría de satélites NASA
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

-- 3. Módulo de Seguimiento y Recomendación de Riego con IA
CREATE TABLE seguimientos (
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

-- 4. Recomendaciones agronómicas históricas
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

## 5. Integración con Satélites de la NASA

Ubicado en `server/services/nasaService.js`:

1. **NASA POWER API (`T2M`, `PRECTOTCORR`, `RH2M`, `ALLSKY_SFC_SW_DWN`):**
   * Consulta climatológica e irradiancia solar en coordenadas exactas.
   * Proporciona temperatura media, rangos diurnos y acumulado de lluvias.
2. **NASA SMAP (Soil Moisture Active Passive L3/L4):**
   * Calibra la saturación volumétrica del suelo en la capa superficial (0-5 cm) y zona radicular (0-100 cm).
   * Modula la retención hídrica según la textura del suelo (`Arenosa`, `Franca`, `Arcillosa`, `Franco-arcillosa`).
3. **NASA MODIS (Sensor Terra/Aqua NDVI 250m):**
   * Estima el verdor vegetal y cobertura del dosel fotosintético para identificar estrés por sequía o senescencia prematura.
4. **Mecanismo de Resiliencia en Campo:**
   * Las consultas exitosas se almacenan en caché SQLite por 6 horas.
   * En caso de indisponibilidad de red en campo o latencia satelital, entra en funcionamiento el modelo de extrapolación climática calibrada para que la plataforma nunca interrumpa la operación.

---

## 6. Motor de Asistencia de Riego y Recomendaciones con IA

### Lógica de Recomendación de Riego (`recommend`)
Evalúa los días sin regar ($ds$), la probabilidad e intensidad de lluvia pronosticada a 7 días y la textura del suelo:
* **"No riegues hoy" (`dry`):** Se activa cuando llovió recientemente, cuando la probabilidad de lluvia para hoy supera el 50%, o cuando el riego se realizó hace 1 día o menos y el suelo aún conserva humedad.
* **"Espera la lluvia, no riegues aún" (`wait`):** Se activa cuando se pronostican lluvias significativas ($\ge 5\text{ mm}$ y $\ge 60\%$) en los próximos 2 a 5 días y los días sin regar son menores a 6.
* **"Riega hoy" (`water`):** Se activa cuando han transcurrido los días críticos para la etapa vegetativa del cultivo y no hay precipitaciones significativas proyectadas en la semana.

---

## 7. Catálogo Completo de Rutas API REST

| Método | Endpoint | Parámetros / Body | Descripción |
|---|---|---|---|
| `GET` | `/api/health` | Ninguno | Estado de la API, satélites y SQLite |
| `GET` | `/api/terrenos` | Ninguno | Lista todas las parcelas con telemetría satelital |
| `POST` | `/api/terrenos` | JSON con datos del terreno | Registra una nueva parcela y sincroniza con NASA |
| `GET` | `/api/terrenos/:id` | `id` en ruta | Ficha técnica de una parcela |
| `PUT` | `/api/terrenos/:id` | JSON de actualización | Actualiza información agronómica o delimitación |
| `DELETE` | `/api/terrenos/:id` | `id` en ruta | Elimina una parcela y su histórico en cascada |
| `GET` | `/api/terrenos/:id/nasa-data` | `id` en ruta | Telemetría satelital NASA en vivo/caché |
| `GET` | `/api/terrenos/:id/recomendaciones`| `id` en ruta | Evaluación agronómica de cultivos compatibles |
| `GET` | `/api/seguimientos` | Ninguno | Lista todos los seguimientos y estado de riego |
| `POST` | `/api/seguimientos` | JSON `{ pid, crop, sow, lastWater, forecast, hist }` | Registra un nuevo ciclo de cultivo bajo monitoreo |
| `POST` | `/api/seguimientos/:id/riego` | JSON `{ date, tone, label }` | Registra un riego en el historial y recalcula IA |
| `DELETE` | `/api/seguimientos/:id` | `id` en ruta | Elimina un seguimiento |
| `GET` | `/api/nasa/clima-punto` | `?lat=...&lon=...&suelo=...` | Consulta telemetría en vivo para cualquier coordenada |
| `GET` | `/api/nasa/cultivos-catalogo` | Ninguno | Catálogo agronómico base de cultivos calibrados |

---

## 8. Guía de Ejecución y Despliegue

### Requisitos del Sistema
* Node.js v20.x o v22+ (detectado Node.js v26 en el entorno)
* npm v10+

### Modos de Ejecución

```bash
# 1. Instalación de dependencias (raíz, servidor y cliente)
npm run install:all

# 2. Modo Desarrollo (Levanta backend en :5000 y Vite HMR en :5173)
npm run dev

# 3. Modo Producción (Compila el cliente optimizado y lo sirve desde Express en el puerto 5000)
npm run build
npm start

# Abrir en el navegador:
# http://localhost:5000
```
