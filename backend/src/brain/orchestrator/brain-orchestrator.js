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
 * Current Phase 3A implementation:
 *   - Receives request
 *   - Invokes Context Builder
 *   - Validates context
 *   - Prepares pipeline
 *   - Returns context for downstream use
 *
 * Does NOT:
 *   - Invoke AI
 *   - Execute reasoning
 *   - Execute planning
 *   - Execute coaching
 *   - Execute reflection
 *
 * Extension points are marked with TODO comments for Phase 3B/C.
 */

const { buildContext } = require('../context/context-builder')
const { validateBrainContext } = require('../modules/brain-validator')
const { createFallbackPlanningOutput } = require('../schemas/planning.schema')

/**
 * Main entry point for the Momentum Brain pipeline.
 *
 * Every planning/replanning request flows through this function.
 *
 * AISPEC §16 Execution Sequence:
 *   1. Build Context       ← implemented
 *   2. Understand workload ← Phase 3B
 *   3. Determine priorities← Phase 3B
 *   4. Create strategy     ← Phase 3B
 *   5. Generate schedule   ← Phase 3B
 *   6. Generate coaching   ← Phase 3C
 *   7. Validate response   ← Phase 3B
 *   8. Return output       ← implemented (fallback)
 *
 * @param {string} userId        - Firebase UID
 * @param {Object} [options]
 * @param {string} [options.requestType]  - 'plan' | 'replan'
 * @param {string} [options.userMessage]  - Optional natural-language input
 * @returns {Promise<Object>} PlanningOutput or fallback
 */
async function executePipeline(userId, options = {}) {
  const startTime = Date.now()

  // ── Step 1: Build Context ──────────────────────────────────────
  let context
  try {
    context = await buildContext(userId)
  } catch (err) {
    console.error('Brain Orchestrator — Context build failed:', err.message)
    return createFallbackPlanningOutput('Failed to build user context.')
  }

  // ── Validate Context ───────────────────────────────────────────
  const contextValidation = validateBrainContext(context)
  if (!contextValidation.isValid) {
    console.warn('Brain Orchestrator — Context validation failed:', contextValidation.errors)
    // Non-fatal: proceed with reduced confidence rather than failing
    context.confidence = Math.min(context.confidence, 30)
  }

  // ── Step 2: Understand workload (Reasoning Engine) ─────────────
  // TODO Phase 3B: invoke reasoning engine
  // const reasoningOutput = await reasoningEngine.execute(context)

  // ── Step 3: Determine priorities (Decision Engine) ─────────────
  // TODO Phase 3B: invoke decision engine
  // const decisions = await decisionEngine.execute(context, reasoningOutput)

  // ── Step 4: Create strategy (Planning Engine) ──────────────────
  // TODO Phase 3B: invoke planning engine
  // const planningOutput = await planningEngine.execute(context, decisions)

  // ── Step 5: Generate schedule ──────────────────────────────────
  // TODO Phase 3B: included in planning engine output

  // ── Step 6: Generate coaching ──────────────────────────────────
  // TODO Phase 3C: invoke coaching engine
  // const coaching = await coachingEngine.execute(context, planningOutput)

  // ── Step 7: Validate response ──────────────────────────────────
  // TODO Phase 3B: validate planning output
  // const validation = validatePlanningOutput(planningOutput)

  // ── Step 8: Return output ──────────────────────────────────────
  const elapsed = Date.now() - startTime
  console.log(`Brain Orchestrator — Pipeline completed in ${elapsed}ms (foundation only)`)

  // Phase 3A: return context and metadata — no AI output yet
  return {
    planningResult: {
      status: 'pending',
      message: 'Brain foundation is active. AI planning is not yet implemented.',
    },
    context,
    contextValidation,
    pipelineDurationMs: elapsed,
    taskPriorities: [],
    schedule: [],
    recommendations: [],
    confidence: context.confidence,
    summary: 'Momentum Brain foundation is operational. Full planning will be available after Phase 3B.',
  }
}

module.exports = { executePipeline }
