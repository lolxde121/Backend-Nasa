# 🌾 Lum (AgroMonitor) — Plataforma de Gestión Agrícola con Telemetría NASA

Plataforma full-stack integral para la **gestión de terrenos agrícolas, seguimiento de riego con IA y recomendaciones agronómicas de cultivo**, potenciada por **telemetría satelital en tiempo real de la NASA (NASA POWER, SMAP y MODIS)** y un diseño moderno optimizado para campo y escritorio.

---

## 🚀 Inicio Rápido

### Requisitos
* **Node.js**: v20+ o v22+ (detectado Node.js v26 en el entorno)
* **npm**: v10+

### Ejecución

```bash
# 1. Instalar dependencias completas (servidor y cliente)
npm run install:all

# 2. Modo desarrollo (Backend en :5000 y Frontend Vite en :5173)
npm run dev

# 3. Modo producción (Servidor Express único entregando API y Web en :5000)
npm run build
npm start
```

* 🌐 **Web App & API:** [http://localhost:5000](http://localhost:5000)
* 📊 **Health Check:** [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🎨 Características de la Capa Visual (Lum Frontend)

* **Paleta Institucional "Agua y Cielo":** Azul Marino NASA (`#0B3D91`), Azul Cielo (`#4FA3E0`), Menta Vegetal (`#2BB3A3`), Fondo Niebla (`#F2F7FB`) y Tinta de Alto Contraste (`#0F1F33`).
* **Dashboard Agrícola (`Dashboard.jsx`):** Saludo al productor, KPIs consolidados de temperatura, humedad, terrenos con necesidad hídrica y precipitación a 7 días, comparativas y alertas activas.
* **Catálogo de Terrenos (`Terrenos.jsx`):** Vista de cuadrícula con badges de estado (`Saludable`, `Requiere riego`, `Monitoreando`), superficie en hectáreas, etiquetas de suelo y cultivo, y búsqueda en tiempo real.
* **Creación y Edición Georreferenciada (`ParcelForm.jsx`):** Selector de texturas de tierra interactivas, tipo de cultivo, sistema de riego, visor cartográfico interactivo y botón **"Usar mi ubicación"** con geolocalización GPS real del dispositivo.
* **Ficha Técnica del Terreno (`ParcelDetail.jsx`):** Sparklines de tendencia, KPIs térmicos e hídricos, pronóstico a 5 días, visor de ubicación, panel de satélites NASA (POWER, SMAP, MODIS) y exportación de reporte.
* **Recomendaciones de Cultivo (`Recomendaciones.jsx`):** Motor de compatibilidad edafoclimática que evalúa la rotación de parcelas (ej. leguminosas tras maíz para fijar nitrógeno) y fichas técnicas de cada cultivo.
* **Seguimiento de Riego Inteligente (`Seguimiento.jsx` & `SegDetail.jsx`):** Asistencia de riego con IA (*Regar hoy*, *Esperar lluvia*, *No regar*), pronóstico de milímetros y probabilidad de lluvia a 7 días, e historial interactivo con modal para registrar riegos.
* **Gráficas Analíticas (`Graficas.jsx`):** Módulo avanzado con Recharts para telemetría a 30 días, oscilación térmica a 24 horas y comparativa multiterreno.
* **Navegación Móvil y Escritorio:** Sidebar retraible con selector de fincas, cabecera con botón de sincronización satelital en vivo y barra inferior para pantallas táctiles.

---

## 🛰️ Integración con Satélites NASA

1. **NASA POWER Climatology:** Temperatura diurna (`T2M`), precipitación acumulada (`PRECTOTCORR`) y radiación solar fotosintética (`ALLSKY_SFC_SW_DWN`).
2. **NASA SMAP (Soil Moisture Active Passive L3/L4):** Saturación superficial del suelo (0-5 cm) y zona radicular (0-100 cm), modulada según la textura edáfica.
3. **NASA MODIS (Sensor Terra/Aqua NDVI 250m):** Índice de vegetación de diferencia normalizada para monitoreo del vigor y biomasa vegetal.
4. **Caché y Resiliencia en Campo:** Almacenamiento local SQLite de telemetría por 6 horas y modelo de extrapolación climática calibrada para mantener la operatividad sin conexión satelital continua.

---

## 📁 Estructura del Proyecto

```
logicaPrototipo/
├── server/                           # Backend API REST (Node.js & Express)
│   ├── db/
│   │   ├── database.js               # Esquema SQLite, migraciones y seeders
│   │   └── terrenos.db               # Base de datos persistente embebida
│   ├── routes/
│   │   ├── terrenos.js               # CRUD de parcelas y consulta satelital
│   │   ├── seguimientos.js           # Control de riego y registro histórico
│   │   └── nasa.js                   # Exploración de coordenadas en el mapa
│   ├── services/
│   │   ├── nasaService.js            # Cliente de satélites NASA POWER, SMAP y MODIS
│   │   └── recommendationService.js  # Motor agronómico de compatibilidad de cultivos
│   └── server.js                     # Servidor HTTP Express y entrega estática
├── client/                           # Frontend React 18 + Vite + Tailwind CSS 3
│   ├── src/
│   │   ├── components/               # Sidebar, Header, BottomNav, MapView, Kpi, charts
│   │   ├── views/                    # Dashboard, Terrenos, ParcelDetail, ParcelForm, SegDetail...
│   │   ├── data/                     # Catálogos de cultivos, navegación y reglas
│   │   ├── lib/                      # Utilidades matemáticas, fórmulas y fechas
│   │   ├── services/api.js           # Cliente API REST unificado
│   │   ├── App.jsx                   # Estado global sincronizado
│   │   └── main.jsx
│   └── package.json
├── DOCUMENTACION_TECNICA.md          # Manual técnico exhaustivo de la arquitectura
├── package.json
└── README.md
```

---

## 📄 Documentación Técnica Completa

Para conocer todos los detalles de diseño, esquemas de tablas SQL, algoritmos de cálculo de riego, catálogo de endpoints REST y parámetros satelitales, consulte:
* [DOCUMENTACION_TECNICA.md](file:///home/edgar/Descargas/logicaPrototipo/DOCUMENTACION_TECNICA.md)
