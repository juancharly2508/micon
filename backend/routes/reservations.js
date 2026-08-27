const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Listar reservaciones (admin ve todas, usuario ve suyas)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT * FROM reservations ORDER BY start_datetime DESC');
      return res.json(rows);
    } else {
      const [rows] = await pool.query('SELECT * FROM reservations WHERE user_id = ? ORDER BY start_datetime DESC', [req.user.id]);
      return res.json(rows);
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear reservación (usuario, pero admin también puede)
router.post('/', authenticate, async (req, res) => {
  try {
    const { area_id, start_datetime, end_datetime } = req.body;
    const user_id = req.user.id;
    const property_id = req.user.property_id;

    // Verificar conflicto
    const [conflict] = await pool.query(
      'SELECT id FROM reservations WHERE area_id = ? AND status NOT IN ("cancelada") AND start_datetime < ? AND end_datetime > ?',
      [area_id, end_datetime, start_datetime]
    );
    if (conflict.length > 0) return res.status(409).json({ error: 'Horario ya ocupado' });

    // Obtener área y calcular costo
    const [areaRows] = await pool.query('SELECT * FROM reservation_areas WHERE id = ?', [area_id]);
    if (areaRows.length === 0) return res.status(404).json({ error: 'Área no encontrada' });
    const area = areaRows[0];

    const start = new Date(start_datetime);
    const end = new Date(end_datetime);
    const diffHours = (end - start) / (1000 * 60 * 60);
    const diffDays = diffHours / 24;

    let total_cost = 0;
    if (diffDays >= 1) total_cost = area.cost_per_day * Math.ceil(diffDays);
    else total_cost = area.cost_per_hour * diffHours;

    const [result] = await pool.query(
      'INSERT INTO reservations (area_id, user_id, property_id, start_datetime, end_datetime, total_cost) VALUES (?, ?, ?, ?, ?, ?)',
      [area_id, user_id, property_id, start_datetime, end_datetime, total_cost]
    );

    // Crear deuda
    await pool.query(
      'INSERT INTO debts (property_id, user_id, type, description, amount, due_date) VALUES (?, ?, "reserva", ?, ?, DATE_ADD(CURDATE(), INTERVAL 7 DAY))',
      [property_id, user_id, `Reservación #${result.insertId}`, total_cost]
    );

    res.status(201).json({ id: result.insertId, total_cost, message: 'Reservación creada' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Actualizar estado o datos (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { area_id, user_id, property_id, start_datetime, end_datetime, total_cost, status } = req.body;
    await pool.query(
      'UPDATE reservations SET area_id = ?, user_id = ?, property_id = ?, start_datetime = ?, end_datetime = ?, total_cost = ?, status = ? WHERE id = ?',
      [area_id, user_id, property_id, start_datetime, end_datetime, total_cost, status, req.params.id]
    );
    res.json({ message: 'Reservación actualizada' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar reservación (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM reservations WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reservación eliminada' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;