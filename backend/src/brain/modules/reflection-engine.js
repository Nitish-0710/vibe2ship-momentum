/**
 * Reflection Engine.
 *
 * Analyzes completed work and schedule outcomes using Gemini.
 *
 * References: TDD §21 "Reasoning Engines" -> Module 6, AISPEC §13 "Reflection Engine"
 *
 * Responsibilities:
 *   - Receives BrainContext, ReasoningOutput, DecisionOutput, and PlanningOutput.
 *   - Injects the bundled context into the Reflection Prompt template.
 *   - Calls Gemini Service to perform reflection.
 *   - Parses and validates output against ReflectionOutput schema.
 *   - Implements retry logic and graceful fallback.
 */

const { generateContent } = require('./gemini-service')
const { SYSTEM_PROMPT } = require('../prompts/system.prompt')
const { REFLECTION_PROMPT } = require('../prompts/reflection.prompt')
const { validateReflectionOutput, safeJsonParse } = require('./brain-validator')

/**
 * Executes reflection over the planning results and context.
 *
 * @param {import('../schemas/brain-context.schema').BrainContext} context
 * @param {import('../schemas/reasoning.schema').ReasoningOutput} reasoningOutput
 * @param {Object} decisionOutput
 * @param {import('../schemas/planning.schema').PlanningOutput} planningOutput
 * @returns {Promise<Object>} Structured ReflectionOutput
 */
async function executeReflection(context, reasoningOutput, decisionOutput, planningOutput) {
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
    },
    plan: {
      planningResult: planningOutput.planningResult,
      taskPriorities: planningOutput.taskPriorities,
      schedule: planningOutput.schedule,
      recommendations: planningOutput.recommendations,
      summary: planningOutput.summary,
    },
  }

  const userPrompt = REFLECTION_PROMPT.replace('{{USER_CONTEXT}}', JSON.stringify(combinedInput, null, 2))

  let attempts = 0
  const maxAttempts = 2

  while (attempts < maxAttempts) {
    attempts++
    const startTime = Date.now()
    console.log(`[Reflection Engine] Attempt ${attempts}/${maxAttempts}: Initiating Gemini request...`)

    try {
      const rawResponse = await generateContent(SYSTEM_PROMPT, userPrompt)
      const latency = Date.now() - startTime
      console.log(`[Reflection Engine] Gemini response received in ${latency}ms.`)

      // Parse JSON
      const parsed = safeJsonParse(rawResponse)
      if (!parsed) {
        console.warn(`[Reflection Engine] Attempt ${attempts}: Failed to parse JSON response.`)
        continue
      }

      // Validate schema
      const validation = validateReflectionOutput(parsed)
      if (!validation.isValid) {
        console.warn(`[Reflection Engine] Attempt ${attempts}: Validation failed:`, validation.errors)
        continue
      }

      return parsed
    } catch (error) {
      console.error(`[Reflection Engine] Attempt ${attempts} failed:`, error.message)
      if (attempts >= maxAttempts) {
        break
      }
    }
  }

  // Fallback
  console.warn('[Reflection Engine] Persistent failure or Gemini unavailable. Returning fallback reflection.')
  return createFallbackReflectionOutput('Reflection engine failed to generate.')
}

/**
 * Returns a fallback ReflectionOutput object.
 */
function createFallbackReflectionOutput(reason) {
  return {
    reflectionSummary: reason || 'Reflection was unable to complete.',
    completedTaskCount: 0,
    skippedTaskCount: 0,
    insights: [],
    recommendations: [],
    planningAdjustments: [],
    confidence: 0,
  }
}

module.exports = { executeReflection }
