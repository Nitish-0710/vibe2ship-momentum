const Groq = require('groq-sdk');
const { GoogleGenAI } = require('@google/genai');

let groqClient = null;
let geminiClient = null;

/**
 * Initializes the LLM clients based on environment variables.
 */
function initializeLLM() {
  const provider = (process.env.LLM_PROVIDER || 'gemini').toLowerCase();

  // Initialize Gemini if GEMINI_API_KEY exists and is non-empty
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.trim() !== '') {
    try {
      geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      console.log('Gemini SDK initialized successfully.');
    } catch (error) {
      console.error('Gemini initialization error:', error);
    }
  } else {
    console.warn('GEMINI_API_KEY missing. Skipping Gemini initialization.');
  }

  // Initialize Groq if GROQ_API_KEY exists and is non-empty
  if (process.env.GROQ_API_KEY && process.env.GROQ_API_KEY.trim() !== '') {
    try {
      groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
      console.log('Groq SDK initialized successfully.');
    } catch (error) {
      console.error('Groq initialization error:', error);
    }
  } else {
    console.warn('GROQ_API_KEY missing. Skipping Groq initialization.');
  }

  // Log active provider
  const formattedProvider = provider === 'gemini' ? 'Gemini' : 'Groq';
  console.log(`Active LLM Provider: ${formattedProvider}`);
}

/**
 * Retrieves the initialized LLM client for a provider.
 *
 * @param {string} [provider]
 * @returns {Object|null}
 */
function getLLMClient(provider) {
  const selectedProvider = (provider || process.env.LLM_PROVIDER || 'gemini').toLowerCase();
  return selectedProvider === 'gemini' ? geminiClient : groqClient;
}

module.exports = { initializeLLM, getLLMClient };
