const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const pool = require('../db');
const router = express.Router();
const { authenticate } = require('../middleware/auth');

// Residentes se registran primero y se vinculan a su condominio con su código.
router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password, phone, pending_unit_number, resident_status, owner_name, emergency_phone, profile_photo_uri } = req.body;
    if (!full_name?.trim() || !email?.trim() || !password || !pending_unit_number?.trim() || !['propietario', 'inquilino'].includes(resident_status) || !emergency_phone?.trim()) {
      return res.status(400).json({ error: 'Completa nombre, correo, contraseña, vivienda, estatus y contacto de emergencia.' });
    }
    if (password.length < 8) return res.status(400).json({ error: 'Usa una contraseña de al menos 8 caracteres.' });
    if (resident_status === 'inquilino' && !owner_name?.trim()) return res.status(400).json({ error: 'Indica el nombre del propietario.' });
    if (!profile_photo_uri) return res.status(400).json({ error: 'Agrega una foto de perfil para identificación.' });
    if (!/^data:image\/(jpeg|png|webp);base64,/.test(profile_photo_uri) || profile_photo_uri.length > 6 * 1024 * 1024) return res.status(400).json({ error: 'La foto debe ser una imagen válida y pesar menos de 6 MB.' });
    const hashed = await bcrypt.hash(password, 10);
    const membershipCode = crypto.randomBytes(5).toString('hex').toUpperCase();
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role, pending_unit_number, resident_status, owner_name, emergency_phone, profile_photo_uri, membership_code)
       VALUES (?, ?, ?, ?, 'residente', ?, ?, ?, ?, ?, ?)`,
      [full_name.trim(), email.trim().toLowerCase(), hashed, phone || null, pending_unit_number.trim(), resident_status, resident_status === 'inquilino' ? owner_name.trim() : null, emergency_phone.trim(), profile_photo_uri, membershipCode]
    );
    const user = { id: result.insertId, email: email.trim().toLowerCase(), full_name: full_name.trim(), role: 'residente', condo_id: null, property_id: null, membership_code: membershipCode, has_guards: false, setup_completed: false };
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, condo_id: null }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user, membership_code: membershipCode, message: 'Cuenta creada. Comparte este código con la administración para vincular tu vivienda.' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const [rows] = await pool.query(
      `SELECT u.*, c.name AS condominium_name, c.has_guards, c.setup_completed
       FROM users u LEFT JOIN condominiums c ON c.id = u.condo_id WHERE u.email = ?`, [email?.trim().toLowerCase()]
    );
    if (rows.length === 0) return res.status(401).json({ error: 'Credenciales inválidas' });

    const user = rows[0];
    if (!user.active) return res.status(403).json({ error: 'Esta cuenta está desactivada.' });
    if (user.role === 'guardia' && !user.has_guards) return res.status(403).json({ error: 'Este condominio no tiene habilitado el servicio de guardia.' });
    if (user.condo_id && user.role !== 'admin' && !user.setup_completed) return res.status(403).json({ error: 'La administración está completando la configuración inicial del condominio.' });
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciales inválidas' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, condo_id: user.condo_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name, property_id: user.property_id, condo_id: user.condo_id, membership_code: user.condo_id ? null : user.membership_code, has_guards: Boolean(user.has_guards), setup_completed: Boolean(user.setup_completed), condominium_name: user.condominium_name } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Perfil
router.get('/me', authenticate, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, full_name, role, property_id, condo_id, membership_code, resident_status, owner_name, emergency_phone, profile_photo_uri, pending_unit_number FROM users WHERE id = ?', [req.user.id]);
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Registro de administrador: crea una cuenta y un condominio aislado.
router.post('/register-admin', async (req, res) => {
  const { full_name, email, password, condominium_name } = req.body;
  if (!full_name?.trim() || !email?.trim() || !password || password.length < 8 || !condominium_name?.trim()) {
    return res.status(400).json({ error: 'Completa tu nombre, correo, contraseña de al menos 8 caracteres y nombre del condominio.' });
  }
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const hashed = await bcrypt.hash(password, 10);
    const [createdUser] = await connection.query(
      `INSERT INTO users (full_name, email, password_hash, role) VALUES (?, ?, ?, 'admin')`,
      [full_name.trim(), email.trim().toLowerCase(), hashed]
    );
    const [createdCondo] = await connection.query(
      'INSERT INTO condominiums (name, owner_user_id) VALUES (?, ?)', [condominium_name.trim(), createdUser.insertId]
    );
    await connection.query('UPDATE users SET condo_id = ? WHERE id = ?', [createdCondo.insertId, createdUser.insertId]);
    await connection.commit();
    const user = { id: createdUser.insertId, email: email.trim().toLowerCase(), full_name: full_name.trim(), role: 'admin', condo_id: createdCondo.insertId, condominium_name: condominium_name.trim(), has_guards: false, setup_completed: false };
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, condo_id: user.condo_id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.code === 'ER_DUP_ENTRY' ? 'Ya existe una cuenta con ese correo.' : error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
