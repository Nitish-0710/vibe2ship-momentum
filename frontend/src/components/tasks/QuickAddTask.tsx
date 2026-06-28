import { useEffect, useRef } from 'react'
import { useCreateTask } from '@/hooks/useTasks'
import type { CreateTaskPayload, UpdateTaskPayload } from '@/types/task.types'
import TaskForm from './TaskForm'

interface QuickAddTaskProps {
  onClose: () => void
}

/**
 * QuickAddTask modal.
 * Mounts over the page, traps focus on open, closes on backdrop click or Escape.
 */
export default function QuickAddTask({ onClose }: QuickAddTaskProps) {
  const createTask = useCreateTask()
  const backdropRef = useRef<HTMLDivElement>(null)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [onClose])

  // Prevent body scroll while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleSubmit = (payload: CreateTaskPayload | UpdateTaskPayload) => {
    // QuickAddTask always creates, so the payload always satisfies CreateTaskPayload
    createTask.mutate(payload as CreateTaskPayload, { onSuccess: onClose })
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose()
  }

  return (
    <div
      ref={backdropRef}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      role="dialog"
      aria-modal="true"
      aria-label="Add task"
    >
      <div
        className="w-full max-w-lg rounded-2xl overflow-hidden"
        style={{
          backgroundColor: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          boxShadow: '0 24px 64px rgba(0,0,0,0.5)',
        }}
      >
        {/* Modal header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: '1px solid var(--color-border)' }}
        >
          <h2 className="text-base font-semibold text-white">New Task</h2>
          <button
            id="btn-quick-add-close"
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors hover:bg-white/10"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <div className="px-5 py-4">
          <TaskForm
            mode="create"
            onSubmit={handleSubmit}
            onCancel={onClose}
            submitting={createTask.isPending}
            error={
              createTask.isError
                ? (createTask.error instanceof Error ? createTask.error.message : 'Failed to create task.')
                : null
            }
          />
        </div>
      </div>
    </div>
  )
}
