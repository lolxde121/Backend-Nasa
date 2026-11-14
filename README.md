# 🌾 AgroAsist — Módulo de Terrenos y Asistencia Agrícola Inteligente

Prototipo funcional full-stack para el **Módulo Terrenos (Web y Móvil)** diseñado para apoyar a **agricultores principiantes** y productores agrícolas mediante la integración de **telemetría satelital en tiempo real de la NASA (NASA POWER, SMAP y MODIS)**, un motor de **recomendaciones agronómicas con IA** y un **visor geoespacial interactivo** con soporte para mapas satelitales y Google Maps.

---

## 🎯 Problemática y Solución

* **Problemática:** Los agricultores principiantes sufren la falta de conocimientos técnicos debido a la escasez de fuentes confiables, datos agroclimáticos locales de difícil acceso o dispersos, lo que deriva en pérdidas de cosechas, siembras fuera de fecha o estrés hídrico.
* **Solución:** Una plataforma centralizada donde el agricultor registra y delimita su terreno en el mapa, y el sistema automáticamente analiza:
  1. **Temperatura:** Promedios mensuales, extremos y acumulación térmica (NASA POWER T2M).
  2. **Precipitación:** Régimen de lluvias en mm/día y mm/mes (NASA POWER PRECTOTCORR).
  3. **Humedad del Suelo:** Sensor satelital **NASA SMAP** (L3/L4) evaluando saturación superficial (0-5 cm) y zona radicular (0-100 cm).
  4. **Vigor Vegetal:** Sensor **NASA MODIS** (Terra/Aqua MOD13Q1) calculando índice de verdor **NDVI** (250m) y EVI.
  5. **Asistencia Agronómica con IA:** Evaluación de compatibilidad de cultivos (Maíz, Frijol, Trigo, Tomate, Chile, Sorgo, Aguacate), calendario óptimo de siembra, alertas tempranas de plagas/enfermedades y consejos prácticos para evitar pérdidas.

---

## 🏗️ Arquitectura del Sistema

```
logicaPrototipo/
├── server/                           # Backend API REST (Node.js & Express)
│   ├── db/
│   │   └── database.js               # Base de datos SQLite nativa con seeders
│   ├── routes/
│   │   ├── terrenos.js               # CRUD completo de parcelas y endpoints satelitales
│   │   └── nasa.js                   # Telemetría puntual por coordenada en el mapa
│   ├── services/
│   │   ├── nasaService.js            # Cliente NASA POWER API en vivo + SMAP + MODIS
│   │   └── recommendationService.js  # Motor de inferencia agronómica y catálogo de cultivos
│   ├── package.json
│   └── server.js                     # Servidor HTTP y entrega del frontend estático
├── client/                           # Frontend React (Vite + Tailwind CSS + Leaflet)
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # Barra superior con selector Web/Móvil y estado satelital
│   │   │   ├── TerrenosList.jsx      # Panel de KPIs, buscador, filtros por suelo y tarjetas
│   │   │   ├── TerrenoDetail.jsx     # Vista detallada con pestañas NASA, IA y Mapa
│   │   │   ├── NasaDataCard.jsx      # Indicadores satelitales visuales (Temp, Lluvia, SMAP, NDVI)
│   │   │   ├── CropRecommendations.jsx # Asistencia agronómica y guía para agricultores
│   │   │   ├── MapView.jsx           # Mapa interactivo dual (Esri Satelital / Google Maps)
│   │   │   └── TerrenoFormModal.jsx  # Formulario con botón de geolocalización GPS
│   │   ├── services/
│   │   │   └── api.js                # Cliente HTTP para la API
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
├── package.json                      # Scripts concurrentes para levantar todo con un solo comando
├── .env.example                      # Configuración de variables de entorno
└── README.md
```

---

## 🗄️ Elección de Base de Datos

Para este prototipo se implementó **SQLite** a través del módulo nativo `node:sqlite` (`DatabaseSync` de Node.js):
1. **Cero configuración requerida:** No requiere instalar ni levantar servicios externos pesados como PostgreSQL o MySQL; se ejecuta al instante en cualquier computadora.
2. **Compatibilidad Geoespacial:** Almacena coordenadas (latitud, longitud) y polígonos perimetrales en formato **GeoJSON** estándar.
3. **Migración transparente a PostgreSQL / PostGIS:** Las sentencias SQL y estructuras creadas son 100% compatibles con PostgreSQL para cuando el equipo pase a producción masiva.

### Esquema de Tablas
* `terrenos`: Información de la parcela (nombre, agricultor, coordenadas, área en hectáreas, tipo de suelo, fuente de agua, cultivo actual, polígono GeoJSON).
* `metricas_satelitales_cache`: Caché de lecturas de la NASA (temperatura, precipitación, SMAP, NDVI, radiación solar) para garantizar respuestas instantáneas en campo.
* `recomendaciones_cultivos`: Historial y registro de compatibilidad edafoclimática calculada para cada parcela.

---

## 🛰️ Integración con APIs de la NASA

1. **NASA POWER Climatology & Daily API:**
   * Endpoint consultado en tiempo real: `https://power.larc.nasa.gov/api/temporal/climatology/point`
   * Parámetros: `T2M` (Temperatura a 2m), `PRECTOTCORR` (Precipitación corregida), `RH2M` (Humedad relativa), `ALLSKY_SFC_SW_DWN` (Irradiancia solar).
   * **No requiere clave de pago:** Es un servicio abierto de la NASA con acceso público directo.
2. **NASA SMAP (Soil Moisture Active Passive):**
   * Calibrado según tipo de textura de suelo (Franco, Arcilloso, Arenoso, Limoso) y balance hídrico, calculando humedad superficial volumétrica ($m^3/m^3$ y porcentaje) y diagnosticando si se requiere riego de auxilio inmediato o si existe saturación/asfixia.
3. **NASA MODIS (Terra/Aqua MOD13Q1):**
   * Estimación del índice de verdor de la vegetación (NDVI entre 0.15 y 0.88) para determinar vigor vegetal, densidad de la canopia y anomalías foliares.

---

## 🗺️ Mapa Interactivo y Google Maps API

El módulo incluye un visor cartográfico con dos motores integrados:
1. **Motor Esri World Imagery & OpenStreetMap (Por Defecto):**
   * **100% funcional sin API Key:** Permite probar el prototipo de inmediato sin bloqueos de facturación de Google Cloud.
   * Proporciona ortofotos satelitales de alta resolución.
2. **Motor Google Maps API:**
   * Soporta activación dinámica ingresando la clave en la interfaz (botón 🔑) o mediante la variable `VITE_GOOGLE_MAPS_API_KEY` en el archivo `.env`.
3. **Telemetría Automática en Mapa:**
   * Al hacer clic en cualquier punto del mapa, el sistema consulta de forma instantánea las métricas satelitales de la NASA para esa coordenada y permite presionar **"Registrar nuevo terreno aquí"** con las coordenadas pre-cargadas.

---

## 🚀 Instrucciones de Instalación y Ejecución

### Requisitos Previos
* Node.js v20+ o v22+ (detectado Node.js en el sistema)
* npm

### Paso 1: Clonar o entrar al directorio
```bash
cd /home/edgar/Descargas/logicaPrototipo
```

### Paso 2: Instalar dependencias
```bash
npm run install:all
```

### Paso 3: Iniciar en Modo Desarrollo (Backend + Frontend)
```bash
npm run dev
```
* **Frontend React (Vite):** `http://localhost:5173`
* **Backend API REST:** `http://localhost:5000`

### Paso 4: Iniciar en Modo Producción (Servidor unificado)
```bash
npm run build
npm start
```
* Abre tu navegador en: `http://localhost:5000`

---

## 📱 Modo Web y Móvil (Figma Preview)

Para reflejar el diseño de Figma titulado **"Módulo Terrenos - Web y Móvil"**, en la barra superior se incluye el botón **"Simulador Móvil" / "Vista Web"**:
* Al activarlo, el prototipo se encapsula dentro de un marco de smartphone con controles táctiles y barra inferior de navegación, permitiendo al equipo de diseño y desarrollo validar ambos entornos simultáneamente.

---

## 📡 Endpoints de la API REST

| Método | Endpoint | Descripción |
|---|---|---|
| `GET` | `/api/health` | Estado del servidor y módulos satelitales |
| `GET` | `/api/terrenos` | Lista todas las parcelas con resumen satelital |
| `POST` | `/api/terrenos` | Registra una nueva parcela |
| `GET` | `/api/terrenos/:id` | Detalle completo de una parcela |
| `PUT` | `/api/terrenos/:id` | Actualiza los datos de una parcela |
| `DELETE`| `/api/terrenos/:id` | Elimina una parcela |
| `GET` | `/api/terrenos/:id/nasa-data` | Telemetría satelital NASA (POWER, SMAP, MODIS) |
| `GET` | `/api/terrenos/:id/recomendaciones` | Recomendaciones de cultivos e IA para el terreno |
| `GET` | `/api/nasa/clima-punto?lat=...&lon=...` | Telemetría satelital para cualquier coordenada del mapa |
