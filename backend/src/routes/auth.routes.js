const express = require('express')
const { authenticate } = require('../middleware/auth.middleware')
const authController = require('../controllers/auth.controller')

const router = express.Router()

/**
 * POST /auth/login
 * Creates or retrieves the Firestore user document.
 * Protected: requires valid Firebase ID Token.
 */
router.post('/login', authenticate, authController.login)

/**
 * GET /auth/profile
 * Returns the authenticated user's profile from Firestore.
 * Protected: requires valid Firebase ID Token.
 */
router.get('/profile', authenticate, authController.getProfile)

module.exports = router
