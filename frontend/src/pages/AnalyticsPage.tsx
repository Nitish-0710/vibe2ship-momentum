import { useUserAnalytics } from '@/hooks/useAi'

export default function AnalyticsPage() {
  const { data: analytics, isLoading, isError, refetch } = useUserAnalytics()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500" />
      </div>
    )
  }

  if (isError) {
    return (
      <div className="max-w-md mx-auto glass rounded-2xl p-6 text-center space-y-4">
        <div className="text-3xl">⚠️</div>
        <h3 className="text-base font-semibold text-white">Failed to Load Analytics</h3>
        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          An error occurred while compiling your productivity insights. Let's try again.
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-xs font-semibold text-white rounded-xl transition-all"
        >
          Retry
        </button>
      </div>
    )
  }

  const completionRate = analytics?.completionRate ?? 0
  const focusConsistencyScore = analytics?.focusConsistencyScore ?? 0

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-[#252530] pb-4">
        <div>
          <h1 className="text-2xl font-bold text-white">📊 Performance Analytics</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Track task completion progress, focus consistency, and behavioral insights.
          </p>
        </div>
      </div>

      {/* Analytics Summary Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        {/* Completion rate card */}
        <div className="glass rounded-2xl p-5 flex flex-col justify-between h-36">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Completion Rate</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{completionRate}%</span>
            <span className="text-xs text-green-400">Total volume</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-purple-500 h-full rounded-full" style={{ width: `${completionRate}%` }} />
          </div>
        </div>

        {/* Focus consistency card */}
        <div className="glass rounded-2xl p-5 flex flex-col justify-between h-36">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Focus Consistency</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{focusConsistencyScore}%</span>
            <span className="text-xs text-purple-300">Daily average</span>
          </div>
          <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-purple-400 h-full rounded-full" style={{ width: `${focusConsistencyScore}%` }} />
          </div>
        </div>

        {/* Total Hours Scheduled vs completed */}
        <div className="glass rounded-2xl p-5 flex flex-col justify-between h-36">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Estimated Workload</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-white">{analytics?.estimatedHours ?? 0}h</span>
            <span className="text-xs text-zinc-500">Overall task hours</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Completed so far: {analytics?.actualHoursCompleted ?? 0}h</p>
        </div>

        {/* Overdue Count */}
        <div className="glass rounded-2xl p-5 flex flex-col justify-between h-36">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Overdue Tasks</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`text-3xl font-extrabold ${analytics?.overdueTasksCount ? 'text-red-400' : 'text-zinc-400'}`}>
              {analytics?.overdueTasksCount ?? 0}
            </span>
            <span className="text-xs text-zinc-500">Behind schedule</span>
          </div>
          <p className="text-[10px] text-zinc-500 mt-2">Needs active scheduling focus.</p>
        </div>

      </div>

      {/* Main Grid: charts and insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left/Middle: Weekly completion progress chart and reflections */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Weekly progress Bar chart */}
          <div className="glass rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Weekly Completion Progress</h3>
            
            <div className="flex items-end justify-between pt-6 h-36 gap-2">
              {(analytics?.weeklyCompletionTrend || []).map((t, i) => {
                const maxCount = Math.max(...(analytics?.weeklyCompletionTrend || []).map(d => d.count), 1)
                const barHeight = Math.min(100, (t.count / maxCount) * 100)
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-[#1a1a24] rounded-t-md relative flex items-end justify-center h-28">
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

          {/* Reflections summarization log */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Reflection Summary Insights</h3>
            <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-500/10 text-xs text-zinc-300 leading-relaxed">
              {analytics?.reflectionSummary || 'No daily reflections logged yet. Record end-of-day progress under "Daily Reflection" tab to start learning.'}
            </div>
          </div>

        </div>

        {/* Right: study window, blockers, recommendations history */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Study window */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Preferred Work Window</span>
            <div className="text-2xl font-bold text-purple-300">
              ⏰ {analytics?.preferredWorkWindow || 'Flexible'}
            </div>
            <p className="text-[10px] text-zinc-500 leading-normal">
              Aggregated focus block preferences registered in Firestore schedules.
            </p>
          </div>

          {/* Productivity Blockers */}
          <div className="glass rounded-2xl p-5 space-y-3">
            <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Productivity Blockers</span>
            
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

    </div>
  )
}
