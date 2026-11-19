const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Listar avisos (todos los roles)
router.get('/', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM announcements WHERE condo_id = ? AND active = 1 ORDER BY created_at DESC', [req.user.condo_id]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear aviso (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, body, expires_at } = req.body;
    const [result] = await pool.query(
      'INSERT INTO announcements (condo_id, title, body, created_by, expires_at) VALUES (?, ?, ?, ?, ?)',
      [req.user.condo_id, title, body, req.user.id, expires_at]
    );
    res.status(201).json({ id: result.insertId, message: 'Aviso creado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Actualizar aviso (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { title, body, expires_at, active } = req.body;
    await pool.query(
      'UPDATE announcements SET title = ?, body = ?, expires_at = ?, active = ? WHERE condo_id = ? AND id = ?',
      [title, body, expires_at, active, req.user.condo_id, req.params.id]
    );
    res.json({ message: 'Aviso actualizado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar aviso (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM announcements WHERE condo_id = ? AND id = ?', [req.user.condo_id, req.params.id]);
    res.json({ message: 'Aviso eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
