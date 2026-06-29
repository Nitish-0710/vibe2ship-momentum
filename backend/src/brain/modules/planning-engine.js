/**
 * Planning Engine.
 *
 * Converts Decision Engine output and BrainContext into a structured schedule/execution plan.
 *
 * References: TDD §21 "Reasoning Engines" -> Module 3, AISPEC §10 "Planning Engine"
 *
 * Responsibilities:
 *   - Receives BrainContext, ReasoningOutput, and DecisionOutput.
 *   - Bundles them into a structured planning context object.
 *   - Injects the bundled context into the Planning Prompt template.
 *   - Calls LLM Service to perform planning inference.
 *   - Parses and validates the structured output against PlanningOutput schema.
 *   - Implements a single retry attempt on failure.
 *   - Falls back gracefully to fallback structured planning output on persistent error.
 */

const { generateContent } = require('./llm-service')
const { SYSTEM_PROMPT } = require('../prompts/system.prompt')
const { PLANNING_PROMPT } = require('../prompts/planning.prompt')
const { validatePlanningOutput, safeJsonParse } = require('./brain-validator')
const { createFallbackPlanningOutput } = require('../schemas/planning.schema')

/**
 * Generates an execution plan based on context, reasoning, and decisions.
 *
 * @param {import('../schemas/brain-context.schema').BrainContext} context
 * @param {import('../schemas/reasoning.schema').ReasoningOutput} reasoningOutput
 * @param {Object} decisionOutput
 * @returns {Promise<import('../schemas/planning.schema').PlanningOutput>}
 */
async function executePlanning(context, reasoningOutput, decisionOutput) {
  const combinedInput = {
    context,
    reasoning: {
      extractedTasks: reasoningOutput.extractedTasks,
      detectedRisks: reasoningOutput.detectedRisks,
      estimatedWorkload: reasoningOutput.estimatedWorkload,
      summary: reasoningOutput.summary,
    },
    decisions: {
      priorityOrdering: decisionOutput.priorityOrdering,
      urgencyAssessment: decisionOutput.urgencyAssessment,
      focusRecommendations: decisionOutput.focusRecommendations,
      deferredTasks: decisionOutput.deferredTasks,
      blockedTasks: decisionOutput.blockedTasks,
      confidence: decisionOutput.confidence,
      summary: decisionOutput.summary,
    },
  }

  const userPrompt = PLANNING_PROMPT.replace('{{USER_CONTEXT}}', JSON.stringify(combinedInput, null, 2))

  let attempts = 0
  const maxAttempts = 2

  while (attempts < maxAttempts) {
    attempts++
    const startTime = Date.now()
    console.log(`[Planning Engine] Attempt ${attempts}/${maxAttempts}: Initiating LLM request...`)

    try {
      const rawResponse = await generateContent(SYSTEM_PROMPT, userPrompt)
      const latency = Date.now() - startTime
      console.log(`[Planning Engine] LLM response received in ${latency}ms.`)

      // Parse JSON
      const parsed = safeJsonParse(rawResponse)
      if (!parsed) {
        console.warn(`[Planning Engine] Attempt ${attempts}: Failed to parse JSON response.`)
        continue
      }

      // Validate schema integrity
      const validation = validatePlanningOutput(parsed)
      if (!validation.isValid) {
        console.warn(`[Planning Engine] Attempt ${attempts}: Validation failed:`, validation.errors)
        continue
      }

      // Success
      parsed.validation = { isValid: true, errors: [] }
      return parsed
    } catch (error) {
      console.error(`[Planning Engine] Attempt ${attempts} failed:`, error.message)
      if (attempts >= maxAttempts) {
        break
      }
    }
  }

  // Graceful fallback
  console.warn('[Planning Engine] Persistent failure or LLM unavailable. Returning fallback planning output.')
  const fallback = createFallbackPlanningOutput('Planning engine failed to compute a schedule.')
  return fallback
}

module.exports = { executePlanning }
