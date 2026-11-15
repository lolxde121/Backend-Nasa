const db = require('../db/database');

/**
 * Middleware: extrae el usuario autenticado del token Bearer.
 * Si no hay token válido responde 401.
 */
function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No autorizado. Token no proporcionado.' });
  }

  const token = authHeader.split(' ')[1];
  const session = db.prepare(`
    SELECT s.usuario_id, u.id, u.nombre, u.email, u.rol, u.finca_nombre
    FROM sesiones s
    JOIN usuarios u ON s.usuario_id = u.id
    WHERE s.token = ? AND (s.expires_at IS NULL OR s.expires_at > datetime('now'))
  `).get(token);

  if (!session) {
    return res.status(401).json({ success: false, error: 'Sesión inválida o expirada.' });
  }

  req.userId = session.usuario_id;
  req.user = session;
  next();
}

/**
 * Middleware opcional: si hay token lo decodifica pero no bloquea si no hay.
 * Permite acceso a invitados (modo guest sin token).
 */
function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    const session = db.prepare(`
      SELECT s.usuario_id, u.id, u.nombre, u.email, u.rol, u.finca_nombre
      FROM sesiones s
      JOIN usuarios u ON s.usuario_id = u.id
      WHERE s.token = ? AND (s.expires_at IS NULL OR s.expires_at > datetime('now'))
    `).get(token);
    if (session) {
      req.userId = session.usuario_id;
      req.user = session;
    }
  }
  next();
}

module.exports = { requireAuth, optionalAuth };
