/**
 * TypeScript types for the task domain.
 * Matches the Firestore document structure defined in TDD.
 */

export type TaskStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled'
export type TaskCategory = 'assignment' | 'exam' | 'project' | 'meeting' | 'personal' | 'other'

export interface Task {
  id: string
  userId: string
  title: string
  description: string
  category: TaskCategory
  deadline: string | null
  estimatedHours: number | null
  priorityScore: number | null
  status: TaskStatus
  createdAt: string
  updatedAt: string
}

export interface CreateTaskPayload {
  title: string
  description?: string
  category?: TaskCategory
  deadline?: string | null
  estimatedHours?: number | null
  status?: TaskStatus
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  category?: TaskCategory
  deadline?: string | null
  estimatedHours?: number | null
  status?: TaskStatus
}
