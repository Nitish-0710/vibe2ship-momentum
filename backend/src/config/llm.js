const Groq = require('groq-sdk');

let groqClient = null;

/**
 * Initializes the Groq client.
 */
function initializeLLM() {
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '') {
    try {
      groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
      console.log('Groq SDK initialized successfully.');
    } catch (error) {
      console.error('Groq initialization error:', error.message);
    }
  } else {
    console.warn('GROQ_API_KEY missing. Skipping Groq initialization.');
  }

  console.log('Active LLM Provider: Groq');
}

/**
 * Retrieves the initialized Groq client.
 *
 * @returns {Object|null}
 */
function getLLMClient() {
  return groqClient;
}

module.exports = { initializeLLM, getLLMClient };
