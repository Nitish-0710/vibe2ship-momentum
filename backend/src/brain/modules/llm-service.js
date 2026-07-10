const { getLLMClient } = require('../../config/llm');

/**
 * Executes a text completion request using Groq Cloud.
 */
async function generateGroq(client, systemPrompt, userPrompt, options) {
  const model = options.model || 'llama-3.3-70b-versatile';
  try {
    const response = await client.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const text = response.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('LLM_EMPTY_RESPONSE');
    }
    return text;
  } catch (error) {
    console.error('[LLM Service] Groq request failed:', error.message);
    throw new Error('GROQ_API_ERROR');
  }
}

/**
 * Sends messages to the active LLM provider (Groq) and returns the raw text response.
 *
 * @param {string} systemPrompt - The system instruction
 * @param {string} userPrompt   - The user/task prompt
 * @param {Object} [options]    - Optional overrides
 * @param {string} [options.model] - Optional override model name
 * @returns {Promise<string>} Raw JSON text response
 * @throws {Error} If client not initialized or API call fails
 */
async function generateContent(systemPrompt, userPrompt, options = {}) {
  const client = getLLMClient();
  if (!client) {
    throw new Error('LLM_NOT_INITIALIZED');
  }

  return generateGroq(client, systemPrompt, userPrompt, options);
}

/**
 * Checks if the active LLM client is available.
 * @returns {boolean}
 */
function isLLMAvailable() {
  return !!getLLMClient();
}

/**
 * Compatibility alias for legacy checks.
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
