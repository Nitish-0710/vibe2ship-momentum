const { GoogleGenAI } = require('@google/genai');

let aiClient = null;

function initializeGemini() {
  try {
    if (process.env.GEMINI_API_KEY) {
      aiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      console.log('Gemini SDK initialized successfully.');
    } else {
      console.warn('GEMINI_API_KEY missing. Skipping Gemini initialization.');
    }
  } catch (error) {
    console.error('Gemini initialization error:', error);
  }
}

function getGeminiClient() {
  return aiClient;
}

module.exports = { initializeGemini, getGeminiClient };
