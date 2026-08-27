const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Listar áreas
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reservation_areas WHERE active = 1');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear área (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, description, requires_reservation, is_public, cost_per_hour, cost_per_day, max_capacity } = req.body;
    const [result] = await pool.query(
      'INSERT INTO reservation_areas (name, description, requires_reservation, is_public, cost_per_hour, cost_per_day, max_capacity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, requires_reservation, is_public, cost_per_hour, cost_per_day, max_capacity]
    );
    res.status(201).json({ id: result.insertId, message: 'Área creada' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Actualizar área (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, description, requires_reservation, is_public, cost_per_hour, cost_per_day, max_capacity, active } = req.body;
    await pool.query(
      'UPDATE reservation_areas SET name = ?, description = ?, requires_reservation = ?, is_public = ?, cost_per_hour = ?, cost_per_day = ?, max_capacity = ?, active = ? WHERE id = ?',
      [name, description, requires_reservation, is_public, cost_per_hour, cost_per_day, max_capacity, active, req.params.id]
    );
    res.json({ message: 'Área actualizada' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar área (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM reservation_areas WHERE id = ?', [req.params.id]);
    res.json({ message: 'Área eliminada' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;