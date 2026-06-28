const { executePipeline } = require('../brain/orchestrator/brain-orchestrator')

/**
 * AI Controller.
 * Thin layer: receives request, invokes Brain Orchestrator, formats response.
 */

/**
 * POST /ai/reason
 *
 * Runs the reasoning and decision engine pipeline on the user's tasks.
 */
async function reason(req, res) {
  try {
    const userId = req.user.uid
    const options = {
      requestType: req.body.requestType || 'plan',
      userMessage: req.body.userMessage || '',
    }

    const result = await executePipeline(userId, options)
    return res.status(200).json(result)
  } catch (err) {
    console.error('ai.controller.reason error:', err.message)
    
    if (err.message === 'CONTEXT_BUILD_FAILED') {
      return res.status(500).json({
        success: false,
        error: { code: 'CONTEXT_BUILD_FAILED', message: 'Failed to construct user context.' },
      })
    }

    if (err.message === 'DECISION_VALIDATION_FAILED') {
      return res.status(500).json({
        success: false,
        error: { code: 'DECISION_VALIDATION_FAILED', message: 'Brain output failed structural validation.' },
      })
    }

    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'An unexpected error occurred during reasoning.' },
    })
  }
}

module.exports = { reason }
