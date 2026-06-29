# Momentum AI

### AI-powered Personal Productivity & Adaptive Planning Assistant

Momentum AI is a state-of-the-art cognitive productivity platform designed to help users structure their daily workloads, programmatically resolve dependencies, receive real-time coaching adjustments, and complete important objectives before deadlines.

---

## Overview

### The Problem
Traditional task managers (to-do lists, calendars, and kanban boards) are passive databases. They require users to manually select what to do, estimate durations, organize sequences, and re-estimate schedules when things change. This leads to decision fatigue, procrastination, and missed deadlines.

### Why Existing Planners Fail
1. **Static Scheduling**: They don't adapt to real-world interruptions, delays, or newly added urgent tasks.
2. **Cognitive Load**: The burden of daily schedule planning remains entirely on the user.
3. **No Closed-Loop Feedback**: Planners don't learn from why you skipped a task or when you work most efficiently.

### The Momentum AI Solution
Momentum AI introduces a closed-loop **Cognitive Planning Pipeline**. By acting as an active intelligence layer, it reads your current tasks, prioritizes them programmatically, maps them into optimized daily focus blocks, analyzes blockers, offers real-time behavioral coaching, and persists lessons in a long-term memory engine. When interruptions occur, it triggers **Adaptive Replanning** to re-optimize your day instantly.

---

## Key Features

- **⚡ AI Task Planning**: Automatically schedules daily task focus blocks based on user-defined morning wake-up times and evening sleep hours.
- **🎯 Intelligent Prioritization**: Programmatically scores task priority (1-100) using deadline urgency, importance, and relative dependencies.
- **🔄 Adaptive Replanning**: Detects scheduling triggers (missed tasks, urgent task additions, deadline shifts) and prompts re-optimization.
- **📝 Reflection Engine**: Evaluates schedule feasibility, reviews skipped tasks, and extracts productivity blockers.
- **💬 Coaching Engine**: Generates positive, context-aware advice advice cards and actionable daily recovery summaries.
- **🧠 Long-Term Memory**: Aggregates study block history, preferred work windows, and recurring blockers to customize future schedules.
- **📊 Productivity Analytics**: Renders completion rates, focus consistency scores, overdue task tracking, and weekly performance bar charts.
- **🔒 Firebase Authentication**: Secures user accounts via Google OAuth and email credential flows.
- **💾 Cloud Firestore**: Persists profiles, task metadata, daily schedules, and behavioral observations safely.
- **📱 Responsive Dashboard**: Premium dark-themed, glassmorphic layout adapted for desktop, tablet, and mobile browsers.

---

## System Architecture

```text
       [ React Frontend ]
               │
               ▼  (HTTP / Firebase Auth Bearer Token)
     [ Node.js + Express API ]
               │
               ▼
     [ Brain Orchestrator ]
               │
               ├─► [ Context Builder ] ───► Reads Tasks, Profile, and Memory Insights
               │
               ├─► [ Reasoning Engine ] ──► Analyzes workload and capacity limits
               │
               ├─► [ Decision Engine ] ───► Calculates task priority scores & dependencies
               │
               ├─► [ Planning Engine ] ───► Generates today's focus time blocks
               │
               ├─► [ Reflection Engine ] ─► Identifies blockers and completion feasibility
               │
               ├─► [ Coaching Engine ] ───► Creates encouraging behavioral advice
               │
               └─► [ Memory Engine ] ─────► Persists updates in Firestore
                                                 │
                                                 ▼
                                        [ Cloud Firestore ]
```

---

## Tech Stack

### Frontend
- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS (PostCSS)
- **State Management**: TanStack React Query v5
- **Routing**: React Router v7

### Backend
- **Runtime**: Node.js
- **Server Framework**: Express

### Database & Auth
- **User Authentication**: Firebase Auth SDK (Google Identity Provider)
- **Database Layer**: Cloud Firestore (Firebase Admin SDK)

### Artificial Intelligence
- **Inference Engine**: Groq Cloud SDK
- **Large Language Model**: Llama 3.3 70B (`llama-3.3-70b-versatile`)

---

## Project Structure

```text
Momentum-AI/
├── backend/
│   ├── src/
│   │   ├── brain/
│   │   │   ├── context/          # BrainContext Builder
│   │   │   ├── modules/          # LLM Service, Engines (Reasoning, Decisions, etc.)
│   │   │   ├── prompts/          # Standard Prompt templates
│   │   │   └── schemas/          # Struct validators & fallback schemas
│   │   ├── config/               # Firebase Admin SDK & Groq LLM client configs
│   │   ├── controllers/          # Express route controllers
│   │   ├── middleware/           # Firebase Auth token validators
│   │   ├── routes/               # API route definitions
│   │   └── services/             # Core business logic services
│   ├── server.js                 # Entry point
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/           # Tasks list, cards, layout pieces
│   │   ├── config/               # Firebase Client Client initialization
│   │   ├── constants/            # Routes endpoints
│   │   ├── contexts/             # Global Auth contexts state
│   │   ├── hooks/                # Custom React Query queries/mutations hooks
│   │   ├── layouts/              # Header and sidebar components
│   │   ├── pages/                # Planner, Analytics, Reflection, Settings pages
│   │   ├── services/             # API client wrappers
│   │   ├── types/                # Typescript type interfaces
│   │   └── main.tsx              # React mounting root
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- A [Firebase Project](https://console.firebase.google.com/) with Authentication (Google & Email enabled) and Firestore Database enabled.
- A [Groq API Key](https://console.groq.com/).

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Place your Firebase Admin SDK service account key JSON file in the backend root and name it `serviceAccountKey.json`.
4. Create a `.env` file from the example:
   ```bash
   cp .env.example .env
   ```
5. Open `.env` and fill in your variables:
   ```env
   PORT=5000
   FIREBASE_PROJECT_ID=your-firebase-project-id
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   GROQ_API_KEY=your-groq-api-key
   ```
6. Start the development server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file:
   ```bash
   touch .env
   ```
4. Open `.env` and fill in your client keys:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_FIREBASE_API_KEY=your-client-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-firebase-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```
5. Launch the React development server:
   ```bash
   npm run dev
   ```

---

## AI Workflow

```text
 [Create Task] ──► [Context Builder] ──► [Reasoning Engine] ──► [Decision Engine]
                                                                      │
 [Memory Update] ◄── [Memory Engine] ◄── [Coaching] ◄── [Reflection] ◄┴─► [Planning]
```

1. **Task Creation**: User logs metadata (due dates, estimation, dependencies).
2. **Context Builder**: Pulls task arrays, user metadata, and historical memory observations.
3. **Reasoning**: Groq analyzes workloads and flags capacity limitations.
4. **Decision**: Scoring algorithm evaluates relative priorities, deadlines, and flags focus recommendations.
5. **Planning**: Schedules focus blocks aligning with the user's wake-up/sleep hours.
6. **Reflection**: Evaluates schedule constraints and checks feasibility.
7. **Coaching**: Produces behavioral tips to help the user recover momentum.
8. **Memory Update**: Persists metrics and schedule states in Firestore for future iterations.

---

## Screenshots

- **Dashboard**: [Dashboard Overview Placeholder](docs/assets/dashboard.png)
- **AI Planner**: [Daily Planner Timeline Placeholder](docs/assets/planner.png)
- **Productivity Analytics**: [Completion Analytics Charts Placeholder](docs/assets/analytics.png)
- **Daily Reflection**: [Night Reflection Check-in Placeholder](docs/assets/reflection.png)
- **Settings & Hours**: [Wake/Sleep Configuration Placeholder](docs/assets/settings.png)

---

## Future Improvements

1. **Adaptive Recalibration (Automatic)**: Automatically reschedule focus blocks using background listeners without requiring the user to click replan.
2. **Calendar Sync**: Bidirectional sync with Google Calendar and Microsoft Outlook.
3. **Focus Timer Mode**: Built-in Pomodoro timer logging actual focus minutes directly into reflection metrics.
4. **Smart Dependency Warnings**: Predictive warnings when blocked tasks are approaching deadlines.

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
