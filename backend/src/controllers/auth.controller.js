const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_jwt_secret_key_momentum_ai';
const JWT_EXPIRE = process.env.JWT_EXPIRE || '7d';

/**
 * Generates a signed JWT token for the user.
 * @param {string} uid
 * @returns {string} Signed JWT token
 */
function generateToken(uid) {
  return jwt.sign({ uid }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
}

/**
 * POST /auth/register
 * Registers a new user with credentials (email/password).
 */
async function register(req, res) {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email and password are required.' }
      });
    }

    const user = await authService.registerUser({ name, email, password });
    const token = generateToken(user.uid);

    return res.status(201).json({
      success: true,
      token,
      data: user
    });
  } catch (error) {
    if (error.message === 'EMAIL_ALREADY_IN_USE') {
      return res.status(400).json({
        success: false,
        error: { code: 'EMAIL_ALREADY_IN_USE', message: 'An account with this email already exists.' }
      });
    }
    console.error('auth.controller.register error:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to complete registration.' }
    });
  }
}

/**
 * POST /auth/login
 * Validates email/password credentials and issues a JWT token.
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_INPUT', message: 'Email and password are required.' }
      });
    }

    const user = await authService.authenticateUser(email, password);
    const token = generateToken(user.uid);

    return res.status(200).json({
      success: true,
      token,
      data: user
    });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(401).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'No account found with this email.' }
      });
    }
    if (error.message === 'WRONG_PASSWORD') {
      return res.status(401).json({
        success: false,
        error: { code: 'WRONG_PASSWORD', message: 'Incorrect password.' }
      });
    }
    console.error('auth.controller.login error:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to process authentication.' }
    });
  }
}

/**
 * GET /auth/profile (and /auth/me)
 * Returns the authenticated user's profile.
 */
async function getProfile(req, res) {
  try {
    const uid = req.user.uid;
    const user = await authService.getUserProfile(uid);

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User profile not found.' }
      });
    }
    console.error('auth.controller.getProfile error:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve profile.' }
    });
  }
}

/**
 * PUT /auth/profile
 * Updates the authenticated user's profile settings.
 */
async function updateProfile(req, res) {
  try {
    const uid = req.user.uid;
    const user = await authService.updateUserProfile(uid, req.body);
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User profile not found.' }
      });
    }
    console.error('auth.controller.updateProfile error:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to update profile settings.' }
    });
  }
}

module.exports = { register, login, getProfile, updateProfile };
