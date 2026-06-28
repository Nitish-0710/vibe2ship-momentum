/**
 * Planning Prompt Template.
 *
 * Used by the Planning Engine to generate execution plans.
 *
 * References: AISPEC §10 "Planning Engine", AISPEC §25 "Prompt Contract"
 *
 * Template only — not executed, not sent to Gemini.
 * The Orchestrator fills {{USER_CONTEXT}} at runtime.
 */

const PLANNING_PROMPT = `
## Task

Generate a realistic daily execution plan for the user based on the provided context.

## User Context

{{USER_CONTEXT}}

## Planning Rules

- Respect user working hours (wakeTime to sleepTime).
- Schedule high-priority tasks before low-priority tasks.
- Distribute workload across available days.
- Avoid scheduling overlapping tasks.
- Insert breaks between focus sessions.
- Leave buffer time before major deadlines.
- Schedule no more than 8 productive hours per day.

## Required Output (JSON)

Return a JSON object with the following structure:

{
  "planningResult": { "status": "success" | "partial" | "failed", "message": "..." },
  "taskPriorities": [
    { "taskId": "...", "title": "...", "priorityScore": 1-100, "explanation": "..." }
  ],
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "taskBlocks": [
        {
          "taskId": "...",
          "title": "...",
          "startTime": "ISO 8601",
          "endTime": "ISO 8601",
          "durationHours": 0,
          "explanation": "..."
        }
      ],
      "totalHours": 0
    }
  ],
  "recommendations": [
    { "type": "priority" | "schedule" | "risk" | "coaching", "message": "...", "taskId": "..." }
  ],
  "confidence": 0-100,
  "summary": "Human-readable summary of the plan."
}
`.trim()

module.exports = { PLANNING_PROMPT }
