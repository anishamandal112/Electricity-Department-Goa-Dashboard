import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Gauge,
  Zap,
  Receipt,
  ShoppingCart,
  Building2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { NavItem } from '../../types'

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview', path: '/overview' },
  { icon: Users, label: 'Consumer Services & Grievances', path: '/consumer-services' },
  { icon: Gauge, label: 'Meter Management', path: '/meter-management' },
  { icon: Zap, label: 'Distribution Operations', path: '/distribution-ops' },
  { icon: Receipt, label: 'Revenue & Billing', path: '/revenue-billing' },
  { icon: ShoppingCart, label: 'Procurement & Finance', path: '/procurement-finance' },
  { icon: Building2, label: 'Infrastructure & Assets', path: '/infrastructure-assets' },
]

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-surface border-r border-border-base flex flex-col transition-all duration-200 z-20 ${
        collapsed ? 'w-16' : 'w-60'
      }`}
    >
      <div className="h-8 border-b border-border-base flex items-center px-4 shrink-0">
        {!collapsed && (
          <span className="text-[11px] font-bold text-text-primary tracking-widest uppercase">
            GED
          </span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            title={collapsed ? label : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 text-[13px] transition-colors ${
                isActive
                  ? 'bg-blue-50 text-primary font-medium border-r-2 border-primary'
                  : 'text-text-secondary hover:bg-gray-50 hover:text-text-primary'
              }`
            }
          >
            <Icon size={16} className="shrink-0" />
            {!collapsed && <span className="truncate">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button
        onClick={onToggle}
        className="h-10 border-t border-border-base flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-gray-50 transition-colors shrink-0"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
    </aside>
  )
}
