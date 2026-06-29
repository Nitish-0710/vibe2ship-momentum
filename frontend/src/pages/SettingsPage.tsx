import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'

export default function SettingsPage() {
  const { userProfile, updateProfileSettings } = useAuth()

  const [name, setName] = useState('')
  const [occupation, setOccupation] = useState('')
  const [timezone, setTimezone] = useState('UTC')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [sleepTime, setSleepTime] = useState('23:00')
  const [defaultDuration, setDefaultDuration] = useState('60')
  const [theme, setTheme] = useState('dark')
  
  const [isSaving, setIsSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // Load from context on load
  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '')
      setOccupation(userProfile.occupation || '')
      setTimezone(userProfile.timezone || 'UTC')
      setWakeTime(userProfile.wakeTime || '07:00')
      setSleepTime(userProfile.sleepTime || '23:00')
      
      const prefs = userProfile.preferences || {}
      setDefaultDuration(String(prefs.defaultDuration || '60'))
      setTheme(String(prefs.theme || 'dark'))
    }
  }, [userProfile])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    setSuccessMsg(null)
    setErrorMsg(null)

    try {
      await updateProfileSettings({
        name,
        occupation,
        timezone,
        wakeTime,
        sleepTime,
        preferences: {
          defaultDuration: parseInt(defaultDuration, 10),
          theme,
        },
      })
      setSuccessMsg('Settings saved successfully and synced to Firestore.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save settings.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      
      {/* Top Header */}
      <div className="border-b border-[#252530] pb-4">
        <h1 className="text-2xl font-bold text-white">◈ Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
          Configure user profile details, study windows, and planning preferences.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-xs text-green-400">
          ✓ {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-400">
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Settings Form */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* Profile Card */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">User Profile</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Occupation / Study focus</label>
              <input
                type="text"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="e.g., Computer Science Student"
                className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
              style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              {['UTC', 'IST', 'EST', 'PST', 'GMT', 'CET'].map((tz) => (
                <option key={tz} value={tz} className="bg-[#12121b]">{tz}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Working & Focus Hours Card */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Working Hours</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Wake Time</label>
              <input
                type="time"
                value={wakeTime}
                onChange={(e) => setWakeTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Sleep Time</label>
              <input
                type="time"
                value={sleepTime}
                onChange={(e) => setSleepTime(e.target.value)}
                required
                className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              />
            </div>
          </div>
        </div>

        {/* AI & Dashboard preferences */}
        <div className="glass rounded-2xl p-6 space-y-4">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">AI Preferences</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Default Block Duration (min)</label>
              <select
                value={defaultDuration}
                onChange={(e) => setDefaultDuration(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              >
                {['30', '45', '60', '90', '120'].map((d) => (
                  <option key={d} value={d} className="bg-[#12121b]">{d} minutes</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs outline-none"
                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              >
                <option value="dark" className="bg-[#12121b]">Vibrant Dark (Recommended)</option>
                <option value="light" className="bg-[#12121b]">Light</option>
              </select>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-2.5 rounded-xl text-xs font-semibold text-white transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', boxShadow: '0 4px 15px rgba(108,99,255,0.2)' }}
        >
          {isSaving ? 'Saving changes...' : 'Save Settings'}
        </button>

      </form>

    </div>
  )
}
