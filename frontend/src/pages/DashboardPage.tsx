import { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useAuth } from '@/hooks/useAuth'
import { useAiPlan, useGeneratePlan, useGenerateReplan, useSubmitReflection, useUserAnalytics } from '@/hooks/useAi'
import TaskList from '@/components/tasks/TaskList'

type TabType = 'planner' | 'analytics' | 'reflection'

export default function DashboardPage() {
  const { userProfile, firebaseUser } = useAuth()
  const { data: tasks, isLoading: tasksLoading, isError: tasksError, error: taskErr, refetch: refetchTasks } = useTasks()
  
  const { data: aiPlan } = useAiPlan()
  const generatePlan = useGeneratePlan()
  const generateReplan = useGenerateReplan()
  const submitReflection = useSubmitReflection()
  const { data: analytics, refetch: refetchAnalytics } = useUserAnalytics()

  const [activeTab, setActiveTab] = useState<TabType>('planner')
  const [promptInput, setPromptInput] = useState('')

  // Daily Reflection Form State
  const [prodRating, setProdRating] = useState(5)
  const [notesInput, setNotesInput] = useState('')
  const [blockersList, setBlockersList] = useState<string[]>([])
  const [newBlocker, setNewBlocker] = useState('')
  const [selectedTasksToComplete, setSelectedTasksToComplete] = useState<string[]>([])
  const [reflectionSuccessMsg, setReflectionSuccessMsg] = useState<string | null>(null)

  const displayName =
    userProfile?.name || firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'there'

  const totalTasks = tasks?.length ?? 0
  const completedTasks = tasks?.filter((t) => t.status === 'completed').length ?? 0
  const pendingTasks = tasks?.filter((t) => t.status === 'pending' || t.status === 'in-progress').length ?? 0

  const handleGeneratePlan = (e?: React.FormEvent) => {
    e?.preventDefault()
    generatePlan.mutate(promptInput || undefined)
  }

  const handleTriggerReplan = () => {
    generateReplan.mutate(undefined, {
      onSuccess: () => {
        refetchAnalytics()
      }
    })
  }

  const handleAddBlocker = () => {
    if (newBlocker.trim() && !blockersList.includes(newBlocker.trim())) {
      setBlockersList([...blockersList, newBlocker.trim()])
      setNewBlocker('')
    }
  }

  const handleRemoveBlocker = (blocker: string) => {
    setBlockersList(blockersList.filter((b) => b !== blocker))
  }

  const handleToggleReflectionTask = (taskId: string) => {
    if (selectedTasksToComplete.includes(taskId)) {
      setSelectedTasksToComplete(selectedTasksToComplete.filter((id) => id !== taskId))
    } else {
      setSelectedTasksToComplete([...selectedTasksToComplete, taskId])
    }
  }

  const handleReflectionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setReflectionSuccessMsg(null)

    submitReflection.mutate({
      productivityRating: prodRating,
      notes: notesInput,
      blockers: blockersList,
      completedTasks: selectedTasksToComplete,
    }, {
      onSuccess: (data) => {
        setReflectionSuccessMsg(data.reflectionSummary)
        // Reset form
        setNotesInput('')
        setBlockersList([])
        setSelectedTasksToComplete([])
        // Refetch queries
        refetchTasks()
        refetchAnalytics()
      }
    })
  }

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
      
      {/* Top Header & Tab Switcher */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-[#252530]">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Good{getTimeGreeting()}, {displayName} 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Build momentum, track productivity, and adapt your daily work schedule.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex bg-[#1a1a24] p-1 rounded-xl border border-zinc-800 self-start md:self-auto">
          {[
            { id: 'planner', label: '⚡ Planner & Tasks' },
            { id: 'analytics', label: '📊 Performance' },
            { id: 'reflection', label: '📝 Daily Reflection' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800/40'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Adaptive Replanning Alert Banner */}
      {aiPlan && (
        <div className="p-4 rounded-xl flex items-center justify-between gap-4 flex-wrap bg-yellow-500/10 border border-yellow-500/20 text-xs">
          <div className="flex items-center gap-2 text-yellow-300">
            <span>⚡</span>
            <span>Workload changes or pending deadlines detected. Optimize your plan to sync schedule blocks.</span>
          </div>
          <button
            onClick={handleTriggerReplan}
            disabled={generateReplan.isPending}
            className="px-4 py-1.5 rounded-lg font-bold text-black bg-yellow-400 hover:bg-yellow-300 transition-all disabled:opacity-50"
          >
            {generateReplan.isPending ? 'Adapting...' : 'Adjust Schedule'}
          </button>
        </div>
      )}

      {/* Stats bar */}
      {totalTasks > 0 && activeTab === 'planner' && (
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

      {/* ── TAB 1: PLANNER & TASKS ────────────────────────────────── */}
      {activeTab === 'planner' && (
        <>
          {generatePlan.isPending && (
            <div className="glass rounded-2xl p-10 text-center flex flex-col items-center justify-center gap-4">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
                <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" style={{ animationDuration: '0.6s' }} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-white">Momentum Brain is optimizing plan...</h3>
                <p className="text-xs mt-1 max-w-sm mx-auto" style={{ color: 'var(--color-text-muted)' }}>
                  Invoking Reasoning, Decision, Planning, Reflection, and Coaching Engines.
                </p>
              </div>
            </div>
          )}

          {generatePlan.isError && (
            <div className="glass rounded-2xl p-6 border border-red-500/30">
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
                      placeholder="e.g. Focus on high priority assignments first..."
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
                        <span className="text-xs font-bold animate-pulse text-[#a78bfa]">
                          Confidence: {aiPlan.confidence}%
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

                    {/* Daily Schedule Timeline */}
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

                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── TAB 2: PERFORMANCE ANALYTICS ──────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Main Analytics Cards */}
          <div className="md:col-span-2 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Completion Rate Widget */}
              <div className="glass rounded-2xl p-5 flex flex-col justify-between h-40">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Task Completion Rate</h3>
                <div className="flex items-center gap-4 mt-2">
                  <div className="relative w-16 h-16 rounded-full border-4 border-purple-500/10 flex items-center justify-center font-bold text-lg text-white">
                    <span className="absolute inset-0 rounded-full border-4 border-purple-500 border-t-transparent" />
                    {analytics?.completionRate ?? 0}%
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">Focus Consistency</p>
                    <p className="text-xs text-zinc-400 mt-0.5">Estimated workload: {analytics?.estimatedHours ?? 0}h</p>
                  </div>
                </div>
              </div>

              {/* Overdue Widget */}
              <div className="glass rounded-2xl p-5 flex flex-col justify-between h-40">
                <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Overdue Tasks</h3>
                <div className="mt-2">
                  <span className={`text-4xl font-bold ${analytics?.overdueTasksCount ? 'text-red-400' : 'text-zinc-400'}`}>
                    {analytics?.overdueTasksCount ?? 0}
                  </span>
                  <p className="text-xs text-zinc-400 mt-2">Tasks currently past their set deadline.</p>
                </div>
              </div>

            </div>

            {/* Weekly Completion Bar Chart list */}
            <div className="glass rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Weekly Completion Volume</h3>
              <div className="flex items-end justify-between pt-6 h-28 gap-2">
                {(analytics?.weeklyCompletionTrend || []).map((t, i) => {
                  const maxCount = Math.max(...(analytics?.weeklyCompletionTrend || []).map(d => d.count), 1)
                  const barHeight = Math.min(100, (t.count / maxCount) * 100)
                  return (
                    <div key={i} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full bg-[#1a1a24] rounded-t-md relative flex items-end justify-center h-20">
                        <div
                          className="w-full bg-purple-500/80 hover:bg-purple-400 transition-all rounded-t-md"
                          style={{ height: `${barHeight}%` }}
                        />
                        {t.count > 0 && (
                          <span className="absolute -top-6 text-[10px] font-bold text-white">{t.count}</span>
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-500 font-semibold">{t.day}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Reflection observations logs */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Historical Reflection Logs</h3>
              <p className="text-xs leading-relaxed text-zinc-300">
                {analytics?.reflectionSummary}
              </p>
            </div>

          </div>

          {/* Right Column: Insights & Preferred study window */}
          <div className="md:col-span-1 space-y-6">
            
            {/* Preferred study window */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Study window</h3>
              <div className="text-2xl font-bold text-purple-300">
                ⏰ {analytics?.preferredWorkWindow || 'Flexible'}
              </div>
              <p className="text-xs text-zinc-500 leading-normal">
                Determined by your scheduled focus block patterns in Firestore.
              </p>
            </div>

            {/* Recurring Blockers */}
            <div className="glass rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Productivity Blockers</h3>
              
              {analytics?.recurringBlockers && analytics.recurringBlockers.length > 0 ? (
                <div className="flex flex-wrap gap-2 pt-1">
                  {analytics.recurringBlockers.map((b, i) => (
                    <span key={i} className="px-2.5 py-1 bg-zinc-900 border border-zinc-800 text-[10px] font-semibold text-purple-300 rounded-full">
                      🚫 {b}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No blockers reported yet.</p>
              )}
            </div>

          </div>

        </div>
      )}

      {/* ── TAB 3: DAILY REFLECTION FORM ──────────────────────────── */}
      {activeTab === 'reflection' && (
        <div className="max-w-xl mx-auto glass rounded-2xl p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-white">Reflection</h2>
            <p className="text-xs text-zinc-400 mt-1">
              End-of-day check-in updating AI learning observations.
            </p>
          </div>

          {reflectionSuccessMsg && (
            <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
              <p className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                <span>✓</span> Daily Reflection Logged Successfully!
              </p>
              <p className="text-xs text-zinc-300 leading-relaxed">
                {reflectionSuccessMsg}
              </p>
            </div>
          )}

          <form onSubmit={handleReflectionSubmit} className="space-y-4">
            
            {/* Star productivity rating */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Productivity Rating (1-5)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setProdRating(val)}
                    className="w-10 h-10 rounded-xl font-bold border transition-all text-sm flex items-center justify-center"
                    style={{
                      backgroundColor: prodRating === val ? 'rgba(108,99,255,0.2)' : 'var(--color-surface-2)',
                      borderColor: prodRating === val ? '#6c63ff' : 'var(--color-border)',
                      color: prodRating === val ? '#a78bfa' : 'zinc-400',
                    }}
                  >
                    {val} ★
                  </button>
                ))}
              </div>
            </div>

            {/* Check completed tasks */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Which tasks did you complete?
              </label>
              {tasks && tasks.filter(t => t.status !== 'completed').length > 0 ? (
                <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                  {tasks.filter(t => t.status !== 'completed').map((task) => (
                    <label key={task.id} className="flex items-center gap-2.5 p-2.5 rounded-xl border border-zinc-800 bg-[#0a0a0f] cursor-pointer hover:bg-zinc-800/25 transition-all text-xs">
                      <input
                        type="checkbox"
                        checked={selectedTasksToComplete.includes(task.id)}
                        onChange={() => handleToggleReflectionTask(task.id)}
                        className="rounded border-zinc-800 text-purple-600 focus:ring-purple-500"
                      />
                      <span className="text-white font-medium">{task.title}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-zinc-500">No active pending tasks remaining.</p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Notes / What prevented progress?
              </label>
              <textarea
                value={notesInput}
                onChange={(e) => setNotesInput(e.target.value)}
                placeholder="What did you learn? E.g., struggled to focus in the morning..."
                rows={3}
                required
                className="w-full px-3 py-2.5 rounded-xl text-xs outline-none transition-colors resize-none"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>

            {/* Blockers list input */}
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                Log Blockers
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBlocker}
                  onChange={(e) => setNewBlocker(e.target.value)}
                  placeholder="e.g. Distractions, Meetings"
                  className="flex-1 px-3 py-2 rounded-xl text-xs outline-none"
                  style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                />
                <button
                  type="button"
                  onClick={handleAddBlocker}
                  className="px-4 py-2 bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white rounded-xl hover:bg-zinc-700 transition-all"
                >
                  Add
                </button>
              </div>

              {blockersList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {blockersList.map((b, i) => (
                    <span key={i} className="px-2 py-1 bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 font-semibold rounded-lg flex items-center gap-1.5">
                      {b}
                      <button type="button" onClick={() => handleRemoveBlocker(b)} className="text-purple-400 hover:text-white font-bold">×</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitReflection.isPending}
              className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
              style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
            >
              {submitReflection.isPending ? 'Logging reflection...' : '⚡ Save Daily Reflection'}
            </button>

          </form>
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
