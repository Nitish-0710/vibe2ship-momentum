const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  name: { type: String, default: '' },
  email: { type: String, required: true, unique: true, index: true },
  password: { type: String, required: true },
  occupation: { type: String, default: '' },
  timezone: { type: String, default: 'UTC' },
  wakeTime: { type: String, default: '07:00' },
  sleepTime: { type: String, default: '23:00' },
  preferences: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model('User', userSchema);
