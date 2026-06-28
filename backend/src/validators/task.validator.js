/**
 * Task Validator.
 * Validates incoming request bodies for task endpoints.
 * Returns a standardized error array or null.
 */

const VALID_STATUSES = ['pending', 'in-progress', 'completed', 'cancelled']
const VALID_CATEGORIES = ['assignment', 'exam', 'project', 'meeting', 'personal', 'other']

/**
 * Validates the body of POST /tasks (create).
 * @param {Object} body
 * @returns {string[]|null} Array of error messages, or null if valid.
 */
function validateCreateTask(body) {
  const errors = []

  if (!body.title || typeof body.title !== 'string' || body.title.trim().length === 0) {
    errors.push('title is required.')
  } else if (body.title.trim().length > 200) {
    errors.push('title must not exceed 200 characters.')
  }

  if (body.description && typeof body.description !== 'string') {
    errors.push('description must be a string.')
  }

  if (body.category && !VALID_CATEGORIES.includes(body.category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}.`)
  }

  if (body.deadline) {
    const date = new Date(body.deadline)
    if (isNaN(date.getTime())) {
      errors.push('deadline must be a valid ISO 8601 date string.')
    }
  }

  if (body.estimatedHours !== undefined && body.estimatedHours !== null) {
    const hours = Number(body.estimatedHours)
    if (isNaN(hours) || hours <= 0) {
      errors.push('estimatedHours must be a positive number.')
    }
  }

  if (body.status && !VALID_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}.`)
  }

  return errors.length > 0 ? errors : null
}

/**
 * Validates the body of PUT /tasks/:id (update).
 * All fields optional — only validates what is present.
 * @param {Object} body
 * @returns {string[]|null}
 */
function validateUpdateTask(body) {
  const errors = []

  if (body.title !== undefined) {
    if (typeof body.title !== 'string' || body.title.trim().length === 0) {
      errors.push('title must be a non-empty string.')
    } else if (body.title.trim().length > 200) {
      errors.push('title must not exceed 200 characters.')
    }
  }

  if (body.description !== undefined && typeof body.description !== 'string') {
    errors.push('description must be a string.')
  }

  if (body.category !== undefined && !VALID_CATEGORIES.includes(body.category)) {
    errors.push(`category must be one of: ${VALID_CATEGORIES.join(', ')}.`)
  }

  if (body.deadline !== undefined) {
    const date = new Date(body.deadline)
    if (isNaN(date.getTime())) {
      errors.push('deadline must be a valid ISO 8601 date string.')
    }
  }

  if (body.estimatedHours !== undefined && body.estimatedHours !== null) {
    const hours = Number(body.estimatedHours)
    if (isNaN(hours) || hours <= 0) {
      errors.push('estimatedHours must be a positive number.')
    }
  }

  if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
    errors.push(`status must be one of: ${VALID_STATUSES.join(', ')}.`)
  }

  return errors.length > 0 ? errors : null
}

module.exports = { validateCreateTask, validateUpdateTask }
