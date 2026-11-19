const jwt = require('jsonwebtoken');
const pool = require('../db');

async function authenticate(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const [accountRows] = await pool.query('SELECT id, role, condo_id, active FROM users WHERE id = ?', [decoded.id]);
    if (!accountRows.length || !accountRows[0].active) return res.status(401).json({ error: 'La cuenta está desactivada o ya no existe.' });
    decoded.role = accountRows[0].role;
    decoded.condo_id = accountRows[0].condo_id;
    if (decoded.condo_id) {
      const [rows] = await pool.query('SELECT id, has_guards, setup_completed FROM condominiums WHERE id = ?', [decoded.condo_id]);
      if (!rows.length) return res.status(403).json({ error: 'El condominio de esta cuenta ya no está disponible.' });
      decoded.has_guards = Boolean(rows[0].has_guards);
      decoded.setup_completed = Boolean(rows[0].setup_completed);
    }
    const path = req.originalUrl.split('?')[0];
    const setupRoute = path.startsWith('/api/condominiums/');
    const residentPreloadRoute = path === '/api/users/link';
    if (decoded.role === 'guardia' && !decoded.has_guards && !setupRoute && path !== '/api/auth/me') return res.status(403).json({ error: 'El administrador deshabilitó el servicio de guardia.' });
    if (path.startsWith('/api/qr') && !decoded.has_guards) return res.status(403).json({ error: 'Los accesos QR requieren el servicio de guardia habilitado.' });
    if (decoded.role === 'admin' && !decoded.setup_completed && !setupRoute && !residentPreloadRoute && path !== '/api/auth/me') {
      return res.status(403).json({ error: 'Completa la configuración inicial del condominio para abrir el panel.' });
    }
    if (['residente', 'guardia'].includes(decoded.role) && !decoded.setup_completed && path !== '/api/auth/me') {
      return res.status(403).json({ error: 'La administración está completando la configuración inicial del condominio.' });
    }
    if (decoded.role === 'residente' && !decoded.condo_id && path !== '/api/auth/me') {
      return res.status(403).json({ error: 'Tu cuenta está pendiente de vincularse con el condominio.' });
    }
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') return res.status(401).json({ error: 'Token inválido' });
    console.error('Error al validar sesión:', err.message);
    return res.status(500).json({ error: 'No se pudo validar la sesión.' });
  }
}

function authorize(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'No autorizado' });
    }
    next();
  };
}

module.exports = { authenticate, authorize };
