/**
 * Coaching Engine.
 *
 * Generates specific, positive, and action-oriented execution tips.
 *
 * References: TDD §21 "Reasoning Engines" -> Module 5, AISPEC §12 "Coaching Engine"
 *
 * Responsibilities:
 *   - Receives BrainContext, PlanningOutput, and ReflectionOutput.
 *   - Injects the bundled context into the Coaching Prompt template.
 *   - Calls Gemini Service to perform coaching inference.
 *   - Parses and validates output against CoachingOutput schema.
 *   - Implements retry logic and graceful fallback.
 */

const { generateContent } = require('./gemini-service')
const { SYSTEM_PROMPT } = require('../prompts/system.prompt')
const { COACHING_PROMPT } = require('../prompts/coaching.prompt')
const { validateCoachingOutput, safeJsonParse } = require('./brain-validator')

/**
 * Generates coaching guidance over context, plan, and reflection results.
 *
 * @param {import('../schemas/brain-context.schema').BrainContext} context
 * @param {import('../schemas/planning.schema').PlanningOutput} planningOutput
 * @param {Object} reflectionOutput
 * @returns {Promise<Object>} Structured CoachingOutput
 */
async function executeCoaching(context, planningOutput, reflectionOutput) {
  const combinedInput = {
    context,
    plan: {
      planningResult: planningOutput.planningResult,
      taskPriorities: planningOutput.taskPriorities,
      schedule: planningOutput.schedule,
      recommendations: planningOutput.recommendations,
      summary: planningOutput.summary,
    },
    reflection: {
      reflectionSummary: reflectionOutput.reflectionSummary,
      insights: reflectionOutput.insights,
      recommendations: reflectionOutput.recommendations,
    },
  }

  const userPrompt = COACHING_PROMPT.replace('{{USER_CONTEXT}}', JSON.stringify(combinedInput, null, 2))

  let attempts = 0
  const maxAttempts = 2

  while (attempts < maxAttempts) {
    attempts++
    const startTime = Date.now()
    console.log(`[Coaching Engine] Attempt ${attempts}/${maxAttempts}: Initiating Gemini request...`)

    try {
      const rawResponse = await generateContent(SYSTEM_PROMPT, userPrompt)
      const latency = Date.now() - startTime
      console.log(`[Coaching Engine] Gemini response received in ${latency}ms.`)

      // Parse JSON
      const parsed = safeJsonParse(rawResponse)
      if (!parsed) {
        console.warn(`[Coaching Engine] Attempt ${attempts}: Failed to parse JSON response.`)
        continue
      }

      // Validate schema
      const validation = validateCoachingOutput(parsed)
      if (!validation.isValid) {
        console.warn(`[Coaching Engine] Attempt ${attempts}: Validation failed:`, validation.errors)
        continue
      }

      return parsed
    } catch (error) {
      console.error(`[Coaching Engine] Attempt ${attempts} failed:`, error.message)
      if (attempts >= maxAttempts) {
        break
      }
    }
  }

  // Fallback
  console.warn('[Coaching Engine] Persistent failure or Gemini unavailable. Returning fallback coaching.')
  return createFallbackCoachingOutput('Coaching advice could not be retrieved.')
}

/**
 * Returns a fallback CoachingOutput object.
 */
function createFallbackCoachingOutput(reason) {
  return {
    coachingMessages: [
      {
        type: 'encouragement',
        message: reason || 'Focus on completing your most high-priority pending task today.',
        taskId: '',
        priority: 'medium',
      },
    ],
    dailySummary: 'Take it one task at a time and focus on execution.',
    confidence: 0,
  }
}

module.exports = { executeCoaching }
