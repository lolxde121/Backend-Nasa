const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db/database');

function hashPassword(password, salt) {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

// POST /api/auth/register - Registro de nuevo usuario
router.post('/register', (req, res) => {
  try {
    const { nombre, email, password, finca_nombre = 'Finca Principal' } = req.body;

    if (!nombre || !nombre.trim()) {
      return res.status(400).json({ success: false, error: 'El nombre es obligatorio.' });
    }
    if (!email || !email.trim() || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'Ingresa un correo electrónico válido.' });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 6 caracteres.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Comprobar si ya existe
    const existing = db.prepare('SELECT id FROM usuarios WHERE LOWER(email) = ?').get(cleanEmail);
    if (existing) {
      return res.status(409).json({ success: false, error: 'Ya existe una cuenta registrada con este correo electrónico.' });
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const password_hash = hashPassword(password, salt);

    const insertStmt = db.prepare(`
      INSERT INTO usuarios (nombre, email, password_hash, salt, rol, finca_nombre)
      VALUES (?, ?, ?, ?, 'agricultor', ?)
    `);

    const result = insertStmt.run(nombre.trim(), cleanEmail, password_hash, salt, finca_nombre.trim());
    const userId = result.lastInsertRowid;

    // Generar token de sesión
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 días

    db.prepare(`
      INSERT INTO sesiones (token, usuario_id, expires_at)
      VALUES (?, ?, ?)
    `).run(token, userId, expiresAt);

    const user = {
      id: userId,
      nombre: nombre.trim(),
      email: cleanEmail,
      rol: 'agricultor',
      finca_nombre: finca_nombre.trim(),
      created_at: new Date().toISOString()
    };

    res.status(201).json({
      success: true,
      message: 'Cuenta creada exitosamente',
      token,
      user
    });
  } catch (err) {
    console.error('Error en registro:', err);
    res.status(500).json({ success: false, error: 'Error interno al registrar usuario.' });
  }
});

// POST /api/auth/login - Inicio de sesión
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Por favor ingresa tu correo y contraseña.' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const userRow = db.prepare('SELECT * FROM usuarios WHERE LOWER(email) = ?').get(cleanEmail);

    if (!userRow) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
    }

    const testHash = hashPassword(password, userRow.salt);
    if (testHash !== userRow.password_hash) {
      return res.status(401).json({ success: false, error: 'Credenciales inválidas. Verifica tu correo y contraseña.' });
    }

    // Crear sesión
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

    db.prepare(`
      INSERT INTO sesiones (token, usuario_id, expires_at)
      VALUES (?, ?, ?)
    `).run(token, userRow.id, expiresAt);

    const user = {
      id: userRow.id,
      nombre: userRow.nombre,
      email: userRow.email,
      rol: userRow.rol,
      finca_nombre: userRow.finca_nombre,
      avatar_url: userRow.avatar_url,
      created_at: userRow.created_at
    };

    res.json({
      success: true,
      message: 'Inicio de sesión exitoso',
      token,
      user
    });
  } catch (err) {
    console.error('Error en login:', err);
    res.status(500).json({ success: false, error: 'Error interno en el servidor.' });
  }
});

// GET /api/auth/me - Obtener perfil del usuario autenticado
router.get('/me', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'No autorizado. Token no proporcionado.' });
    }

    const token = authHeader.split(' ')[1];
    const session = db.prepare(`
      SELECT s.*, u.id as user_id, u.nombre, u.email, u.rol, u.finca_nombre, u.avatar_url, u.created_at as user_created
      FROM sesiones s
      JOIN usuarios u ON s.usuario_id = u.id
      WHERE s.token = ?
    `).get(token);

    if (!session) {
      return res.status(401).json({ success: false, error: 'Sesión inválida o expirada.' });
    }

    // Verificar si expiró
    if (session.expires_at && new Date(session.expires_at) < new Date()) {
      db.prepare('DELETE FROM sesiones WHERE token = ?').run(token);
      return res.status(401).json({ success: false, error: 'La sesión ha expirado.' });
    }

    res.json({
      success: true,
      user: {
        id: session.user_id,
        nombre: session.nombre,
        email: session.email,
        rol: session.rol,
        finca_nombre: session.finca_nombre,
        avatar_url: session.avatar_url,
        created_at: session.user_created
      }
    });
  } catch (err) {
    console.error('Error en /me:', err);
    res.status(500).json({ success: false, error: 'Error al consultar la sesión.' });
  }
});

// POST /api/auth/logout - Cerrar sesión
router.post('/logout', (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      db.prepare('DELETE FROM sesiones WHERE token = ?').run(token);
    }
    res.json({ success: true, message: 'Sesión cerrada correctamente.' });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Error al cerrar sesión.' });
  }
});

module.exports = router;
