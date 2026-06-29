import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  generateAiPlan,
  fetchTodayPlan,
  generateAiReplan,
  submitDailyReflection,
  fetchUserAnalytics,
} from '@/services/ai.service'
import type { BrainPlanResponse, UserAnalyticsResponse } from '@/types/ai.types'

/**
 * Hook to retrieve today's saved AI plan.
 * Fetches from backend if not already cached.
 */
export function useAiPlan() {
  return useQuery<BrainPlanResponse | null>({
    queryKey: ['aiPlan'],
    queryFn: () => fetchTodayPlan(),
    staleTime: 5 * 60 * 1000, // 5 minutes cache
  })
}

/**
 * Mutation hook to execute the AI planning pipeline.
 */
export function useGeneratePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userMessage?: string) => generateAiPlan(userMessage),
    onSuccess: (data) => {
      queryClient.setQueryData(['aiPlan'], data)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['userAnalytics'] })
    },
  })
}

/**
 * Mutation hook to run adaptive replanning.
 */
export function useGenerateReplan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userMessage?: string) => generateAiReplan(userMessage),
    onSuccess: (res) => {
      queryClient.setQueryData(['aiPlan'], res.data)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['userAnalytics'] })
    },
  })
}

/**
 * Mutation hook to submit user daily reflections.
 */
export function useSubmitReflection() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: {
      productivityRating: number
      completedTasks: string[]
      blockers: string[]
      notes: string
    }) => submitDailyReflection(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userAnalytics'] })
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}

/**
 * Query hook to fetch calculated productivity insights analytics.
 */
export function useUserAnalytics() {
  return useQuery<UserAnalyticsResponse>({
    queryKey: ['userAnalytics'],
    queryFn: fetchUserAnalytics,
  })
}
