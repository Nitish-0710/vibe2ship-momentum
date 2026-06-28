import api from './api'
import type { BrainPlanResponse, UserAnalyticsResponse } from '@/types/ai.types'

/**
 * AI Service.
 * Communication with the backend AI endpoints.
 */

/**
 * Requests the backend to execute the full Momentum Brain planning pipeline.
 */
export async function generateAiPlan(userMessage?: string): Promise<BrainPlanResponse> {
  const response = await api.post<{ success: boolean; data: BrainPlanResponse }>('/ai/plan', {
    requestType: 'plan',
    userMessage,
  })
  return response.data.data
}

/**
 * Requests the backend to execute adaptive replanning based on workload triggers.
 */
export async function generateAiReplan(userMessage?: string): Promise<{
  triggerDetected: boolean
  triggerReasons: string[]
  data: BrainPlanResponse
}> {
  const response = await api.post<{
    success: boolean
    triggerDetected: boolean
    triggerReasons: string[]
    data: BrainPlanResponse
  }>('/ai/replan', { userMessage })
  return response.data
}

/**
 * Submits the daily reflection logs and retrieves reflection summary insights.
 */
export async function submitDailyReflection(payload: {
  productivityRating: number
  completedTasks: string[]
  blockers: string[]
  notes: string
}): Promise<{
  reflectionSummary: string
  insights: any[]
  recommendations: any[]
  confidence: number
}> {
  const response = await api.post<{ success: boolean; data: any }>('/ai/reflection', payload)
  return response.data.data
}

/**
 * Fetches user-wide productivity analytics metrics.
 */
export async function fetchUserAnalytics(): Promise<UserAnalyticsResponse> {
  const response = await api.get<{ success: boolean; data: UserAnalyticsResponse }>('/ai/insights')
  return response.data.data
}
