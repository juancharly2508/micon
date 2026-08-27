const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Listar horarios (público)
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM area_schedules');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear horario (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { area_id, day_of_week, start_time, end_time, is_closed } = req.body;
    const [result] = await pool.query(
      'INSERT INTO area_schedules (area_id, day_of_week, start_time, end_time, is_closed) VALUES (?, ?, ?, ?, ?)',
      [area_id, day_of_week, start_time, end_time, is_closed]
    );
    res.status(201).json({ id: result.insertId, message: 'Horario creado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Actualizar horario (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { area_id, day_of_week, start_time, end_time, is_closed } = req.body;
    await pool.query(
      'UPDATE area_schedules SET area_id = ?, day_of_week = ?, start_time = ?, end_time = ?, is_closed = ? WHERE id = ?',
      [area_id, day_of_week, start_time, end_time, is_closed, req.params.id]
    );
    res.json({ message: 'Horario actualizado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar horario (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM area_schedules WHERE id = ?', [req.params.id]);
    res.json({ message: 'Horario eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;