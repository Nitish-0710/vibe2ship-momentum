require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { initializeFirebase } = require('./config/firebase');
const { initializeGemini } = require('./config/gemini');

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Initialize Services
initializeFirebase();
initializeGemini();

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Momentum AI API is running' });
});

module.exports = app;
