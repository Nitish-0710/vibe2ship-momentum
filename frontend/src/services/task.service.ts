import api from './api'
import type { Task, CreateTaskPayload, UpdateTaskPayload } from '@/types/task.types'

/**
 * Task API service.
 * All calls attach the Firebase ID token automatically via the Axios interceptor.
 */

export async function fetchTasks(): Promise<Task[]> {
  const res = await api.get<{ success: boolean; data: Task[] }>('/tasks')
  return res.data.data
}

export async function fetchTaskById(id: string): Promise<Task> {
  const res = await api.get<{ success: boolean; data: Task }>(`/tasks/${id}`)
  return res.data.data
}

export async function createTaskApi(payload: CreateTaskPayload): Promise<Task> {
  const res = await api.post<{ success: boolean; data: Task }>('/tasks', payload)
  return res.data.data
}

export async function updateTaskApi(id: string, payload: UpdateTaskPayload): Promise<Task> {
  const res = await api.put<{ success: boolean; data: Task }>(`/tasks/${id}`, payload)
  return res.data.data
}

export async function deleteTaskApi(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`)
}
