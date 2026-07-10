const mongoose = require('mongoose');

const insightSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true, index: true },
  preferredWorkWindow: { type: String, default: 'Flexible' },
  averageCompletionRate: { type: Number, default: 0 },
  commonBlockers: { type: [String], default: [] },
  recommendationHistory: { type: [String], default: [] },
  reflectionSummaries: { type: [String], default: [] },
  lastUpdatedAt: { type: String, default: () => new Date().toISOString() }
});

module.exports = mongoose.model('Insight', insightSchema);
