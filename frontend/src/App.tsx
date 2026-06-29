import { Routes, Route, Navigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import ProtectedRoute from '@/components/common/ProtectedRoute'
import DashboardLayout from '@/layouts/DashboardLayout'
import LoginPage from '@/pages/LoginPage'
import SignupPage from '@/pages/SignupPage'
import DashboardPage from '@/pages/DashboardPage'
import PlannerPage from '@/pages/PlannerPage'
import AnalyticsPage from '@/pages/AnalyticsPage'
import ReflectionPage from '@/pages/ReflectionPage'
import SettingsPage from '@/pages/SettingsPage'
import NotFoundPage from '@/pages/NotFoundPage'

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.SIGNUP} element={<SignupPage />} />

      {/* Protected routes — wrapped in DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
          <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTES.TASKS} element={<DashboardPage />} />
          <Route path={ROUTES.PLANNER} element={<PlannerPage />} />
          <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
          <Route path={ROUTES.REFLECTION} element={<ReflectionPage />} />
          <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
          
          {/* Unmatched routes inside layout */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  )
}
