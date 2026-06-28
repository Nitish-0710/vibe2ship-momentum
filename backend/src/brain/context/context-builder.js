/**
 * Context Builder.
 *
 * Assembles a normalized BrainContext from Firestore data for the
 * authenticated user. This is the FIRST step of every Brain pipeline.
 *
 * References: TDD §20 "Context Builder", AISPEC §7 "Context Builder"
 *
 * Responsibilities:
 *   - Gather user profile
 *   - Gather active tasks (pending / in-progress)
 *   - Gather completed tasks
 *   - Normalize timestamps
 *   - Mark missing fields
 *   - Compute confidence
 *
 * Does NOT:
 *   - Invoke AI
 *   - Perform reasoning
 *   - Score priorities
 */

const { getDb } = require('../../config/firebase')
const { createEmptyBrainContext } = require('../schemas/brain-context.schema')

/**
 * Builds a complete BrainContext for the given user.
 *
 * AISPEC §7 Failure Handling:
 *   - If partial data is unavailable, continue with what is available.
 *   - Mark missing fields.
 *   - Lower confidence.
 *
 * @param {string} userId - Firebase UID
 * @returns {Promise<import('../schemas/brain-context.schema').BrainContext>}
 */
async function buildContext(userId) {
  const context = createEmptyBrainContext()
  const missingFields = []

  const db = getDb()
  if (!db) {
    missingFields.push('firestore')
    context.missingFields = missingFields
    context.confidence = 0
    return context
  }

  // ── User Profile ────────────────────────────────────────────────
  try {
    const userSnap = await db.collection('users').doc(userId).get()
    if (userSnap.exists) {
      const data = userSnap.data()
      context.user = {
        uid: data.uid || userId,
        name: data.name || '',
        email: data.email || '',
        occupation: data.occupation || '',
        timezone: data.timezone || 'UTC',
        wakeTime: data.wakeTime || '07:00',
        sleepTime: data.sleepTime || '23:00',
        preferences: data.preferences || {},
      }
      context.timezone = context.user.timezone
    } else {
      missingFields.push('user')
    }
  } catch (err) {
    console.error('Context Builder — failed to read user profile:', err.message)
    missingFields.push('user')
  }

  // ── Tasks ───────────────────────────────────────────────────────
  try {
    const taskSnap = await db
      .collection('tasks')
      .where('userId', '==', userId)
      .get()

    const allTasks = taskSnap.docs.map((doc) => doc.data())

    context.activeTasks = allTasks.filter(
      (t) => t.status === 'pending' || t.status === 'in-progress',
    )
    context.completedTasks = allTasks.filter(
      (t) => t.status === 'completed',
    )
  } catch (err) {
    console.error('Context Builder — failed to read tasks:', err.message)
    missingFields.push('tasks')
  }

  // ── Timestamps ──────────────────────────────────────────────────
  context.currentTimestamp = new Date().toISOString()

  // ── Confidence ──────────────────────────────────────────────────
  context.missingFields = missingFields
  context.confidence = calculateConfidence(context, missingFields)

  return context
}

/**
 * Computes a 0–100 confidence score.
 * AISPEC §22: factors that increase/reduce confidence.
 *
 * @param {Object} context
 * @param {string[]} missingFields
 * @returns {number}
 */
function calculateConfidence(context, missingFields) {
  let score = 100

  // Major penalties
  if (missingFields.includes('firestore')) return 0
  if (missingFields.includes('user')) score -= 30
  if (missingFields.includes('tasks')) score -= 30

  // Minor deductions for incomplete data
  if (!context.user) score -= 10
  if (context.activeTasks.length === 0 && context.completedTasks.length === 0) score -= 10

  // Check for tasks missing critical fields
  for (const task of context.activeTasks) {
    if (!task.deadline) score -= 2
    if (!task.estimatedHours) score -= 2
  }

  return Math.max(0, Math.min(100, score))
}

module.exports = { buildContext }
