const jwt = require('jsonwebtoken');

/**
 * Authentication Middleware.
 * Verifies the JWT Bearer Token on every protected request.
 * Attaches decoded token claims to req.user.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Missing or invalid authorization header.",
      },
    });
  }

  const token = authHeader.split('Bearer ')[1];

  try {
    const jwtSecret = process.env.JWT_SECRET || 'fallback_jwt_secret_key_momentum_ai';
    const decoded = jwt.verify(token, jwtSecret);
    
    req.user = { uid: decoded.uid };
    console.log('[AUTH] User authenticated successfully via JWT.');
    next();
  } catch (error) {
    console.error('[AUTH] JWT verification failed:', error.message);
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_TOKEN', message: 'Invalid or expired authentication token.' },
    });
  }
}

module.exports = { authenticate };
