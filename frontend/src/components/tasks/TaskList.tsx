import { useState } from 'react'
import type { Task, TaskStatus } from '@/types/task.types'
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import TaskCard from './TaskCard'
import TaskDetails from './TaskDetails'
import EmptyState from '@/components/common/EmptyState'
import ErrorState from '@/components/common/ErrorState'

interface TaskListProps {
  tasks: Task[]
  isLoading: boolean
  isError: boolean
  errorMessage?: string
  onRetry: () => void
  onAddTask: () => void
}

export default function TaskList({
  tasks,
  isLoading,
  isError,
  errorMessage,
  onRetry,
  onAddTask,
}: TaskListProps) {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const handleStatusChange = (id: string, status: TaskStatus) => {
    updateTask.mutate({ id, payload: { status } })
  }

  const handleDelete = (id: string) => {
    deleteTask.mutate(id)
    if (selectedTask?.id === id) setSelectedTask(null)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading tasks…</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return <ErrorState message={errorMessage || 'Failed to load tasks.'} onRetry={onRetry} />
  }

  if (tasks.length === 0) {
    return (
      <EmptyState
        title="No tasks yet"
        description="Create your first task to start building momentum."
        action={
          <button
            id="btn-empty-add-task"
            onClick={onAddTask}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02]"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', boxShadow: '0 2px 12px rgba(108,99,255,0.3)' }}
          >
            + Add your first task
          </button>
        }
      />
    )
  }

  return (
    <div className="flex gap-6 h-full">
      {/* Task list column */}
      <div className="flex-1 min-w-0 space-y-2">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={setSelectedTask}
            onStatusChange={handleStatusChange}
            onDelete={handleDelete}
          />
        ))}
      </div>

      {/* Task detail panel */}
      {selectedTask && (
        <div className="w-80 shrink-0">
          <TaskDetails
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onDelete={handleDelete}
          />
        </div>
      )}
    </div>
  )
}
