import { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useAuth } from '@/hooks/useAuth'
import { useAiPlan, useGeneratePlan } from '@/hooks/useAi'
import TaskList from '@/components/tasks/TaskList'

/**
 * DashboardPage — Phase 3E.
 * Integrates the pre-existing Task CRUD list with the completed AI planning pipeline.
 * Offers loading states, error states, and a premium schedule layout.
 */
export default function DashboardPage() {
  const { userProfile, firebaseUser } = useAuth()
  const { data: tasks, isLoading: tasksLoading, isError: tasksError, error: taskErr, refetch: refetchTasks } = useTasks()
  
  const { data: aiPlan } = useAiPlan()
  const generatePlan = useGeneratePlan()

  const [promptInput, setPromptInput] = useState('')

  const displayName =
    userProfile?.name || firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'there'

  const totalTasks = tasks?.length ?? 0
  const completedTasks = tasks?.filter((t) => t.status === 'completed').length ?? 0
  const pendingTasks = tasks?.filter((t) => t.status === 'pending' || t.status === 'in-progress').length ?? 0

  const handleGeneratePlan = (e?: React.FormEvent) => {
    e?.preventDefault()
    generatePlan.mutate(promptInput || undefined)
  }

  // Determine priority badge color
  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'critical': return { bg: 'rgba(239,68,68,0.15)', text: '#fca5a5', border: 'rgba(239,68,68,0.3)' }
      case 'high': return { bg: 'rgba(245,158,11,0.15)', text: '#fde047', border: 'rgba(245,158,11,0.3)' }
      case 'medium': return { bg: 'rgba(59,130,246,0.15)', text: '#93c5fd', border: 'rgba(59,130,246,0.3)' }
      default: return { bg: 'rgba(108,99,255,0.15)', text: '#a78bfa', border: 'rgba(108,99,255,0.3)' }
    }
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good{getTimeGreeting()}, {displayName} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Your AI Chief of Staff is ready to help you plan and execute.
          </p>
        </div>

        {totalTasks > 0 && !aiPlan && !generatePlan.isPending && (
          <button
            onClick={() => handleGeneratePlan()}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', boxShadow: '0 4px 20px rgba(108,99,255,0.3)' }}
          >
            ⚡ Generate AI Plan
          </button>
        )}
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
              className="px-4 py-3 rounded-xl"
              style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            >
              <p className="text-2xl font-bold" style={{ color: accent }}>{value}</p>
              <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Loading Pipeline State */}
      {generatePlan.isPending && (
        <div className="glass rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4">
          <div className="relative w-12 h-12">
            <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
            <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" style={{ animationDuration: '0.6s' }} />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">Momentum Brain is thinking...</h3>
            <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: 'var(--color-text-muted)' }}>
              Analyzing workload, ranking priorities, checking dependencies, and generating focus blocks.
            </p>
          </div>
        </div>
      )}

      {/* AI Error State */}
      {generatePlan.isError && (
        <div className="glass rounded-2xl p-6 border" style={{ borderColor: 'rgba(239,68,68,0.3)' }}>
          <div className="flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <h3 className="text-sm font-semibold text-red-300">Brain Planning Failed</h3>
              <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                {generatePlan.error instanceof Error ? generatePlan.error.message : 'Brain pipeline failed to execute.'}
              </p>
              <button
                onClick={() => handleGeneratePlan()}
                className="mt-3 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all"
              >
                Retry Generation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {!generatePlan.isPending && (
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

          {/* Right: AI Plan / Recommendation Column */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* AI Input Form */}
            {totalTasks > 0 && (
              <form onSubmit={handleGeneratePlan} className="glass rounded-2xl p-4 space-y-3">
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">AI Directives</h3>
                <textarea
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder="e.g. I want to prioritize DBMS study today or I need a lighter schedule..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl text-xs outline-none transition-colors resize-none"
                  style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
                <button
                  type="submit"
                  disabled={generatePlan.isPending}
                  className="w-full py-2 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-95"
                  style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
                >
                  ⚡ Optimize Schedule
                </button>
              </form>
            )}

            {/* AI Active Plan Panel */}
            {aiPlan && (
              <div className="space-y-6">
                
                {/* Coaching Summary */}
                <div className="glass rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Coaching Advice</h3>
                    <span className="text-xs font-bold" style={{ color: '#a78bfa' }}>
                      Brain Confidence: {aiPlan.confidence}%
                    </span>
                  </div>

                  <p className="text-sm font-medium text-purple-200 leading-snug">
                    &ldquo;{aiPlan.coaching.dailySummary}&rdquo;
                  </p>

                  <div className="space-y-2">
                    {aiPlan.coaching.coachingMessages.slice(0, 3).map((msg, i) => {
                      const urg = getUrgencyColor(msg.priority)
                      return (
                        <div
                          key={i}
                          className="p-3 rounded-xl border text-xs leading-relaxed"
                          style={{ backgroundColor: urg.bg, borderColor: urg.border, color: urg.text }}
                        >
                          <span className="font-semibold capitalize">{msg.type}: </span>
                          {msg.message}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Focus Blocks Schedule */}
                <div className="glass rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Today's Schedule</h3>
                  
                  {aiPlan.schedule.length > 0 && aiPlan.schedule[0].taskBlocks.length > 0 ? (
                    <div className="space-y-3 relative before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                      {aiPlan.schedule[0].taskBlocks.map((block, i) => {
                        const start = block.startTime.substring(11, 16)
                        const end = block.endTime.substring(11, 16)
                        return (
                          <div key={i} className="flex gap-4 items-start relative pl-6">
                            <span className="absolute left-1.5 top-1.5 w-2.5 h-2.5 rounded-full border border-purple-500 bg-[#0a0a0f]" />
                            <div className="flex-1">
                              <p className="text-xs font-semibold text-purple-300">{start} - {end}</p>
                              <p className="text-xs font-medium text-white mt-0.5">{block.title}</p>
                              <p className="text-[10px] mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                                {block.explanation}
                              </p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      No tasks scheduled for today.
                    </p>
                  )}
                </div>

                {/* Reflection Insights */}
                <div className="glass rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Reflection Insights</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                    {aiPlan.reflection.reflectionSummary}
                  </p>

                  {aiPlan.decisions.blockedTasks.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-red-400 uppercase">Blocked items detected</p>
                      {aiPlan.decisions.blockedTasks.map((bt, i) => (
                        <div key={i} className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 text-[10px] text-red-300">
                          <strong>{bt.title}</strong>: {bt.reason}
                        </div>
                      ))}
                    </div>
                  )}

                  {aiPlan.decisions.deferredTasks.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[10px] font-bold text-yellow-400 uppercase">Deferred items</p>
                      {aiPlan.decisions.deferredTasks.map((dt, i) => (
                        <div key={i} className="p-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-300">
                          <strong>{dt.title}</strong>: {dt.reason}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            )}

          </div>

        </div>
      )}
    </div>
  )
}

function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 17) return 'afternoon'
  return 'evening'
}
