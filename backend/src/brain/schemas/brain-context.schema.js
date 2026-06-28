/**
 * Brain Context Schema.
 *
 * Defines the normalized context object assembled by the Context Builder
 * before any reasoning begins.
 *
 * References: TDD §20 "Context Builder", AISPEC §7 "Context Builder"
 *
 * This is a data-only module — no logic.
 */

/**
 * @typedef {Object} UserContext
 * @property {string}  uid
 * @property {string}  name
 * @property {string}  email
 * @property {string}  occupation
 * @property {string}  timezone
 * @property {string}  wakeTime    - e.g. "07:00"
 * @property {string}  sleepTime   - e.g. "23:00"
 * @property {Object}  preferences
 */

/**
 * @typedef {Object} TaskContext
 * @property {string}      id
 * @property {string}      title
 * @property {string}      description
 * @property {string}      category
 * @property {string|null} deadline
 * @property {number|null} estimatedHours
 * @property {number|null} priorityScore
 * @property {string}      status
 * @property {string}      createdAt
 * @property {string}      updatedAt
 */

/**
 * @typedef {Object} BrainContext
 * @property {UserContext}    user              - Authenticated user profile
 * @property {TaskContext[]}  activeTasks       - Tasks with status pending | in-progress
 * @property {TaskContext[]}  completedTasks    - Tasks with status completed
 * @property {string}         currentTimestamp  - ISO 8601
 * @property {string}         timezone          - IANA timezone from user profile
 * @property {string[]}       missingFields     - Fields that could not be populated
 * @property {number}         confidence        - 0–100, reduced when missingFields exist
 */

/**
 * Returns a default (empty) BrainContext.
 * Used as a safe fallback when context building fails partially.
 */
function createEmptyBrainContext() {
  return {
    user: null,
    activeTasks: [],
    completedTasks: [],
    currentTimestamp: new Date().toISOString(),
    timezone: 'UTC',
    missingFields: [],
    confidence: 0,
  }
}

module.exports = { createEmptyBrainContext }
