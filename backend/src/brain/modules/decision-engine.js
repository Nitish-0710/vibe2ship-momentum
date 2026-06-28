/**
 * Decision Engine.
 *
 * Programmatically processes the ReasoningOutput and BrainContext to rank tasks,
 * assess urgency, select focus candidates, detect blocked tasks, and defer low-priority items.
 *
 * References: TDD §21 "Reasoning Engines" -> Module 2, AISPEC §9 "Decision Engine"
 *
 * Responsibilities:
 *   - Rank priorities based on urgency, importance, and deadline proximity.
 *   - Identify blocked tasks based on dependencies present in the active/completed tasks list.
 *   - Highlight 1-3 immediate focus recommendations (non-blocked, high priority).
 *   - Defer low-priority or capacity-overloaded tasks.
 *   - Adjust confidence based on context and detected risks.
 *
 * Does NOT:
 *   - Generate time blocks/schedules.
 *   - Execute AI calls.
 */

const URGENCY_VALUES = { critical: 4, high: 3, medium: 2, low: 1 }
const IMPORTANCE_VALUES = { critical: 4, high: 3, medium: 2, low: 1 }

/**
 * Executes decision logic over reasoning output and context.
 *
 * @param {import('../schemas/brain-context.schema').BrainContext} context
 * @param {import('../schemas/reasoning.schema').ReasoningOutput} reasoningOutput
 * @returns {Promise<Object>} Structured decision result
 */
async function executeDecisions(context, reasoningOutput) {
  const startTime = Date.now()
  console.log('[Decision Engine] Starting decision mapping...')

  const { activeTasks, completedTasks, currentTimestamp } = context
  const { extractedTasks = [], detectedRisks = [] } = reasoningOutput

  const completedTaskIds = new Set(completedTasks.map((t) => t.id))
  const activeTaskMap = new Map(activeTasks.map((t) => [t.id, t]))

  // 1. Identify Blocked Tasks & Dependency Check
  const blockedTasks = []
  const nonBlockedTasks = []

  for (const extTask of extractedTasks) {
    const activeTask = activeTaskMap.get(extTask.id)
    if (!activeTask) continue

    const uncompletedDeps = []
    if (Array.isArray(extTask.dependencies)) {
      for (const depId of extTask.dependencies) {
        if (!completedTaskIds.has(depId)) {
          uncompletedDeps.push(depId)
        }
      }
    }

    if (uncompletedDeps.length > 0) {
      blockedTasks.push({
        taskId: extTask.id,
        title: extTask.title,
        blockedBy: uncompletedDeps,
        reason: `Blocked by uncompleted dependencies: ${uncompletedDeps.join(', ')}`,
      })
    } else {
      nonBlockedTasks.push(extTask)
    }
  }

  // 2. Prioritization & Scoring Algorithm
  // TDD §21: urgency, importance, available time, and dependencies.
  const scoredPriorities = []
  const now = new Date(currentTimestamp)

  for (const extTask of extractedTasks) {
    const urgencyWeight = URGENCY_VALUES[extTask.urgency] || 2
    const importanceWeight = IMPORTANCE_VALUES[extTask.importance] || 2
    
    // Base score from AI reasoning values
    let score = (urgencyWeight * 15) + (importanceWeight * 10) // Max base: 100

    // Deadline proximity adjustments
    if (extTask.deadline) {
      const deadlineDate = new Date(extTask.deadline)
      const diffMs = deadlineDate - now
      const diffDays = diffMs / (1000 * 60 * 60 * 24)

      if (diffDays < 0) {
        score += 40 // Overdue
      } else if (diffDays <= 1) {
        score += 30 // Due today or tomorrow
      } else if (diffDays <= 3) {
        score += 20 // Due within 3 days
      } else if (diffDays <= 7) {
        score += 10 // Due within a week
      }
    }

    // Blocked task penalty
    const isBlocked = blockedTasks.some((b) => b.taskId === extTask.id)
    if (isBlocked) {
      score -= 20
    }

    // Normalize score to 1-100 range
    const normalizedScore = Math.max(1, Math.min(100, Math.round(score)))

    scoredPriorities.push({
      taskId: extTask.id,
      title: extTask.title,
      priorityScore: normalizedScore,
      explanation: extTask.explanation || `Priority determined by ${extTask.urgency} urgency and ${extTask.importance} importance.`,
    })
  }

  // Sort priorities (highest score first)
  scoredPriorities.sort((a, b) => b.priorityScore - a.priorityScore)

  // 3. Urgency Assessment Map
  const urgencyAssessment = {}
  for (const extTask of extractedTasks) {
    urgencyAssessment[extTask.id] = extTask.urgency
  }

  // 4. Focus Recommendations
  // Select top 1-3 tasks that are NOT blocked
  const focusRecommendations = []
  const nonBlockedPrioritized = scoredPriorities.filter(
    (sp) => !blockedTasks.some((bt) => bt.taskId === sp.taskId)
  )

  const focusCount = Math.min(3, nonBlockedPrioritized.length)
  for (let i = 0; i < focusCount; i++) {
    const item = nonBlockedPrioritized[i]
    focusRecommendations.push({
      taskId: item.taskId,
      title: item.title,
      reason: `High priority task (Score: ${item.priorityScore}). Non-blocked and ready to start.`,
    })
  }

  // 5. Deferred Tasks
  // Tasks with priority score lower than 40 or marked low urgency/importance,
  // or explicitly deferred due to capacity/deadline risks
  const deferredTasks = []
  const capacityRisk = detectedRisks.some((r) => r.type === 'capacity' || r.type === 'overload')

  for (const sp of scoredPriorities) {
    // If we have focus recommendations, don't defer them
    if (focusRecommendations.some((fr) => fr.taskId === sp.taskId)) continue

    const extTask = extractedTasks.find((t) => t.id === sp.taskId)
    const isLowPriority = sp.priorityScore < 45
    const isLowImportance = extTask && (extTask.importance === 'low' || extTask.urgency === 'low')

    if (isLowPriority || isLowImportance || (capacityRisk && sp.priorityScore < 60)) {
      deferredTasks.push({
        taskId: sp.taskId,
        title: sp.title,
        reason: capacityRisk
          ? `Deferred to mitigate schedule capacity risks.`
          : `Deferred due to low relative priority score (${sp.priorityScore}).`,
      })
    }
  }

  // Calculate overall decisions confidence
  const baseConfidence = reasoningOutput.confidence || 100
  const finalConfidence = Math.max(0, Math.min(100, Math.round(baseConfidence - (blockedTasks.length * 5))))

  const elapsed = Date.now() - startTime
  console.log(`[Decision Engine] Decisions mapping completed in ${elapsed}ms.`)

  return {
    priorityOrdering: scoredPriorities,
    urgencyAssessment,
    focusRecommendations,
    deferredTasks,
    blockedTasks,
    confidence: finalConfidence,
    summary: `Prioritized ${extractedTasks.length} active tasks. Recommended ${focusRecommendations.length} focus targets, deferred ${deferredTasks.length} items, and detected ${blockedTasks.length} blocked tasks.`,
  }
}

module.exports = { executeDecisions }
