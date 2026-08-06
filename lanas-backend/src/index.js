require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const migrate = require('./utils/migrate');

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(o => o.trim())
  : ['http://localhost:5173', 'http://localhost:5174'];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, '..', process.env.UPLOAD_DIR || 'uploads')));

app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/products', require('./routes/products.routes'));
app.use('/api/categories', require('./routes/categories.routes'));
app.use('/api/orders', require('./routes/orders.routes'));
app.use('/api/dashboard', require('./routes/dashboard.routes'));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Error interno' });
});

const PORT = process.env.PORT || 4000;
migrate().then(() => {
  app.listen(PORT, () => console.log(`Backend corriendo en http://localhost:${PORT}`));
});
