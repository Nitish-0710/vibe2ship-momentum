# Momentum AI

### AI-powered Personal Productivity & Adaptive Planning Assistant

Momentum AI is a state-of-the-art cognitive productivity platform that transforms task management from a passive storage database into a proactive planning pipeline. By dynamically evaluating deadlines, relative task dependencies, and daily work/sleep hour boundaries, the platform programmatically maps daily tasks into optimized focus time blocks, identifies behavioral bottlenecks, and generates contextual coaching advice.

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18.0+-339933?style=flat-square&logo=node.js)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=flat-square&logo=express)](https://expressjs.com/)
[![Firebase](https://img.shields.io/badge/Firebase-12.0+-FFCA28?style=flat-square&logo=firebase)](https://firebase.google.com/)
[![Groq](https://img.shields.io/badge/Groq-Llama_3.3_70B-orange?style=flat-square)](https://groq.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=flat-square&logo=vite)](https://vite.dev/)

---

## Project Assets
- **[🎥 Demo Video Placeholder]**
- **[📊 Presentation Deck Placeholder]**
- **[🌐 Live Demo Platform Placeholder]**

---

## 1. Problem Statement

### Why Productivity Apps Fail
Traditional task managers (to-do lists, calendars, and kanban boards) are passive record-keeping tools. They rely entirely on the user to schedule their day, organize task sequences, and estimate durations. When things go wrong, the user must manually re-plan everything, resulting in high cognitive friction, decision fatigue, and eventual planner abandonment.

### Why Static Planners Fail
1. **Zero Adaptation**: They cannot adapt dynamically to real-world interruptions, delayed work, or new urgent tasks.
2. **Cognitive Overhead**: The scheduling process itself takes valuable time away from execution.
3. **No Closed-Loop Learning**: Conventional apps do not track why a task was skipped, when you are most productive, or what blockers continuously stall your work.

### The Momentum AI Approach
Momentum AI resolves these issues by handling the prioritization and scheduling logic programmatically. When workload disruptions or missed tasks are detected, the system triggers **Adaptive Replanning** to re-optimize schedules instantly, keeping you in your productivity flow.

---

## 2. The Solution

Momentum AI utilizes a multi-engine **Cognitive Planning Pipeline** that evaluates user tasks, preferences, and performance history to deliver an optimized, distraction-free work schedule.

```text
  [Context Builder] ──► [Reasoning] ──► [Decision] ──► [Planning] ──► [Reflection] ──► [Coaching] ──► [Memory]
```

- **Reasoning Engine**: Performs semantic checking of task requirements and constraints.
- **Decision Engine**: Prioritizes tasks (1-100 score) using deadline urgency and dependency trees.
- **Planning Engine**: Organizes tasks into structured time blocks within your sleep/wake constraints.
- **Reflection Engine**: Reviews task outcomes, identifies productivity blockers, and maps trends.
- **Coaching Engine**: Renders contextual, positive, and action-oriented daily advice cards.
- **Memory Engine**: Persists schedule snapshots and observation insights in Cloud Firestore to continuously personalize future recommendations.

---

## 3. Key Features

### 📅 AI Planner Timeline
Automatically creates a chronological, color-coded sequence of task blocks fitting your waking hours. Includes a clean view of estimated task durations and custom recommendations.

### 🔄 Adaptive Replanning Triggers
Monitors plan consistency. If an urgent task is added, a deadline is moved, or a task block is missed, the UI alerts the user and lets them regenerate their plan instantly with one click.

### 📊 Productivity Analytics
Visualizes your performance with responsive metrics:
- Overall Task Completion Rate (%).
- Overdue Task Count.
- Peak Productivity Work Windows (computed from historical memory).
- Weekly Task Completion Trends (Interactive Bar Chart).

### 📝 End-of-Day Reflections
Let's you check off completed tasks, rate your focus level, catalog productivity blockers (e.g., social media, fatigue, technical issues), and save qualitative insights directly to your memory profile.

### ⚙️ Customizable Settings
Configure your profile name, email, morning wake-up hours, and evening sleep times to set strict boundaries for AI planning blocks.

---

## 4. System Architecture

The following diagram illustrates the relationship between the React Frontend, authentication middleware, Express API controllers, the internal Brain Orchestrator pipeline, and external APIs (Firebase & Groq):

```mermaid
graph TD
    subgraph Frontend Client
        React["React Application (SPA)"]
        QueryClient["TanStack React Query"]
    end

    subgraph Authentication
        FirebaseAuth["Firebase Authentication (Bearer Token)"]
    end

    subgraph Express Backend
        API["Express.js Server API"]
        Middleware["Auth Middleware"]
        Controller["AI Controller"]
    end

    subgraph Brain Orchestrator Pipeline
        Orchestrator["Brain Orchestrator"]
        Context["Context Builder"]
        Reasoning["Reasoning Engine"]
        Decision["Decision Engine"]
        Planning["Planning Engine"]
        Reflection["Reflection Engine"]
        Coaching["Coaching Engine"]
        Memory["Memory Engine"]
    end

    subgraph Data & Inference Providers
        LLM["Gemini SDK / Groq Cloud SDK"]
        Firestore["Cloud Firestore Database"]
    end

    React -->|HTTP Requests + Bearer Token| API
    API --> Middleware
    Middleware -->|Verify ID Token| FirebaseAuth
    API --> Controller
    Controller --> Orchestrator
    Orchestrator --> Context
    Context -->|Read Profile, Tasks & Memory| Firestore
    Orchestrator --> Reasoning
    Reasoning -->|Chat Completion JSON| LLM
    Orchestrator --> Decision
    Orchestrator --> Planning
    Planning -->|Chat Completion JSON| LLM
    Orchestrator --> Reflection
    Reflection -->|Chat Completion JSON| LLM
    Orchestrator --> Coaching
    Coaching -->|Chat Completion JSON| LLM
    Orchestrator --> Memory
    Memory -->|Write Schedules & Insights| Firestore
```

---

## 5. User Journey Flowchart

Here is the operational path a user takes from signup/login through planning execution and reflective feedback loops:

```mermaid
graph TD
    Start([User Starts]) --> Auth{Logged In?}
    Auth -->|No| Login[Authenticate via Google OAuth / Email]
    Auth -->|Yes| Dashboard[Access Dashboard]
    Login --> Dashboard
    Dashboard --> CreateTask[Create / Manage Tasks]
    CreateTask --> StoreTask[(Save Task in Firestore)]
    StoreTask --> Dashboard
    Dashboard --> ClickOptimize[Click 'Optimize Plan']
    ClickOptimize --> TriggerBrain[Trigger Brain Orchestration Pipeline]
    TriggerBrain --> ViewPlanner[View Daily Planner Timeline]
    ViewPlanner --> CompleteTasks[Complete Tasks / Log Reflections]
    CompleteTasks --> SubmitReflection[Submit Daily Reflection]
    SubmitReflection --> AnalyzeReflection[Reflection Engine Updates Memory]
    AnalyzeReflection --> UpdateInsights[(Save Insights in Memory)]
    UpdateInsights --> NextDay[Prepare Next Day Optimized Planning]
```

---

## 6. Brain Pipeline Architecture

The sequential engines run in strict order. Data validation and JSON schemas check the output of each engine, halting execution if errors occur:

```mermaid
graph LR
    subgraph Input
        CB[Context Builder]
    end
    subgraph Evaluation
        RE[Reasoning Engine]
        DE[Decision Engine]
    end
    subgraph Generation
        PE[Planning Engine]
    end
    subgraph Optimization
        RFE[Reflection Engine]
        CE[Coaching Engine]
    end
    subgraph Feedback Loop
        ME[Memory Engine]
    end

    CB -->|Build context| RE
    RE -->|Workload evaluation| DE
    DE -->|Task priority & status scoring| PE
    PE -->|Optimized time blocks schedule| RFE
    RFE -->|Feasibility checks & observations| CE
    CE -->|Encouraging daily coaching messages| ME
    ME -->|Persist schedules & learning trends| Firestore[(Cloud Firestore)]
```

- **Context Builder**: Normalizes tasks, profile, and memory into a single structured schema.
- **Reasoning**: Analyzes task complexity and potential scheduling conflicts.
- **Decision**: Programmatically calculates priority ratings and handles task dependencies.
- **Planning**: Generates start/end times for daily task blocks.
- **Reflection**: Identifies performance leaks, skipped tasks, and blockers.
- **Coaching**: Produces encouraging, positive daily focus guidelines.
- **Memory**: Merges metrics and saves schedule histories.

---

## 7. Backend Module Dependency Diagram

The architectural diagram below highlights the structural hierarchy of backend layers and configs:

```mermaid
graph TD
    Server[server.js] --> App[app.js]
    App --> Routes[API Routes]
    Routes --> AuthMiddleware[Auth Middleware]
    AuthMiddleware --> FirebaseAuth[Firebase Auth SDK]
    Routes --> AIController[AI Controller]
    AIController --> ContextBuilder[Context Builder]
    AIController --> Orchestrator[Brain Orchestrator]
    Orchestrator --> ReasoningEngine[Reasoning Engine]
    Orchestrator --> DecisionEngine[Decision Engine]
    Orchestrator --> PlanningEngine[Planning Engine]
    Orchestrator --> ReflectionEngine[Reflection Engine]
    Orchestrator --> CoachingEngine[Coaching Engine]
    Orchestrator --> MemoryEngine[Memory Engine]
    
    Engines[AI Engines] --> LLMService[LLM Service]
    LLMService --> LLMSDKs[Gemini / Groq SDK Clients]
    
    ContextBuilder --> FirebaseConfig[Firebase Admin Config]
    MemoryEngine --> FirebaseConfig
    FirebaseConfig --> Firestore[(Cloud Firestore)]
```

---

## 8. Frontend Component Architecture

The visual below maps page layers, data-fetching hooks, API service wrappers, and Axios clients:

```mermaid
graph TD
    subgraph UI Pages
        App[App.tsx]
        DashboardPage[DashboardPage.tsx]
        PlannerPage[PlannerPage.tsx]
        AnalyticsPage[AnalyticsPage.tsx]
        ReflectionPage[ReflectionPage.tsx]
        SettingsPage[SettingsPage.tsx]
    end

    subgraph State & Queries
        useAi[useAi.ts Hooks]
        useTasks[useTasks.ts Hooks]
        useAuth[useAuth.ts Context]
    end

    subgraph API Service Layer
        AiService[ai.service.ts]
        TasksService[tasks.service.ts]
        AuthService[auth.service.ts]
        ApiClient[api.ts Axios Instance]
    end

    App --> DashboardPage
    App --> PlannerPage
    App --> AnalyticsPage
    App --> ReflectionPage
    App --> SettingsPage

    DashboardPage --> useAi
    PlannerPage --> useAi
    AnalyticsPage --> useAi
    ReflectionPage --> useAi
    SettingsPage --> useAuth
    
    useAi --> AiService
    useTasks --> TasksService
    useAuth --> AuthService
    
    AiService --> ApiClient
    TasksService --> ApiClient
    AuthService --> ApiClient
    
    ApiClient --> Backend["Backend REST API"]
```

---

## 9. Database Entity-Relationship Diagram

Momentum AI is powered by Cloud Firestore's document-model collection layout:

```mermaid
erDiagram
    USERS {
        string uid PK
        string email
        string name
        string wakeUpTime
        string sleepTime
        timestamp createdAt
    }
    TASKS {
        string id PK
        string userId FK
        string title
        string description
        string category
        string urgency
        string dependencyTaskId
        int estimatedDurationMinutes
        string status
        timestamp dueDate
        timestamp createdAt
    }
    SCHEDULES {
        string docId PK "Format: userId_YYYY-MM-DD"
        string userId FK
        string date
        array taskBlocks
        int totalHours
        string aiSummary
        object fullPlan "Complete snap of planning run"
        timestamp createdAt
    }
    REFLECTIONS {
        string id PK
        string userId FK
        int productivityRating
        array completedTasks
        array blockers
        string notes
        timestamp createdAt
    }
    INSIGHTS {
        string userId PK
        string preferredWorkWindow
        int averageCompletionRate
        array commonBlockers
        array recommendationHistory
        array reflectionSummaries
        timestamp lastUpdatedAt
    }

    USERS ||--o{ TASKS : owns
    USERS ||--o{ SCHEDULES : schedules
    USERS ||--o{ REFLECTIONS : logs
    USERS ||--|| INSIGHTS : owns
```

---

## 10. API Specification

| Method | Endpoint | Purpose | Authentication |
| :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | Creates a new user profile document in Firestore. | No |
| **POST** | `/auth/login` | Validates user session parameters. | No |
| **PUT** | `/auth/profile` | Updates user settings (wake-up time, sleep time). | Yes (Bearer Token) |
| **GET** | `/tasks` | Retrieves all active and completed tasks for the authenticated user. | Yes (Bearer Token) |
| **POST** | `/tasks` | Creates a new task. | Yes (Bearer Token) |
| **PUT** | `/tasks/:id` | Modifies an existing task's attributes or status. | Yes (Bearer Token) |
| **DELETE**| `/tasks/:id` | Deletes a task. | Yes (Bearer Token) |
| **POST** | `/ai/plan` | Runs the planning pipeline and generates today's schedule. | Yes (Bearer Token) |
| **GET** | `/ai/plan/today` | Retrieves today's persisted schedule plan if one exists. | Yes (Bearer Token) |
| **POST** | `/ai/replan` | Runs the adaptive replanning flow. | Yes (Bearer Token) |
| **POST** | `/ai/reflection` | Submits daily reflection logs and updates memory. | Yes (Bearer Token) |
| **GET** | `/ai/insights` | Computes user-wide analytics metrics. | Yes (Bearer Token) |

---

## 11. AI Planning Request Lifecycle

The diagram below shows the sequence of events from clicking "Optimize Plan" to rendering the completed schedule:

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Frontend as Frontend (Vite)
    participant Backend as Backend API (Express)
    participant Orchestrator as Brain Orchestrator
    participant LLM as LLM Provider (Gemini/Groq)
    participant Firestore as Firestore DB

    User->>Frontend: Click "Optimize Plan"
    Frontend->>Backend: POST /ai/plan (Bearer Token)
    Backend->>Backend: Auth Middleware verifies token
    Backend->>Orchestrator: executePipeline(userId)
    Orchestrator->>Firestore: Fetch User Profile, Tasks, and Memory Insights
    Firestore-->>Orchestrator: Context Data
    Orchestrator->>LLM: Generate Reasoning (extractedTasks, risks, capacity)
    LLM-->>Orchestrator: Reasoning JSON Response
    Orchestrator->>Orchestrator: Decision Engine calculates scores & status mapping
    Orchestrator->>LLM: Generate Planning Schedule (wake/sleep boundaries)
    LLM-->>Orchestrator: Planning JSON Response
    Orchestrator->>LLM: Generate Reflection constraints & bottlenecks
    LLM-->>Orchestrator: Reflection JSON Response
    Orchestrator->>LLM: Generate Coaching messages & tips
    LLM-->>Orchestrator: Coaching JSON Response
    Orchestrator->>Firestore: Persist Schedule & update Memory insights
    Firestore-->>Orchestrator: Confirmation
    Orchestrator-->>Backend: Consolidated plan payload
    Backend-->>Frontend: 200 OK (BrainPlanResponse)
    Frontend-->>User: Render Timeline & Coaching Cards
```

---

## 12. Repository Structure

```text
Momentum-AI/
├── backend/
│   ├── src/
│   │   ├── brain/
│   │   │   ├── context/          # Context-builder logic
│   │   │   ├── modules/          # Core engines (Reasoning, Planning, etc.)
│   │   │   ├── prompts/          # String template files for Groq prompts
│   │   │   ├── schemas/          # Struct validators and default schema constructs
│   │   │   └── orchestrator/     # Pipeline orchestrator & step validation errors
│   │   ├── config/               # Firebase & Groq connection clients
│   │   ├── controllers/          # AI routes, authentication routes, task routes controllers
│   │   ├── middleware/           # Auth Bearer Token token validators
│   │   ├── routes/               # API Router maps
│   │   ├── services/             # Analytics metrics & reflection observers services
│   │   └── app.js                # Express app framework initialization
│   ├── server.js                 # Local server execution port listener
│   └── package.json
├── docs/
│   └── assets/                   # Screenshots & images folder
├── frontend/
│   ├── src/
│   │   ├── components/           # Tasks, forms, timeline cards, charts
│   │   ├── config/               # Firebase Client SDK initialize hooks
│   │   ├── constants/            # Routing path declarations
│   │   ├── contexts/             # Auth provider contexts
│   │   ├── hooks/                # Custom React hooks (React Query integrations)
│   │   ├── layouts/              # Main structure with Sidebar
│   │   ├── pages/                # Pages (Planner, Analytics, Reflection, Settings)
│   │   ├── services/             # Axios request definitions
│   │   ├── types/                # Typescript interfaces
│   │   ├── main.tsx              # Mounting index
│   │   └── index.css             # Main styling index
│   ├── vite.config.ts
│   └── package.json
└── README.md
```

---

## 13. Installation & Run Guide

### Prerequisites
1. [Node.js](https://nodejs.org/) (v18 or higher recommended).
2. A [Firebase Project](https://console.firebase.google.com/) with:
   - Authentication (Email/Password & Google Sign-In enabled).
   - Cloud Firestore Database in Native Mode.
3. A Google AI Studio Gemini API Key (or Groq API Key as a fallback).

---

### Step 1: Firebase Project Configuration
Create a file named `serviceAccountKey.json` inside the `backend` directory. Locate this by visiting:
* **Firebase Console** -> **Project Settings** -> **Service accounts** -> **Generate new private key**.

Download the key and paste its contents into `backend/serviceAccountKey.json`.

---

### Step 2: Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
4. Update the environment variables:
   ```env
   PORT=5000
   FIREBASE_PROJECT_ID=your-firebase-project-id
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   LLM_PROVIDER=gemini
   GEMINI_API_KEY=your-gemini-api-key
   GROQ_API_KEY=your-groq-api-key
   ```
5. Run the dev server:
   ```bash
   npm run dev
   ```
   The backend should log:
   ```text
   Firebase Admin initialized successfully.
   Firestore connection initialized successfully.
   Gemini SDK initialized successfully.
   Groq SDK initialized successfully.
   Active LLM Provider: Gemini
   Server is running on port 5000
   ```

---

### Step 3: Frontend Setup
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file inside the `frontend` root:
   ```bash
   touch .env
   ```
4. Configure the environment variables using your Firebase Web client details:
   ```env
   VITE_API_URL=http://localhost:5000
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```
5. Run the Vite development server:
   ```bash
   npm run dev
   ```
6. Open your browser and navigate to the URL provided by Vite (typically `http://localhost:5173`).

---

## 14. Screenshots

| Section | Visual |
| :--- | :--- |
| **Dashboard** | ![Dashboard Overview](docs/assets/dashboard.png) |
| **AI Planner** | ![AI Planner Timeline](docs/assets/planner.png) |
| **Analytics** | ![Productivity Analytics](docs/assets/analytics.png) |
| **Daily Reflection** | ![Reflection check-in](docs/assets/reflection.png) |
| **Settings** | ![Settings hours config](docs/assets/settings.png) |

---

## 15. Performance & Reliability

### Authentication Security
Requests sent to backend AI, task, and analytics routes are verified by the `auth.middleware.js` using Firebase Authentication. If a token is missing, invalid, or expired, the backend returns a `401 Unauthorized` response.

### Plan Persistence
Schedules generated by the Brain Orchestrator are saved to the `schedules` collection in Firestore with a unique document ID format (`${userId}_${todayDateStr}`). When the page is reloaded, the app retrieves the existing schedule, ensuring it survives page refreshes.

### Fault Tolerance & Fallback Schemas
If the Groq API fails or rate limits (`429`) occur during pipeline execution, the system uses fallback schemas (implemented in `backend/src/brain/schemas/`) for the planning, reasoning, reflection, and coaching stages. This prevents backend crashes, keeps validation rules intact, and returns a usable default schedule.

### Normalization
The `getTodayPlan` endpoint in the AI controller automatically normalizes documents before sending them to the client. If properties are missing from earlier schemas, it populates empty arrays and valid properties, preventing frontend runtime errors.

---

## 16. Future Roadmap

- **Automatic Event Import**: Sync tasks and schedules automatically with Google Calendar and Microsoft Outlook.
- **Built-in Pomodoro Mode**: Log actual study and work intervals directly into reflections using a built-in focus timer.
- **Auto-Replanning**: Trigger schedule re-optimizations in the background when task deadlines are shifted, without requiring manual user input.
- **Interactive Graphs**: Provide monthly and custom-range comparative task completion reports.

---

## 17. Development Process

Momentum AI was built using a modular, test-driven approach:
1. **Engine Segregation**: The pipeline is split into distinct engines, each with its own role (reasoning, decisions, planning, reflection, coaching, memory).
2. **Schema Validation**: Each pipeline step is validated to prevent malformed data from propagating down the system.
3. **Groq SDK Migration**: Migrated the AI service layer from Google Gemini to the Groq Cloud SDK using Llama 3.3 70B for fast JSON completions.
4. **Reliability Tuning**: Integrated client-side loading spinners and backend data normalization to handle page refreshes cleanly.

---

## 18. Acknowledgements

The following tools and platforms were used during the development of Momentum AI:
- **Antigravity IDE** – AI-assisted development environment.
- **Claude (Opus / Sonnet)** – Assisted with code generation, review, and refactoring during development.
- **Google Gemini (Flash Pro)** – Assisted with design discussions, planning, and documentation during development.
- **Groq Cloud** – Inference provider for the deployed AI pipeline.
- **Firebase** – Authentication and database infrastructure.
- **React, Express, Tailwind CSS, Vite, Node.js** – Application framework ecosystem.

---

## 19. Team
- **[Nitish Sahu](https://github.com/Nitish-0710)** – Full Stack Engineer & Brain Pipeline Architect

---

## 20. License
This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
