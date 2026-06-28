/**
 * Brain Schemas — barrel export.
 *
 * Single entry point for all schema definitions and factory functions.
 */

const { createEmptyBrainContext } = require('./brain-context.schema')
const { createFallbackPlanningOutput } = require('./planning.schema')
const { createFallbackReasoningOutput } = require('./reasoning.schema')

module.exports = {
  createEmptyBrainContext,
  createFallbackPlanningOutput,
  createFallbackReasoningOutput,
}
