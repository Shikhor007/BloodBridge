
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');
const { initDatabase } = require('./models/dbAdapter');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Allowed frontend origins
const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim().replace(/\/+$/, ''))
  .filter(Boolean);

const defaultOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:3000'
];

const origins = [...defaultOrigins, ...allowedOrigins];

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      origins.includes(origin.replace(/\/+$/, ''))
    ) {
      return callback(null, true);
    }

    return callback(new Error('Blocked by CORS policy'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev'));

// Uploaded files
app.use('/uploads', express.static(
  path.join(__dirname, 'uploads')
));

// Authentication rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again later.'
  }
});

// Route imports
const authRoutes = require('./routes/authRoutes');
const publicRoutes = require('./routes/publicRoutes');
const patientRoutes = require('./routes/patientRoutes');
const donorRoutes = require('./routes/donorRoutes');
const hospitalRoutes = require('./routes/hospitalRoutes');
const adminRoutes = require('./routes/adminRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

// API routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/donor', donorRoutes);
app.use('/api/hospital', hospitalRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    platform: 'BloodBridge Central Blood Supply Management System',
    timestamp: new Date().toISOString(),
    database: 'CONNECTED_LOCAL_ADAPTER'
  });
});

// Central error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);

  if (err.name === 'MulterError') {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${err.message}`
    });
  }

  return res.status(500).json({
    success: false,
    message: err.message || 'Internal server error occurred.'
  });
});

// Start server
async function startServer() {
  try {
    await initDatabase();

    app.listen(PORT, '0.0.0.0', () => {
      console.log('==========================================');
      console.log(`BloodBridge API running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`Health: http://localhost:${PORT}/api/health`);
      console.log('==========================================');
    });

  } catch (error) {
    console.error('Failed to start BloodBridge server:', error);
    process.exit(1);
  }
}

startServer();
