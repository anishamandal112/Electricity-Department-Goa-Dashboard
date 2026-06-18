import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'

export function AppShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main
        className={`min-h-screen transition-all duration-200 ${
          collapsed ? 'ml-16' : 'ml-60'
        }`}
      >
        <Outlet />
      </main>
    </div>
  )
}
