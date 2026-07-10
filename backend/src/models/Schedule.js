const mongoose = require('mongoose');

const scheduleSchema = new mongoose.Schema({
  docId: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },
  date: { type: String, required: true },
  taskBlocks: { type: Array, default: [] },
  totalHours: { type: Number, default: 0 },
  aiSummary: { type: String, default: '' },
  fullPlan: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model('Schedule', scheduleSchema);
