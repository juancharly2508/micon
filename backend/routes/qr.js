const express = require('express');
const crypto = require('crypto');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

const QR_COST = 50;

// Generar QR (usuario, pero admin también)
router.post('/generate', authenticate, async (req, res) => {
  try {
    const { visitor_name, valid_to, max_entries } = req.body;
    const user_id = req.user.id;
    const property_id = req.user.property_id;

    const code = crypto.randomBytes(12).toString('hex').toUpperCase();

    const [result] = await pool.query(
      'INSERT INTO qr_codes (user_id, property_id, visitor_name, code, valid_to, max_entries, cost) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [user_id, property_id, visitor_name, code, valid_to, max_entries || 1, QR_COST]
    );

    await pool.query(
      'INSERT INTO debts (property_id, user_id, type, description, amount, due_date) VALUES (?, ?, "qr", ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY))',
      [property_id, user_id, `QR visitante: ${visitor_name}`, QR_COST]
    );

    res.status(201).json({ qr: { code, cost: QR_COST, visitor_name, valid_to }, message: `QR generado. Se cargará $${QR_COST} a su cuenta.` });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Verificar QR (guardia o admin)
router.post('/verify', authenticate, authorize('guardia', 'admin'), async (req, res) => {
  try {
    const { code } = req.body;
    const [rows] = await pool.query('SELECT * FROM qr_codes WHERE code = ?', [code]);
    if (rows.length === 0) return res.status(404).json({ valid: false, message: 'QR no encontrado' });

    const qr = rows[0];
    const now = new Date();
    const validTo = new Date(qr.valid_to);

    if (now > validTo || qr.status !== 'activo' || qr.entries_count >= qr.max_entries) {
      return res.json({ valid: false, message: 'QR expirado o ya utilizado' });
    }

    await pool.query('INSERT INTO qr_scans (qr_id, scanned_by_user_id, result) VALUES (?, ?, "valido")', [qr.id, req.user.id]);
    await pool.query('UPDATE qr_codes SET entries_count = entries_count + 1, status = IF(entries_count + 1 >= max_entries, "usado", status) WHERE id = ?', [qr.id]);

    res.json({ valid: true, visitor_name: qr.visitor_name, property_id: qr.property_id, message: 'Acceso permitido' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Listar QRs (admin ve todos, usuario ve suyos)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT * FROM qr_codes ORDER BY created_at DESC');
      return res.json(rows);
    } else {
      const [rows] = await pool.query('SELECT * FROM qr_codes WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
      return res.json(rows);
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Eliminar QR (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM qr_codes WHERE id = ?', [req.params.id]);
    res.json({ message: 'QR eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;