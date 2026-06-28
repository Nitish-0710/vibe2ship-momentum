/**
 * Brain Orchestrator.
 *
 * Coordinates the Momentum Brain reasoning pipeline.
 *
 * References:
 *   TDD §19 "Momentum Brain Architecture"
 *   TDD §23 "Momentum Brain Execution Pipeline"
 *   AISPEC §6 "Overall Architecture"
 *   AISPEC §15 "Engine Communication"
 *   AISPEC §16 "Execution Rules"
 *
 * Current Phase 3B pipeline implementation:
 *   Context Builder -> Reasoning Engine -> Decision Engine -> Return Decision Result
 */

const { buildContext } = require('../context/context-builder')
const { validateBrainContext, validateDecisionOutput } = require('../modules/brain-validator')
const { executeReasoning } = require('../modules/reasoning-engine')
const { executeDecisions } = require('../modules/decision-engine')

/**
 * Main entry point for the Momentum Brain pipeline.
 * Runs Context Builder, Reasoning Engine, and Decision Engine.
 *
 * @param {string} userId        - Firebase UID
 * @param {Object} [options]
 * @param {string} [options.requestType]  - 'plan' | 'replan'
 * @param {string} [options.userMessage]  - Optional natural-language input
 * @returns {Promise<Object>} Decision result with reasoning details
 */
async function executePipeline(userId, options = {}) {
  const startTime = Date.now()
  console.log(`[Brain Orchestrator] Starting pipeline execution for user: ${userId}`)

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

  const elapsed = Date.now() - startTime
  console.log(`[Brain Orchestrator] Pipeline completed successfully in ${elapsed}ms.`)

  return {
    success: true,
    data: {
      decisions,
      reasoning: {
        extractedTasks: reasoningOutput.extractedTasks,
        detectedRisks: reasoningOutput.detectedRisks,
        estimatedWorkload: reasoningOutput.estimatedWorkload,
        summary: reasoningOutput.summary,
        confidence: reasoningOutput.confidence,
      },
      pipelineDurationMs: elapsed,
    },
  }
}

module.exports = { executePipeline }
