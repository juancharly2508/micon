const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { assertCondoReferences } = require('../utils/condominium');
const router = express.Router();

// Obtener todos los usuarios (admin)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, full_name, phone, role, property_id, active, created_at, resident_status, owner_name, emergency_phone, pending_unit_number, profile_photo_uri FROM users WHERE condo_id = ? AND id <> ? AND (role <> \'guardia\' OR ? = 1)', [req.user.condo_id, req.user.id, req.user.has_guards ? 1 : 0]);
    res.json(rows);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Obtener un usuario por ID
router.get('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT id, email, full_name, phone, role, property_id, active, created_at FROM users WHERE condo_id = ? AND id = ? AND (role <> \'guardia\' OR ? = 1)', [req.user.condo_id, req.params.id, req.user.has_guards ? 1 : 0]);
    if (rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(rows[0]);
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear usuario (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { full_name, email, password, phone, role, property_id } = req.body;
    if (role !== 'guardia') return res.status(400).json({ error: 'Los residentes se agregan con su código de vinculación. Desde aquí solo puedes crear cuentas de guardia.' });
    const [[condo]] = await pool.query('SELECT has_guards FROM condominiums WHERE id = ?', [req.user.condo_id]);
    if (!condo?.has_guards) return res.status(403).json({ error: 'Activa el servicio de guardia en la configuración del condominio.' });
    await assertCondoReferences(req.user.condo_id, { propertyId: property_id });
    if (!full_name?.trim() || !email?.trim() || !password || password.length < 8) return res.status(400).json({ error: 'Completa nombre, correo y una contraseña de al menos 8 caracteres.' });
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (full_name, email, password_hash, phone, role, property_id, condo_id)
       VALUES (?, ?, ?, ?, 'guardia', ?, ?)`,
      [full_name.trim(), email.trim().toLowerCase(), hashed, phone || null, property_id || null, req.user.condo_id]
    );
    res.status(201).json({ id: result.insertId, message: 'Usuario creado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Actualizar usuario (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { full_name, email, phone, role, property_id, active } = req.body;
    await assertCondoReferences(req.user.condo_id, { propertyId: property_id });
    await pool.query(
      'UPDATE users SET full_name = ?, email = ?, phone = ?, property_id = ?, active = ? WHERE condo_id = ? AND id = ? AND role = \'guardia\'',
      [full_name, email, phone, property_id, active, req.user.condo_id, req.params.id]
    );
    res.json({ message: 'Usuario actualizado' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar usuario (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM users WHERE condo_id = ? AND id = ? AND role = \'guardia\'', [req.user.condo_id, req.params.id]);
    res.json({ message: 'Usuario eliminado' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.post('/link', authenticate, authorize('admin'), async (req, res) => {
  const code = String(req.body.code || '').trim().toUpperCase();
  if (!code) return res.status(400).json({ error: 'Escribe el código de registro del residente.' });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [users] = await connection.query(
      'SELECT id, full_name, pending_unit_number, resident_status FROM users WHERE membership_code = ? AND condo_id IS NULL AND role = \'residente\' FOR UPDATE', [code]
    );
    if (!users.length) throw new Error('No encontramos un residente pendiente con ese código. Revísalo e intenta de nuevo.');
    const resident = users[0];
    const [properties] = await connection.query(
      'SELECT id FROM properties WHERE condo_id = ? AND unit_number = ?', [req.user.condo_id, resident.pending_unit_number]
    );
    if (!properties.length) throw new Error(`La vivienda “${resident.pending_unit_number}” no existe en este condominio. Revisa el número capturado por el residente.`);
    const propertyId = properties[0].id;
    await connection.query(
      `UPDATE users SET condo_id = ?, property_id = ?, membership_code = NULL
       WHERE id = ? AND condo_id IS NULL`, [req.user.condo_id, propertyId, resident.id]
    );
    if (resident.resident_status === 'propietario') {
      await connection.query('UPDATE properties SET owner_user_id = COALESCE(owner_user_id, ?) WHERE id = ? AND condo_id = ?', [resident.id, propertyId, req.user.condo_id]);
    } else {
      await connection.query('UPDATE properties SET tenant_user_id = COALESCE(tenant_user_id, ?), is_rental = 1 WHERE id = ? AND condo_id = ?', [resident.id, propertyId, req.user.condo_id]);
    }
    await connection.commit();
    res.status(201).json({ id: resident.id, full_name: resident.full_name, property_id: propertyId, message: 'Residente vinculado correctamente.' });
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally { connection.release(); }
});

module.exports = router;
