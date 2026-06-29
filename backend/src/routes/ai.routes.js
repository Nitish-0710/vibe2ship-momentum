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
 * GET /ai/plan/today
 *
 * Retrieves today's persisted schedule plan.
 */
router.get('/plan/today', aiController.getTodayPlan)

/**
 * POST /ai/replan
 *
 * Checks triggers and generates adaptive replanning adjustments.
 */
router.post('/replan', aiController.replan)

/**
 * POST /ai/reflection
 *
 * Stores user daily reflection and runs Reflection Engine observations.
 */
router.post('/reflection', aiController.reflect)

/**
 * GET /ai/insights
 *
 * Retrieves calculated user productivity metrics and observation insights.
 */
router.get('/insights', aiController.insights)

/**
 * POST /ai/reason
 *
 * Runs the reasoning and decision engines.
 */
router.post('/reason', aiController.reason)

module.exports = router
