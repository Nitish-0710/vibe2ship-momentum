import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'

interface HeaderProps {
  onQuickAdd: () => void
}

export default function Header({ onQuickAdd }: HeaderProps) {
  const { firebaseUser, userProfile, logout } = useAuth()
  const navigate = useNavigate()

  const displayName = userProfile?.name || firebaseUser?.displayName || firebaseUser?.email?.split('@')[0] || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate(ROUTES.LOGIN, { replace: true })
  }

  return (
    <header
      className="flex items-center justify-between px-6 h-16 shrink-0"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      {/* Left — page title slot (filled by parent via context or prop in future) */}
      <div />

      {/* Right — actions */}
      <div className="flex items-center gap-3">
        {/* Quick Add */}
        <button
          id="btn-quick-add"
          onClick={onQuickAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all duration-150 hover:scale-[1.02] active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', boxShadow: '0 2px 12px rgba(108,99,255,0.3)' }}
        >
          <span className="text-base leading-none">+</span>
          Add Task
        </button>

        {/* User menu */}
        <div className="relative group">
          <button
            id="btn-user-menu"
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl transition-colors duration-150 hover:bg-white/5"
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
            >
              {initial}
            </div>
            <span className="text-sm font-medium text-white hidden sm:block max-w-32 truncate">
              {displayName}
            </span>
          </button>

          {/* Dropdown */}
          <div
            className="absolute right-0 top-full mt-1 w-44 rounded-xl py-1 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-150 z-50"
            style={{
              backgroundColor: 'var(--color-surface-2)',
              border: '1px solid var(--color-border)',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <div className="px-3 py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
              <p className="text-xs font-medium text-white truncate">{displayName}</p>
              <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                {firebaseUser?.email}
              </p>
            </div>
            <button
              id="btn-logout"
              onClick={handleLogout}
              className="w-full text-left px-3 py-2 text-sm transition-colors hover:bg-white/5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
