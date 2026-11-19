const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { assertCondoReferences } = require('../utils/condominium');
const router = express.Router();

// Listar horarios (público)
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM area_schedules WHERE condo_id = ?', [req.user.condo_id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear horario (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { area_id, day_of_week, start_time, end_time, is_closed } = req.body;
    await assertCondoReferences(req.user.condo_id, { areaId: area_id });
    const [result] = await pool.query(
      'INSERT INTO area_schedules (condo_id, area_id, day_of_week, start_time, end_time, is_closed) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.condo_id, area_id, day_of_week, start_time, end_time, is_closed]
    );
    res.status(201).json({ id: result.insertId, message: 'Horario creado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Actualizar horario (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { area_id, day_of_week, start_time, end_time, is_closed } = req.body;
    await assertCondoReferences(req.user.condo_id, { areaId: area_id });
    await pool.query(
      'UPDATE area_schedules SET area_id = ?, day_of_week = ?, start_time = ?, end_time = ?, is_closed = ? WHERE condo_id = ? AND id = ?',
      [area_id, day_of_week, start_time, end_time, is_closed, req.user.condo_id, req.params.id]
    );
    res.json({ message: 'Horario actualizado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar horario (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM area_schedules WHERE condo_id = ? AND id = ?', [req.user.condo_id, req.params.id]);
    res.json({ message: 'Horario eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
