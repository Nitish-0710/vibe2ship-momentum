const mongoose = require('mongoose');

const reflectionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  productivityRating: { type: Number, required: true },
  completedTasks: { type: [String], default: [] },
  blockers: { type: [String], default: [] },
  notes: { type: String, default: '' },
  createdAt: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model('Reflection', reflectionSchema);
