const authService = require('../services/auth.service')

/**
 * Auth Controller.
 * Thin layer: validates request, delegates to service, formats response.
 * Contains no business logic.
 */

/**
 * POST /auth/login
 * Creates or retrieves a Firestore user document.
 * Called by the frontend after every successful Firebase authentication.
 */
async function login(req, res) {
  try {
    const { name, email } = req.body
    const uid = req.user.uid

    const user = await authService.createOrGetUser(uid, { name, email })

    return res.status(200).json({ success: true, data: user })
  } catch (error) {
    console.error('auth.controller.login error:', error.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to process authentication.' },
    })
  }
}

/**
 * GET /auth/profile
 * Returns the authenticated user's Firestore profile.
 */
async function getProfile(req, res) {
  try {
    const uid = req.user.uid
    const user = await authService.getUserProfile(uid)

    return res.status(200).json({ success: true, data: user })
  } catch (error) {
    if (error.message === 'USER_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        error: { code: 'USER_NOT_FOUND', message: 'User profile not found.' },
      })
    }
    console.error('auth.controller.getProfile error:', error.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to retrieve profile.' },
    })
  }
}

module.exports = { login, getProfile }
