const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { assertCondoReferences } = require('../utils/condominium');
const router = express.Router();

// Listar pagos (admin)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payments WHERE condo_id = ? ORDER BY payment_date DESC', [req.user.condo_id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear pago (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { user_id, concept, amount, status, reference } = req.body;
    await assertCondoReferences(req.user.condo_id, { userId: user_id });
    const [result] = await pool.query(
      'INSERT INTO payments (condo_id, user_id, concept, amount, status, reference) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.condo_id, user_id, concept, amount, status, reference]
    );
    res.status(201).json({ id: result.insertId, message: 'Pago registrado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Actualizar pago (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { user_id, concept, amount, status, reference } = req.body;
    await assertCondoReferences(req.user.condo_id, { userId: user_id });
    await pool.query(
      'UPDATE payments SET user_id = ?, concept = ?, amount = ?, status = ?, reference = ? WHERE condo_id = ? AND id = ?',
      [user_id, concept, amount, status, reference, req.user.condo_id, req.params.id]
    );
    res.json({ message: 'Pago actualizado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar pago (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM payments WHERE condo_id = ? AND id = ?', [req.user.condo_id, req.params.id]);
    res.json({ message: 'Pago eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
