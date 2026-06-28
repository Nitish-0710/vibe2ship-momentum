import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { generateAiPlan } from '@/services/ai.service'
import type { BrainPlanResponse } from '@/types/ai.types'

/**
 * Hook to retrieve the current cached AI plan.
 * Returns null if no plan has been generated in the current session.
 */
export function useAiPlan() {
  return useQuery<BrainPlanResponse | null>({
    queryKey: ['aiPlan'],
    queryFn: () => null, // Serves as local cache state container
    staleTime: Infinity,
    initialData: null,
  })
}

/**
 * Mutation hook to execute the AI planning pipeline.
 * Automatically updates ['aiPlan'] cache and invalidates task lists to reflect any priority updates.
 */
export function useGeneratePlan() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (userMessage?: string) => generateAiPlan(userMessage),
    onSuccess: (data) => {
      // Update local AI plan cache
      queryClient.setQueryData(['aiPlan'], data)
      // Invalidate task queries so list reads are refreshed with correct priorityScores
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
    },
  })
}
