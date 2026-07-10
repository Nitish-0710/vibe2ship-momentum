const mongoose = require('mongoose');
const Schedule = require('../../models/Schedule');
const Insight = require('../../models/Insight');

/**
 * Memory Engine.
 *
 * Persists and retrieves schedule plans and observation insights in MongoDB.
 */

/**
 * Validates the memory payload structure.
 *
 * @param {Object} data
 * @returns {string[]|null} Errors array or null if valid.
 */
function validateMemoryObject(data) {
  const errors = [];
  if (!data) return ['Payload is null or undefined.'];
  if (!data.userId) errors.push('Missing userId.');
  return errors.length > 0 ? errors : null;
}

/**
 * Updates user memory with the latest planning run details.
 *
 * @param {import('../schemas/brain-context.schema').BrainContext} context
 * @param {import('../schemas/planning.schema').PlanningOutput} planningOutput
 * @param {Object} reflectionOutput
 * @param {Object} coachingOutput
 * @param {Object} [decisions]
 * @param {Object} [reasoning]
 * @returns {Promise<{ success: boolean, errors?: string[] }>}
 */
async function updateMemory(context, planningOutput, reflectionOutput, coachingOutput, decisions, reasoning) {
  const userId = context.user?.uid;
  if (!userId) {
    return { success: false, errors: ['No authenticated user found in context.'] };
  }

  const isConnected = mongoose.connection.readyState === 1;
  if (!isConnected) {
    return { success: false, errors: ['Database connection is unavailable.'] };
  }

  const errors = [];
  const now = new Date().toISOString();
  const todayDateStr = now.substring(0, 10); // YYYY-MM-DD

  // 1. Persist Schedule Plan
  try {
    const totalHours = planningOutput.schedule?.reduce((acc, curr) => acc + (curr.totalHours || 0), 0) || 0;
    const docId = `${userId}_${todayDateStr}`;

    const scheduleData = {
      docId,
      userId,
      date: todayDateStr,
      taskBlocks: planningOutput.schedule?.[0]?.taskBlocks || [],
      totalHours,
      aiSummary: coachingOutput.dailySummary || planningOutput.summary || '',
      createdAt: now,
      fullPlan: {
        planningResult: planningOutput.planningResult,
        taskPriorities: planningOutput.taskPriorities,
        schedule: planningOutput.schedule,
        recommendations: planningOutput.recommendations,
        confidence: planningOutput.confidence,
        summary: planningOutput.summary,
        decisions: decisions || {
          priorityOrdering: [],
          urgencyAssessment: {},
          focusRecommendations: [],
          deferredTasks: [],
          blockedTasks: [],
          confidence: 100,
          summary: '',
        },
        reasoning: reasoning || {
          extractedTasks: [],
          detectedRisks: [],
          estimatedWorkload: 0,
          summary: '',
          confidence: 100,
        },
        reflection: reflectionOutput,
        coaching: coachingOutput,
      }
    };

    const valErrors = validateMemoryObject(scheduleData);
    if (valErrors) {
      errors.push(...valErrors);
    } else {
      console.log(`[Memory Engine] Persisting schedule in MongoDB for date: ${todayDateStr}`);
      await Schedule.findOneAndUpdate(
        { docId },
        scheduleData,
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error('[Memory Engine] Failed to write schedule to MongoDB:', err.message);
    errors.push(`Schedule write error: ${err.message}`);
  }

  // 2. Persist/Update Long-term Insights
  try {
    const existingInsights = await Insight.findOne({ userId });
    const existingData = existingInsights ? existingInsights.toObject() : {};

    // Extract blockers from reflection insights
    const newBlockers = (reflectionOutput.insights || [])
      .filter((ins) => ins.type === 'blocker')
      .map((ins) => ins.description);

    // Compute preferred study window from task blocks (earliest start to latest end)
    let preferredWorkWindow = existingData.preferredWorkWindow || 'Flexible';
    const taskBlocks = planningOutput.schedule?.[0]?.taskBlocks || [];
    if (taskBlocks.length > 0) {
      const times = taskBlocks.map((b) => b.startTime.substring(11, 16)).sort();
      const start = times[0];
      const end = taskBlocks.map((b) => b.endTime.substring(11, 16)).sort().pop();
      preferredWorkWindow = `${start} - ${end}`;
    }

    // Keep history lists limited to last 10 records
    const blockersLimit = Array.from(new Set([...(existingData.commonBlockers || []), ...newBlockers])).slice(0, 10);
    const reflectionHist = [reflectionOutput.reflectionSummary, ...(existingData.reflectionSummaries || [])]
      .filter(Boolean)
      .slice(0, 10);

    const recHist = [
      ...(coachingOutput.coachingMessages || []).map((m) => m.message),
      ...(existingData.recommendationHistory || []),
    ].slice(0, 10);

    // Calculate completion metrics
    const totalCount = context.activeTasks.length + context.completedTasks.length;
    const averageCompletionRate = totalCount > 0 ? Math.round((context.completedTasks.length / totalCount) * 100) : 0;

    const updatedInsights = {
      userId,
      preferredWorkWindow,
      averageCompletionRate,
      commonBlockers: blockersLimit,
      recommendationHistory: recHist,
      reflectionSummaries: reflectionHist,
      lastUpdatedAt: now,
    };

    const valErrors = validateMemoryObject(updatedInsights);
    if (valErrors) {
      errors.push(...valErrors);
    } else {
      console.log(`[Memory Engine] Merging insights observation profile in MongoDB for user: ${userId}`);
      await Insight.findOneAndUpdate(
        { userId },
        updatedInsights,
        { upsert: true, new: true }
      );
    }
  } catch (err) {
    console.error('[Memory Engine] Failed to write insights to MongoDB:', err.message);
    errors.push(`Insights write error: ${err.message}`);
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Retrieves the user's long-term insights profile from MongoDB.
 *
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
async function getMemoryInsights(userId) {
  try {
    console.log(`[Memory Engine] Reading insights from MongoDB for user: ${userId}`);
    const insight = await Insight.findOne({ userId });
    return insight ? insight.toObject() : null;
  } catch (err) {
    console.error('[Memory Engine] Failed to read insights:', err.message);
    return null;
  }
}

module.exports = { updateMemory, getMemoryInsights };
