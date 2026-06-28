/**
 * Brain Validation Utilities.
 *
 * Validates context integrity, schema structure, and null safety
 * for all Brain pipeline inputs/outputs.
 *
 * References: TDD §27 "Validation Layer", AISPEC §14 "Response Validator"
 *
 * Does NOT perform AI validation. Only structural checks.
 */

/**
 * Validates that a BrainContext has the minimum required fields.
 *
 * @param {Object} context
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validateBrainContext(context) {
  const errors = []

  if (!context) {
    return { isValid: false, errors: ['Context is null or undefined.'] }
  }

  if (!context.currentTimestamp) errors.push('Missing currentTimestamp.')
  if (!context.timezone) errors.push('Missing timezone.')
  if (!context.user) errors.push('Missing user profile.')

  if (context.user) {
    if (!context.user.uid) errors.push('Missing user.uid.')
  }

  if (!Array.isArray(context.activeTasks)) errors.push('activeTasks must be an array.')
  if (!Array.isArray(context.completedTasks)) errors.push('completedTasks must be an array.')

  return { isValid: errors.length === 0, errors }
}

/**
 * Validates a PlanningOutput from the AI against the required schema.
 *
 * AISPEC §14: Required fields — planningResult, taskPriorities,
 * schedule, recommendations, confidence, summary.
 *
 * @param {Object} output
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validatePlanningOutput(output) {
  const errors = []

  if (!output) return { isValid: false, errors: ['Output is null or undefined.'] }

  if (!output.planningResult) errors.push('Missing planningResult.')
  else {
    if (!output.planningResult.status) errors.push('Missing planningResult.status.')
  }

  if (!Array.isArray(output.taskPriorities)) errors.push('taskPriorities must be an array.')
  if (!Array.isArray(output.schedule)) errors.push('schedule must be an array.')
  if (!Array.isArray(output.recommendations)) errors.push('recommendations must be an array.')

  if (typeof output.confidence !== 'number') errors.push('confidence must be a number.')
  else if (output.confidence < 0 || output.confidence > 100) errors.push('confidence must be 0–100.')

  if (typeof output.summary !== 'string' || output.summary.length === 0) {
    errors.push('summary must be a non-empty string.')
  }

  return { isValid: errors.length === 0, errors }
}

/**
 * Validates a ReasoningOutput from the AI.
 *
 * @param {Object} output
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validateReasoningOutput(output) {
  const errors = []

  if (!output) return { isValid: false, errors: ['Output is null or undefined.'] }

  if (!Array.isArray(output.extractedTasks)) errors.push('extractedTasks must be an array.')
  if (!Array.isArray(output.detectedRisks)) errors.push('detectedRisks must be an array.')
  if (typeof output.estimatedWorkload !== 'number') errors.push('estimatedWorkload must be a number.')
  if (typeof output.confidence !== 'number') errors.push('confidence must be a number.')

  return { isValid: errors.length === 0, errors }
}

/**
 * Attempts to parse a JSON string safely.
 * Returns the parsed object or null.
 *
 * @param {string} jsonString
 * @returns {Object|null}
 */
function safeJsonParse(jsonString) {
  try {
    return JSON.parse(jsonString)
  } catch {
    return null
  }
}

/**
 * Validates a DecisionOutput from the Decision Engine.
 *
 * @param {Object} output
 * @returns {{ isValid: boolean, errors: string[] }}
 */
function validateDecisionOutput(output) {
  const errors = []

  if (!output) return { isValid: false, errors: ['Output is null or undefined.'] }

  if (!Array.isArray(output.priorityOrdering)) errors.push('priorityOrdering must be an array.')
  if (typeof output.urgencyAssessment !== 'object' || output.urgencyAssessment === null) {
    errors.push('urgencyAssessment must be an object.')
  }
  if (!Array.isArray(output.focusRecommendations)) errors.push('focusRecommendations must be an array.')
  if (!Array.isArray(output.deferredTasks)) errors.push('deferredTasks must be an array.')
  if (!Array.isArray(output.blockedTasks)) errors.push('blockedTasks must be an array.')

  if (typeof output.confidence !== 'number') errors.push('confidence must be a number.')
  else if (output.confidence < 0 || output.confidence > 100) errors.push('confidence must be 0–100.')

  if (typeof output.summary !== 'string' || output.summary.length === 0) {
    errors.push('summary must be a non-empty string.')
  }

  return { isValid: errors.length === 0, errors }
}

module.exports = {
  validateBrainContext,
  validatePlanningOutput,
  validateReasoningOutput,
  validateDecisionOutput,
  safeJsonParse,
}
