const { getLLMClient } = require('../../config/llm');

/**
 * Sends messages to Groq and returns the raw text response.
 *
 * @param {string} systemPrompt - The system instruction
 * @param {string} userPrompt   - The user/task prompt
 * @param {Object} [options]    - Optional overrides
 * @param {string} [options.model] - Groq model name (default: llama-3.3-70b-versatile)
 * @returns {Promise<string>} Raw text response from Groq
 * @throws {Error} If client not initialized or API call fails
 */
async function generateContent(systemPrompt, userPrompt, options = {}) {
  const client = getLLMClient();
  if (!client) {
    throw new Error('LLM_NOT_INITIALIZED');
  }

  const model = options.model || 'llama-3.3-70b-versatile';

  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1, // Low temperature for deterministic JSON output
    });

    const text = response.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('LLM_EMPTY_RESPONSE');
    }

    return text;
  } catch (error) {
    console.error('[LLM Service] Request failed:', error.message);
    throw new Error('LLM_REQUEST_FAILED');
  }
}

/**
 * Checks if the LLM client is available.
 * @returns {boolean}
 */
function isLLMAvailable() {
  return !!getLLMClient();
}

/**
 * Compatibility alias for legacy Gemini-specific checks.
 * @returns {boolean}
 */
function isGeminiAvailable() {
  return isLLMAvailable();
}

module.exports = {
  generateContent,
  isLLMAvailable,
  isGeminiAvailable,
};
