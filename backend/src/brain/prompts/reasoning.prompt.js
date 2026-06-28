/**
 * Reasoning Prompt Template.
 *
 * Used by the Reasoning Engine to analyze workload and detect risks
 * before planning decisions are made.
 *
 * References: AISPEC §8 "Reasoning Engine"
 *
 * Template only — not executed, not sent to Gemini.
 */

const REASONING_PROMPT = `
## Task

Analyze the user's current workload. Identify tasks, assess urgency and importance,
detect dependencies, estimate total workload, and identify scheduling risks.

Do NOT generate a schedule. Only analyze.

## User Context

{{USER_CONTEXT}}

## Required Output (JSON)

{
  "extractedTasks": [
    {
      "id": "...",
      "title": "...",
      "deadline": "ISO 8601 | null",
      "estimatedHours": 0,
      "urgency": "critical" | "high" | "medium" | "low",
      "importance": "critical" | "high" | "medium" | "low",
      "dependencies": [],
      "explanation": "..."
    }
  ],
  "detectedRisks": [
    {
      "type": "deadline" | "capacity" | "dependency" | "overload",
      "severity": "high" | "medium" | "low",
      "description": "...",
      "affectedTaskIds": []
    }
  ],
  "estimatedWorkload": 0,
  "summary": "Human-readable reasoning summary.",
  "confidence": 0-100
}
`.trim()

module.exports = { REASONING_PROMPT }
