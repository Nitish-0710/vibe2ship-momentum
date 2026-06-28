import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import DashboardLayout from '@/layouts/DashboardLayout'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP} element={<SignupPage />} />

      {/* Protected routes — wrapped in DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.TASKS} element={<DashboardPage />} />
        </Route>
      </Route>

      {/* Default redirect */}
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  )
}
