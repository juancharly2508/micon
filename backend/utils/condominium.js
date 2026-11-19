const pool = require('../db');

const tables = {
  userId: 'users',
  propertyId: 'properties',
  areaId: 'reservation_areas',
};

async function assertCondoReferences(condoId, references, connection = pool) {
  for (const [field, table] of Object.entries(tables)) {
    const id = references[field];
    if (id === undefined || id === null || id === '') continue;
    const [rows] = await connection.query(`SELECT id FROM ${table} WHERE id = ? AND condo_id = ?`, [id, condoId]);
    if (!rows.length) throw new Error('Uno de los elementos seleccionados no pertenece a este condominio.');
  }
}

module.exports = { assertCondoReferences };
