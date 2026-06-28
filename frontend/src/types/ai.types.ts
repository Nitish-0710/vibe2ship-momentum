
export interface TaskBlock {
  taskId: string
  title: string
  startTime: string
  endTime: string
  durationHours: number
  explanation: string
}

export interface DailySchedule {
  date: string
  taskBlocks: TaskBlock[]
  totalHours: number
}

export interface AiRecommendation {
  type: 'priority' | 'schedule' | 'risk' | 'coaching'
  message: string
  taskId?: string
}

export interface ExtractedTask {
  id: string
  title: string
  deadline: string | null
  estimatedHours: number | null
  urgency: 'critical' | 'high' | 'medium' | 'low'
  importance: 'critical' | 'high' | 'medium' | 'low'
  dependencies: string[]
  explanation: string
}

export interface DetectedRisk {
  type: 'deadline' | 'capacity' | 'dependency' | 'overload'
  severity: 'high' | 'medium' | 'low'
  description: string
  affectedTaskIds: string[]
}

export interface PriorityOrderItem {
  taskId: string
  title: string
  priorityScore: number
  explanation: string
}

export interface FocusRecommendationItem {
  taskId: string
  title: string
  reason: string
}

export interface DeferredTaskItem {
  taskId: string
  title: string
  reason: string
}

export interface BlockedTaskItem {
  taskId: string
  title: string
  blockedBy: string[]
  reason: string
}

export interface ReflectionInsight {
  type: 'pattern' | 'blocker' | 'improvement' | 'strength'
  description: string
  confidence: number
}

export interface ReflectionPlanningAdjustment {
  field: string
  suggestion: string
  reason: string
}

export interface CoachingMessage {
  type: 'guidance' | 'recovery' | 'progress' | 'priority' | 'encouragement' | 'risk'
  message: string
  taskId: string
  priority: 'high' | 'medium' | 'low'
}

export interface BrainPlanResponse {
  planningResult: {
    status: 'success' | 'partial' | 'failed'
    message: string
  }
  taskPriorities: PriorityOrderItem[]
  schedule: DailySchedule[]
  recommendations: AiRecommendation[]
  confidence: number
  summary: string
  reasoning: {
    extractedTasks: ExtractedTask[]
    detectedRisks: DetectedRisk[]
    estimatedWorkload: number
    summary: string
    confidence: number
  }
  decisions: {
    priorityOrdering: PriorityOrderItem[]
    urgencyAssessment: Record<string, 'critical' | 'high' | 'medium' | 'low'>
    focusRecommendations: FocusRecommendationItem[]
    deferredTasks: DeferredTaskItem[]
    blockedTasks: BlockedTaskItem[]
    confidence: number
    summary: string
  }
  reflection: {
    reflectionSummary: string
    insights: ReflectionInsight[]
    recommendations: { type: string; message: string }[]
    planningAdjustments: ReflectionPlanningAdjustment[]
    confidence: number
  }
  coaching: {
    coachingMessages: CoachingMessage[]
    dailySummary: string
    confidence: number
  }
  pipelineDurationMs: number
}

export interface WeeklyTrendItem {
  day: string
  count: number
}

export interface UserAnalyticsResponse {
  completionRate: number
  estimatedHours: number
  actualHoursCompleted: number
  overdueTasksCount: number
  focusConsistencyScore: number
  preferredWorkWindow: string
  recurringBlockers: string[]
  weeklyCompletionTrend: WeeklyTrendItem[]
  reflectionSummary: string
}
