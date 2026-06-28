/**
 * Reasoning Output Schema.
 *
 * Defines the structured output produced by the Reasoning Engine
 * before planning decisions are made.
 *
 * References: AISPEC §8 "Reasoning Engine"
 *
 * This is a data-only module — no logic.
 */

/**
 * @typedef {Object} ExtractedTask
 * @property {string}      id
 * @property {string}      title
 * @property {string|null} deadline
 * @property {number|null} estimatedHours
 * @property {string}      urgency        - 'critical' | 'high' | 'medium' | 'low'
 * @property {string}      importance     - 'critical' | 'high' | 'medium' | 'low'
 * @property {string[]}    dependencies   - IDs of tasks this depends on
 * @property {string}      explanation    - Why this assessment was made
 */

/**
 * @typedef {Object} DetectedRisk
 * @property {string} type        - 'deadline' | 'capacity' | 'dependency' | 'overload'
 * @property {string} severity    - 'high' | 'medium' | 'low'
 * @property {string} description
 * @property {string[]} affectedTaskIds
 */

/**
 * @typedef {Object} ReasoningOutput
 * @property {ExtractedTask[]}  extractedTasks    - Tasks with inferred metadata
 * @property {DetectedRisk[]}   detectedRisks     - Scheduling risks
 * @property {number}           estimatedWorkload - Total hours across all active tasks
 * @property {string}           summary           - Human-readable reasoning summary
 * @property {number}           confidence        - 0–100
 */

/**
 * Returns a safe fallback ReasoningOutput.
 */
function createFallbackReasoningOutput(reason) {
  return {
    extractedTasks: [],
    detectedRisks: [],
    estimatedWorkload: 0,
    summary: reason || 'Reasoning was unable to complete.',
    confidence: 0,
  }
}

module.exports = { createFallbackReasoningOutput }
