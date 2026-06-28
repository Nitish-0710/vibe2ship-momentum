require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { initializeFirebase } = require('./config/firebase');
const { initializeGemini } = require('./config/gemini');

// Routes
const authRoutes = require('./routes/auth.routes');
const taskRoutes = require('./routes/task.routes');
const aiRoutes = require('./routes/ai.routes');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize Services
initializeFirebase();
initializeGemini();

// Health check — unauthenticated
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Momentum AI API is running' });
});

// Mount routes
app.use('/auth', authRoutes);
app.use('/tasks', taskRoutes);
app.use('/ai', aiRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: { code: 'NOT_FOUND', message: 'Route not found.' },
  });
});

// Global error handler
app.use((err, req, res, _next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: { code: 'SERVER_ERROR', message: 'An unexpected error occurred.' },
  });
});

module.exports = app;
