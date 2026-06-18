# GED Executive Analytics Dashboard — Application Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the complete application shell — routing, collapsible sidebar, global filter state, reusable UI components, and 7 module page scaffolds.

**Architecture:** Feature-sliced structure: each module owns `src/modules/<name>/`, shared components in `src/components/`, global filter state in a single Zustand store. All 7 module pages inherit a 4-section template (KPIs → Analytics → Data Table → Insights).

**Tech Stack:** React 18 + Vite + TypeScript, Tailwind CSS v3, React Router v6, Zustand, Recharts, Lucide React, DM Sans (Google Fonts), Vitest + React Testing Library

## Global Constraints

- Node.js 18+ required
- TypeScript strict mode enabled
- Tailwind color tokens (exact hex): `background #F8FAFC`, `surface #FFFFFF`, `border-base #E5E7EB`, `primary #2563EB`, `success #16A34A`, `warning #F59E0B`, `error #DC2626`, `text-primary #111827`, `text-secondary #6B7280`
- Font: DM Sans from Google Fonts only — no other font
- Icons: Lucide React only
- Card standard: `bg-surface border border-border-base rounded-xl shadow-sm`
- No colored card backgrounds unless representing status
- Sidebar collapse state lives in AppShell via `useState` (not Zustand)
- Zustand store holds filter state only
- All routes are children of AppShell via `<Outlet />`
- Desktop-first — no responsive/mobile breakpoints at this phase
- Project root: `c:\Users\asus tuf\OneDrive\Desktop\ED_GOA_Dashboard`

---

## File Map

```
[root]/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── tsconfig.node.json
├── tailwind.config.js
├── postcss.config.js
└── src/
    ├── index.css
    ├── main.tsx
    ├── App.tsx
    ├── test/
    │   └── setup.ts
    ├── types/
    │   └── index.ts
    ├── store/
    │   ├── filterStore.ts
    │   └── filterStore.test.ts
    ├── components/
    │   ├── layout/
    │   │   ├── AppShell.tsx
    │   │   ├── Sidebar.tsx
    │   │   ├── Sidebar.test.tsx
    │   │   └── TopBar.tsx
    │   ├── ui/
    │   │   ├── PageHeader.tsx
    │   │   ├── SectionContainer.tsx
    │   │   ├── KpiCard.tsx
    │   │   ├── KpiCard.test.tsx
    │   │   ├── ChartCard.tsx
    │   │   └── DataTableCard.tsx
    │   └── filters/
    │       ├── GlobalFilterBar.tsx
    │       └── GlobalFilterBar.test.tsx
    └── modules/
        ├── overview/OverviewPage.tsx
        ├── consumer-services/ConsumerServicesPage.tsx
        ├── meter-management/MeterManagementPage.tsx
        ├── distribution-ops/DistributionOpsPage.tsx
        ├── revenue-billing/RevenueBillingPage.tsx
        ├── procurement-finance/ProcurementFinancePage.tsx
        └── infrastructure-assets/InfrastructureAssetsPage.tsx
```

---

## Task 1: Project Bootstrap

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `tsconfig.node.json`
- Create: `tailwind.config.js`
- Create: `postcss.config.js`
- Create: `index.html`
- Create: `src/index.css`
- Create: `src/test/setup.ts`

**Interfaces:**
- Produces: working `npm run dev` and `npm test` commands

- [ ] **Step 1: Create package.json**

```json
{
  "name": "ged-dashboard",
  "private": true,
  "version": "0.0.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "lucide-react": "^0.400.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.24.0",
    "recharts": "^2.12.7",
    "zustand": "^4.5.4"
  },
  "devDependencies": {
    "@testing-library/jest-dom": "^6.4.6",
    "@testing-library/react": "^16.0.0",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.19",
    "jsdom": "^24.1.0",
    "postcss": "^8.4.39",
    "tailwindcss": "^3.4.4",
    "typescript": "^5.4.5",
    "vite": "^5.3.1",
    "vitest": "^1.6.0"
  }
}
```

- [ ] **Step 2: Create vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
  },
})
```

- [ ] **Step 3: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

- [ ] **Step 4: Create tsconfig.node.json**

```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true
  },
  "include": ["vite.config.ts"]
}
```

- [ ] **Step 5: Create tailwind.config.js**

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#F8FAFC',
        surface: '#FFFFFF',
        'border-base': '#E5E7EB',
        primary: '#2563EB',
        success: '#16A34A',
        warning: '#F59E0B',
        error: '#DC2626',
        'text-primary': '#111827',
        'text-secondary': '#6B7280',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

- [ ] **Step 6: Create postcss.config.js**

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

- [ ] **Step 7: Create index.html**

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet" />
    <title>GED Executive Analytics Dashboard</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 8: Create src/index.css**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: 'DM Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

- [ ] **Step 9: Create src/test/setup.ts**

```ts
import '@testing-library/jest-dom'
```

- [ ] **Step 10: Install dependencies**

Run: `npm install`

Expected: `node_modules/` created, no errors.

- [ ] **Step 11: Commit**

```bash
git init
git add package.json vite.config.ts tsconfig.json tsconfig.node.json tailwind.config.js postcss.config.js index.html src/index.css src/test/setup.ts
git commit -m "chore: bootstrap Vite + React + Tailwind + Vitest project"
```

---

## Task 2: Types & Filter Store

**Files:**
- Create: `src/types/index.ts`
- Create: `src/store/filterStore.ts`
- Create: `src/store/filterStore.test.ts`

**Interfaces:**
- Produces: `useFilterStore` hook exported from `src/store/filterStore.ts`
- Produces: `KpiCardProps`, `ChartCardProps`, `DataTableCardProps`, `Column`, `SectionContainerProps`, `PageHeaderProps`, `NavItem` exported from `src/types/index.ts`

- [ ] **Step 1: Write failing filter store test**

Create `src/store/filterStore.test.ts`:

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useFilterStore } from './filterStore'

describe('filterStore', () => {
  beforeEach(() => {
    act(() => { useFilterStore.getState().resetFilters() })
  })

  it('has correct defaults', () => {
    const s = useFilterStore.getState()
    expect(s.financialYear).toBe('2024-25')
    expect(s.month).toBe('All')
    expect(s.circle).toBe('All')
    expect(s.division).toBe('All')
    expect(s.subdivision).toBe('All')
  })

  it('setFilter updates a single key', () => {
    act(() => { useFilterStore.getState().setFilter('month', 'April') })
    const s = useFilterStore.getState()
    expect(s.month).toBe('April')
    expect(s.circle).toBe('All')
  })

  it('resetFilters restores defaults', () => {
    act(() => {
      useFilterStore.getState().setFilter('month', 'June')
      useFilterStore.getState().setFilter('circle', 'North Goa')
    })
    act(() => { useFilterStore.getState().resetFilters() })
    const s = useFilterStore.getState()
    expect(s.month).toBe('All')
    expect(s.circle).toBe('All')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npm test`

Expected: FAIL — `Cannot find module './filterStore'`

- [ ] **Step 3: Create src/types/index.ts**

```ts
export interface NavItem {
  icon: React.ComponentType<{ size?: number; className?: string }>
  label: string
  path: string
}

export interface KpiCardProps {
  label: string
  value: string
  trend: string
  trendDirection: 'up' | 'down' | 'neutral'
  trendIsPositive: boolean
  comparisonLabel: string
}

export interface ChartCardProps {
  title: string
  timeContext?: string
  children: React.ReactNode
}

export interface Column {
  key: string
  label: string
}

export interface DataTableCardProps {
  title: string
  columns: Column[]
  data: Record<string, unknown>[]
}

export interface SectionContainerProps {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}

export interface PageHeaderProps {
  title: string
  subtitle?: string
}
```

- [ ] **Step 4: Create src/store/filterStore.ts**

```ts
import { create } from 'zustand'

type FilterKey = 'financialYear' | 'month' | 'circle' | 'division' | 'subdivision'

interface FilterState {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
  setFilter: (key: FilterKey, value: string) => void
  resetFilters: () => void
}

const defaults = {
  financialYear: '2024-25',
  month: 'All',
  circle: 'All',
  division: 'All',
  subdivision: 'All',
}

export const useFilterStore = create<FilterState>((set) => ({
  ...defaults,
  setFilter: (key, value) => set({ [key]: value }),
  resetFilters: () => set(defaults),
}))
```

- [ ] **Step 5: Run tests to confirm they pass**

Run: `npm test`

Expected: 3 passing tests in `filterStore.test.ts`

- [ ] **Step 6: Commit**

```bash
git add src/types/index.ts src/store/filterStore.ts src/store/filterStore.test.ts
git commit -m "feat: add TypeScript types and Zustand filter store"
```

---

## Task 3: Layout Components

**Files:**
- Create: `src/components/layout/TopBar.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Sidebar.test.tsx`
- Create: `src/components/layout/AppShell.tsx`

**Interfaces:**
- Consumes: `NavItem` from `src/types/index.ts`
- Produces: `<AppShell />` (root layout, wraps `<Outlet />`), `<Sidebar collapsed onToggle />`, `<TopBar />`

- [ ] **Step 1: Write failing Sidebar test**

Create `src/components/layout/Sidebar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'

const renderSidebar = (collapsed = false) =>
  render(
    <MemoryRouter>
      <Sidebar collapsed={collapsed} onToggle={() => {}} />
    </MemoryRouter>
  )

describe('Sidebar', () => {
  it('renders all 7 nav item labels when expanded', () => {
    renderSidebar(false)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Consumer Services & Grievances')).toBeInTheDocument()
    expect(screen.getByText('Meter Management')).toBeInTheDocument()
    expect(screen.getByText('Distribution Operations')).toBeInTheDocument()
    expect(screen.getByText('Revenue & Billing')).toBeInTheDocument()
    expect(screen.getByText('Procurement & Finance')).toBeInTheDocument()
    expect(screen.getByText('Infrastructure & Assets')).toBeInTheDocument()
  })

  it('hides nav labels when collapsed', () => {
    renderSidebar(true)
    expect(screen.queryByText('Overview')).not.toBeInTheDocument()
  })

  it('renders collapse toggle button', () => {
    renderSidebar(false)
    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npm test`

Expected: FAIL — `Cannot find module './Sidebar'`

- [ ] **Step 3: Create src/components/layout/TopBar.tsx**

```tsx
export function TopBar() {
  return (
    <div className="h-8 bg-surface border-b border-border-base flex items-center px-6">
      <span className="text-[11px] font-semibold text-text-secondary tracking-widest uppercase">
        Goa Electricity Department — Executive Analytics Dashboard
      </span>
    </div>
  )
}
```

- [ ] **Step 4: Create src/components/layout/Sidebar.tsx**

```tsx
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
```

- [ ] **Step 5: Create src/components/layout/AppShell.tsx**

```tsx
import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'

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
        <TopBar />
        <Outlet />
      </main>
    </div>
  )
}
```

- [ ] **Step 6: Run tests to confirm they pass**

Run: `npm test`

Expected: 3 Sidebar tests passing + 3 filterStore tests passing = 6 total

- [ ] **Step 7: Commit**

```bash
git add src/components/layout/
git commit -m "feat: add AppShell, Sidebar, and TopBar layout components"
```

---

## Task 4: UI Primitive Components

**Files:**
- Create: `src/components/ui/PageHeader.tsx`
- Create: `src/components/ui/SectionContainer.tsx`
- Create: `src/components/ui/KpiCard.tsx`
- Create: `src/components/ui/KpiCard.test.tsx`
- Create: `src/components/ui/ChartCard.tsx`
- Create: `src/components/ui/DataTableCard.tsx`

**Interfaces:**
- Consumes: `KpiCardProps`, `ChartCardProps`, `DataTableCardProps`, `SectionContainerProps`, `PageHeaderProps` from `src/types/index.ts`
- Produces: all 5 components for use by module pages

- [ ] **Step 1: Write failing KpiCard test**

Create `src/components/ui/KpiCard.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from './KpiCard'

const base = {
  label: 'AT&C Loss',
  value: '12.4%',
  trend: '1.2%',
  trendDirection: 'down' as const,
  trendIsPositive: true,
  comparisonLabel: 'vs Last Month',
}

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard {...base} />)
    expect(screen.getByText('AT&C Loss')).toBeInTheDocument()
    expect(screen.getByText('12.4%')).toBeInTheDocument()
  })

  it('renders down arrow for trendDirection down', () => {
    render(<KpiCard {...base} />)
    expect(screen.getByText(/↓/)).toBeInTheDocument()
  })

  it('renders up arrow for trendDirection up', () => {
    render(<KpiCard {...base} trendDirection="up" />)
    expect(screen.getByText(/↑/)).toBeInTheDocument()
  })

  it('applies success color when trendIsPositive', () => {
    const { container } = render(<KpiCard {...base} trendIsPositive={true} />)
    const trendEl = container.querySelector('.text-success')
    expect(trendEl).toBeInTheDocument()
  })

  it('applies error color when not trendIsPositive', () => {
    const { container } = render(<KpiCard {...base} trendIsPositive={false} />)
    const trendEl = container.querySelector('.text-error')
    expect(trendEl).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npm test`

Expected: FAIL — `Cannot find module './KpiCard'`

- [ ] **Step 3: Create src/components/ui/PageHeader.tsx**

```tsx
import type { PageHeaderProps } from '../../types'

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="px-6 pt-5 pb-3">
      <h1 className="text-[28px] font-bold text-text-primary leading-tight">{title}</h1>
      {subtitle && (
        <p className="text-[13px] text-text-secondary mt-1">{subtitle}</p>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Create src/components/ui/SectionContainer.tsx**

```tsx
import type { SectionContainerProps } from '../../types'

export function SectionContainer({ title, children, action }: SectionContainerProps) {
  return (
    <section className="px-6 mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-[20px] font-semibold text-text-primary">{title}</h2>
        {action && <div>{action}</div>}
      </div>
      {children}
    </section>
  )
}
```

- [ ] **Step 5: Create src/components/ui/KpiCard.tsx**

```tsx
import type { KpiCardProps } from '../../types'

export function KpiCard({
  label,
  value,
  trend,
  trendDirection,
  trendIsPositive,
  comparisonLabel,
}: KpiCardProps) {
  const arrow =
    trendDirection === 'down' ? '↓' : trendDirection === 'up' ? '↑' : '→'

  const trendColor = trendIsPositive ? 'text-success' : 'text-error'
  const neutralTrend = trendDirection === 'neutral'

  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4 min-h-[100px] flex flex-col justify-between">
      <p className="text-[13px] font-semibold text-text-secondary truncate">{label}</p>
      <p className="text-[26px] font-bold text-text-primary leading-none mt-1">{value}</p>
      <p className={`text-[12px] mt-1 ${neutralTrend ? 'text-text-secondary' : trendColor}`}>
        {arrow} {trend}{' '}
        <span className="text-text-secondary font-normal">{comparisonLabel}</span>
      </p>
    </div>
  )
}
```

- [ ] **Step 6: Create src/components/ui/ChartCard.tsx**

```tsx
import type { ChartCardProps } from '../../types'

export function ChartCard({ title, timeContext, children }: ChartCardProps) {
  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4">
      <div className="mb-3">
        <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
        {timeContext && (
          <p className="text-[12px] text-text-secondary mt-0.5">{timeContext}</p>
        )}
      </div>
      <div className="min-h-[220px]">{children}</div>
    </div>
  )
}
```

- [ ] **Step 7: Create src/components/ui/DataTableCard.tsx**

```tsx
import type { DataTableCardProps } from '../../types'

export function DataTableCard({ title, columns, data }: DataTableCardProps) {
  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm">
      <div className="px-4 py-3 border-b border-border-base">
        <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-base bg-background">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-text-secondary text-[13px]"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border-base last:border-0 hover:bg-background transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-2.5 text-text-primary">
                      {String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Run tests to confirm they pass**

Run: `npm test`

Expected: 5 KpiCard tests + 3 Sidebar tests + 3 filterStore tests = 11 passing

- [ ] **Step 9: Commit**

```bash
git add src/components/ui/
git commit -m "feat: add PageHeader, SectionContainer, KpiCard, ChartCard, DataTableCard"
```

---

## Task 5: GlobalFilterBar

**Files:**
- Create: `src/components/filters/GlobalFilterBar.tsx`
- Create: `src/components/filters/GlobalFilterBar.test.tsx`

**Interfaces:**
- Consumes: `useFilterStore` from `src/store/filterStore.ts`
- Produces: `<GlobalFilterBar />` — sticky filter bar with 5 selects

- [ ] **Step 1: Write failing GlobalFilterBar test**

Create `src/components/filters/GlobalFilterBar.test.tsx`:

```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { GlobalFilterBar } from './GlobalFilterBar'
import { useFilterStore } from '../../store/filterStore'
import { act } from '@testing-library/react'

describe('GlobalFilterBar', () => {
  beforeEach(() => {
    act(() => { useFilterStore.getState().resetFilters() })
  })

  it('renders all 5 filter selects', () => {
    render(<GlobalFilterBar />)
    expect(screen.getByRole('combobox', { name: 'Financial Year' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Month' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Circle' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Division' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Subdivision' })).toBeInTheDocument()
  })

  it('defaults financial year to 2024-25', () => {
    render(<GlobalFilterBar />)
    const sel = screen.getByRole('combobox', { name: 'Financial Year' }) as HTMLSelectElement
    expect(sel.value).toBe('2024-25')
  })

  it('updates store when month changes', async () => {
    render(<GlobalFilterBar />)
    const sel = screen.getByRole('combobox', { name: 'Month' })
    await userEvent.selectOptions(sel, 'April')
    expect(useFilterStore.getState().month).toBe('April')
  })
})
```

- [ ] **Step 2: Run test to confirm it fails**

Run: `npm test`

Expected: FAIL — `Cannot find module './GlobalFilterBar'`

- [ ] **Step 3: Create src/components/filters/GlobalFilterBar.tsx**

```tsx
import { useFilterStore } from '../../store/filterStore'

const FINANCIAL_YEARS = ['2022-23', '2023-24', '2024-25', '2025-26']
const MONTHS = [
  'All', 'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March',
]
const CIRCLES = ['All', 'North Goa', 'South Goa']
const DIVISIONS = ['All', 'Panaji', 'Mapusa', 'Margao', 'Vasco', 'Ponda', 'Bicholim']
const SUBDIVISIONS = [
  'All', 'Panaji-1', 'Panaji-2', 'Mapusa-1', 'Margao-1', 'Margao-2', 'Vasco-1',
]

const selectCls =
  'text-[13px] border border-border-base rounded-lg px-3 py-1.5 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer'

export function GlobalFilterBar() {
  const { financialYear, month, circle, division, subdivision, setFilter, resetFilters } =
    useFilterStore()

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border-base px-6 py-2.5 flex items-center gap-3 flex-wrap">
      <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide shrink-0">
        Filters
      </span>

      <select
        value={financialYear}
        onChange={(e) => setFilter('financialYear', e.target.value)}
        className={selectCls}
        aria-label="Financial Year"
      >
        {FINANCIAL_YEARS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      <select
        value={month}
        onChange={(e) => setFilter('month', e.target.value)}
        className={selectCls}
        aria-label="Month"
      >
        {MONTHS.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <select
        value={circle}
        onChange={(e) => setFilter('circle', e.target.value)}
        className={selectCls}
        aria-label="Circle"
      >
        {CIRCLES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={division}
        onChange={(e) => setFilter('division', e.target.value)}
        className={selectCls}
        aria-label="Division"
      >
        {DIVISIONS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        value={subdivision}
        onChange={(e) => setFilter('subdivision', e.target.value)}
        className={selectCls}
        aria-label="Subdivision"
      >
        {SUBDIVISIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <button
        onClick={resetFilters}
        className="ml-auto text-[12px] text-text-secondary hover:text-primary transition-colors"
      >
        Reset
      </button>
    </div>
  )
}
```

- [ ] **Step 4: Run tests to confirm they pass**

Run: `npm test`

Expected: 3 GlobalFilterBar + 5 KpiCard + 3 Sidebar + 3 filterStore = 14 passing

- [ ] **Step 5: Commit**

```bash
git add src/components/filters/
git commit -m "feat: add GlobalFilterBar with Zustand integration"
```

---

## Task 6: Module Page Scaffolds

**Files:**
- Create: `src/modules/overview/OverviewPage.tsx`
- Create: `src/modules/consumer-services/ConsumerServicesPage.tsx`
- Create: `src/modules/meter-management/MeterManagementPage.tsx`
- Create: `src/modules/distribution-ops/DistributionOpsPage.tsx`
- Create: `src/modules/revenue-billing/RevenueBillingPage.tsx`
- Create: `src/modules/procurement-finance/ProcurementFinancePage.tsx`
- Create: `src/modules/infrastructure-assets/InfrastructureAssetsPage.tsx`

**Interfaces:**
- Consumes: `PageHeader`, `GlobalFilterBar`, `SectionContainer`, `KpiCard`, `ChartCard`, `DataTableCard`
- Produces: 7 routable page components

- [ ] **Step 1: Create src/modules/overview/OverviewPage.tsx**

```tsx
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'AT&C Loss', value: '12.4%', trend: '1.2%', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Energy Input (MU)', value: '142.3', trend: '3.1 MU', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Collection Efficiency', value: '96.8%', trend: '0.4%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Billing Efficiency', value: '94.2%', trend: '0.8%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'circle', label: 'Circle' },
  { key: 'atcLoss', label: 'AT&C Loss' },
  { key: 'collectionEff', label: 'Collection Eff.' },
  { key: 'billingEff', label: 'Billing Eff.' },
  { key: 'status', label: 'Status' },
]

const ChartPlaceholder = ({ label }: { label: string }) => (
  <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
    {label}
  </div>
)

export function OverviewPage() {
  return (
    <div>
      <PageHeader title="Overview" subtitle="Department-wide performance summary" />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="Key Metrics">
          <div className="grid grid-cols-4 gap-4">
            {KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>
        <SectionContainer title="Analytics">
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="AT&C Loss Trend" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Line Chart — AT&C Loss" />
            </ChartCard>
            <ChartCard title="Energy Input vs Energy Sold" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Bar Chart — Energy Input / Sold" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Division-wise Performance">
          <DataTableCard title="Circle Summary" columns={COLUMNS} data={[]} />
        </SectionContainer>
        <SectionContainer title="Insights & Exceptions">
          <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4 text-[13px] text-text-secondary">
            No exceptions flagged for the selected period.
          </div>
        </SectionContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create src/modules/consumer-services/ConsumerServicesPage.tsx**

```tsx
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'Total Consumers', value: '2,86,420', trend: '1,243', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'new this month' },
  { label: 'New Connections', value: '1,243', trend: '87', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Pending Grievances', value: '347', trend: '62', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Avg Resolution (Days)', value: '4.2', trend: '0.8 days', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'division', label: 'Division' },
  { key: 'consumers', label: 'Total Consumers' },
  { key: 'newConn', label: 'New Connections' },
  { key: 'grievances', label: 'Grievances' },
  { key: 'resolved', label: 'Resolved %' },
]

const ChartPlaceholder = ({ label }: { label: string }) => (
  <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
    {label}
  </div>
)

export function ConsumerServicesPage() {
  return (
    <div>
      <PageHeader title="Consumer Services & Grievances" subtitle="Consumer base, new connections, and grievance resolution" />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="Key Metrics">
          <div className="grid grid-cols-4 gap-4">
            {KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>
        <SectionContainer title="Analytics">
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="New Connections by Month" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Bar Chart — New Connections" />
            </ChartCard>
            <ChartCard title="Grievance Status Breakdown" timeContext="Current Month">
              <ChartPlaceholder label="Donut Chart — Grievance Status" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Division-wise Consumer Data">
          <DataTableCard title="Consumer Summary by Division" columns={COLUMNS} data={[]} />
        </SectionContainer>
        <SectionContainer title="Insights & Exceptions">
          <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4 text-[13px] text-text-secondary">
            No exceptions flagged for the selected period.
          </div>
        </SectionContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create src/modules/meter-management/MeterManagementPage.tsx**

```tsx
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'Smart Meter Coverage', value: '34.8%', trend: '2.1%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Total Meters', value: '2,86,420', trend: '1,243', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Faulty Meters', value: '1,842', trend: '214', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Reading Efficiency', value: '98.2%', trend: '0.3%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'division', label: 'Division' },
  { key: 'totalMeters', label: 'Total Meters' },
  { key: 'smartMeters', label: 'Smart Meters' },
  { key: 'coverage', label: 'Coverage %' },
  { key: 'faulty', label: 'Faulty' },
]

const ChartPlaceholder = ({ label }: { label: string }) => (
  <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
    {label}
  </div>
)

export function MeterManagementPage() {
  return (
    <div>
      <PageHeader title="Meter Management" subtitle="Smart meter deployment, reading efficiency, and faulty meter tracking" />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="Key Metrics">
          <div className="grid grid-cols-4 gap-4">
            {KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>
        <SectionContainer title="Analytics">
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="Smart Meter Rollout Progress" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Area Chart — Smart Meter Coverage" />
            </ChartCard>
            <ChartCard title="Faulty Meters by Division" timeContext="Current Month">
              <ChartPlaceholder label="Bar Chart — Faulty Meters" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Division-wise Meter Data">
          <DataTableCard title="Meter Summary by Division" columns={COLUMNS} data={[]} />
        </SectionContainer>
        <SectionContainer title="Insights & Exceptions">
          <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4 text-[13px] text-text-secondary">
            No exceptions flagged for the selected period.
          </div>
        </SectionContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Create src/modules/distribution-ops/DistributionOpsPage.tsx**

```tsx
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'SAIFI (Interruptions)', value: '3.2', trend: '0.4', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'SAIDI (Hours)', value: '8.4', trend: '1.1 hrs', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Peak Demand (MW)', value: '312.4', trend: '8.2 MW', trendDirection: 'up' as const, trendIsPositive: false, comparisonLabel: 'vs Last Month' },
  { label: 'Feeder Availability', value: '97.8%', trend: '0.3%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'feeder', label: 'Feeder' },
  { key: 'saifi', label: 'SAIFI' },
  { key: 'saidi', label: 'SAIDI (hrs)' },
  { key: 'availability', label: 'Availability %' },
  { key: 'incidents', label: 'Incidents' },
]

const ChartPlaceholder = ({ label }: { label: string }) => (
  <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
    {label}
  </div>
)

export function DistributionOpsPage() {
  return (
    <div>
      <PageHeader title="Distribution Operations" subtitle="Reliability indices, feeder performance, and outage analysis" />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="Key Metrics">
          <div className="grid grid-cols-4 gap-4">
            {KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>
        <SectionContainer title="Analytics">
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="SAIFI / SAIDI Trend" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Line Chart — SAIFI & SAIDI" />
            </ChartCard>
            <ChartCard title="Peak Demand by Month" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Area Chart — Peak Demand" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Feeder Performance">
          <DataTableCard title="Feeder-wise Reliability" columns={COLUMNS} data={[]} />
        </SectionContainer>
        <SectionContainer title="Insights & Exceptions">
          <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4 text-[13px] text-text-secondary">
            No exceptions flagged for the selected period.
          </div>
        </SectionContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Create src/modules/revenue-billing/RevenueBillingPage.tsx**

```tsx
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'Revenue Collection (₹ Cr)', value: '142.3', trend: '8.4 Cr', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Outstanding Dues (₹ Cr)', value: '38.7', trend: '3.2 Cr', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Billing Efficiency', value: '94.2%', trend: '0.8%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Recovery Rate', value: '96.8%', trend: '0.4%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'division', label: 'Division' },
  { key: 'billed', label: 'Billed (₹ Cr)' },
  { key: 'collected', label: 'Collected (₹ Cr)' },
  { key: 'outstanding', label: 'Outstanding (₹ Cr)' },
  { key: 'recovery', label: 'Recovery %' },
]

const ChartPlaceholder = ({ label }: { label: string }) => (
  <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
    {label}
  </div>
)

export function RevenueBillingPage() {
  return (
    <div>
      <PageHeader title="Revenue & Billing" subtitle="Revenue collection, billing efficiency, and outstanding dues" />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="Key Metrics">
          <div className="grid grid-cols-4 gap-4">
            {KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>
        <SectionContainer title="Analytics">
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="Monthly Revenue Collection" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Bar Chart — Revenue Collection" />
            </ChartCard>
            <ChartCard title="Outstanding Dues Trend" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Line Chart — Outstanding Dues" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Division-wise Revenue Data">
          <DataTableCard title="Revenue Summary by Division" columns={COLUMNS} data={[]} />
        </SectionContainer>
        <SectionContainer title="Insights & Exceptions">
          <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4 text-[13px] text-text-secondary">
            No exceptions flagged for the selected period.
          </div>
        </SectionContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create src/modules/procurement-finance/ProcurementFinancePage.tsx**

```tsx
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'Budget Utilization', value: '68.4%', trend: '4.2%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'YTD' },
  { label: 'PO Value (₹ Cr)', value: '28.3', trend: '3.1 Cr', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'this month' },
  { label: 'Pending Payments (₹ Cr)', value: '12.7', trend: '2.4 Cr', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Inventory Value (₹ Cr)', value: '45.2', trend: '1.8 Cr', trendDirection: 'neutral' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'category', label: 'Category' },
  { key: 'budget', label: 'Budget (₹ Cr)' },
  { key: 'spent', label: 'Spent (₹ Cr)' },
  { key: 'utilization', label: 'Utilization %' },
  { key: 'pendingPO', label: 'Pending POs' },
]

const ChartPlaceholder = ({ label }: { label: string }) => (
  <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
    {label}
  </div>
)

export function ProcurementFinancePage() {
  return (
    <div>
      <PageHeader title="Procurement & Finance" subtitle="Budget utilization, purchase orders, and payment status" />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="Key Metrics">
          <div className="grid grid-cols-4 gap-4">
            {KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>
        <SectionContainer title="Analytics">
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="Budget vs Expenditure" timeContext="FY 2024-25">
              <ChartPlaceholder label="Stacked Bar — Budget vs Expenditure" />
            </ChartCard>
            <ChartCard title="PO Value by Category" timeContext="Current Month">
              <ChartPlaceholder label="Donut Chart — PO Categories" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Budget Summary">
          <DataTableCard title="Budget Utilization by Category" columns={COLUMNS} data={[]} />
        </SectionContainer>
        <SectionContainer title="Insights & Exceptions">
          <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4 text-[13px] text-text-secondary">
            No exceptions flagged for the selected period.
          </div>
        </SectionContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 7: Create src/modules/infrastructure-assets/InfrastructureAssetsPage.tsx**

```tsx
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'DT Failures (MTD)', value: '23', trend: '6', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Total Distribution Transformers', value: '4,821', trend: '12', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'added this month' },
  { label: 'Substation Capacity (MVA)', value: '580', trend: '20 MVA', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Asset Uptime', value: '97.2%', trend: '0.4%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'division', label: 'Division' },
  { key: 'totalDTs', label: 'Total DTs' },
  { key: 'dtFailures', label: 'DT Failures' },
  { key: 'failureRate', label: 'Failure Rate %' },
  { key: 'uptime', label: 'Uptime %' },
]

const ChartPlaceholder = ({ label }: { label: string }) => (
  <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
    {label}
  </div>
)

export function InfrastructureAssetsPage() {
  return (
    <div>
      <PageHeader title="Infrastructure & Assets" subtitle="Distribution transformers, substations, and asset uptime" />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="Key Metrics">
          <div className="grid grid-cols-4 gap-4">
            {KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>
        <SectionContainer title="Analytics">
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="DT Failure Trend" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Line Chart — DT Failures" />
            </ChartCard>
            <ChartCard title="Asset Uptime by Division" timeContext="Current Month">
              <ChartPlaceholder label="Bar Chart — Asset Uptime" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Division-wise Asset Data">
          <DataTableCard title="DT Summary by Division" columns={COLUMNS} data={[]} />
        </SectionContainer>
        <SectionContainer title="Insights & Exceptions">
          <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4 text-[13px] text-text-secondary">
            No exceptions flagged for the selected period.
          </div>
        </SectionContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 8: Commit**

```bash
git add src/modules/
git commit -m "feat: scaffold all 7 module pages with page template"
```

---

## Task 7: App Router, Entry Point & Final Verification

**Files:**
- Create: `src/App.tsx`
- Create: `src/main.tsx`

**Interfaces:**
- Consumes: all 7 module pages, `AppShell`
- Produces: running application at `http://localhost:5173`

- [ ] **Step 1: Create src/App.tsx**

```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { OverviewPage } from './modules/overview/OverviewPage'
import { ConsumerServicesPage } from './modules/consumer-services/ConsumerServicesPage'
import { MeterManagementPage } from './modules/meter-management/MeterManagementPage'
import { DistributionOpsPage } from './modules/distribution-ops/DistributionOpsPage'
import { RevenueBillingPage } from './modules/revenue-billing/RevenueBillingPage'
import { ProcurementFinancePage } from './modules/procurement-finance/ProcurementFinancePage'
import { InfrastructureAssetsPage } from './modules/infrastructure-assets/InfrastructureAssetsPage'

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppShell />}>
          <Route index element={<Navigate to="/overview" replace />} />
          <Route path="overview" element={<OverviewPage />} />
          <Route path="consumer-services" element={<ConsumerServicesPage />} />
          <Route path="meter-management" element={<MeterManagementPage />} />
          <Route path="distribution-ops" element={<DistributionOpsPage />} />
          <Route path="revenue-billing" element={<RevenueBillingPage />} />
          <Route path="procurement-finance" element={<ProcurementFinancePage />} />
          <Route path="infrastructure-assets" element={<InfrastructureAssetsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
```

- [ ] **Step 2: Create src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import './index.css'
import { App } from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
```

- [ ] **Step 3: Run full test suite**

Run: `npm test`

Expected: 14 tests passing (3 filterStore, 5 KpiCard, 3 Sidebar, 3 GlobalFilterBar), 0 failures

- [ ] **Step 4: Start dev server and visually verify**

Run: `npm run dev`

Open browser at `http://localhost:5173`. Verify:
- Redirects to `/overview` automatically
- White sidebar on left with 7 nav items
- Active nav item highlighted blue
- TopBar shows department name
- Sticky filter bar with 5 selects below page header
- 4 KPI cards in a row
- 2 chart placeholder boxes
- Empty data table with "No data available"
- Insights section placeholder
- Sidebar collapse button works — main content shifts

- [ ] **Step 5: Navigate to all 7 routes and confirm no errors**

Click each nav item in the sidebar. Confirm:
- Each page renders its correct title
- Filter bar persists across all pages
- No console errors

- [ ] **Step 6: Final commit**

```bash
git add src/App.tsx src/main.tsx
git commit -m "feat: wire up React Router with all 7 module routes"
```

---

## Self-Review

**Spec coverage:**
- ✅ Fixed left sidebar with 7 modules
- ✅ Page scaffolds for all 7 modules
- ✅ Consistent page template: Header → FilterBar → KPIs → Analytics → Table → Insights
- ✅ Collapsible Sidebar, PageHeader, GlobalFilterBar, KpiCard, ChartCard, SectionContainer, DataTableCard
- ✅ 5 global filters: Financial Year, Month, Circle, Division, Subdivision
- ✅ White cards on #F8FAFC background
- ✅ Border-based design, minimal shadows
- ✅ Compact KPI cards (100–120px target)
- ✅ DM Sans font, design tokens in Tailwind theme
- ✅ Realistic electricity utility terminology in KPI labels

**No placeholders remaining in plan body.**

**Type consistency:** `KpiCardProps.trendDirection` defined in `src/types/index.ts` Task 2 and used identically in Task 4 (KpiCard) and Task 6 (all module pages). `Column` type used consistently in `DataTableCard` props and all module page column definitions.
