const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Registro (solo residentes, el admin crea usuarios después)
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone, property_id } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role, property_id)
       VALUES (?, ?, ?, ?, 'residente', ?)`,
      [full_name, email, hashed, phone, property_id]
    );
    const [userRows] = await pool.query('SELECT id, email, full_name, role, property_id FROM users WHERE id = ?', [result.insertId]);
    const user = userRows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, property_id: user.property_id } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Perfil
router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, full_name, role, property_id FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;