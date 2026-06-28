const express = require('express')
const { authenticate } = require('../middleware/auth.middleware')
const aiController = require('../controllers/ai.controller')

const router = express.Router()

// All AI routes require authentication
router.use(authenticate)

/**
 * POST /ai/plan
 *
 * Runs the complete planning pipeline and generates schedule.
 */
router.post('/plan', aiController.plan)

/**
 * POST /ai/reason
 *
 * Runs the reasoning and decision engines.
 */
router.post('/reason', aiController.reason)

module.exports = router
