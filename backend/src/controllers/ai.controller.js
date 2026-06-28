const { executePipeline, PipelineValidationError } = require('../brain/orchestrator/brain-orchestrator')

/**
 * AI Controller.
 * Thin layer: receives request, invokes Brain Orchestrator, formats response.
 */

/**
 * POST /ai/plan
 *
 * Runs the complete planning pipeline (Context -> Reasoning -> Decision -> Planning -> Reflection -> Coaching)
 * and returns the enriched plan response.
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
 * POST /ai/reason
 *
 * Diagnostic/development helper route returning the full planning response.
 */
async function reason(req, res) {
  return plan(req, res)
}

module.exports = { plan, reason }
