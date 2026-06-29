const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const fs = require('fs');
const path = require('path');

let db = null;

function initializeFirebase() {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      // Fallback to Application Default Credentials if local JSON key file doesn't exist (e.g. Cloud Run)
      if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        const credPath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
        if (!fs.existsSync(credPath)) {
          console.warn(`[FIREBASE] Credential key file not found at ${credPath}. Unsetting GOOGLE_APPLICATION_CREDENTIALS to fallback to metadata default credentials.`);
          delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
        }
      }

      initializeApp({
        credential: applicationDefault(),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });

      db = getFirestore();

      console.log('Firebase Admin initialized successfully.');
      console.log('Firestore connection initialized successfully.');
    } else {
      console.warn('Firebase config missing. Skipping Firebase initialization.');
    }
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

function getDb() {
  return db;
}

module.exports = {
  initializeFirebase,
  getDb,
};