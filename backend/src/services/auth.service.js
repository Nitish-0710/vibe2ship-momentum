const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const User = require('../models/User');

/**
 * Auth Service.
 * Handles all MongoDB operations for user management.
 */

/**
 * Registers a new user with hashed password.
 */
async function registerUser({ name, email, password }) {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    throw new Error('EMAIL_ALREADY_IN_USE');
  }

  const uid = new mongoose.Types.ObjectId().toString();
  const hashedPassword = await bcrypt.hash(password, 10);
  const now = new Date().toISOString();

  const newUser = new User({
    uid,
    name: name || '',
    email: email.toLowerCase(),
    password: hashedPassword,
    occupation: '',
    timezone: 'UTC',
    wakeTime: '07:00',
    sleepTime: '23:00',
    preferences: {},
    createdAt: now,
    updatedAt: now,
  });

  await newUser.save();
  console.log(`New user registered in MongoDB: ${uid}`);
  return newUser.toObject();
}

/**
 * Authenticates user by email and password.
 */
async function authenticateUser(email, password) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error('WRONG_PASSWORD');
  }

  const now = new Date().toISOString();
  user.updatedAt = now;
  await user.save();

  return user.toObject();
}

/**
 * Creates a new user document or returns existing one (retained for OAuth compatibility if any, or general use).
 */
async function createOrGetUser(uid, userData) {
  const now = new Date().toISOString();
  let user = await User.findOne({ uid });

  if (user) {
    user.updatedAt = now;
    await user.save();
    return user.toObject();
  }

  // Fallback default password for sync-ups
  const defaultPassword = await bcrypt.hash('momentum_ai_oauth_default_pwd', 10);

  const newUser = new User({
    uid,
    name: userData.name || '',
    email: userData.email?.toLowerCase() || '',
    password: defaultPassword,
    occupation: '',
    timezone: 'UTC',
    wakeTime: '07:00',
    sleepTime: '23:00',
    preferences: {},
    createdAt: now,
    updatedAt: now,
  });

  await newUser.save();
  console.log(`New user created in MongoDB via oauth/sync: ${uid}`);
  return newUser.toObject();
}

/**
 * Retrieves the user document by UID.
 */
async function getUserProfile(uid) {
  const user = await User.findOne({ uid });
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }
  return user.toObject();
}

/**
 * Updates an existing user's profile settings.
 */
async function updateUserProfile(uid, updateData) {
  const user = await User.findOne({ uid });
  if (!user) {
    throw new Error('USER_NOT_FOUND');
  }

  const now = new Date().toISOString();

  if (updateData.name !== undefined) user.name = updateData.name;
  if (updateData.occupation !== undefined) user.occupation = updateData.occupation;
  if (updateData.timezone !== undefined) user.timezone = updateData.timezone;
  if (updateData.wakeTime !== undefined) user.wakeTime = updateData.wakeTime;
  if (updateData.sleepTime !== undefined) user.sleepTime = updateData.sleepTime;
  if (updateData.preferences !== undefined) user.preferences = updateData.preferences;
  user.updatedAt = now;

  await user.save();
  console.log(`User profile updated in MongoDB: ${uid}`);
  return user.toObject();
}

module.exports = {
  registerUser,
  authenticateUser,
  createOrGetUser,
  getUserProfile,
  updateUserProfile
};
