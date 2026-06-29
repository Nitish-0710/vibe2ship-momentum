import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 space-y-5">
      <div className="text-6xl">🔍</div>
      <h1 className="text-3xl font-extrabold text-white tracking-tight">404 — Page Not Found</h1>
      <p className="max-w-md text-sm" style={{ color: 'var(--color-text-muted)' }}>
        The page you are looking for does not exist or has been moved. Let's get you back on track.
      </p>
      <Link
        to={ROUTES.DASHBOARD}
        className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #6c63ff, #a78bfa)', boxShadow: '0 4px 20px rgba(108,99,255,0.2)' }}
      >
        Go to Dashboard
      </Link>
    </div>
  )
}
