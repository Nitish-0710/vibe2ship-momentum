/**
 * Reasoning Engine.
 *
 * Analyzes the BrainContext using Gemini to generate structural understanding.
 *
 * References: TDD §21 "Reasoning Engines" -> Module 1, AISPEC §8 "Reasoning Engine"
 *
 * Responsibilities:
 *   - Receives validated BrainContext.
 *   - Injects user context into the Reasoning Prompt template.
 *   - Calls Gemini Service to perform inference.
 *   - Parses and validates the structured output.
 *   - Implements a single retry attempt on failure.
 *   - Falls back gracefully to structured default values on persistent error.
 */

const { generateContent } = require('./gemini-service')
const { SYSTEM_PROMPT } = require('../prompts/system.prompt')
const { REASONING_PROMPT } = require('../prompts/reasoning.prompt')
const { validateReasoningOutput, safeJsonParse } = require('./brain-validator')
const { createFallbackReasoningOutput } = require('../schemas/reasoning.schema')

/**
 * Executes reasoning over the provided BrainContext.
 *
 * @param {import('../schemas/brain-context.schema').BrainContext} context
 * @returns {Promise<import('../schemas/reasoning.schema').ReasoningOutput>}
 */
async function executeReasoning(context) {
  const userPrompt = REASONING_PROMPT.replace('{{USER_CONTEXT}}', JSON.stringify(context, null, 2))

  let attempts = 0
  const maxAttempts = 2

  while (attempts < maxAttempts) {
    attempts++
    const startTime = Date.now()
    console.log(`[Reasoning Engine] Attempt ${attempts}/${maxAttempts}: Initiating Gemini request...`)
    
    try {
      const rawResponse = await generateContent(SYSTEM_PROMPT, userPrompt)
      const latency = Date.now() - startTime
      console.log(`[Reasoning Engine] Gemini response received in ${latency}ms.`)

      // Parse JSON
      const parsed = safeJsonParse(rawResponse)
      if (!parsed) {
        console.warn(`[Reasoning Engine] Attempt ${attempts}: Failed to parse JSON response.`)
        continue
      }

      // Validate schema integrity
      const validation = validateReasoningOutput(parsed)
      if (!validation.isValid) {
        console.warn(`[Reasoning Engine] Attempt ${attempts}: Validation failed:`, validation.errors)
        continue
      }

      // Success
      return parsed
    } catch (error) {
      console.error(`[Reasoning Engine] Attempt ${attempts} failed:`, error.message)
      if (attempts >= maxAttempts) {
        break
      }
    }
  }

  // Graceful fallback
  console.warn('[Reasoning Engine] Persistent failure or Gemini unavailable. Returning fallback reasoning output.')
  return createFallbackReasoningOutput('Inference failed or was unavailable.')
}

module.exports = { executeReasoning }
