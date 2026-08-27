const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const router = express.Router();

// Listar propiedades (admin ve todas, usuario ve la suya)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT * FROM properties');
      return res.json(rows);
    } else {
      const [rows] = await pool.query('SELECT * FROM properties WHERE id = ?', [req.user.property_id]);
      return res.json(rows);
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear propiedad (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { unit_number, address, owner_user_id, tenant_user_id, is_rental, monthly_maintenance_fee, status } = req.body;
    const [result] = await pool.query(
      'INSERT INTO properties (unit_number, address, owner_user_id, tenant_user_id, is_rental, monthly_maintenance_fee, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [unit_number, address, owner_user_id, tenant_user_id, is_rental, monthly_maintenance_fee, status]
    );
    res.status(201).json({ id: result.insertId, message: 'Propiedad creada' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Actualizar propiedad (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { unit_number, address, owner_user_id, tenant_user_id, is_rental, monthly_maintenance_fee, status } = req.body;
    await pool.query(
      'UPDATE properties SET unit_number = ?, address = ?, owner_user_id = ?, tenant_user_id = ?, is_rental = ?, monthly_maintenance_fee = ?, status = ? WHERE id = ?',
      [unit_number, address, owner_user_id, tenant_user_id, is_rental, monthly_maintenance_fee, status, req.params.id]
    );
    res.json({ message: 'Propiedad actualizada' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar propiedad (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM properties WHERE id = ?', [req.params.id]);
    res.json({ message: 'Propiedad eliminada' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;