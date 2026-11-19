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
    if (!req.user.condo_id) return res.status(403).json({ error: 'Tu cuenta debe estar vinculada a un condominio antes de generar accesos.' });
    const [[condo]] = await pool.query('SELECT has_guards FROM condominiums WHERE id = ?', [req.user.condo_id]);
    if (!condo?.has_guards) return res.status(403).json({ error: 'Los accesos QR requieren el servicio de guardia habilitado.' });
    const user_id = req.user.id;
    const property_id = req.user.property_id;

    const code = crypto.randomBytes(12).toString('hex').toUpperCase();

    const [result] = await pool.query(
      'INSERT INTO qr_codes (condo_id, user_id, property_id, visitor_name, code, valid_to, max_entries, cost) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.condo_id, user_id, property_id, visitor_name, code, valid_to, max_entries || 1, QR_COST]
    );

    await pool.query(
      'INSERT INTO debts (condo_id, property_id, user_id, type, description, amount, due_date) VALUES (?, ?, ?, "qr", ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY))',
      [req.user.condo_id, property_id, user_id, `QR visitante: ${visitor_name}`, QR_COST]
    );

    res.status(201).json({ qr: { code, cost: QR_COST, visitor_name, valid_to }, message: `QR generado. Se cargará $${QR_COST} a su cuenta.` });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Verificar QR (guardia o admin)
router.post('/verify', authenticate, authorize('guardia', 'admin'), async (req, res) => {
  try {
    const { code } = req.body;
    if (!req.user.condo_id) return res.status(403).json({ valid: false, message: 'Cuenta sin condominio asignado.' });
    const [[condo]] = await pool.query('SELECT has_guards FROM condominiums WHERE id = ?', [req.user.condo_id]);
    if (req.user.role === 'guardia' && !condo?.has_guards) return res.status(403).json({ valid: false, message: 'El acceso de guardia está deshabilitado.' });
    const [rows] = await pool.query('SELECT * FROM qr_codes WHERE condo_id = ? AND code = ?', [req.user.condo_id, code]);
    if (rows.length === 0) return res.status(404).json({ valid: false, message: 'QR no encontrado' });

    const qr = rows[0];
    const now = new Date();
    const validTo = new Date(qr.valid_to);

    if (now > validTo || qr.status !== 'activo' || qr.entries_count >= qr.max_entries) {
      return res.json({ valid: false, message: 'QR expirado o ya utilizado' });
    }

    await pool.query('INSERT INTO qr_scans (condo_id, qr_id, scanned_by_user_id, result) VALUES (?, ?, ?, "valido")', [req.user.condo_id, qr.id, req.user.id]);
    await pool.query('UPDATE qr_codes SET entries_count = entries_count + 1, status = IF(entries_count + 1 >= max_entries, "usado", status) WHERE condo_id = ? AND id = ?', [req.user.condo_id, qr.id]);

    res.json({ valid: true, visitor_name: qr.visitor_name, property_id: qr.property_id, message: 'Acceso permitido' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Listar QRs (admin ve todos, usuario ve suyos)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT * FROM qr_codes WHERE condo_id = ? ORDER BY created_at DESC', [req.user.condo_id]);
      return res.json(rows);
    } else {
      const [rows] = await pool.query('SELECT * FROM qr_codes WHERE condo_id = ? AND user_id = ? ORDER BY created_at DESC', [req.user.condo_id, req.user.id]);
      return res.json(rows);
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Eliminar QR (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM qr_codes WHERE condo_id = ? AND id = ?', [req.user.condo_id, req.params.id]);
    res.json({ message: 'QR eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
