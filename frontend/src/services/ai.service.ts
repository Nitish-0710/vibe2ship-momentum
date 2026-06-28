import api from './api'
import type { BrainPlanResponse } from '@/types/ai.types'

/**
 * AI Service.
 * Communication with the backend AI endpoints.
 */

/**
 * Requests the backend to execute the full Momentum Brain planning pipeline.
 *
 * @param {string} [userMessage] - Optional natural language input (e.g. from chatbot/planner)
 * @returns {Promise<BrainPlanResponse>} The generated structured execution plan
 */
export async function generateAiPlan(userMessage?: string): Promise<BrainPlanResponse> {
  const response = await api.post<{ success: boolean; data: BrainPlanResponse }>('/ai/plan', {
    requestType: 'plan',
    userMessage,
  })
  return response.data.data
}
