const { getDb } = require('../config/firebase')

/**
 * Auth Service.
 * Handles all Firestore operations for user management.
 * Business logic stays here — controllers remain thin.
 */

/**
 * Creates a new Firestore user document or returns existing one.
 * Called automatically after every successful authentication.
 *
 * @param {string} uid - Firebase UID from the verified token
 * @param {{ name: string, email: string }} userData - Basic user info
 * @returns {Promise<Object>} The user document data
 */
async function createOrGetUser(uid, userData) {
  const db = getDb()
  if (!db) throw new Error('Firestore is not initialized.')

  const userRef = db.collection('users').doc(uid)
  const userSnap = await userRef.get()

  if (userSnap.exists) {
    // Compute now once so Firestore write and return value are identical
    const now = new Date().toISOString()
    await userRef.update({ updatedAt: now })
    // Return merged object — avoids an unnecessary second Firestore read
    return { ...userSnap.data(), updatedAt: now }
  }

  // First-time login: create user document
  const newUser = {
    uid,
    name: userData.name || '',
    email: userData.email || '',
    occupation: '',
    timezone: 'UTC',
    wakeTime: '07:00',
    sleepTime: '23:00',
    preferences: {},
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  await userRef.set(newUser)
  console.log(`New user created in Firestore: ${uid}`)
  return newUser
}

/**
 * Retrieves the Firestore user document by UID.
 *
 * @param {string} uid - Firebase UID
 * @returns {Promise<Object>} The user document data
 * @throws {Error} If user document does not exist
 */
async function getUserProfile(uid) {
  const db = getDb()
  if (!db) throw new Error('Firestore is not initialized.')

  const userSnap = await db.collection('users').doc(uid).get()

  if (!userSnap.exists) {
    throw new Error('USER_NOT_FOUND')
  }

  return userSnap.data()
}

/**
 * Updates an existing user's profile settings in Firestore.
 *
 * @param {string} uid - Firebase UID
 * @param {Object} updateData - Key-values to update
 * @returns {Promise<Object>} The updated user document data
 */
async function updateUserProfile(uid, updateData) {
  const db = getDb()
  if (!db) throw new Error('Firestore is not initialized.')

  const userRef = db.collection('users').doc(uid)
  const userSnap = await userRef.get()

  if (!userSnap.exists) {
    throw new Error('USER_NOT_FOUND')
  }

  const now = new Date().toISOString()
  const data = userSnap.data()

  const updated = {
    ...data,
    name: updateData.name !== undefined ? updateData.name : data.name,
    occupation: updateData.occupation !== undefined ? updateData.occupation : data.occupation,
    timezone: updateData.timezone !== undefined ? updateData.timezone : data.timezone,
    wakeTime: updateData.wakeTime !== undefined ? updateData.wakeTime : data.wakeTime,
    sleepTime: updateData.sleepTime !== undefined ? updateData.sleepTime : data.sleepTime,
    preferences: updateData.preferences !== undefined ? updateData.preferences : data.preferences,
    updatedAt: now,
  }

  await userRef.set(updated)
  console.log(`User profile updated in Firestore: ${uid}`)
  return updated
}

module.exports = { createOrGetUser, getUserProfile, updateUserProfile }
