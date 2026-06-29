import { useTasks } from '@/hooks/useTasks'
import { useAuth } from '@/hooks/useAuth'
import { useAiPlan } from '@/hooks/useAi'
import TaskList from '@/components/tasks/TaskList'

export default function DashboardPage() {
  const { userProfile, firebaseUser } = useAuth()
  const { data: tasks, isLoading: tasksLoading, isError: tasksError, error: taskErr, refetch: refetchTasks } = useTasks()
  const { data: aiPlan, isLoading: aiPlanLoading } = useAiPlan()

  const displayName =
    userProfile?.name || firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'there'

  const totalTasks = tasks?.length ?? 0
  const completedTasks = tasks?.filter((t) => t.status === 'completed').length ?? 0
  const pendingTasks = tasks?.filter((t) => t.status === 'pending' || t.status === 'in-progress').length ?? 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-[#252530]">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good{getTimeGreeting()}, {displayName} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Welcome back. Track your study objectives, dependencies, and daily progress.
          </p>
        </div>
      </div>

      {/* Stats bar */}
      {totalTasks > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Tasks', value: totalTasks, accent: '#8888a0' },
            { label: 'Pending', value: pendingTasks, accent: '#6c63ff' },
            { label: 'Completed', value: completedTasks, accent: '#34d399' },
          ].map(({ label, value, accent }) => (
            <div
              key={label}
              className="px-4 py-3 rounded-xl animate-fade-in"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-2xl font-bold" style={{ color: accent }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left: Tasks List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-white">Your Tasks</h2>
            {totalTasks > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full" style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-muted)', border: '1px solid var(--color-border)' }}>
                {totalTasks} {totalTasks === 1 ? 'task' : 'tasks'}
              </span>
            )}
          </div>

          <TaskList
            tasks={tasks ?? []}
            isLoading={tasksLoading}
            isError={tasksError}
            errorMessage={taskErr instanceof Error ? taskErr.message : 'Failed to load tasks.'}
            onRetry={refetchTasks}
            onAddTask={() => {
              document.getElementById('btn-quick-add')?.click()
            }}
          />
        </div>

        {/* Right: Quick Planner Preview / Coaching alert */}
        <div className="lg:col-span-1 space-y-6">
          {aiPlanLoading ? (
            <div className="glass rounded-2xl p-5 text-center flex flex-col items-center justify-center py-10">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-purple-500" />
            </div>
          ) : aiPlan ? (
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Plan Summary</h3>
              <p className="text-sm font-medium text-purple-200 leading-snug">
                &ldquo;{aiPlan.coaching.dailySummary}&rdquo;
              </p>
              <div className="pt-2 border-t border-[#252530] flex justify-between items-center text-xs">
                <span style={{ color: 'var(--color-text-muted)' }}>Confidence Score:</span>
                <span className="font-bold text-[#a78bfa]">{aiPlan.confidence}%</span>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-5 text-center space-y-3">
              <div className="text-3xl">⚡</div>
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">AI Daily Planner</h3>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                You haven't optimized today's focus schedule. Let the Momentum Brain schedule task blocks for you.
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
