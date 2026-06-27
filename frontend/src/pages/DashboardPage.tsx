import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'

/**
 * Dashboard placeholder page.
 * Phase 1 scope: only shows authenticated user info + logout.
 * Full dashboard implementation is Phase 2.
 */
export default function DashboardPage() {
  const { firebaseUser, userProfile, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  const displayName = userProfile?.name || firebaseUser?.displayName || firebaseUser?.email || 'User'

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div
          className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl"
          style={{ background: 'radial-gradient(circle, #6c63ff, transparent)' }}
        />
      </div>

      <div className="relative text-center max-w-lg">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 mb-10">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
          >
            M
          </div>
          <span className="text-2xl font-bold gradient-text">Momentum</span>
        </div>

        <div className="glass rounded-2xl p-10">
          {/* Avatar */}
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-5"
            style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
          >
            {displayName.charAt(0).toUpperCase()}
          </div>

          <h1 className="text-2xl font-bold text-white mb-2">
            Welcome, {displayName}!
          </h1>
          <p className="text-sm mb-2" style={{ color: 'var(--color-text-muted)' }}>
            {firebaseUser?.email}
          </p>
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium mb-8"
            style={{
              backgroundColor: 'rgba(108,99,255,0.15)',
              border: '1px solid rgba(108,99,255,0.3)',
              color: '#a78bfa',
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Authenticated
          </div>

          <div
            className="rounded-xl p-4 mb-8 text-sm text-left"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
            }}
          >
            <p className="font-medium text-white mb-1">🚀 Phase 1 Complete</p>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Authentication is working. The full dashboard will be implemented in Phase 2.
            </p>
          </div>

          <button
            id="btn-logout"
            onClick={handleLogout}
            className="w-full py-3 px-6 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}
