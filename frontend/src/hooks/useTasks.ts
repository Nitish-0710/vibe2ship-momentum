import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  fetchTasks,
  fetchTaskById,
  createTaskApi,
  updateTaskApi,
  deleteTaskApi,
} from '@/services/task.service'
import type { CreateTaskPayload, UpdateTaskPayload } from '@/types/task.types'

/** Query key factory — keeps cache keys consistent across all hooks. */
export const taskKeys = {
  all: ['tasks'] as const,
  detail: (id: string) => ['tasks', id] as const,
}

/** Fetch all tasks for the authenticated user. */
export function useTasks() {
  return useQuery({
    queryKey: taskKeys.all,
    queryFn: fetchTasks,
  })
}

/** Fetch a single task by ID. */
export function useTask(id: string) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => fetchTaskById(id),
    enabled: !!id,
  })
}

/** Create task — invalidates the task list on success. */
export function useCreateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateTaskPayload) => createTaskApi(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  })
}

/** Update task — invalidates both list and detail on success. */
export function useUpdateTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      updateTaskApi(id, payload),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: taskKeys.all })
      qc.invalidateQueries({ queryKey: taskKeys.detail(id) })
    },
  })
}

/** Delete task — invalidates the task list on success. */
export function useDeleteTask() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteTaskApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: taskKeys.all }),
  })
}
