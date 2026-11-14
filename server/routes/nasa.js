const express = require('express');
const router = express.Router();
const { fetchAgroClimaticData } = require('../services/nasaService');
const { CROP_CATALOG } = require('../services/recommendationService');

// GET /api/nasa/clima-punto?lat=...&lon=...&suelo=...
// Permite explorar cualquier coordenada en el mapa de forma interactiva
router.get('/clima-punto', async (req, res) => {
  try {
    const { lat, lon, suelo = 'Franco' } = req.query;

    if (!lat || !lon) {
      return res.status(400).json({
        success: false,
        error: 'Debe proporcionar parámetros de latitud (lat) y longitud (lon).'
      });
    }

    const data = await fetchAgroClimaticData(parseFloat(lat), parseFloat(lon), null, suelo);
    res.json({
      success: true,
      coordenadas: { lat: parseFloat(lat), lon: parseFloat(lon) },
      data
    });
  } catch (error) {
    console.error('Error al consultar clima puntual:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/nasa/cultivos-catalogo
router.get('/cultivos-catalogo', (req, res) => {
  res.json({
    success: true,
    total: CROP_CATALOG.length,
    data: CROP_CATALOG
  });
});

module.exports = router;
