const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const announcementsRoutes = require('./routes/announcements');
const debtsRoutes = require('./routes/debts');
const areasRoutes = require('./routes/areas');
const reservationsRoutes = require('./routes/reservations');
const qrRoutes = require('./routes/qr');
const reportsRoutes = require('./routes/reports');
const propertiesRoutes = require('./routes/properties');
const usersRoutes = require('./routes/users');
const paymentsRoutes = require('./routes/payments');
const schedulesRoutes = require('./routes/schedules');
const condominiumsRoutes = require('./routes/condominiums');

const app = express();
app.use(cors());
app.use(express.json({ limit: '8mb' }));

app.get('/health', async (_req, res) => {
  try {
    const pool = require('./db');
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch (error) {
    res.status(503).json({ status: 'unavailable', error: 'Database connection failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api/announcements', announcementsRoutes);
app.use('/api/debts', debtsRoutes);
app.use('/api/areas', areasRoutes);
app.use('/api/reservations', reservationsRoutes);
app.use('/api/qr', qrRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/properties', propertiesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/schedules', schedulesRoutes);
app.use('/api/condominiums', condominiumsRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API MiCon en puerto ${PORT}`));
