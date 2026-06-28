/**
 * Memory Engine.
 *
 * Persists and retrieves schedule plans and observation insights in Firestore.
 *
 * References:
 *   TDD §9 "Memory Layer", TDD §31 "Firestore Data Model"
 *   AISPEC §11 "Memory Engine", AISPEC §31 "Learning Strategy"
 *
 * Responsibilities:
 *   - Persist generated execution plans in the 'schedules' collection.
 *   - Update/merge observation insights (blockers, work windows, summaries) in the 'insights' collection.
 *   - Provide helper methods for retrieving insights and schedules.
 *   - Catch and log database write errors without crashing or corrupting other states.
 */

const { getDb } = require('../../config/firebase')

/**
 * Validates the memory payload structure.
 *
 * @param {Object} data
 * @returns {string[]|null} Errors array or null if valid.
 */
function validateMemoryObject(data) {
  const errors = []
  if (!data) return ['Payload is null or undefined.']
  if (!data.userId) errors.push('Missing userId.')
  return errors.length > 0 ? errors : null
}

/**
 * Updates user memory with the latest planning run details.
 *
 * @param {import('../schemas/brain-context.schema').BrainContext} context
 * @param {import('../schemas/planning.schema').PlanningOutput} planningOutput
 * @param {Object} reflectionOutput
 * @param {Object} coachingOutput
 * @returns {Promise<{ success: boolean, errors?: string[] }>}
 */
async function updateMemory(context, planningOutput, reflectionOutput, coachingOutput) {
  const userId = context.user?.uid
  if (!userId) {
    return { success: false, errors: ['No authenticated user found in context.'] }
  }

  const db = getDb()
  if (!db) {
    return { success: false, errors: ['Firestore database connection is unavailable.'] }
  }

  const errors = []
  const now = new Date().toISOString()
  const todayDateStr = now.substring(0, 10) // YYYY-MM-DD

  // 1. Persist Schedule Plan (TDD §31 schedules schema)
  try {
    const totalHours = planningOutput.schedule?.reduce((acc, curr) => acc + (curr.totalHours || 0), 0) || 0
    const scheduleData = {
      userId,
      date: todayDateStr,
      taskBlocks: planningOutput.schedule?.[0]?.taskBlocks || [],
      totalHours,
      aiSummary: coachingOutput.dailySummary || planningOutput.summary || '',
      createdAt: now,
    }

    const valErrors = validateMemoryObject(scheduleData)
    if (valErrors) {
      errors.push(...valErrors)
    } else {
      console.log(`[Memory Engine] Persisting schedule for date: ${todayDateStr}`)
      // Store using a unique doc ID: userId_date to prevent duplicates on regeneration
      await db.collection('schedules').doc(`${userId}_${todayDateStr}`).set(scheduleData)
    }
  } catch (err) {
    console.error('[Memory Engine] Failed to write schedule to Firestore:', err.message)
    errors.push(`Schedule write error: ${err.message}`)
  }

  // 2. Persist/Update Long-term Insights (TDD §31 insights schema)
  try {
    const insightsRef = db.collection('insights').doc(userId)
    const insightsSnap = await insightsRef.get()
    const existingInsights = insightsSnap.exists ? insightsSnap.data() : {}

    // Extract blockers from reflection insights
    const newBlockers = (reflectionOutput.insights || [])
      .filter((ins) => ins.type === 'blocker')
      .map((ins) => ins.description)

    // Compute preferred study window from task blocks (earliest start to latest end)
    let preferredWorkWindow = existingInsights.preferredWorkWindow || 'Flexible'
    const taskBlocks = planningOutput.schedule?.[0]?.taskBlocks || []
    if (taskBlocks.length > 0) {
      const times = taskBlocks.map((b) => b.startTime.substring(11, 16)).sort()
      const start = times[0]
      const end = taskBlocks.map((b) => b.endTime.substring(11, 16)).sort().pop()
      preferredWorkWindow = `${start} - ${end}`
    }

    // Keep history lists limited to last 10 records
    const blockersLimit = Array.from(new Set([...(existingInsights.commonBlockers || []), ...newBlockers])).slice(0, 10)
    const reflectionHist = [reflectionOutput.reflectionSummary, ...(existingInsights.reflectionSummaries || [])]
      .filter(Boolean)
      .slice(0, 10)

    const recHist = [
      ...(coachingOutput.coachingMessages || []).map((m) => m.message),
      ...(existingInsights.recommendationHistory || []),
    ].slice(0, 10)

    // Calculate completion metrics
    const totalCount = context.activeTasks.length + context.completedTasks.length
    const averageCompletionRate = totalCount > 0 ? Math.round((context.completedTasks.length / totalCount) * 100) : 0

    const updatedInsights = {
      userId,
      preferredWorkWindow,
      averageCompletionRate,
      commonBlockers: blockersLimit,
      recommendationHistory: recHist,
      reflectionSummaries: reflectionHist,
      lastUpdatedAt: now,
    }

    const valErrors = validateMemoryObject(updatedInsights)
    if (valErrors) {
      errors.push(...valErrors)
    } else {
      console.log(`[Memory Engine] Merging insights observation profile for user: ${userId}`)
      await insightsRef.set(updatedInsights, { merge: true })
    }
  } catch (err) {
    console.error('[Memory Engine] Failed to write insights to Firestore:', err.message)
    errors.push(`Insights write error: ${err.message}`)
  }

  return {
    success: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  }
}

/**
 * Retrieves the user's long-term insights profile from Firestore.
 *
 * @param {string} userId
 * @returns {Promise<Object|null>}
 */
async function getMemoryInsights(userId) {
  const db = getDb()
  if (!db) return null
  try {
    console.log(`[Memory Engine] Reading insights for user: ${userId}`)
    const snap = await db.collection('insights').doc(userId).get()
    return snap.exists ? snap.data() : null
  } catch (err) {
    console.error('[Memory Engine] Failed to read insights:', err.message)
    return null
  }
}

module.exports = { updateMemory, getMemoryInsights }
