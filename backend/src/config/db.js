const mongoose = require('mongoose');

async function initializeDb() {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is missing.');
    }

    await mongoose.connect(mongoUri);
    console.log('MongoDB connection initialized successfully.');
  } catch (error) {
    console.error('MongoDB initialization error:', error.message);
    process.exit(1);
  }
}

module.exports = { initializeDb };
