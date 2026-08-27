const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Listar pagos (admin)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM payments ORDER BY payment_date DESC');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear pago (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { user_id, concept, amount, status, reference } = req.body;
    const [result] = await pool.query(
      'INSERT INTO payments (user_id, concept, amount, status, reference) VALUES (?, ?, ?, ?, ?)',
      [user_id, concept, amount, status, reference]
    );
    res.status(201).json({ id: result.insertId, message: 'Pago registrado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Actualizar pago (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { user_id, concept, amount, status, reference } = req.body;
    await pool.query(
      'UPDATE payments SET user_id = ?, concept = ?, amount = ?, status = ?, reference = ? WHERE id = ?',
      [user_id, concept, amount, status, reference, req.params.id]
    );
    res.json({ message: 'Pago actualizado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar pago (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM payments WHERE id = ?', [req.params.id]);
    res.json({ message: 'Pago eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;