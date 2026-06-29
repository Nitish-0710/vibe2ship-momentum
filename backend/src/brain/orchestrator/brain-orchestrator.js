/**
 * PipelineValidationError.
 *
 * Custom error class thrown when a stage in the Brain pipeline fails structural validation.
 */
class PipelineValidationError extends Error {
  constructor(stage, errors) {
    super(`Validation failed at stage: ${stage}`)
    this.name = 'PipelineValidationError'
    this.stage = stage
    this.errors = errors
  }
}

/**
 * Brain Orchestrator.
 *
 * Coordinates the Momentum Brain reasoning, planning, reflection, and coaching pipeline.
 *
 * References:
 *   TDD §19 "Momentum Brain Architecture"
 *   TDD §23 "Momentum Brain Execution Pipeline"
 *   AISPEC §6 "Overall Architecture"
 *   AISPEC §15 "Engine Communication"
 *   AISPEC §16 "Execution Rules"
 *
 * Current Phase 3F pipeline implementation:
 *   Context Builder
 *   ↓
 *   Reasoning Engine
 *   ↓
 *   Decision Engine
 *   ↓
 *   Planning Engine
 *   ↓
 *   Reflection Engine
 *   ↓
 *   Coaching Engine
 *   ↓
 *   Memory Engine (Firestore updates)
 */

const { buildContext } = require('../context/context-builder')
const {
  validateBrainContext,
  validateReasoningOutput,
  validateDecisionOutput,
  validatePlanningOutput,
  validateReflectionOutput,
  validateCoachingOutput,
} = require('../modules/brain-validator')
const { executeReasoning } = require('../modules/reasoning-engine')
const { executeDecisions } = require('../modules/decision-engine')
const { executePlanning } = require('../modules/planning-engine')
const { executeReflection } = require('../modules/reflection-engine')
const { executeCoaching } = require('../modules/coaching-engine')
const { updateMemory } = require('../modules/memory-engine')

/**
 * Main entry point for the Momentum Brain pipeline.
 * Runs Context Builder, Reasoning Engine, Decision Engine, Planning Engine,
 * Reflection Engine, Coaching Engine, and Memory Engine.
 *
 * @param {string} userId        - Firebase UID
 * @param {Object} [options]
 * @param {string} [options.requestType]  - 'plan' | 'replan'
 * @param {string} [options.userMessage]  - Optional natural-language input
 * @returns {Promise<Object>} Enriched planning response containing schedule, priorities, reflection, coaching, and memory status.
 */
async function executePipeline(userId, options = {}) {
  const startTime = Date.now()
  console.log(`[Brain Orchestrator] Starting full pipeline execution for user: ${userId}`)

  // ── Step 1: Build Context ──────────────────────────────────────
  let context
  try {
    context = await buildContext(userId)
    console.log('[Brain Orchestrator] Context created successfully.')
  } catch (err) {
    console.error('[Brain Orchestrator] Context build failed:', err.message)
    throw new Error('CONTEXT_BUILD_FAILED')
  }

  // ── Validate Context ───────────────────────────────────────────
  const contextValidation = validateBrainContext(context)
  if (!contextValidation.isValid) {
    console.error('[Brain Orchestrator] Context validation failures:', contextValidation.errors)
    throw new PipelineValidationError('context', contextValidation.errors)
  }

  // ── Step 2: Understand workload (Reasoning Engine) ─────────────
  console.log('[Brain Orchestrator] Invoking Reasoning Engine...')
  const reasoningOutput = await executeReasoning(context)
  const reasoningValidation = validateReasoningOutput(reasoningOutput)
  if (!reasoningValidation.isValid) {
    console.error('[Brain Orchestrator] Reasoning output validation failures:', reasoningValidation.errors)
    throw new PipelineValidationError('reasoning', reasoningValidation.errors)
  }

  // ── Step 3: Determine priorities (Decision Engine) ─────────────
  console.log('[Brain Orchestrator] Invoking Decision Engine...')
  const decisions = await executeDecisions(context, reasoningOutput)
  const decisionValidation = validateDecisionOutput(decisions)
  if (!decisionValidation.isValid) {
    console.error('[Brain Orchestrator] Decision output validation failed:', decisionValidation.errors)
    throw new PipelineValidationError('decisions', decisionValidation.errors)
  }

  // ── Step 4 & 5: Create strategy & schedule (Planning Engine) ───
  console.log('[Brain Orchestrator] Invoking Planning Engine...')
  const planningOutput = await executePlanning(context, reasoningOutput, decisions)
  const planningValidation = validatePlanningOutput(planningOutput)
  if (!planningValidation.isValid) {
    console.error('[Brain Orchestrator] Planning output validation failures:', planningValidation.errors)
    throw new PipelineValidationError('planning', planningValidation.errors)
  }

  // ── Step 6: Generate reflection (Reflection Engine) ────────────
  console.log('[Brain Orchestrator] Invoking Reflection Engine...')
  const reflectionOutput = await executeReflection(context, reasoningOutput, decisions, planningOutput)
  const reflectionValidation = validateReflectionOutput(reflectionOutput)
  if (!reflectionValidation.isValid) {
    console.error('[Brain Orchestrator] Reflection output validation failures:', reflectionValidation.errors)
    throw new PipelineValidationError('reflection', reflectionValidation.errors)
  }

  // ── Step 7: Generate coaching (Coaching Engine) ───────────────
  console.log('[Brain Orchestrator] Invoking Coaching Engine...')
  const coachingOutput = await executeCoaching(context, planningOutput, reflectionOutput)
  const coachingValidation = validateCoachingOutput(coachingOutput)
  if (!coachingValidation.isValid) {
    console.error('[Brain Orchestrator] Coaching output validation failures:', coachingValidation.errors)
    throw new PipelineValidationError('coaching', coachingValidation.errors)
  }

  // ── Step 8: Update memory observations (Memory Engine) ──────────
  console.log('[Brain Orchestrator] Invoking Memory Engine...')
  let memoryResult = { success: true }
  try {
    memoryResult = await updateMemory(context, planningOutput, reflectionOutput, coachingOutput, decisions, reasoningOutput)
    if (!memoryResult.success) {
      console.warn('[Brain Orchestrator] Memory Engine reported warnings during persistence:', memoryResult.errors)
    }
  } catch (err) {
    console.error('[Brain Orchestrator] Memory Engine write failed with exception:', err.message)
    memoryResult = { success: false, errors: [err.message] }
  }

  const elapsed = Date.now() - startTime
  console.log(`[Brain Orchestrator] Pipeline completed successfully in ${elapsed}ms.`)

  return {
    planningResult: planningOutput.planningResult,
    taskPriorities: planningOutput.taskPriorities,
    schedule: planningOutput.schedule,
    recommendations: planningOutput.recommendations,
    confidence: planningOutput.confidence,
    summary: planningOutput.summary,
    reasoning: {
      extractedTasks: reasoningOutput.extractedTasks,
      detectedRisks: reasoningOutput.detectedRisks,
      estimatedWorkload: reasoningOutput.estimatedWorkload,
      summary: reasoningOutput.summary,
      confidence: reasoningOutput.confidence,
    },
    decisions: {
      priorityOrdering: decisions.priorityOrdering,
      urgencyAssessment: decisions.urgencyAssessment,
      focusRecommendations: decisions.focusRecommendations,
      deferredTasks: decisions.deferredTasks,
      blockedTasks: decisions.blockedTasks,
      confidence: decisions.confidence,
      summary: decisions.summary,
    },
    reflection: {
      reflectionSummary: reflectionOutput.reflectionSummary,
      insights: reflectionOutput.insights,
      recommendations: reflectionOutput.recommendations,
      planningAdjustments: reflectionOutput.planningAdjustments,
      confidence: reflectionOutput.confidence,
    },
    coaching: {
      coachingMessages: coachingOutput.coachingMessages,
      dailySummary: coachingOutput.dailySummary,
      confidence: coachingOutput.confidence,
    },
    memory: {
      success: memoryResult.success,
      errors: memoryResult.errors || null,
    },
    pipelineDurationMs: elapsed,
  }
}

module.exports = { executePipeline, PipelineValidationError }
