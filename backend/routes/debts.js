const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Listar deudas (admin ve todas, usuario ve las suyas)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT * FROM debts ORDER BY created_at DESC');
      return res.json(rows);
    } else {
      const [rows] = await pool.query('SELECT * FROM debts WHERE user_id = ? OR property_id = ? ORDER BY created_at DESC', [req.user.id, req.user.property_id]);
      return res.json(rows);
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear deuda (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { property_id, user_id, type, description, amount, due_date } = req.body;
    const [result] = await pool.query(
      'INSERT INTO debts (property_id, user_id, type, description, amount, due_date) VALUES (?, ?, ?, ?, ?, ?)',
      [property_id, user_id, type, description, amount, due_date]
    );
    res.status(201).json({ id: result.insertId, message: 'Deuda creada' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Actualizar deuda (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { property_id, user_id, type, description, amount, due_date, status } = req.body;
    await pool.query(
      'UPDATE debts SET property_id = ?, user_id = ?, type = ?, description = ?, amount = ?, due_date = ?, status = ? WHERE id = ?',
      [property_id, user_id, type, description, amount, due_date, status, req.params.id]
    );
    res.json({ message: 'Deuda actualizada' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar deuda (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM debts WHERE id = ?', [req.params.id]);
    res.json({ message: 'Deuda eliminada' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;