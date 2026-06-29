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
 * Executes a text completion request using Google Gemini (Google GenAI SDK).
 */
async function generateGemini(client, systemPrompt, userPrompt, options) {
  const model = options.model || 'gemini-2.5-flash';
  try {
    const response = await client.models.generateContent({
      model,
      contents: userPrompt,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    let text = response.text;
    if (!text) {
      throw new Error('LLM_EMPTY_RESPONSE');
    }

    // Strip markdown wrappers if present (e.g. ```json ... ```)
    text = text.trim();
    if (text.startsWith('```')) {
      const firstNewLine = text.indexOf('\n');
      if (firstNewLine !== -1) {
        text = text.substring(firstNewLine + 1);
      } else {
        text = text.replace(/^```[a-zA-Z]*/, '');
      }
      text = text.replace(/```$/, '').trim();
    }

    return text;
  } catch (error) {
    console.error('[LLM Service] Gemini request failed:', error.message);
    throw new Error('GEMINI_API_ERROR');
  }
}

/**
 * Sends messages to the active LLM provider and returns the raw text response.
 *
 * @param {string} systemPrompt - The system instruction
 * @param {string} userPrompt   - The user/task prompt
 * @param {Object} [options]    - Optional overrides
 * @param {string} [options.model] - Optional override model name
 * @returns {Promise<string>} Raw JSON text response
 * @throws {Error} If client not initialized, invalid provider, or API call fails
 */
async function generateContent(systemPrompt, userPrompt, options = {}) {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  
  if (provider !== 'gemini' && provider !== 'groq') {
    throw new Error('UNKNOWN_PROVIDER');
  }

  const client = getLLMClient(provider);
  if (!client) {
    throw new Error('LLM_NOT_INITIALIZED');
  }

  if (provider === 'gemini') {
    return generateGemini(client, systemPrompt, userPrompt, options);
  } else {
    return generateGroq(client, systemPrompt, userPrompt, options);
  }
}

/**
 * Checks if the active LLM client is available.
 * @returns {boolean}
 */
function isLLMAvailable() {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  return !!getLLMClient(provider);
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
