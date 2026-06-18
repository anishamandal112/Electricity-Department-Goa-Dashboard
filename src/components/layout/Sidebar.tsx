import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Gauge,
  Zap,
  Receipt,
  ShoppingCart,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { NavItem } from '../../types'

const NAV_ITEMS: NavItem[] = [
  { icon: LayoutDashboard, label: 'Overview', path: '/overview' },
  { icon: ShoppingCart, label: 'Procurement & Finance', path: '/procurement-finance' },
  { icon: Zap, label: 'Distribution Operations', path: '/distribution-ops' },
  { icon: Gauge, label: 'Meter Management', path: '/meter-management' },
  { icon: Receipt, label: 'Revenue & Billing', path: '/revenue-billing' },
  { icon: Users, label: 'Consumer Services & Grievances', path: '/consumer-services' },
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
      <div className={`flex items-center border-b border-border-base shrink-0 ${collapsed ? 'justify-center py-3 px-2' : 'gap-3 py-4 px-4'}`}>
        <img
          src="/goa-logo.png"
          alt="Government of Goa"
          className={`object-contain shrink-0 transition-all duration-200 ${collapsed ? 'w-8 h-8' : 'w-10 h-10'}`}
        />
        {!collapsed && (
          <div>
            <p className="text-[12px] font-bold text-text-primary leading-tight">Electricity Department</p>
            <p className="text-[10px] text-text-secondary mt-0.5">Government of Goa</p>
          </div>
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
