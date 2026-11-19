const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');
const { assertCondoReferences } = require('../utils/condominium');
const router = express.Router();

// Listar propiedades (admin ve todas, usuario ve la suya)
router.get('/', authenticate, async (req, res) => {
  try {
    if (req.user.role === 'admin') {
      const [rows] = await pool.query('SELECT * FROM properties WHERE condo_id = ?', [req.user.condo_id]);
      return res.json(rows);
    } else {
      const [rows] = await pool.query('SELECT * FROM properties WHERE condo_id = ? AND id = ?', [req.user.condo_id, req.user.property_id]);
      return res.json(rows);
    }
  } catch (error) { res.status(500).json({ error: error.message }); }
});

// Crear propiedad (admin)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { unit_number, address, owner_user_id, tenant_user_id, is_rental, monthly_maintenance_fee, status } = req.body;
    await assertCondoReferences(req.user.condo_id, { userId: owner_user_id, propertyId: null });
    await assertCondoReferences(req.user.condo_id, { userId: tenant_user_id });
    const [result] = await pool.query(
      'INSERT INTO properties (condo_id, unit_number, address, owner_user_id, tenant_user_id, is_rental, monthly_maintenance_fee, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [req.user.condo_id, unit_number, address, owner_user_id, tenant_user_id, is_rental, monthly_maintenance_fee, status]
    );
    res.status(201).json({ id: result.insertId, message: 'Propiedad creada' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Actualizar propiedad (admin)
router.put('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { unit_number, address, owner_user_id, tenant_user_id, is_rental, monthly_maintenance_fee, status } = req.body;
    await assertCondoReferences(req.user.condo_id, { userId: owner_user_id });
    await assertCondoReferences(req.user.condo_id, { userId: tenant_user_id });
    await pool.query(
      'UPDATE properties SET unit_number = ?, address = ?, owner_user_id = ?, tenant_user_id = ?, is_rental = ?, monthly_maintenance_fee = ?, status = ? WHERE condo_id = ? AND id = ?',
      [unit_number, address, owner_user_id, tenant_user_id, is_rental, monthly_maintenance_fee, status, req.user.condo_id, req.params.id]
    );
    res.json({ message: 'Propiedad actualizada' });
  } catch (error) { res.status(400).json({ error: error.message }); }
});

// Eliminar propiedad (admin)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    await pool.query('DELETE FROM properties WHERE condo_id = ? AND id = ?', [req.user.condo_id, req.params.id]);
    res.json({ message: 'Propiedad eliminada' });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
