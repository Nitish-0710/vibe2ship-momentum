import { useState } from 'react'
import { useTasks } from '@/hooks/useTasks'
import { useSubmitReflection } from '@/hooks/useAi'

export default function ReflectionPage() {
  const { data: tasks, refetch: refetchTasks } = useTasks()
  const submitReflection = useSubmitReflection()

  const [prodRating, setProdRating] = useState(5)
  const [notesInput, setNotesInput] = useState('')
  const [blockersList, setBlockersList] = useState<string[]>([])
  const [newBlocker, setNewBlocker] = useState('')
  const [selectedTasksToComplete, setSelectedTasksToComplete] = useState<string[]>([])
  const [reflectionSuccessMsg, setReflectionSuccessMsg] = useState<string | null>(null)

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
        // Reset form inputs
        setNotesInput('')
        setBlockersList([])
        setSelectedTasksToComplete([])
        refetchTasks()
      }
    })
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="border-b border-[#252530] pb-4">
        <h1 className="text-2xl font-bold text-white">📝 Daily Reflection</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Record end-of-day progress, productivity barriers, and insights to adapt AI schedules.
        </p>
      </div>

      {/* Success banner displays AI coaching summary */}
      {reflectionSuccessMsg && (
        <div className="glass p-5 rounded-2xl border border-purple-500/30 space-y-3">
          <p className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
            <span>✓</span> Daily Reflection Logged successfully
          </p>
          <p className="text-xs text-zinc-300 leading-relaxed">
            {reflectionSuccessMsg}
          </p>
        </div>
      )}

      {/* Daily Reflection Form */}
      <div className="glass rounded-2xl p-6 space-y-5">
        <form onSubmit={handleReflectionSubmit} className="space-y-5">
          
          {/* Productivity selector */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              How productive were you today? (1 - lowest, 5 - highest)
            </label>
            <div className="flex gap-2.5">
              {[1, 2, 3, 4, 5].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setProdRating(val)}
                  className="w-10 h-10 rounded-xl font-bold border transition-all text-sm flex items-center justify-center"
                  style={{
                    backgroundColor: prodRating === val ? 'rgba(108,99,255,0.18)' : 'var(--color-surface-2)',
                    borderColor: prodRating === val ? '#6c63ff' : 'var(--color-border)',
                    color: prodRating === val ? '#a78bfa' : 'zinc-400',
                  }}
                >
                  {val} ★
                </button>
              ))}
            </div>
          </div>

          {/* Pending Tasks Checkbox completion logs */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              Select tasks you completed today:
            </label>
            {tasks && tasks.filter(t => t.status !== 'completed').length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                {tasks.filter(t => t.status !== 'completed').map((task) => (
                  <label key={task.id} className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-[#0a0a0f] cursor-pointer hover:bg-zinc-800/30 transition-all text-xs">
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
              <p className="text-xs text-zinc-500 italic">No active pending tasks listed.</p>
            )}
          </div>

          {/* Productivity Blockers */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              Did you face any blocker obstacles? (e.g. Distractions, Tiredness)
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newBlocker}
                onChange={(e) => setNewBlocker(e.target.value)}
                placeholder="e.g. Fatigue, Distractions"
                className="flex-1 px-3.5 py-2.5 rounded-xl text-xs outline-none"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              />
              <button
                type="button"
                onClick={handleAddBlocker}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-xs font-semibold text-white rounded-xl transition-all"
              >
                Add blocker
              </button>
            </div>

            {blockersList.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2.5">
                {blockersList.map((b, i) => (
                  <span key={i} className="px-2.5 py-1 bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-300 font-semibold rounded-lg flex items-center gap-1.5">
                    {b}
                    <button type="button" onClick={() => handleRemoveBlocker(b)} className="text-purple-400 hover:text-white font-bold">×</button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Thoughts Notes */}
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-2">
              Reflection notes (thoughts/learnings):
            </label>
            <textarea
              value={notesInput}
              onChange={(e) => setNotesInput(e.target.value)}
              placeholder="What worked? What didn't? Focus improvements..."
              rows={3}
              required
              className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none resize-none"
              style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitReflection.isPending}
            className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', boxShadow: '0 4px 15px rgba(108,99,255,0.2)' }}
          >
            {submitReflection.isPending ? 'Saving daily reflection...' : 'Save Daily Reflection'}
          </button>

        </form>
      </div>

    </div>
  )
}
