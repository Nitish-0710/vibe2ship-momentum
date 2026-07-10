const { executePipeline, PipelineValidationError } = require('../brain/orchestrator/brain-orchestrator')
const { detectReplanningTriggers } = require('../brain/modules/adaptive-planner')
const { buildContext } = require('../brain/context/context-builder')
const { recordDailyReflection } = require('../services/reflection.service')
const { getUserAnalytics } = require('../services/analytics.service')
const Schedule = require('../models/Schedule')

/**
 * AI Controller.
 * Thin layer: receives request, invokes services/orchestrators, formats response.
 */

/**
 * POST /ai/plan
 *
 * Runs the complete planning pipeline and returns the enriched plan response.
 */
async function plan(req, res) {
  try {
    const userId = req.user.uid
    const options = {
      requestType: req.body.requestType || 'plan',
      userMessage: req.body.userMessage || '',
    }

    const result = await executePipeline(userId, options)
    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err) {
    console.error('ai.controller.plan error:', err.message)

    if (err instanceof PipelineValidationError) {
      return res.status(422).json({
        success: false,
        error: {
          code: 'VALIDATION_FAILED',
          message: `Validation failed at stage: ${err.stage}`,
          stage: err.stage,
          details: err.errors,
        },
      })
    }

    if (err.message === 'CONTEXT_BUILD_FAILED') {
      return res.status(500).json({
        success: false,
        error: { code: 'CONTEXT_BUILD_FAILED', message: 'Failed to construct user context.' },
      })
    }

    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An unexpected error occurred during planning.' },
    })
  }
}

/**
 * POST /ai/replan
 *
 * Checks if replanning triggers are active (missed tasks, urgent items)
 * and executes pipeline update accordingly.
 */
async function replan(req, res) {
  try {
    const userId = req.user.uid
    const context = await buildContext(userId)
    const trigger = detectReplanningTriggers(context)

    const userMessage = req.body.userMessage || trigger.reasons.join(' ') || 'User initiated replanning.'
    console.log(`[AI Controller] Replanning trigger reasons: ${trigger.reasons.join(', ')}`)

    const result = await executePipeline(userId, {
      requestType: 'replan',
      userMessage,
    })

    return res.status(200).json({
      success: true,
      triggerDetected: trigger.shouldReplan,
      triggerReasons: trigger.reasons,
      data: result,
    })
  } catch (err) {
    console.error('ai.controller.replan error:', err.message)
    if (err instanceof PipelineValidationError) {
      return res.status(422).json({
        success: false,
        error: { code: 'VALIDATION_FAILED', message: err.message, details: err.errors },
      })
    }
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to execute adaptive replanning.' },
    })
  }
}

/**
 * POST /ai/reflection
 *
 * Saves daily reflection input and returns analysis observations from Reflection Engine.
 */
async function reflect(req, res) {
  try {
    const userId = req.user.uid
    const result = await recordDailyReflection(userId, req.body)
    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err) {
    console.error('ai.controller.reflect error:', err.message)
    if (err.message.startsWith('VALIDATION_ERROR:')) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: err.message.replace('VALIDATION_ERROR: ', '') },
      })
    }
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to record daily reflection.' },
    })
  }
}

/**
 * GET /ai/insights
 *
 * Computes and retrieves personalized productivity insights.
 */
async function insights(req, res) {
  try {
    const userId = req.user.uid
    const result = await getUserAnalytics(userId)
    return res.status(200).json({
      success: true,
      data: result,
    })
  } catch (err) {
    console.error('ai.controller.insights error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Failed to compute productivity insights.' },
    })
  }
}

/**
 * POST /ai/reason
 *
 * Diagnostic/development helper route returning the full planning response.
 */
async function reason(req, res) {
  return plan(req, res)
}

/**
 * GET /ai/plan/today
 *
 * Retrieves today's persisted schedule plan if one exists.
 */
async function getTodayPlan(req, res) {
  try {
    const userId = req.user.uid
    const todayDateStr = new Date().toISOString().substring(0, 10)
    const schedule = await Schedule.findOne({ docId: `${userId}_${todayDateStr}` })

    if (!schedule) {
      return res.status(200).json({
        success: true,
        data: null,
      })
    }

    const data = schedule.toObject()
    const fullPlan = data.fullPlan || null

    if (fullPlan) {
      if (!fullPlan.decisions) {
        fullPlan.decisions = {
          priorityOrdering: [],
          urgencyAssessment: {},
          focusRecommendations: [],
          deferredTasks: [],
          blockedTasks: [],
          confidence: 100,
          summary: '',
        }
      }
      if (!fullPlan.reasoning) {
        fullPlan.reasoning = {
          extractedTasks: [],
          detectedRisks: [],
          estimatedWorkload: 0,
          summary: '',
          confidence: 100,
        }
      }
      if (!fullPlan.reflection) {
        fullPlan.reflection = {
          reflectionSummary: '',
          insights: [],
          recommendations: [],
          planningAdjustments: [],
          confidence: 100,
        }
      }
      if (!fullPlan.coaching) {
        fullPlan.coaching = {
          coachingMessages: [],
          dailySummary: '',
          confidence: 100,
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: fullPlan,
    })
  } catch (err) {
    console.error('ai.controller.getTodayPlan error:', err.message)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: "Failed to retrieve today's schedule." },
    })
  }
}

module.exports = { plan, replan, reflect, insights, reason, getTodayPlan }
