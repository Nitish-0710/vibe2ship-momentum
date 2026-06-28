import type { Task, TaskStatus } from '@/types/task.types'

interface TaskCardProps {
  task: Task
  onClick: (task: Task) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; dot: string }> = {
  pending: { label: 'Pending', dot: '#8888a0' },
  'in-progress': { label: 'In Progress', dot: '#6c63ff' },
  completed: { label: 'Completed', dot: '#34d399' },
  cancelled: { label: 'Cancelled', dot: '#f87171' },
}

const CATEGORY_EMOJI: Record<string, string> = {
  assignment: '📝',
  exam: '📚',
  project: '🚀',
  meeting: '🤝',
  personal: '⭐',
  other: '📌',
}

function formatDeadline(iso: string | null): string | null {
  if (!iso) return null
  const d = new Date(iso)
  const now = new Date()
  const diffMs = d.getTime() - now.getTime()
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24))
  if (diffDays < 0) return 'Overdue'
  if (diffDays === 0) return 'Due today'
  if (diffDays === 1) return 'Due tomorrow'
  if (diffDays <= 7) return `Due in ${diffDays} days`
  return `Due ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export default function TaskCard({ task, onClick, onStatusChange, onDelete }: TaskCardProps) {
  const statusCfg = STATUS_CONFIG[task.status]
  const emoji = CATEGORY_EMOJI[task.category] ?? '📌'
  const deadlineLabel = formatDeadline(task.deadline)
  const isOverdue = deadlineLabel === 'Overdue'
  const isCompleted = task.status === 'completed'

  const handleStatusToggle = (e: React.MouseEvent) => {
    e.stopPropagation()
    const next: TaskStatus = task.status === 'completed' ? 'pending' : 'completed'
    onStatusChange(task.id, next)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete(task.id)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onClick(task)}
      onKeyDown={(e) => e.key === 'Enter' && onClick(task)}
      className="group relative flex items-start gap-3 px-4 py-3.5 rounded-xl cursor-pointer transition-all duration-150 hover:scale-[1.005]"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        opacity: isCompleted ? 0.65 : 1,
      }}
    >
      {/* Completion toggle */}
      <button
        id={`task-toggle-${task.id}`}
        onClick={handleStatusToggle}
        aria-label={isCompleted ? 'Mark incomplete' : 'Mark complete'}
        className="mt-0.5 w-5 h-5 rounded-full shrink-0 border-2 flex items-center justify-center transition-all duration-150 hover:scale-110"
        style={{
          borderColor: isCompleted ? '#34d399' : 'var(--color-border)',
          backgroundColor: isCompleted ? 'rgba(52,211,153,0.15)' : 'transparent',
        }}
      >
        {isCompleted && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="#34d399" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-sm font-medium leading-snug"
            style={{
              color: isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)',
              textDecoration: isCompleted ? 'line-through' : 'none',
            }}
          >
            {emoji} {task.title}
          </p>

          {/* Delete — visible on hover */}
          <button
            id={`task-delete-${task.id}`}
            onClick={handleDelete}
            aria-label="Delete task"
            className="opacity-0 group-hover:opacity-100 p-1 rounded-lg transition-all hover:bg-red-500/15 shrink-0"
            style={{ color: '#f87171' }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
            </svg>
          </button>
        </div>

        {/* Meta row */}
        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
          {/* Status dot */}
          <span className="flex items-center gap-1 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            <span className="w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: statusCfg.dot }} />
            {statusCfg.label}
          </span>

          {/* Deadline */}
          {deadlineLabel && (
            <span
              className="text-xs font-medium"
              style={{ color: isOverdue ? '#f87171' : 'var(--color-text-muted)' }}
            >
              {isOverdue ? '⚠ ' : '⏰ '}{deadlineLabel}
            </span>
          )}

          {/* Est. hours */}
          {task.estimatedHours != null && (
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              ⌛ {task.estimatedHours}h
            </span>
          )}

          {/* Priority Score */}
          {task.priorityScore != null && (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(108,99,255,0.15)', color: '#a78bfa', border: '1px solid rgba(108,99,255,0.25)' }}>
              ⚡ Score: {task.priorityScore}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
