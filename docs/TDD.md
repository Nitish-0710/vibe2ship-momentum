# Technical Design Document (TDD)

# Momentum AI

Version: 1.0

Hackathon: Vibe2Ship 2026

---

# 1. System Overview

Momentum AI is an AI-powered productivity platform that helps users plan, prioritize, execute, and adapt their work before deadlines are missed.

Unlike traditional reminder applications, Momentum AI uses an AI Orchestrator coordinating multiple specialized reasoning agents to generate intelligent execution plans.

---

# 2. High-Level Architecture

```
                    React Frontend
                          │
                          ▼
                  Express API Server
                          │
        ┌─────────────────┼─────────────────┐
        ▼                 ▼                 ▼
 Firebase Auth      Firestore DB     Gemini API
                          │
                          ▼
                  AI Orchestrator
                          │
 ┌──────────┬──────────┬──────────┬──────────┬──────────┐
 ▼          ▼          ▼          ▼          ▼
Parser   Prioritizer Estimator Planner Coach
                          │
                          ▼
                    Final Schedule
```

---

# 3. AI Orchestrator

The AI Orchestrator manages all reasoning.

Instead of calling Gemini randomly, every request follows a structured pipeline.

Responsibilities:

* maintain workflow
* call reasoning modules
* merge outputs
* validate results
* return structured response

---

# 4. Agent Pipeline

## Agent 1 — Task Parser

Input:

Natural language

Example

"I have a DBMS assignment due Friday and an ML exam next Tuesday."

Output

```json
{
  "tasks": [
    {
      "title": "DBMS Assignment",
      "deadline": "...",
      "estimatedHours": null,
      "category": "Assignment"
    }
  ]
}
```

Responsibilities

* extract tasks
* identify deadlines
* detect missing fields
* normalize data

---

## Agent 2 — Priority Agent

Input

Structured task list

Responsibilities

Calculate

* urgency
* importance
* dependency
* effort

Output

Priority Score

0–100

---

## Agent 3 — Time Estimation Agent

Responsibilities

Estimate

* total hours
* focus sessions
* recommended breaks
* suggested start date

---

## Agent 4 — Conflict Detection Agent

Checks

* overlapping deadlines
* overloaded days
* impossible schedules
* insufficient available hours

Returns

Conflict Report

---

## Agent 5 — Schedule Optimizer

Creates

* daily plan
* weekly roadmap
* time blocks
* focus sessions
* break intervals
* buffer time

---

## Agent 6 — Accountability Coach

Generates

Daily messages

Progress reminders

Recovery suggestions

Motivation

---

## Agent 7 — Reflection Agent

Analyzes

completed tasks

skipped work

focus level

Updates

future planning strategy

---

# 5. AI Request Flow

```
User
 │
 ▼
Task Input

 │
 ▼
Task Parser

 │
 ▼
Priority Agent

 │
 ▼
Time Estimator

 │
 ▼
Conflict Detection

 │
 ▼
Schedule Optimizer

 │
 ▼
Firestore

 │
 ▼
Dashboard
```

---

# 6. Backend Modules

```
backend/

config/

controllers/

middleware/

models/

routes/

services/

agents/

utils/

prompts/

orchestrator/

```

---

# 7. AI Folder Structure

```
agents/

parserAgent.js

priorityAgent.js

estimationAgent.js

plannerAgent.js

coachAgent.js

reflectionAgent.js

```

---

# 8. Prompt Strategy

Every agent has

System Prompt

Developer Prompt

Output Schema

Validation Rules

No free-form outputs.

Only JSON.

Example

```
Parser Agent

Input

Natural language

Output

Strict JSON

No explanations.
```

---

# 9. Firestore Collections

Users

Tasks

Schedules

Subtasks

ProgressLogs

Reflections

Notifications

AIInsights

Settings

---

# 10. Frontend Structure

```
src/

pages/

components/

hooks/

contexts/

services/

types/

utils/

assets/

```

---

# 11. Major Screens

Landing Page

Authentication

Dashboard

Task Manager

AI Planner

Calendar View

Analytics

Settings

Reflection

---

# 12. API Endpoints

POST /auth/login

POST /tasks

GET /tasks

PUT /tasks/:id

DELETE /tasks/:id

POST /ai/plan

POST /ai/replan

POST /reflection

GET /dashboard

GET /analytics

---

# 13. Error Handling

Gemini timeout

↓

retry once

↓

fallback response

Firestore failure

↓

retry

↓

cache

↓

notify user

---

# 14. Logging

Store

AI latency

API latency

Agent outputs

Errors

Execution time

---

# 15. Security

Firebase Authentication

JWT verification

Firestore Rules

Input sanitization

Rate limiting

CORS

Helmet

---

# 16. Performance

Lazy loading

Component memoization

Pagination

Firestore indexing

Prompt optimization

Caching

---

# 17. Deployment

Frontend

Firebase Hosting (or Cloud Run)

Backend

Google Cloud Run

Database

Firestore

Authentication

Firebase Auth

AI

Gemini API

---

# 18. Development Plan

Sprint 1

Authentication

Firestore

Task CRUD

Landing

Dashboard

Sprint 2

Parser Agent

Priority Agent

Planner Agent

Sprint 3

Replanner

Reflection

Analytics

Sprint 4

Testing

Deployment

Documentation

Demo

---

# 19. Future Expansion

Google Calendar

Email integration

Slack

Wearables

Team collaboration

Voice assistant

Mobile app

Offline mode

---

# 20. Success Criteria

* Complete task planning workflow.
* Adaptive schedule replanning.
* End-to-end AI orchestration.
* Responsive UI.
* Stable Google Cloud deployment.
* Production-quality documentation.
* Clear demonstration of agentic reasoning.
