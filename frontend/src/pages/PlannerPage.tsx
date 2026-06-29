import { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useAiPlan, useGeneratePlan, useGenerateReplan } from '@/hooks/useAi'

export default function PlannerPage() {
  const { data: tasks, isLoading: tasksLoading } = useTasks()
  const { data: aiPlan, isLoading: aiPlanLoading } = useAiPlan()
  const generatePlan = useGeneratePlan()
  const generateReplan = useGenerateReplan()

  const [promptInput, setPromptInput] = useState('')

  const totalTasks = tasks?.length ?? 0
  const pendingTasks = tasks?.filter((t) => t.status === 'pending' || t.status === 'in-progress').length ?? 0

  const handleGeneratePlan = (e?: React.FormEvent) => {
    e?.preventDefault()
    generatePlan.mutate(promptInput || undefined)
  }

  const handleTriggerReplan = () => {
    generateReplan.mutate(promptInput || undefined)
  }

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'critical': return { bg: 'rgba(239,68,68,0.12)', text: '#fca5a5', border: 'rgba(239,68,68,0.2)' }
      case 'high': return { bg: 'rgba(245,158,11,0.12)', text: '#fde047', border: 'rgba(245,158,11,0.2)' }
      case 'medium': return { bg: 'rgba(59,130,246,0.12)', text: '#93c5fd', border: 'rgba(59,130,246,0.2)' }
      default: return { bg: 'rgba(108,99,255,0.12)', text: '#a78bfa', border: 'rgba(108,99,255,0.2)' }
    }
  }

  if (tasksLoading || aiPlanLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-[#252530] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">⚡ AI Daily Planner</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Schedule focus blocks, analyze constraints, and complete tasks on time.
          </p>
        </div>
      </div>

      {totalTasks === 0 ? (
        <div className="glass rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto">
          <div className="text-4xl">📝</div>
          <h3 className="text-base font-semibold text-white">No Tasks Available</h3>
          <p className="text-xs max-w-xs mx-auto leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            Before the AI can plan your schedule, you need to create at least one task. Let's add some to get started!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Main timeline & timeblocks schedule column */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Generating Loading Indicator */}
            {(generatePlan.isPending || generateReplan.isPending) && (
              <div className="glass rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4">
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                  <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" style={{ animationDuration: '0.6s' }} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-white">Momentum Brain is optimizing plan...</h3>
                  <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                    Generating focus blocks, checking deadlines, and mapping task dependencies.
                  </p>
                </div>
              </div>
            )}

            {/* Error indicators */}
            {(generatePlan.isError || generateReplan.isError) && (
              <div className="glass rounded-2xl p-5 border border-red-500/30 text-xs text-red-300">
                <div className="font-semibold mb-1">Planning Engine Error</div>
                <div>{generatePlan.error instanceof Error ? generatePlan.error.message : 'Failed to execute pipeline.'}</div>
                <button
                  onClick={() => handleGeneratePlan()}
                  className="mt-3 px-3.5 py-1.5 rounded-lg font-bold text-white bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 transition-all"
                >
                  Retry Plan Generation
                </button>
              </div>
            )}

            {/* Empty planning state */}
            {!aiPlan && !generatePlan.isPending && !generateReplan.isPending && (
              <div className="glass rounded-2xl p-10 text-center space-y-4">
                <div className="text-4xl">⚡</div>
                <h3 className="text-base font-semibold text-white">Daily plan has not been generated yet</h3>
                <p className="text-xs max-w-sm mx-auto leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
                  Let's configure your constraints and run the Momentum Brain optimization pipeline to schedule focus blocks for today.
                </p>
                <button
                  onClick={() => handleGeneratePlan()}
                  className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', boxShadow: '0 4px 20px rgba(108,99,255,0.3)' }}
                >
                  ⚡ Generate Plan
                </button>
              </div>
            )}

            {/* Active Timeline view */}
            {aiPlan && !generatePlan.isPending && !generateReplan.isPending && (
              <div className="glass rounded-2xl p-6 space-y-6">
                <div className="flex items-center justify-between border-b border-[#252530] pb-3">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider">Your Daily Schedule</h3>
                  <span className="text-xs font-semibold text-zinc-400">Total: {pendingTasks} pending tasks</span>
                </div>

                {aiPlan.schedule.length > 0 && aiPlan.schedule[0].taskBlocks.length > 0 ? (
                  <div className="space-y-4 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                    {aiPlan.schedule[0].taskBlocks.map((block, i) => {
                      const start = block.startTime.substring(11, 16)
                      const end = block.endTime.substring(11, 16)
                      return (
                        <div key={i} className="flex gap-4 items-start relative pl-8">
                          <span className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-purple-500 bg-[#0a0a0f]" />
                          <div className="flex-1 p-4 rounded-xl border border-zinc-800/80 bg-[#12121b]/40 hover:bg-[#12121b]/80 transition-all">
                            <div className="flex items-center justify-between gap-4">
                              <span className="text-xs font-bold text-purple-300">{start} - {end} ({block.durationHours}h)</span>
                            </div>
                            <h4 className="text-sm font-bold text-white mt-1">{block.title}</h4>
                            <p className="text-xs mt-1.5 text-zinc-400 leading-relaxed">{block.explanation}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">No task blocks scheduled for today.</p>
                )}
              </div>
            )}

          </div>

          {/* Right column: AI parameters & settings & coaching */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Directives Input panel */}
            <form onSubmit={handleGeneratePlan} className="glass rounded-2xl p-5 space-y-4">
              <div>
                <h3 className="text-xs font-semibold text-white uppercase tracking-wider">AI Constraints</h3>
                <p className="text-[10px] text-zinc-500 mt-0.5">Customize how the planner schedules tasks.</p>
              </div>

              <textarea
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
                placeholder="E.g., I have limited time in the morning, schedule focus sessions in the afternoon, or study DBMS assignment first."
                rows={3}
                className="w-full px-3 py-2 rounded-xl text-xs outline-none resize-none"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              />

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={generatePlan.isPending || generateReplan.isPending}
                  className="flex-1 py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:opacity-95"
                  style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
                >
                  Optimize Plan
                </button>
                {aiPlan && (
                  <button
                    type="button"
                    onClick={handleTriggerReplan}
                    disabled={generatePlan.isPending || generateReplan.isPending}
                    className="px-4 py-2.5 bg-zinc-800 border border-zinc-700 hover:bg-zinc-700 text-xs font-semibold text-white rounded-xl transition-all"
                  >
                    Replan
                  </button>
                )}
              </div>
            </form>

            {/* Active coaching & observations panel */}
            {aiPlan && (
              <div className="space-y-6">
                
                {/* Coaching cards */}
                <div className="glass rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-[#252530] pb-2">
                    <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Coaching Advice</h3>
                    <span className="text-xs font-bold text-purple-400">Score: {aiPlan.confidence}%</span>
                  </div>

                  <p className="text-sm font-medium text-purple-200 italic leading-snug">
                    &ldquo;{aiPlan.coaching.dailySummary}&rdquo;
                  </p>

                  <div className="space-y-2">
                    {aiPlan.coaching.coachingMessages.map((msg, i) => {
                      const col = getUrgencyColor(msg.priority)
                      return (
                        <div
                          key={i}
                          className="p-3 rounded-xl border text-xs leading-relaxed"
                          style={{ backgroundColor: col.bg, borderColor: col.border, color: col.text }}
                        >
                          <span className="font-semibold capitalize">{msg.type}: </span>
                          {msg.message}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Recommendations summaries */}
                <div className="glass rounded-2xl p-5 space-y-3">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Plan Recommendations</h3>
                  <div className="space-y-2">
                    {aiPlan.recommendations.map((rec, i) => (
                      <div key={i} className="flex gap-2 items-start text-xs text-zinc-300">
                        <span className="text-purple-400">✦</span>
                        <span>{rec.message}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Blocked & Deferred items */}
                <div className="glass rounded-2xl p-5 space-y-4">
                  <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Bottlenecks & Deferrals</h3>
                  
                  {aiPlan.decisions.blockedTasks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-wide">Blocked Tasks</p>
                      {aiPlan.decisions.blockedTasks.map((t, i) => (
                        <div key={i} className="p-2.5 rounded-lg border border-red-500/25 bg-red-500/10 text-xs text-red-300">
                          <strong>{t.title}</strong>: {t.reason}
                        </div>
                      ))}
                    </div>
                  )}

                  {aiPlan.decisions.deferredTasks.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-[10px] font-bold text-yellow-400 uppercase tracking-wide">Deferred Tasks</p>
                      {aiPlan.decisions.deferredTasks.map((t, i) => (
                        <div key={i} className="p-2.5 rounded-lg border border-yellow-500/25 bg-yellow-500/10 text-xs text-yellow-300">
                          <strong>{t.title}</strong>: {t.reason}
                        </div>
                      ))}
                    </div>
                  )}

                  {aiPlan.decisions.blockedTasks.length === 0 && aiPlan.decisions.deferredTasks.length === 0 && (
                    <p className="text-xs text-zinc-500">No bottlenecks or deferred tasks detected.</p>
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
