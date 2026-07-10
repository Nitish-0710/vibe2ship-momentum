const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'other' },
  deadline: { type: String, default: null },
  estimatedHours: { type: Number, default: null },
  priorityScore: { type: Number, default: null },
  status: { type: String, default: 'pending' },
  createdAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model('Task', taskSchema);
