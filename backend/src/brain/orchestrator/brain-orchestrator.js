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
 * Current Phase 3D pipeline implementation:
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
 */

const { buildContext } = require('../context/context-builder')
const {
  validateBrainContext,
  validateDecisionOutput,
  validateReflectionOutput,
  validateCoachingOutput,
} = require('../modules/brain-validator')
const { executeReasoning } = require('../modules/reasoning-engine')
const { executeDecisions } = require('../modules/decision-engine')
const { executePlanning } = require('../modules/planning-engine')
const { executeReflection } = require('../modules/reflection-engine')
const { executeCoaching } = require('../modules/coaching-engine')

/**
 * Main entry point for the Momentum Brain pipeline.
 * Runs Context Builder, Reasoning Engine, Decision Engine, Planning Engine,
 * Reflection Engine, and Coaching Engine.
 *
 * @param {string} userId        - Firebase UID
 * @param {Object} [options]
 * @param {string} [options.requestType]  - 'plan' | 'replan'
 * @param {string} [options.userMessage]  - Optional natural-language input
 * @returns {Promise<Object>} Enriched planning response containing schedule, priorities, reflection, and coaching.
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
    console.warn('[Brain Orchestrator] Context validation failures:', contextValidation.errors)
    // Non-fatal: proceed with reduced confidence
    context.confidence = Math.min(context.confidence, 30)
  }

  // ── Step 2: Understand workload (Reasoning Engine) ─────────────
  console.log('[Brain Orchestrator] Invoking Reasoning Engine...')
  const reasoningOutput = await executeReasoning(context)

  // ── Step 3: Determine priorities (Decision Engine) ─────────────
  console.log('[Brain Orchestrator] Invoking Decision Engine...')
  const decisions = await executeDecisions(context, reasoningOutput)

  // ── Validate Decision Output ──────────────────────────────────
  const decisionValidation = validateDecisionOutput(decisions)
  if (!decisionValidation.isValid) {
    console.error('[Brain Orchestrator] Decision output validation failed:', decisionValidation.errors)
    throw new Error('DECISION_VALIDATION_FAILED')
  }

  // ── Step 4 & 5: Create strategy & schedule (Planning Engine) ───
  console.log('[Brain Orchestrator] Invoking Planning Engine...')
  const planningOutput = await executePlanning(context, reasoningOutput, decisions)

  // ── Step 6: Generate reflection (Reflection Engine) ────────────
  console.log('[Brain Orchestrator] Invoking Reflection Engine...')
  const reflectionOutput = await executeReflection(context, reasoningOutput, decisions, planningOutput)

  // ── Validate Reflection Output ────────────────────────────────
  const reflectionValidation = validateReflectionOutput(reflectionOutput)
  if (!reflectionValidation.isValid) {
    console.warn('[Brain Orchestrator] Reflection output validation failures:', reflectionValidation.errors)
  }

  // ── Step 7: Generate coaching (Coaching Engine) ───────────────
  console.log('[Brain Orchestrator] Invoking Coaching Engine...')
  const coachingOutput = await executeCoaching(context, planningOutput, reflectionOutput)

  // ── Validate Coaching Output ──────────────────────────────────
  const coachingValidation = validateCoachingOutput(coachingOutput)
  if (!coachingValidation.isValid) {
    console.warn('[Brain Orchestrator] Coaching output validation failures:', coachingValidation.errors)
  }

  const elapsed = Date.now() - startTime
  console.log(`[Brain Orchestrator] Pipeline completed successfully in ${elapsed}ms.`)

  return {
    ...planningOutput,
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
    pipelineDurationMs: elapsed,
  }
}

module.exports = { executePipeline }
