/**
 * Gemini Service — reusable client utility for the Brain layer.
 *
 * Exposes a single `generateContent` function that:
 *   1. Checks the client is initialized.
 *   2. Sends the prompt to Gemini.
 *   3. Returns raw text.
 *
 * Does NOT send prompts itself — only called by engine modules.
 * Does NOT perform any model inference in Phase 3A.
 * This is infrastructure only.
 *
 * References: TDD §29 "Backend Architecture" (Gemini API layer)
 */

const { getGeminiClient } = require('../../config/gemini')

/**
 * Sends a prompt to Gemini and returns the raw text response.
 *
 * @param {string} systemPrompt - The system instruction
 * @param {string} userPrompt   - The user/task prompt
 * @param {Object} [options]    - Optional overrides
 * @param {string} [options.model] - Gemini model name (default: gemini-2.0-flash)
 * @returns {Promise<string>} Raw text response from Gemini
 * @throws {Error} If client not initialized or API call fails
 */
async function generateContent(systemPrompt, userPrompt, options = {}) {
  const client = getGeminiClient()
  if (!client) {
    throw new Error('GEMINI_NOT_INITIALIZED')
  }

  const model = options.model || 'gemini-2.0-flash'

  const response = await client.models.generateContent({
    model,
    contents: userPrompt,
    config: {
      systemInstruction: systemPrompt,
      responseMimeType: 'application/json',
    },
  })

  const text = response.text
  if (!text) {
    throw new Error('GEMINI_EMPTY_RESPONSE')
  }

  return text
}

/**
 * Checks if the Gemini client is available.
 * @returns {boolean}
 */
function isGeminiAvailable() {
  return !!getGeminiClient()
}

module.exports = { generateContent, isGeminiAvailable }
