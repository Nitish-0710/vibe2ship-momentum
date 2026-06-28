/**
 * Brain Prompts — barrel export.
 *
 * Single entry point for all prompt template constants.
 * No execution logic.
 */

const { SYSTEM_PROMPT } = require('./system.prompt')
const { PLANNING_PROMPT } = require('./planning.prompt')
const { REASONING_PROMPT } = require('./reasoning.prompt')
const { REFLECTION_PROMPT } = require('./reflection.prompt')
const { COACHING_PROMPT } = require('./coaching.prompt')

module.exports = {
  SYSTEM_PROMPT,
  PLANNING_PROMPT,
  REASONING_PROMPT,
  REFLECTION_PROMPT,
  COACHING_PROMPT,
}
