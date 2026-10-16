const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5174'
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    system: 'Blood Care Management System API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/donors', require('./routes/donorRoutes'));
app.use('/api/requests', require('./routes/requestRoutes'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/matching', require('./routes/matchingRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));

// 404 handler for undefined API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint '${req.originalUrl}' not found.`
  });
});

// Centralized error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server = null;

const startServer = async () => {
  try {
    await connectDB();
    server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(` Blood Care Management System - Backend Server Running `);
      console.log(` Environment: ${process.env.NODE_ENV || 'development'} `);
      console.log(` Port: ${PORT} `);
      console.log(` Health: http://localhost:${PORT}/api/health `);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

// Start the server if executed directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
