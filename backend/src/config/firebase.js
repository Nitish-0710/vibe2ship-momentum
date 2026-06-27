const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');

let db = null;

function initializeFirebase() {
  try {
    if (process.env.FIREBASE_PROJECT_ID) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
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

module.exports = { initializeFirebase, getDb: () => db };
