const Groq = require('groq-sdk');

let client = null;

/**
 * Initializes the Groq client using the GROQ_API_KEY environment variable.
 */
function initializeLLM() {
  try {
    if (process.env.GROQ_API_KEY) {
      client = new Groq({ apiKey: process.env.GROQ_API_KEY });
      console.log('Groq SDK initialized successfully.');
    } else {
      console.warn('GROQ_API_KEY missing. Skipping Groq initialization.');
    }
  } catch (error) {
    console.error('Groq initialization error:', error);
  }
}

/**
 * Retrieves the initialized Groq client.
 *
 * @returns {Groq|null}
 */
function getLLMClient() {
  return client;
}

module.exports = { initializeLLM, getLLMClient };
