/**
 * Reflection Prompt Template.
 *
 * Used by the Reflection Engine to analyze completed work
 * and identify improvement opportunities.
 *
 * References: AISPEC §13 "Reflection Engine"
 *
 * Template only — not executed, not sent to Gemini.
 */

const REFLECTION_PROMPT = `
## Task

Analyze the user's completed work and productivity patterns.
Identify recurring blockers, detect trends, and generate improvement suggestions.

Reflection is for learning, not evaluation. Be supportive and constructive.

## User Context

{{USER_CONTEXT}}

## Required Output (JSON)

{
  "reflectionSummary": "Human-readable analysis of recent productivity.",
  "completedTaskCount": 0,
  "skippedTaskCount": 0,
  "insights": [
    {
      "type": "pattern" | "blocker" | "improvement" | "strength",
      "description": "...",
      "confidence": 0-100
    }
  ],
  "recommendations": [
    {
      "type": "coaching",
      "message": "..."
    }
  ],
  "planningAdjustments": [
    {
      "field": "...",
      "suggestion": "...",
      "reason": "..."
    }
  ],
  "confidence": 0-100
}
`.trim()

module.exports = { REFLECTION_PROMPT }
