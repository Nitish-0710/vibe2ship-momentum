const mongoose = require('mongoose');
const User = require('../../models/User');
const Task = require('../../models/Task');
const Insight = require('../../models/Insight');
const Schedule = require('../../models/Schedule');
const { createEmptyBrainContext } = require('../schemas/brain-context.schema');

/**
 * Context Builder.
 *
 * Assembles a normalized BrainContext from MongoDB data for the
 * authenticated user. This is the FIRST step of every Brain pipeline.
 */

/**
 * Builds a complete BrainContext for the given user.
 *
 * @param {string} userId - Unique User ID (uid)
 * @returns {Promise<import('../schemas/brain-context.schema').BrainContext>}
 */
async function buildContext(userId) {
  const context = createEmptyBrainContext();
  const missingFields = [];

  const isConnected = mongoose.connection.readyState === 1;
  if (!isConnected) {
    missingFields.push('database');
    context.missingFields = missingFields;
    context.confidence = 0;
    return context;
  }

  // ── User Profile ────────────────────────────────────────────────
  try {
    const user = await User.findOne({ uid: userId });
    if (user) {
      context.user = {
        uid: user.uid || userId,
        name: user.name || '',
        email: user.email || '',
        occupation: user.occupation || '',
        timezone: user.timezone || 'UTC',
        wakeTime: user.wakeTime || '07:00',
        sleepTime: user.sleepTime || '23:00',
        preferences: user.preferences || {},
      };
      context.timezone = context.user.timezone;
    } else {
      missingFields.push('user');
    }
  } catch (err) {
    console.error('Context Builder — failed to read user profile:', err.message);
    missingFields.push('user');
  }

  // ── Tasks ───────────────────────────────────────────────────────
  try {
    const allTasks = await Task.find({ userId });

    context.activeTasks = allTasks.filter(
      (t) => t.status === 'pending' || t.status === 'in-progress'
    ).map(t => t.toObject());
    
    context.completedTasks = allTasks.filter(
      (t) => t.status === 'completed'
    ).map(t => t.toObject());
  } catch (err) {
    console.error('Context Builder — failed to read tasks:', err.message);
    missingFields.push('tasks');
  }

  // ── Memory Insights & Historical Schedules ──────────────────────
  try {
    const insightDoc = await Insight.findOne({ userId });
    context.memoryInsights = insightDoc ? insightDoc.toObject() : null;
  } catch (err) {
    console.error('Context Builder — failed to read insights memory:', err.message);
    missingFields.push('memoryInsights');
  }

  try {
    const previousSchedules = await Schedule.find({ userId })
      .sort({ date: -1 })
      .limit(5);
    context.previousSchedules = previousSchedules.map(doc => doc.toObject());
  } catch (err) {
    console.error('Context Builder — failed to read schedules history:', err.message);
    missingFields.push('previousSchedules');
  }

  // ── Timestamps ──────────────────────────────────────────────────
  context.currentTimestamp = new Date().toISOString();

  // ── Confidence ──────────────────────────────────────────────────
  context.missingFields = missingFields;
  context.confidence = calculateConfidence(context, missingFields);

  return context;
}

/**
 * Computes a 0–100 confidence score.
 *
 * @param {Object} context
 * @param {string[]} missingFields
 * @returns {number}
 */
function calculateConfidence(context, missingFields) {
  let score = 100;

  // Major penalties
  if (missingFields.includes('database')) return 0;
  if (missingFields.includes('user')) score -= 30;
  if (missingFields.includes('tasks')) score -= 30;

  // Minor deductions for incomplete data
  if (!context.user) score -= 10;
  if (context.activeTasks.length === 0 && context.completedTasks.length === 0) score -= 10;

  // Check for tasks missing critical fields
  for (const task of context.activeTasks) {
    if (!task.deadline) score -= 2;
    if (!task.estimatedHours) score -= 2;
  }

  return Math.max(0, Math.min(100, score));
}

module.exports = { buildContext };
