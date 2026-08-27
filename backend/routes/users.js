const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Obtener todos los usuarios (admin)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, full_name, phone, role, property_id, active, created_at FROM users');
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Obtener un usuario por ID
router.get('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, full_name, phone, role, property_id, active, created_at FROM users WHERE id = ?', [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear usuario (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { full_name, email, password, phone, role, property_id } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role, property_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [full_name, email, hashed, phone, role, property_id]
    );
    res.status(201).json({ id: result.insertId, message: 'Usuario creado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Actualizar usuario (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { full_name, email, phone, role, property_id, active } = req.body;
    await pool.query(
      'UPDATE users SET full_name = ?, email = ?, phone = ?, role = ?, property_id = ?, active = ? WHERE id = ?',
      [full_name, email, phone, role, property_id, active, req.params.id]
    );
    res.json({ message: 'Usuario actualizado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar usuario (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;