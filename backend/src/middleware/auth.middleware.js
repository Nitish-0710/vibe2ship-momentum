const admin = require('firebase-admin')

/**
 * Authentication Middleware.
 * Verifies the Firebase ID Token on every protected request.
 * Attaches decoded token claims to req.user.
 *
 * Usage: router.get('/protected', authenticate, controller)
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Missing or invalid authorization header.' },
    })
  }

  const idToken = authHeader.split('Bearer ')[1]

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken)
    req.user = decodedToken
    next()
  } catch (error) {
    console.error('Token verification failed:', error.message)
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired authentication token.' },
    })
  }
}

module.exports = { authenticate }
