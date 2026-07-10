const express = require('express');
const { authenticate } = require('../middleware/auth.middleware');
const authController = require('../controllers/auth.controller');

const router = express.Router();

/**
 * POST /auth/register
 * Registers a new user.
 */
router.post('/register', authController.register);

/**
 * POST /auth/login
 * Performs credentials check and returns a signed JWT.
 */
router.post('/login', authController.login);

/**
 * GET /auth/me
 * Returns current authenticated user's profile.
 */
router.get('/me', authenticate, authController.getProfile);

/**
 * GET /auth/profile
 * Compatibility route for existing profile retrieval.
 */
router.get('/profile', authenticate, authController.getProfile);

/**
 * PUT /auth/profile
 * Updates the user's settings profile.
 */
router.put('/profile', authenticate, authController.updateProfile);

module.exports = router;
