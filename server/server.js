const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./db/database');
const terrenosRouter = require('./routes/terrenos');
const nasaRouter = require('./routes/nasa');
const seguimientosRouter = require('./routes/seguimientos');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/terrenos', terrenosRouter);
app.use('/api/nasa', nasaRouter);
app.use('/api/seguimientos', seguimientosRouter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    servicio: 'API Módulo Terrenos & Asistencia Agrícola',
    version: '1.0.0',
    base_datos: 'SQLite (node:sqlite native)',
    integraciones: {
      nasa_power: 'Activa (T2M, PRECTOTCORR, RH2M, Solar Rad)',
      nasa_smap: 'Activa (Soil Moisture L3/L4 Index)',
      nasa_modis: 'Activa (NDVI 250m Vegetation Index)',
      motor_recomendaciones: 'Activo'
    },
    timestamp: new Date().toISOString()
  });
});

// Serve static frontend build if it exists
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
      return next();
    }
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🌾 Plataforma Agrícola AgroMonitor lista`);
  console.log(`🌐 Web App & API: http://localhost:${PORT}`);
  console.log(`📊 Health Check: http://localhost:${PORT}/api/health`);
  console.log(`🛰️  NASA POWER, SMAP & MODIS endpoints activos`);
  console.log(`======================================================\n`);
});

