/**
 * Coaching Prompt Template.
 *
 * Used by the Coaching Engine to generate actionable, supportive guidance.
 *
 * References: AISPEC §12 "Coaching Engine"
 *
 * Template only — not executed, not sent to Gemini.
 */

const COACHING_PROMPT = `
## Task

Generate personalized, actionable coaching recommendations for the user
based on their current workload, progress, and schedule.

## Coaching Principles

- Be specific and actionable.
- Be supportive and positive.
- Be relevant to current context.
- Keep messages short.
- Never shame or overwhelm the user.
- Never recommend impossible workloads.
- Focus on encouraging achievable progress.

## User Context

{{USER_CONTEXT}}

## Required Output (JSON)

{
  "coachingMessages": [
    {
      "type": "guidance" | "recovery" | "progress" | "priority" | "encouragement" | "risk",
      "message": "...",
      "taskId": "...",
      "priority": "high" | "medium" | "low"
    }
  ],
  "dailySummary": "One-sentence summary of the day's focus.",
  "confidence": 0-100
}
`.trim()

module.exports = { COACHING_PROMPT }
