import { NavLink } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

interface NavItem {
  label: string
  icon: string
  to?: string
  disabled?: boolean
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', icon: '⬡', to: ROUTES.DASHBOARD },
  { label: 'Tasks', icon: '✓', to: ROUTES.TASKS },
  { label: 'Planner', icon: '⚡', disabled: true },
  { label: 'Analytics', icon: '◎', disabled: true },
  { label: 'Settings', icon: '◈', disabled: true },
]

export default function Sidebar() {
  return (
    <aside
      className="flex flex-col w-60 shrink-0 h-screen sticky top-0"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 h-16 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)' }}
        >
          M
        </div>
        <span className="font-bold text-base gradient-text">Momentum</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          if (item.disabled) {
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-not-allowed select-none"
                style={{ color: 'var(--color-text-muted)', opacity: 0.4 }}
                title="Coming in a future phase"
              >
                <span className="w-4 text-center">{item.icon}</span>
                {item.label}
                <span
                  className="ml-auto text-xs px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
                >
                  soon
                </span>
              </div>
            )
          }
          return (
            <NavLink
              key={item.label}
              to={item.to!}
              end={item.to === ROUTES.DASHBOARD}
              className={({ isActive }) =>
                [
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'text-white'
                    : 'hover:text-white',
                ].join(' ')
              }
              style={({ isActive }) => ({
                backgroundColor: isActive ? 'rgba(108,99,255,0.15)' : 'transparent',
                color: isActive ? '#a78bfa' : 'var(--color-text-muted)',
                border: isActive ? '1px solid rgba(108,99,255,0.25)' : '1px solid transparent',
              })}
            >
              <span className="w-4 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          )
        })}
      </nav>

      {/* Footer */}
      <div
        className="px-5 py-4 text-xs shrink-0"
        style={{ color: 'var(--color-text-muted)', borderTop: '1px solid var(--color-border)' }}
      >
        Phase 2 — Dashboard
      </div>
    </aside>
  )
}
