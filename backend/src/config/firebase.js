const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

let db = null;

function initializeFirebase() {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
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