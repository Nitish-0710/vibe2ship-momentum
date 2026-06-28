import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/common/Sidebar'
import Header from '@/components/common/Header'
import QuickAddTask from '@/components/tasks/QuickAddTask'

/**
 * DashboardLayout.
 * Sidebar + Header + main content area (rendered by nested routes via <Outlet>).
 * Owns the QuickAdd modal so it is accessible from any nested page.
 */
export default function DashboardLayout() {
  const [quickAddOpen, setQuickAddOpen] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--color-bg)' }}>
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header onQuickAdd={() => setQuickAddOpen(true)} />

        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>

      {quickAddOpen && <QuickAddTask onClose={() => setQuickAddOpen(false)} />}
    </div>
  )
}
