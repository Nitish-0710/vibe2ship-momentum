import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { ROUTES } from '@/constants/routes'
import LoadingSpinner from './LoadingSpinner'

/**
 * ProtectedRoute wraps all routes that require authentication.
 * - While loading: shows spinner (prevents flash of redirect)
 * - If unauthenticated: redirects to /login, preserving attempted URL
 * - If authenticated: renders child routes via <Outlet />
 */
export default function ProtectedRoute() {
  const { firebaseUser, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <LoadingSpinner />
  }

  if (!firebaseUser) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />
  }

  return <Outlet />
}
