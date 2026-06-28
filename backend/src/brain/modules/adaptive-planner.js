/**
 * Adaptive Planner.
 *
 * Implements intelligent schedule adjustments when triggers occur.
 *
 * References:
 *   TDD §24 "Adaptive Replanning", AISPEC §20 "Replanning Framework"
 *
 * Responsibilities:
 *   - Detect missed tasks from the last schedule.
 *   - Detect changed deadlines and newly added urgent tasks.
 *   - Evaluate if replanning is necessary based on workload changes.
 *   - Call the Brain Orchestrator pipeline to generate an updated plan.
 */

/**
 * Evaluates the user's tasks and schedules to determine if replanning is needed.
 *
 * @param {import('../schemas/brain-context.schema').BrainContext} context
 * @returns {{ shouldReplan: boolean, reasons: string[] }}
 */
function detectReplanningTriggers(context) {
  const reasons = []
  const { activeTasks = [], previousSchedules = [], currentTimestamp } = context

  if (previousSchedules.length === 0) {
    return { shouldReplan: false, reasons }
  }

  const lastSchedule = previousSchedules[0]
  const now = new Date(currentTimestamp)

  // 1. Detect missed tasks (scheduled blocks in the past that are still active/pending)
  const scheduledTaskIds = new Set(
    (lastSchedule.taskBlocks || []).map((b) => b.taskId).filter(Boolean)
  )

  const activeTaskIds = new Set(activeTasks.map((t) => t.id))
  const missedTasks = Array.from(scheduledTaskIds).filter((id) => activeTaskIds.has(id))

  if (missedTasks.length > 0) {
    reasons.push(`${missedTasks.length} planned tasks were not completed.`)
  }

  // 2. Detect newly added critical/urgent tasks created after the last schedule
  const lastScheduleTime = new Date(lastSchedule.createdAt || 0)
  const newUrgentTasks = activeTasks.filter(
    (t) => new Date(t.createdAt) > lastScheduleTime && (t.status === 'pending' || t.status === 'in-progress') && (t.priorityScore > 75)
  )

  if (newUrgentTasks.length > 0) {
    reasons.push(`${newUrgentTasks.length} new high-priority tasks were added.`)
  }

  // 3. Detect updated deadlines for active tasks close to now
  const urgentDeadlines = activeTasks.filter((t) => {
    if (!t.deadline) return false
    const due = new Date(t.deadline)
    const diffMs = due - now
    const diffHours = diffMs / (1000 * 60 * 60)
    return diffHours > 0 && diffHours <= 48
  })

  if (urgentDeadlines.length > 0) {
    reasons.push(`${urgentDeadlines.length} tasks are approaching hard deadlines within 48 hours.`)
  }

  return {
    shouldReplan: reasons.length > 0,
    reasons,
  }
}

module.exports = { detectReplanningTriggers }
