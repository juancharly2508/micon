const express = require('express');
const pool = require('../db');
const { authenticate, authorize } = require('../middleware/auth');

const router = express.Router();

router.get('/me', authenticate, async (req, res) => {
  try {
    if (!req.user.condo_id) return res.status(403).json({ error: 'Tu cuenta aún no está vinculada a un condominio.' });
    const [rows] = await pool.query(
      'SELECT id, name, unit_count, rules, has_guards, setup_step, setup_completed FROM condominiums WHERE id = ?',
      [req.user.condo_id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Condominio no encontrado.' });
    const [areaRows] = await pool.query('SELECT name FROM reservation_areas WHERE condo_id = ? AND active = 1 ORDER BY name', [req.user.condo_id]);
    res.json({ ...rows[0], areas: areaRows.map((area) => area.name) });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

router.patch('/setup', authenticate, authorize('admin'), async (req, res) => {
  const { step, unit_count, areas, rules, has_guards, complete } = req.body;
  const condoId = req.user.condo_id;
  if (!condoId || !Number.isInteger(step) || step < 1 || step > 5) return res.status(400).json({ error: 'Paso de configuración inválido.' });
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    const [[currentCondo]] = await connection.query('SELECT setup_step, setup_completed FROM condominiums WHERE id = ? FOR UPDATE', [condoId]);
    if (!currentCondo) throw new Error('Condominio no encontrado.');
    if (step > currentCondo.setup_step + 1) throw new Error('Completa los pasos en orden para continuar.');
    if (currentCondo.setup_completed && step !== 3 && !complete) throw new Error('Usa las opciones de configuración para actualizar una comunidad ya activa.');
    if (step === 1) {
      const count = Number(unit_count);
      if (!Number.isInteger(count) || count < 1 || count > 500) throw new Error('Indica entre 1 y 500 viviendas.');
      await connection.query('UPDATE condominiums SET unit_count = ? WHERE id = ?', [count, condoId]);
      const [existing] = await connection.query('SELECT unit_number FROM properties WHERE condo_id = ?', [condoId]);
      const known = new Set(existing.map((row) => row.unit_number));
      for (let i = 1; i <= count; i += 1) {
        const unit = `Casa ${i}`;
        if (!known.has(unit)) await connection.query('INSERT INTO properties (condo_id, unit_number) VALUES (?, ?)', [condoId, unit]);
      }
    }
    if (step === 2) {
      if (!Array.isArray(areas) || areas.some((name) => typeof name !== 'string' || !name.trim())) throw new Error('Revisa los nombres de las amenidades.');
      await connection.query('UPDATE reservation_areas SET active = 0 WHERE condo_id = ?', [condoId]);
      for (const name of [...new Set(areas.map((value) => value.trim()).filter(Boolean))]) {
        await connection.query(
          'INSERT INTO reservation_areas (condo_id, name, description, requires_reservation, is_public, max_capacity, active) VALUES (?, ?, ?, 1, 0, 1, 1) ON DUPLICATE KEY UPDATE active = 1',
          [condoId, name, '']
        );
      }
    }
    if (step === 3) {
      if (typeof rules !== 'string' || !rules.trim()) throw new Error('Escribe las reglas principales o indica que no hay reglas definidas todavía.');
      await connection.query('UPDATE condominiums SET rules = ? WHERE id = ?', [rules.trim(), condoId]);
    }
    if (step === 5) {
      if (typeof has_guards !== 'boolean') throw new Error('Indica si tu condominio cuenta con servicio de guardia.');
      await connection.query('UPDATE condominiums SET has_guards = ? WHERE id = ?', [has_guards ? 1 : 0, condoId]);
    }
    const completed = Boolean(complete);
    if (completed) {
      const [[condo]] = await connection.query('SELECT unit_count, rules, setup_step FROM condominiums WHERE id = ? FOR UPDATE', [condoId]);
      if (!condo.unit_count || !condo.rules || currentCondo.setup_step < 4 || step !== 5) throw new Error('Completa los cinco pasos antes de abrir el panel.');
      await connection.query('UPDATE condominiums SET setup_step = 5, setup_completed = 1 WHERE id = ?', [condoId]);
    } else {
      await connection.query('UPDATE condominiums SET setup_step = GREATEST(setup_step, ?) WHERE id = ?', [step, condoId]);
    }
    await connection.commit();
    const [rows] = await pool.query('SELECT id, name, unit_count, rules, has_guards, setup_step, setup_completed FROM condominiums WHERE id = ?', [condoId]);
    res.json(rows[0]);
  } catch (error) {
    await connection.rollback();
    res.status(400).json({ error: error.message });
  } finally { connection.release(); }
});

router.patch('/guards', authenticate, authorize('admin'), async (req, res) => {
  if (typeof req.body.has_guards !== 'boolean') return res.status(400).json({ error: 'Indica si el servicio de guardia está habilitado.' });
  try {
    await pool.query('UPDATE condominiums SET has_guards = ? WHERE id = ?', [req.body.has_guards ? 1 : 0, req.user.condo_id]);
    res.json({ has_guards: req.body.has_guards });
  } catch (error) { res.status(500).json({ error: error.message }); }
});

module.exports = router;
