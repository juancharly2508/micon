const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Crear reporte (cualquier rol)
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, title, description, area, anonymous } = req.body;
    const user_id = anonymous ? null : req.user.id;
    const property_id = req.user.property_id;

    const [result] = await pool.query(
      'INSERT INTO reports (user_id, property_id, type, title, description, area) VALUES (?, ?, ?, ?, ?, ?)',
      [user_id, property_id, type, title, description, area]
    );
    res.status(201).json({ id: result.insertId, message: 'Reporte enviado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Listar reportes (admin ve todos, guardia ve los de visitantes, usuario ve suyos)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT * FROM reports ORDER BY created_at DESC');
      return res.json(rows);
    } else if (req.user.role === 'guardia') {
      const [rows] = await pool.query('SELECT * FROM reports WHERE type = "visitante" OR user_id = ? ORDER BY created_at DESC', [req.user.id]);
      return res.json(rows);
    } else {
      const [rows] = await pool.query('SELECT * FROM reports WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
      return res.json(rows);
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Actualizar estado (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { status } = req.body;
    await pool.query('UPDATE reports SET status = ? WHERE id = ?', [status, req.params.id]);
    res.json({ message: 'Reporte actualizado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar reporte (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM reports WHERE id = ?', [req.params.id]);
    res.json({ message: 'Reporte eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;