import { useState, type FormEvent } from 'react'
import type { Task, CreateTaskPayload, UpdateTaskPayload, TaskCategory, TaskStatus } from '@/types/task.types'

interface TaskFormProps {
  initialValues?: Partial<Task>
  onSubmit: (data: CreateTaskPayload | UpdateTaskPayload) => void
  onCancel: () => void
  submitting?: boolean
  error?: string | null
  mode?: 'create' | 'edit'
}

const CATEGORIES: { value: TaskCategory; label: string }[] = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'exam', label: 'Exam' },
  { value: 'project', label: 'Project' },
  { value: 'meeting', label: 'Meeting' },
  { value: 'personal', label: 'Personal' },
  { value: 'other', label: 'Other' },
]

const STATUSES: { value: TaskStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const inputStyle = {
  backgroundColor: 'var(--color-surface-2)',
  border: '1px solid var(--color-border)',
  color: 'var(--color-text)',
}

export default function TaskForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitting = false,
  error,
  mode = 'create',
}: TaskFormProps) {
  const [title, setTitle] = useState(initialValues.title ?? '')
  const [description, setDescription] = useState(initialValues.description ?? '')
  const [category, setCategory] = useState<TaskCategory>(initialValues.category ?? 'other')
  const [deadline, setDeadline] = useState(
    initialValues.deadline ? initialValues.deadline.substring(0, 10) : '',
  )
  const [estimatedHours, setEstimatedHours] = useState(
    initialValues.estimatedHours != null ? String(initialValues.estimatedHours) : '',
  )
  const [status, setStatus] = useState<TaskStatus>(initialValues.status ?? 'pending')
  const [validationError, setValidationError] = useState<string | null>(null)

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setValidationError(null)

    if (!title.trim()) {
      setValidationError('Title is required.')
      return
    }

    const hours = estimatedHours ? parseFloat(estimatedHours) : null
    if (estimatedHours && (isNaN(hours!) || hours! <= 0)) {
      setValidationError('Estimated hours must be a positive number.')
      return
    }

    const payload: CreateTaskPayload = {
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      deadline: deadline ? new Date(deadline).toISOString() : null,
      estimatedHours: hours,
      status,
    }

    onSubmit(payload)
  }

  const displayError = validationError || error

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {displayError && (
        <div
          className="px-3 py-2.5 rounded-lg text-sm"
          style={{
            backgroundColor: 'rgba(239,68,68,0.1)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: '#fca5a5',
          }}
        >
          {displayError}
        </div>
      )}

      {/* Title */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
          Title <span style={{ color: '#f87171' }}>*</span>
        </label>
        <input
          id="task-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. DBMS Assignment"
          required
          maxLength={200}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = '#6c63ff')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
          Description
        </label>
        <textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add details..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors resize-none"
          style={inputStyle}
          onFocus={(e) => (e.target.style.borderColor = '#6c63ff')}
          onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
        />
      </div>

      {/* Category + Status */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Category
          </label>
          <select
            id="task-category"
            value={category}
            onChange={(e) => setCategory(e.target.value as TaskCategory)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={inputStyle}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value} style={{ backgroundColor: '#1a1a24' }}>
                {c.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Status
          </label>
          <select
            id="task-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={inputStyle}
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value} style={{ backgroundColor: '#1a1a24' }}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Deadline + Estimated Hours */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Deadline
          </label>
          <input
            id="task-deadline"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={{ ...inputStyle, colorScheme: 'dark' }}
            onFocus={(e) => (e.target.style.borderColor = '#6c63ff')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          />
        </div>

        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--color-text-muted)' }}>
            Est. Hours
          </label>
          <input
            id="task-estimated-hours"
            type="number"
            value={estimatedHours}
            onChange={(e) => setEstimatedHours(e.target.value)}
            placeholder="e.g. 3"
            min="0.5"
            step="0.5"
            className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-colors"
            style={inputStyle}
            onFocus={(e) => (e.target.style.borderColor = '#6c63ff')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--color-border)')}
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2.5 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all hover:opacity-80"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          Cancel
        </button>
        <button
          id="btn-task-submit"
          type="submit"
          disabled={submitting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
        >
          {submitting ? 'Saving…' : mode === 'edit' ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  )
}
