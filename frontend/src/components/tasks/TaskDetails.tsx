import { useState } from 'react'
import type { Task, UpdateTaskPayload } from '@/types/task.types'
import { useUpdateTask, useDeleteTask } from '@/hooks/useTasks'
import TaskForm from './TaskForm'

interface TaskDetailsProps {
  task: Task
  onClose: () => void
  onDelete: (id: string) => void
}

const CATEGORY_LABEL: Record<string, string> = {
  assignment: 'Assignment', exam: 'Exam', project: 'Project',
  meeting: 'Meeting', personal: 'Personal', other: 'Other',
}

const STATUS_LABEL: Record<string, string> = {
  pending: 'Pending', 'in-progress': 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled',
}

export default function TaskDetails({ task, onClose, onDelete }: TaskDetailsProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const updateTask = useUpdateTask()
  const deleteTask = useDeleteTask()

  const handleUpdate = (payload: UpdateTaskPayload) => {
    updateTask.mutate(
      { id: task.id, payload },
      { onSuccess: () => setIsEditing(false) },
    )
  }

  const handleDelete = () => {
    setDeleteError(null)
    deleteTask.mutate(task.id, {
      onSuccess: () => onDelete(task.id),
      onError: (err) => setDeleteError(err instanceof Error ? err.message : 'Delete failed.'),
    })
  }

  return (
    <div
      className="rounded-2xl overflow-hidden h-fit sticky top-0"
      style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <span className="text-sm font-semibold text-white">
          {isEditing ? 'Edit Task' : 'Task Details'}
        </span>
        <button
          id="btn-task-detail-close"
          onClick={onClose}
          className="p-1 rounded-lg transition-colors hover:bg-white/10"
          style={{ color: 'var(--color-text-muted)' }}
          aria-label="Close"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="p-4">
        {isEditing ? (
          <TaskForm
            initialValues={task}
            mode="edit"
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            submitting={updateTask.isPending}
            error={updateTask.isError ? (updateTask.error instanceof Error ? updateTask.error.message : 'Update failed.') : null}
          />
        ) : (
          <div className="space-y-4">
            {/* Title */}
            <div>
              <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Title</p>
              <p className="text-sm font-semibold text-white leading-snug">{task.title}</p>
            </div>

            {/* Description */}
            {task.description && (
              <div>
                <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>Description</p>
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>{task.description}</p>
              </div>
            )}

            {/* Meta grid */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Status', value: STATUS_LABEL[task.status] ?? task.status },
                { label: 'Category', value: CATEGORY_LABEL[task.category] ?? task.category },
                {
                  label: 'Deadline',
                  value: task.deadline
                    ? new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                    : '—',
                },
                { label: 'Est. Hours', value: task.estimatedHours != null ? `${task.estimatedHours}h` : '—' },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
                  <p className="text-sm text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Timestamps */}
            <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '12px' }}>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Created {new Date(task.createdAt).toLocaleDateString()}
              </p>
            </div>

            {/* Error */}
            {deleteError && (
              <p className="text-xs" style={{ color: '#f87171' }}>{deleteError}</p>
            )}

            {/* Actions */}
            <div className="flex gap-2">
              <button
                id={`btn-task-edit-${task.id}`}
                onClick={() => setIsEditing(true)}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80"
                style={{
                  backgroundColor: 'var(--color-surface-2)',
                  border: '1px solid var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                Edit
              </button>
              <button
                id={`btn-task-delete-confirm-${task.id}`}
                onClick={handleDelete}
                disabled={deleteTask.isPending}
                className="flex-1 py-2 rounded-xl text-sm font-medium transition-all hover:opacity-80 disabled:opacity-50"
                style={{
                  backgroundColor: 'rgba(239,68,68,0.1)',
                  border: '1px solid rgba(239,68,68,0.3)',
                  color: '#f87171',
                }}
              >
                {deleteTask.isPending ? 'Deleting…' : 'Delete'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
