import { useTasks } from '@/hooks/useTasks'
import { useAuth } from '@/hooks/useAuth'
import TaskList from '@/components/tasks/TaskList'

/**
 * DashboardPage — Phase 2.
 * Renders the task list with full loading / error / empty states.
 * CRUD is handled inside TaskList, TaskCard, and TaskDetails via React Query hooks.
 * QuickAddTask is mounted in DashboardLayout (accessible from the Header button).
 */
export default function DashboardPage() {
  const { userProfile, firebaseUser } = useAuth()
  const { data: tasks, isLoading, isError, error, refetch } = useTasks()

  const displayName =
    userProfile?.name || firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'there'

  const totalTasks = tasks?.length ?? 0
  const completedTasks = tasks?.filter((t) => t.status === 'completed').length ?? 0
  const pendingTasks = tasks?.filter((t) => t.status === 'pending' || t.status === 'in-progress').length ?? 0

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Good{getTimeGreeting()}, {displayName} 👋
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Here&apos;s what needs your attention today.
        </p>
      </div>

      {/* Stats bar — only render if tasks exist */}
      {totalTasks > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Tasks', value: totalTasks, accent: '#8888a0' },
            { label: 'Pending', value: pendingTasks, accent: '#6c63ff' },
            { label: 'Completed', value: completedTasks, accent: '#34d399' },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-2xl font-bold" style={{ color: accent }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Section header */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-white">Your Tasks</h2>
        {totalTasks > 0 && (
          <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
            {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
          </span>
        )}
      </div>

      {/* Task list — handles its own loading/error/empty states */}
      <TaskList
        tasks={tasks ?? []}
        isLoading={isLoading}
        isError={isError}
        errorMessage={error instanceof Error ? error.message : 'Failed to load tasks.'}
        onRetry={refetch}
        onAddTask={() => {
          // Trigger the Header's quick-add — dispatch a custom event DashboardLayout listens to
          document.getElementById('btn-quick-add')?.click()
        }}
      />
    </div>
  )
}

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
