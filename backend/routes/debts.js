const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { assertCondoReferences } = require('../utils/condominium');
const router = express.Router();

// Listar deudas (admin ve todas, usuario ve las suyas)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT * FROM debts WHERE condo_id = ? ORDER BY created_at DESC', [req.user.condo_id]);
      return res.json(rows);
    } else {
      const [rows] = await pool.query('SELECT * FROM debts WHERE condo_id = ? AND (user_id = ? OR property_id = ?) ORDER BY created_at DESC', [req.user.condo_id, req.user.id, req.user.property_id]);
      return res.json(rows);
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear deuda (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { property_id, user_id, type, description, amount, due_date } = req.body;
    await assertCondoReferences(req.user.condo_id, { propertyId: property_id, userId: user_id });
    const [result] = await pool.query(
      'INSERT INTO debts (condo_id, property_id, user_id, type, description, amount, due_date) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.condo_id, property_id, user_id, type, description, amount, due_date]
    );
    res.status(201).json({ id: result.insertId, message: 'Deuda creada' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Actualizar deuda (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { property_id, user_id, type, description, amount, due_date, status } = req.body;
    await assertCondoReferences(req.user.condo_id, { propertyId: property_id, userId: user_id });
    await pool.query(
      'UPDATE debts SET property_id = ?, user_id = ?, type = ?, description = ?, amount = ?, due_date = ?, status = ? WHERE condo_id = ? AND id = ?',
      [property_id, user_id, type, description, amount, due_date, status, req.user.condo_id, req.params.id]
    );
    res.json({ message: 'Deuda actualizada' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar deuda (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM debts WHERE condo_id = ? AND id = ?', [req.user.condo_id, req.params.id]);
    res.json({ message: 'Deuda eliminada' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
