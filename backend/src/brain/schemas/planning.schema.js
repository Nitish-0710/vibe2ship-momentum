/**
 * Planning Input / Output Schemas.
 *
 * Defines the structured data contracts for the Planning Engine.
 *
 * References: TDD §26 "Output Contract", AISPEC §10 "Planning Engine",
 *             AISPEC §23 "Machine Output Specification"
 *
 * This is a data-only module — no logic.
 */

/**
 * @typedef {Object} PlanningInput
 * @property {import('./brain-context.schema').BrainContext} context
 * @property {string}  requestType     - 'plan' | 'replan'
 * @property {string}  [userMessage]   - Optional natural-language input
 * @property {Object}  [existingPlan]  - Existing schedule for replan requests
 */

/**
 * @typedef {Object} TaskBlock
 * @property {string}  taskId
 * @property {string}  title
 * @property {string}  startTime   - ISO 8601
 * @property {string}  endTime     - ISO 8601
 * @property {number}  durationHours
 * @property {string}  explanation - Why this task is here
 */

/**
 * @typedef {Object} DailySchedule
 * @property {string}       date       - YYYY-MM-DD
 * @property {TaskBlock[]}  taskBlocks
 * @property {number}       totalHours
 */

/**
 * @typedef {Object} Recommendation
 * @property {string} type        - 'priority' | 'schedule' | 'risk' | 'coaching'
 * @property {string} message     - Human-readable recommendation
 * @property {string} [taskId]    - Related task, if applicable
 */

/**
 * @typedef {Object} PlanningOutput
 * @property {Object}           planningResult
 * @property {string}           planningResult.status    - 'success' | 'partial' | 'failed'
 * @property {string}           planningResult.message
 * @property {Object[]}         taskPriorities           - Ranked task list with scores
 * @property {DailySchedule[]}  schedule                 - Daily schedules
 * @property {Recommendation[]} recommendations
 * @property {number}           confidence               - 0–100
 * @property {string}           summary                  - Human-readable summary
 * @property {Object}           validation
 * @property {boolean}          validation.isValid
 * @property {string[]}         validation.errors
 */

/**
 * Returns a safe fallback PlanningOutput when AI inference fails.
 */
function createFallbackPlanningOutput(reason) {
  return {
    planningResult: { status: 'failed', message: reason || 'Unable to generate plan.' },
    taskPriorities: [],
    schedule: [],
    recommendations: [],
    confidence: 0,
    summary: 'Planning was unable to complete. Please try again later.',
    validation: { isValid: false, errors: [reason || 'Unknown error'] },
  }
}

module.exports = { createFallbackPlanningOutput }
