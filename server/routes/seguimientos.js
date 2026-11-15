const express = require('express');
const router = express.Router();
const db = require('../db/database');

// GET /api/seguimientos - Lista todos los seguimientos
router.get('/', (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT s.*, t.nombre as terreno_nombre 
      FROM seguimientos s 
      LEFT JOIN terrenos t ON s.terreno_id = t.id 
      ORDER BY s.updated_at DESC
    `);
    const rows = stmt.all();

    const formatted = rows.map(r => ({
      id: r.id,
      pid: String(r.terreno_id),
      terreno_nombre: r.terreno_nombre || 'Terreno',
      crop: r.cultivo,
      sow: r.fecha_siembra,
      lastWater: r.ultimo_riego,
      rainYesterday: Boolean(r.lluvia_ayer),
      upd: 'hoy, 6:00 a. m.',
      forecast: r.pronostico_json ? JSON.parse(r.pronostico_json) : [],
      hist: r.historial_json ? JSON.parse(r.historial_json) : []
    }));

    res.json({
      success: true,
      total: formatted.length,
      data: formatted
    });
  } catch (error) {
    console.error('Error al obtener seguimientos:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/seguimientos - Registra un nuevo seguimiento
router.post('/', (req, res) => {
  try {
    const {
      id = 'sg' + Date.now(),
      pid,
      terreno_id = pid,
      crop,
      cultivo = crop,
      sow,
      fecha_siembra = sow,
      lastWater,
      ultimo_riego = lastWater,
      forecast = [],
      hist = []
    } = req.body;

    const tid = parseInt(String(terreno_id).replace(/\D/g, ''), 10) || 1;

    const stmt = db.prepare(`
      INSERT INTO seguimientos (
        id, terreno_id, cultivo, fecha_siembra, ultimo_riego, lluvia_ayer, pronostico_json, historial_json
      ) VALUES (?, ?, ?, ?, ?, 0, ?, ?)
    `);

    stmt.run(
      id,
      tid,
      cultivo,
      fecha_siembra,
      ultimo_riego,
      JSON.stringify(forecast),
      JSON.stringify(hist)
    );

    res.status(201).json({
      success: true,
      message: 'Seguimiento registrado exitosamente',
      data: {
        id,
        pid: String(tid),
        crop: cultivo,
        sow: fecha_siembra,
        lastWater: ultimo_riego,
        forecast,
        hist
      }
    });
  } catch (error) {
    console.error('Error al crear seguimiento:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/seguimientos/:id/riego - Registra un riego en el historial
router.post('/:id/riego', (req, res) => {
  try {
    const { id } = req.params;
    const { date, tone = 'ok', label = 'Seguiste la recomendación' } = req.body;

    const stmt = db.prepare('SELECT * FROM seguimientos WHERE id = ?');
    const seg = stmt.get(id);

    if (!seg) {
      return res.status(404).json({ success: false, error: 'Seguimiento no encontrado' });
    }

    const currentHist = seg.historial_json ? JSON.parse(seg.historial_json) : [];
    const newEntry = {
      id: 'h' + Date.now(),
      d: date,
      tone,
      label
    };

    const updatedHist = [newEntry, ...currentHist].sort((a, b) => b.d.localeCompare(a.d));

    const updateStmt = db.prepare(`
      UPDATE seguimientos SET
        ultimo_riego = ?,
        historial_json = ?,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(date, JSON.stringify(updatedHist), id);

    res.json({
      success: true,
      message: 'Riego registrado correctamente',
      data: {
        id,
        lastWater: date,
        hist: updatedHist
      }
    });
  } catch (error) {
    console.error('Error al registrar riego:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE /api/seguimientos/:id - Elimina un seguimiento
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const stmt = db.prepare('DELETE FROM seguimientos WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return res.status(404).json({ success: false, error: 'Seguimiento no encontrado' });
    }

    res.json({ success: true, message: 'Seguimiento eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
