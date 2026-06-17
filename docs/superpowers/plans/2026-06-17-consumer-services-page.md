# Consumer Services & Grievances — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `ConsumerServicesPage.tsx` with a fully-built, filter-reactive analytics page covering complaint management, SLA monitoring, service requests, consumer analytics, and division performance.

**Architecture:** Two files only — `mockData.ts` (all pure data functions) and `ConsumerServicesPage.tsx` (all section components inline + page assembly). No new shared components. All enhancements (sortable table, gauge, heatmap, funnel) are local to this module.

**Tech Stack:** React 18, Recharts 2.12, Zustand, Tailwind CSS, TypeScript, Vitest

## Global Constraints

- No new npm dependencies
- Tailwind token classes only: `bg-surface`, `bg-background`, `bg-primary`, `bg-success`, `bg-warning`, `bg-error`, `border-border-base`, `text-text-primary`, `text-text-secondary`, `text-success`, `text-warning`, `text-error`
- Hex values for Recharts/inline styles: primary `#2563EB`, success `#16A34A`, warning `#F59E0B`, error `#DC2626`, purple `#7C3AED`, cyan `#0891B2`, orange `#EA580C`
- All `ResponsiveContainer` must use `height={220}` unless noted otherwise
- Filter store: `useFilterStore` from `../../store/filterStore`
- Recharts imports from `'recharts'`; Lucide icons from `'lucide-react'`

---

### Task 1: Mock Data Layer

**Files:**
- Create: `src/modules/consumer-services/mockData.ts`
- Create: `src/modules/consumer-services/mockData.test.ts`

**Interfaces:**
- Produces: `Filters`, `KpiData`, `MonthlyComplaintPoint`, `CategoryPoint`, `StatusPoint`, `BacklogPoint`, `SlaPoint`, `ResTimePoint`, `DivisionSlaPoint`, `ServiceVolumePoint`, `FunnelData`, `ProcessingTimePoint`, `ConsumerGrowthPoint`, `ConnectionsPoint`, `ConsumerCategoryPoint`, `HeatmapRow`, `TableRow`, `InsightItem` — and all exported functions that Tasks 2–5 consume.

- [ ] **Step 1: Write the failing tests**

Create `src/modules/consumer-services/mockData.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  getKpiData, getComplaintTrend, getCategoryDistribution,
  getDivisionTableData, getInsights, type Filters,
} from './mockData'

const F: Filters = {
  financialYear: '2024-25', month: 'All',
  circle: 'All', division: 'All', subdivision: 'All',
}

describe('getKpiData', () => {
  it('is deterministic', () => {
    expect(getKpiData(F)).toEqual(getKpiData(F))
  })
  it('consumers > 100 000 for All filters', () => {
    expect(getKpiData(F).totalConsumers).toBeGreaterThan(100000)
  })
  it('division filter reduces consumer count', () => {
    const all = getKpiData(F).totalConsumers
    const ng  = getKpiData({ ...F, division: 'North Goa' }).totalConsumers
    expect(ng).toBeLessThan(all)
  })
  it('slaCompliance in 70–99', () => {
    const v = getKpiData(F).slaCompliance
    expect(v).toBeGreaterThanOrEqual(70)
    expect(v).toBeLessThanOrEqual(99)
  })
  it('varies between financial years', () => {
    const a = getKpiData({ ...F, financialYear: '2023-24' }).totalConsumers
    const b = getKpiData({ ...F, financialYear: '2025-26' }).totalConsumers
    expect(a).not.toBe(b)
  })
})

describe('getComplaintTrend', () => {
  it('returns 12 months', () => {
    expect(getComplaintTrend(F)).toHaveLength(12)
  })
  it('first month is Apr, last is Mar', () => {
    const t = getComplaintTrend(F)
    expect(t[0].month).toBe('Apr')
    expect(t[11].month).toBe('Mar')
  })
  it('resolved < received for every month', () => {
    getComplaintTrend(F).forEach(p => expect(p.resolved).toBeLessThan(p.received))
  })
})

describe('getCategoryDistribution', () => {
  it('returns 7 categories', () => {
    expect(getCategoryDistribution(F)).toHaveLength(7)
  })
  it('all values positive', () => {
    getCategoryDistribution(F).forEach(c => expect(c.value).toBeGreaterThan(0))
  })
})

describe('getDivisionTableData', () => {
  it('returns 5 rows', () => {
    expect(getDivisionTableData(F)).toHaveLength(5)
  })
  it('pending === complaints − resolved', () => {
    getDivisionTableData(F).forEach(r =>
      expect(r.pending).toBe(r.complaints - r.resolved)
    )
  })
  it('slaPercent in 68–99', () => {
    getDivisionTableData(F).forEach(r => {
      expect(r.slaPercent).toBeGreaterThanOrEqual(68)
      expect(r.slaPercent).toBeLessThanOrEqual(99)
    })
  })
})

describe('getInsights', () => {
  it('returns 5 insights', () => {
    expect(getInsights(F)).toHaveLength(5)
  })
  it('every insight has a non-empty value', () => {
    getInsights(F).forEach(i => expect(i.value.length).toBeGreaterThan(0))
  })
})
```

- [ ] **Step 2: Run tests — expect failures**

```
npm test -- mockData
```

Expected: all tests fail with "Cannot find module './mockData'".

- [ ] **Step 3: Create `src/modules/consumer-services/mockData.ts`**

```typescript
// --- Types ---
export interface Filters {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
}

export interface KpiData {
  totalConsumers: number
  newConnections: number
  complaintsReceived: number
  complaintsResolved: number
  openComplaints: number
  slaCompliance: number
  avgResolutionTime: number
  serviceRequestsProcessed: number
}

export interface MonthlyComplaintPoint { month: string; received: number; resolved: number }
export interface CategoryPoint { name: string; value: number; color: string }
export interface StatusPoint { name: string; value: number }
export interface BacklogPoint { month: string; backlog: number }
export interface SlaPoint { month: string; compliance: number }
export interface ResTimePoint { month: string; days: number }
export interface DivisionSlaPoint { division: string; compliance: number; fill: string }
export interface ServiceVolumePoint { type: string; volume: number }
export interface FunnelData { submitted: number; inProcess: number; completed: number }
export interface ProcessingTimePoint { type: string; days: number }
export interface ConsumerGrowthPoint { month: string; consumers: number }
export interface ConnectionsPoint { month: string; newConnections: number; disconnections: number }
export interface ConsumerCategoryPoint { name: string; value: number; color: string }
export interface HeatmapRow {
  division: string
  complaintVolume: number
  slaCompliance: number
  resolutionTime: number
  pendingCases: number
}
export interface TableRow {
  division: string
  consumers: number
  complaints: number
  resolved: number
  pending: number
  slaPercent: number
  resolutionTime: number
  newConnections: number
  serviceRequests: number
}
export interface InsightItem {
  id: string
  label: string
  value: string
  context: string
  severity: 'error' | 'warning'
  icon: 'trending-up' | 'alert-triangle' | 'clock' | 'zap' | 'timer'
}

// --- Constants ---
export const MONTHS = [
  'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar',
]

const DIVISIONS = ['North Goa','South Goa','East Goa','West Goa','Central Goa']

export const COMPLAINT_CATEGORIES: { name: string; color: string }[] = [
  { name: 'Billing Issues',       color: '#DC2626' },
  { name: 'Power Outages',        color: '#F59E0B' },
  { name: 'Voltage Fluctuation',  color: '#EA580C' },
  { name: 'Meter Issues',         color: '#7C3AED' },
  { name: 'New Connections',      color: '#16A34A' },
  { name: 'Service Requests',     color: '#2563EB' },
  { name: 'Others',               color: '#6B7280' },
]

const SERVICE_TYPES = [
  'Load Enhancement','Load Reduction','Name Change',
  'Meter Shifting','Reconnection','Temporary Connection',
]

// --- Helpers ---
function strHash(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return Math.abs(h)
}

function jitter(base: number, seed: number, pct = 0.10): number {
  const r = ((seed % 1000) / 1000 - 0.5) * 2 * pct
  return Math.round(base * (1 + r))
}

function divFactor(division: string): number {
  const m: Record<string, number> = {
    'All': 1, 'North Goa': 0.27, 'South Goa': 0.23,
    'East Goa': 0.19, 'West Goa': 0.17, 'Central Goa': 0.14,
  }
  return m[division] ?? 1
}

function fyFactor(fy: string): number {
  return fy === '2023-24' ? 0.94 : fy === '2025-26' ? 1.05 : 1
}

function monthFactor(month: string): number {
  const idx = MONTHS.indexOf(month)
  if (idx < 0) return 1
  return [0.9,1.15,1.18,1.08,0.95,0.9,0.85,0.82,0.87,0.92,0.96,0.88][idx]
}

export function slaColor(pct: number): string {
  return pct >= 90 ? '#16A34A' : pct >= 75 ? '#F59E0B' : '#DC2626'
}

// --- Data Functions ---

export function getKpiData(filters: Filters): KpiData {
  const h  = strHash(filters.financialYear + filters.division + filters.circle)
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  const mf = filters.month === 'All' ? 1 : monthFactor(filters.month)
  return {
    totalConsumers:         jitter(Math.round(615000 * df * ff), h),
    newConnections:         jitter(Math.round(1420 * df * ff * mf), h + 1),
    complaintsReceived:     jitter(Math.round(4100 * df * ff * mf), h + 2),
    complaintsResolved:     jitter(Math.round(3770 * df * ff * mf), h + 3),
    openComplaints:         jitter(Math.round(390 * df * ff), h + 4),
    slaCompliance:          Math.min(99, Math.max(70, jitter(91, h + 5, 0.12))),
    avgResolutionTime:      Math.max(1.5, Math.min(9, +( 4.2 * (1 + ((h + 6) % 200) / 1000 - 0.1)).toFixed(1))),
    serviceRequestsProcessed: jitter(Math.round(2050 * df * ff * mf), h + 7),
  }
}

export function getComplaintTrend(filters: Filters): MonthlyComplaintPoint[] {
  const h  = strHash(filters.financialYear + filters.division)
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  return MONTHS.map((month, i) => {
    const received = jitter(Math.round(4100 * df * ff * monthFactor(month)), h + i)
    const resolved = jitter(Math.round(received * 0.91), h + i + 50)
    return { month, received, resolved }
  })
}

export function getCategoryDistribution(filters: Filters): CategoryPoint[] {
  const h = strHash(filters.financialYear + filters.month + filters.division)
  const baseWeights = [28, 22, 15, 12, 10, 8, 5]
  return COMPLAINT_CATEGORIES.map(({ name, color }, i) => ({
    name, color,
    value: jitter(baseWeights[i] * 42, h + i, 0.15),
  }))
}

export function getComplaintStatus(filters: Filters): StatusPoint[] {
  const h     = strHash(filters.financialYear + filters.division + 'status')
  const total = jitter(4100, h, 0.1)
  return [
    { name: 'Resolved',  value: Math.round(total * 0.88) },
    { name: 'Pending',   value: Math.round(total * 0.08) },
    { name: 'Escalated', value: Math.round(total * 0.025) },
    { name: 'Withdrawn', value: Math.round(total * 0.015) },
  ]
}

export function getBacklogTrend(filters: Filters): BacklogPoint[] {
  const h  = strHash(filters.financialYear + filters.division + 'backlog')
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  return MONTHS.map((month, i) => ({
    month,
    backlog: jitter(Math.round(390 * df * ff * monthFactor(month)), h + i),
  }))
}

export function getSlaTrend(filters: Filters): SlaPoint[] {
  const h  = strHash(filters.financialYear + filters.division + 'sla')
  const ff = fyFactor(filters.financialYear)
  return MONTHS.map((month, i) => ({
    month,
    compliance: Math.min(99, Math.max(68, jitter(Math.round(91 * ff), h + i, 0.06))),
  }))
}

export function getResTimeTrend(filters: Filters): ResTimePoint[] {
  const h  = strHash(filters.financialYear + filters.division + 'restime')
  const ff = fyFactor(filters.financialYear)
  return MONTHS.map((_month, i) => ({
    month: MONTHS[i],
    days: Math.max(1.5, Math.min(9, +(4.2 * ff * (1 + ((h + i) % 200) / 1000 - 0.1)).toFixed(1))),
  }))
}

export function getDivisionSlaRanking(filters: Filters): DivisionSlaPoint[] {
  const h  = strHash(filters.financialYear + 'slarank')
  const ff = fyFactor(filters.financialYear)
  return DIVISIONS.map((division, i) => {
    const compliance = Math.min(99, Math.max(68, jitter(Math.round(88 * ff), h + i, 0.10)))
    return { division, compliance, fill: slaColor(compliance) }
  }).sort((a, b) => b.compliance - a.compliance)
}

export function getServiceVolumeByType(filters: Filters): ServiceVolumePoint[] {
  const h   = strHash(filters.financialYear + filters.month + filters.division + 'svc')
  const df  = divFactor(filters.division)
  const ff  = fyFactor(filters.financialYear)
  const mf  = filters.month === 'All' ? 1 : monthFactor(filters.month)
  const base = [380, 120, 290, 210, 430, 180]
  return SERVICE_TYPES.map((type, i) => ({
    type,
    volume: jitter(Math.round(base[i] * df * ff * mf), h + i),
  }))
}

export function getServiceRequestFunnel(filters: Filters): FunnelData {
  const h         = strHash(filters.financialYear + filters.division + 'funnel')
  const df        = divFactor(filters.division)
  const ff        = fyFactor(filters.financialYear)
  const submitted = jitter(Math.round(2400 * df * ff), h)
  const inProcess = jitter(Math.round(submitted * 0.62), h + 1)
  const completed = jitter(Math.round(submitted * 0.87), h + 2)
  return { submitted, inProcess, completed }
}

export function getServiceProcessingTime(filters: Filters): ProcessingTimePoint[] {
  const h    = strHash(filters.financialYear + filters.division + 'proctime')
  const base = [12, 8, 5, 7, 3, 10]
  return SERVICE_TYPES.map((type, i) => ({
    type,
    days: Math.max(1, +(base[i] * (1 + ((h + i) % 200) / 1000 - 0.1)).toFixed(1)),
  }))
}

export function getConsumerGrowthTrend(filters: Filters): ConsumerGrowthPoint[] {
  const h  = strHash(filters.financialYear + filters.division + 'growth')
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  let consumers = Math.round(608000 * df * ff)
  return MONTHS.map((month, i) => {
    consumers += jitter(Math.round(1250 * df), h + i, 0.3)
    return { month, consumers }
  })
}

export function getConnectionsTrend(filters: Filters): ConnectionsPoint[] {
  const h  = strHash(filters.financialYear + filters.division + 'conn')
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  return MONTHS.map((month, i) => ({
    month,
    newConnections:  jitter(Math.round(1420 * df * ff * monthFactor(month)), h + i),
    disconnections:  jitter(Math.round(180  * df * ff), h + i + 30),
  }))
}

export function getConsumerCategoryDist(filters: Filters): ConsumerCategoryPoint[] {
  const h = strHash(filters.financialYear + filters.division + 'catdist')
  return [
    { name: 'Domestic',    color: '#2563EB', value: jitter(78, h,     0.05) },
    { name: 'Commercial',  color: '#7C3AED', value: jitter(14, h + 1, 0.08) },
    { name: 'Industrial',  color: '#EA580C', value: jitter(5,  h + 2, 0.15) },
    { name: 'Government',  color: '#0891B2', value: jitter(3,  h + 3, 0.15) },
  ]
}

export function getDivisionHeatmapData(filters: Filters): HeatmapRow[] {
  const h  = strHash(filters.financialYear + 'heat')
  const ff = fyFactor(filters.financialYear)
  return DIVISIONS.map((division, i) => ({
    division,
    complaintVolume: jitter(Math.round(820 * ff), h + i,      0.20),
    slaCompliance:   Math.min(99, Math.max(68, jitter(88, h + i + 10, 0.10))),
    resolutionTime:  Math.max(1.5, +(4.2 * (1 + ((h + i + 20) % 200) / 1000 - 0.1)).toFixed(1)),
    pendingCases:    jitter(Math.round(80 * ff), h + i + 30, 0.25),
  }))
}

export function getDivisionTableData(filters: Filters): TableRow[] {
  const h  = strHash(filters.financialYear + 'table')
  const ff = fyFactor(filters.financialYear)
  const mf = filters.month === 'All' ? 1 : monthFactor(filters.month)
  return DIVISIONS.map((division, i) => {
    const df         = divFactor(division)
    const complaints = jitter(Math.round(4100 * df * ff * mf), h + i)
    const resolved   = jitter(Math.round(complaints * 0.91), h + i + 5)
    return {
      division,
      consumers:       jitter(Math.round(615000 * df * ff), h + i + 10),
      complaints,
      resolved,
      pending:         complaints - resolved,
      slaPercent:      Math.min(99, Math.max(68, jitter(88, h + i + 20, 0.10))),
      resolutionTime:  Math.max(1.5, +(4.2 * (1 + ((h + i + 30) % 200) / 1000 - 0.1)).toFixed(1)),
      newConnections:  jitter(Math.round(1420 * df * ff * mf), h + i + 40),
      serviceRequests: jitter(Math.round(2050 * df * ff * mf), h + i + 50),
    }
  })
}

export function getInsights(filters: Filters): InsightItem[] {
  const table   = getDivisionTableData(filters)
  const slaRank = getDivisionSlaRanking(filters)
  const cats    = getCategoryDistribution(filters)
  const trend   = getComplaintTrend(filters)

  const lowestSla    = slaRank[slaRank.length - 1]
  const highestPend  = [...table].sort((a, b) => b.pending - a.pending)[0]
  const highestRT    = [...table].sort((a, b) => b.resolutionTime - a.resolutionTime)[0]
  const highestVol   = [...table].sort((a, b) => b.complaints - a.complaints)[0]
  const topCat       = [...cats].sort((a, b) => b.value - a.value)[0]

  const lastM = trend[trend.length - 1]
  const prevM = trend[trend.length - 2]
  const growthPct = prevM
    ? Math.abs(Math.round(((lastM.received - prevM.received) / prevM.received) * 100))
    : 12

  return [
    {
      id: 'complaint-growth', icon: 'trending-up', severity: 'warning',
      label: 'Highest Complaint Growth',
      value: highestVol.division,
      context: `+${growthPct}% vs prev month`,
    },
    {
      id: 'lowest-sla', icon: 'alert-triangle', severity: 'error',
      label: 'Lowest SLA Division',
      value: lowestSla.division,
      context: `${lowestSla.compliance}% compliance`,
    },
    {
      id: 'largest-backlog', icon: 'clock', severity: 'error',
      label: 'Largest Pending Backlog',
      value: highestPend.division,
      context: `${highestPend.pending.toLocaleString()} open cases`,
    },
    {
      id: 'top-category', icon: 'zap', severity: 'warning',
      label: 'Top Complaint Category',
      value: topCat.name,
      context: `${topCat.value.toLocaleString()} complaints`,
    },
    {
      id: 'highest-restime', icon: 'timer', severity: 'warning',
      label: 'Highest Resolution Time',
      value: highestRT.division,
      context: `${highestRT.resolutionTime} days avg`,
    },
  ]
}
```

- [ ] **Step 4: Run tests — expect all passing**

```
npm test -- mockData
```

Expected: 14 tests pass, 0 failing.

- [ ] **Step 5: Commit**

```
git add src/modules/consumer-services/mockData.ts src/modules/consumer-services/mockData.test.ts
git commit -m "feat(consumer-services): add filter-reactive mock data layer"
```

---

### Task 2: KPI Section + Complaints Dashboard

**Files:**
- Modify: `src/modules/consumer-services/ConsumerServicesPage.tsx`

**Interfaces:**
- Consumes from Task 1: `getKpiData`, `getComplaintTrend`, `getCategoryDistribution`, `getComplaintStatus`, `getBacklogTrend`, `Filters`, all related point types
- Produces: Page renders with KPI row and complaints section visible

- [ ] **Step 1: Replace ConsumerServicesPage.tsx with KPI + Complaints sections**

Full file content:

```tsx
import { useMemo, useState } from 'react'
import {
  ResponsiveContainer, ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, PieChart, Pie, Cell, BarChart, AreaChart, Area,
  RadialBarChart, RadialBar, LineChart, ReferenceLine,
} from 'recharts'
import { TrendingUp, AlertTriangle, Clock, Zap, Timer, ChevronUp, ChevronDown, Search } from 'lucide-react'
import { useFilterStore } from '../../store/filterStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import {
  getKpiData, getComplaintTrend, getCategoryDistribution, getComplaintStatus,
  getBacklogTrend, getSlaTrend, getResTimeTrend, getDivisionSlaRanking,
  getServiceVolumeByType, getServiceRequestFunnel, getServiceProcessingTime,
  getConsumerGrowthTrend, getConnectionsTrend, getConsumerCategoryDist,
  getDivisionHeatmapData, getDivisionTableData, getInsights,
  slaColor,
  type Filters, type TableRow,
} from './mockData'

const C = {
  primary: '#2563EB', success: '#16A34A', warning: '#F59E0B',
  error: '#DC2626', purple: '#7C3AED', cyan: '#0891B2', orange: '#EA580C',
  grid: '#E5E7EB',
}
const ax = { fontSize: 11, fill: '#6B7280' }

function resTimeColor(d: number) {
  return d <= 4 ? C.success : d <= 6 ? C.warning : C.error
}

function heatBg(value: number, type: 'complaint' | 'sla' | 'resolution' | 'pending'): string {
  if (type === 'complaint')  return value < 600  ? '#DCFCE7' : value < 900  ? '#FEF9C3' : '#FEE2E2'
  if (type === 'sla')        return value >= 90  ? '#DCFCE7' : value >= 75  ? '#FEF9C3' : '#FEE2E2'
  if (type === 'resolution') return value <= 4   ? '#DCFCE7' : value <= 6   ? '#FEF9C3' : '#FEE2E2'
  return value < 60 ? '#DCFCE7' : value < 100 ? '#FEF9C3' : '#FEE2E2'
}

// ── Complaints Dashboard ─────────────────────────────────────────────────────
function ComplaintsSection({ filters }: { filters: Filters }) {
  const trend      = useMemo(() => getComplaintTrend(filters),        [filters])
  const categories = useMemo(() => getCategoryDistribution(filters),  [filters])
  const status     = useMemo(() => getComplaintStatus(filters),       [filters])
  const backlog    = useMemo(() => getBacklogTrend(filters),          [filters])

  const statusColor: Record<string, string> = {
    Resolved: C.success, Pending: C.warning, Escalated: C.error, Withdrawn: '#6B7280',
  }

  return (
    <>
      <ChartCard title="Complaints Received vs Resolved" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={trend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={48} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="received" name="Received" fill={C.error} opacity={0.7} radius={[2,2,0,0]} />
            <Line type="monotone" dataKey="resolved" name="Resolved" stroke={C.success} strokeWidth={2} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-3 gap-4 mt-4">
        <ChartCard title="Category Distribution" timeContext="Current Period">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85}>
                {categories.map((c) => <Cell key={c.name} fill={c.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => v.toLocaleString()} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Complaint Status Breakdown" timeContext="Current Period">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={status} layout="vertical" margin={{ left: 8, right: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={ax} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={ax} axisLine={false} tickLine={false} width={72} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="value" name="Count" radius={[0,2,2,0]}>
                {status.map((s) => <Cell key={s.name} fill={statusColor[s.name] ?? '#6B7280'} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Complaint Backlog Trend" timeContext="Apr – Mar (Financial Year)">
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={backlog} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Area type="monotone" dataKey="backlog" name="Open Complaints"
                stroke={C.warning} fill={C.warning} fillOpacity={0.15} strokeWidth={2} dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </>
  )
}

// ── SLA Performance ──────────────────────────────────────────────────────────
function SlaSection({ filters }: { filters: Filters }) {
  const kpi        = useMemo(() => getKpiData(filters),              [filters])
  const slaTrend   = useMemo(() => getSlaTrend(filters),             [filters])
  const rtTrend    = useMemo(() => getResTimeTrend(filters),         [filters])
  const divRanking = useMemo(() => getDivisionSlaRanking(filters),   [filters])

  return (
    <div className="grid grid-cols-4 gap-4">
      <ChartCard title="SLA Compliance" timeContext="Current Period">
        <div className="relative" style={{ height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="75%"
              innerRadius="55%" outerRadius="80%"
              startAngle={180} endAngle={0}
              data={[{ value: kpi.slaCompliance }]}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={6}
                fill={slaColor(kpi.slaCompliance)}
                background={{ fill: '#F3F4F6' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-x-0 flex flex-col items-center" style={{ bottom: 28 }}>
            <span className="text-[28px] font-bold text-text-primary">{kpi.slaCompliance}%</span>
            <span className="text-[11px] text-text-secondary">Target: 90%</span>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="SLA Compliance Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={slaTrend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis domain={[60, 100]} tick={ax} axisLine={false} tickLine={false} width={36} unit="%" />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
            <ReferenceLine y={90} stroke={C.primary} strokeDasharray="4 2"
              label={{ value: 'Target', fill: C.primary, fontSize: 10, position: 'right' }} />
            <Line type="monotone" dataKey="compliance" name="SLA %" stroke={C.success} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Resolution Time Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={rtTrend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={ax} axisLine={false} tickLine={false} width={36} unit="d" />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v} days`} />
            <ReferenceLine y={5} stroke={C.warning} strokeDasharray="4 2"
              label={{ value: 'Target', fill: C.warning, fontSize: 10, position: 'right' }} />
            <Line type="monotone" dataKey="days" name="Avg Days" stroke={C.primary} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Division SLA Ranking" timeContext="Current Period">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={divRanking} layout="vertical" margin={{ left: 8, right: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={ax} axisLine={false} tickLine={false} unit="%" />
            <YAxis dataKey="division" type="category" tick={ax} axisLine={false} tickLine={false} width={88} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
            <Bar dataKey="compliance" name="SLA %" radius={[0,2,2,0]}>
              {divRanking.map((d) => <Cell key={d.division} fill={d.fill} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Service Requests ─────────────────────────────────────────────────────────
function ServiceRequestsSection({ filters }: { filters: Filters }) {
  const volume   = useMemo(() => getServiceVolumeByType(filters),    [filters])
  const funnel   = useMemo(() => getServiceRequestFunnel(filters),   [filters])
  const procTime = useMemo(() => getServiceProcessingTime(filters),  [filters])

  const funnelStages = [
    { label: 'Submitted',  value: funnel.submitted,  pct: 100 },
    { label: 'In Process', value: funnel.inProcess,  pct: Math.round(funnel.inProcess  / funnel.submitted * 100) },
    { label: 'Completed',  value: funnel.completed,  pct: Math.round(funnel.completed  / funnel.submitted * 100) },
  ]

  return (
    <div className="grid grid-cols-3 gap-4">
      <ChartCard title="Request Volume by Type" timeContext="Current Period">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={volume} margin={{ top: 4, right: 8, bottom: 56, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="type" tick={{ ...ax, textAnchor: 'end' }} angle={-35}
              axisLine={false} tickLine={false} interval={0} height={60} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Bar dataKey="volume" name="Requests" fill={C.primary} radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Processing Funnel" timeContext="Current Period">
        <div className="flex flex-col justify-center h-[220px] px-2 gap-5">
          {funnelStages.map((stage) => (
            <div key={stage.label}>
              <div className="flex justify-between mb-1">
                <span className="text-[12px] text-text-secondary">{stage.label}</span>
                <span className="text-[12px] font-semibold text-text-primary">
                  {stage.value.toLocaleString()} ({stage.pct}%)
                </span>
              </div>
              <div className="h-6 bg-background rounded border border-border-base overflow-hidden">
                <div
                  className="h-full transition-all"
                  style={{ width: `${stage.pct}%`, backgroundColor: C.primary, opacity: 0.4 + stage.pct / 200 }}
                />
              </div>
            </div>
          ))}
        </div>
      </ChartCard>

      <ChartCard title="Avg Processing Time by Type" timeContext="Current Period">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={procTime} layout="vertical" margin={{ left: 8, right: 32 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
            <XAxis type="number" tick={ax} axisLine={false} tickLine={false} unit="d" />
            <YAxis dataKey="type" type="category" tick={ax} axisLine={false} tickLine={false} width={120} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v} days`} />
            <Bar dataKey="days" name="Days" radius={[0,2,2,0]}>
              {procTime.map((p) => (
                <Cell key={p.type} fill={p.days <= 5 ? C.success : p.days <= 8 ? C.warning : C.error} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Consumer Analytics ───────────────────────────────────────────────────────
function ConsumerAnalyticsSection({ filters }: { filters: Filters }) {
  const growth      = useMemo(() => getConsumerGrowthTrend(filters), [filters])
  const connections = useMemo(() => getConnectionsTrend(filters),    [filters])
  const categories  = useMemo(() => getConsumerCategoryDist(filters),[filters])

  return (
    <div className="grid grid-cols-3 gap-4">
      <ChartCard title="Consumer Growth Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={growth} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={52}
              tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => v.toLocaleString()} />
            <Area type="monotone" dataKey="consumers" name="Total Consumers"
              stroke={C.primary} fill={C.primary} fillOpacity={0.12} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="New Connections vs Disconnections" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={connections} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={40} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="newConnections"  name="New Connections" fill={C.success} radius={[2,2,0,0]} />
            <Bar dataKey="disconnections"  name="Disconnections"  fill={C.error}   radius={[2,2,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Consumer Category Distribution" timeContext="Current Period">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85}>
              {categories.map((c) => <Cell key={c.name} fill={c.color} />)}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Division Heatmap ─────────────────────────────────────────────────────────
const HEATMAP_COLS = ['Complaint Volume', 'SLA Compliance %', 'Avg Resolution (Days)', 'Pending Cases']

function DivisionHeatmap({ filters }: { filters: Filters }) {
  const data = useMemo(() => getDivisionHeatmapData(filters), [filters])

  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border-base">
        <h3 className="text-[14px] font-semibold text-text-primary">Division Performance Heatmap</h3>
        <p className="text-[12px] text-text-secondary mt-0.5">Green / Amber / Red by performance threshold</p>
      </div>
      <div className="overflow-x-auto p-4">
        <div className="grid" style={{ gridTemplateColumns: '160px repeat(4, 1fr)', minWidth: 580 }}>
          <div />
          {HEATMAP_COLS.map((m) => (
            <div key={m} className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide text-center pb-3 px-2">
              {m}
            </div>
          ))}
          {data.map((row) => (
            <React.Fragment key={row.division}>
              <div className="text-[13px] font-medium text-text-primary py-3 pr-4 flex items-center border-t border-border-base">
                {row.division}
              </div>
              {([
                { val: row.complaintVolume, type: 'complaint'  as const, fmt: (v: number) => v.toLocaleString() },
                { val: row.slaCompliance,   type: 'sla'        as const, fmt: (v: number) => `${v}%`           },
                { val: row.resolutionTime,  type: 'resolution' as const, fmt: (v: number) => `${v}d`           },
                { val: row.pendingCases,    type: 'pending'    as const, fmt: (v: number) => String(v)         },
              ]).map(({ val, type, fmt }) => (
                <div
                  key={type}
                  className="py-3 px-2 text-center text-[13px] font-semibold border-t border-border-base mx-1 rounded"
                  style={{ backgroundColor: heatBg(val, type), color: '#111827' }}
                >
                  {fmt(val)}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Division Operations Table ────────────────────────────────────────────────
type SortDir = 'asc' | 'desc'
type SortKey = keyof TableRow

const TABLE_COLS: { key: SortKey; label: string }[] = [
  { key: 'division',        label: 'Division'    },
  { key: 'consumers',       label: 'Consumers'   },
  { key: 'complaints',      label: 'Complaints'  },
  { key: 'resolved',        label: 'Resolved'    },
  { key: 'pending',         label: 'Pending'     },
  { key: 'slaPercent',      label: 'SLA %'       },
  { key: 'resolutionTime',  label: 'Avg Days'    },
  { key: 'newConnections',  label: 'New Conn.'   },
  { key: 'serviceRequests', label: 'Svc Req.'    },
]

function EnhancedTable({ filters }: { filters: Filters }) {
  const data = useMemo(() => getDivisionTableData(filters), [filters])
  const [sortKey, setSortKey] = useState<SortKey>('division')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(0)
  const PAGE_SIZE = 5

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(
    () => data.filter((r) => r.division.toLowerCase().includes(search.toLowerCase())),
    [data, search],
  )

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      const cmp = typeof av === 'string' ? (av as string).localeCompare(bv as string) : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const paged      = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm">
      <div className="px-4 py-3 border-b border-border-base flex items-center justify-between gap-4">
        <h3 className="text-[14px] font-semibold text-text-primary">Division Operations Summary</h3>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search division…"
            className="pl-8 pr-3 py-1.5 text-[12px] border border-border-base rounded-lg bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-primary w-48"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-base bg-background">
              {TABLE_COLS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-text-primary select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key
                      ? sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                      : <ChevronDown size={11} className="opacity-30" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.division} className="border-b border-border-base last:border-0 hover:bg-background transition-colors">
                <td className="px-4 py-2.5 font-medium text-text-primary">{row.division}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.consumers.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.complaints.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.resolved.toLocaleString()}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                    row.pending > 100 ? 'bg-red-50 text-error' :
                    row.pending > 50  ? 'bg-yellow-50 text-warning' :
                    'bg-green-50 text-success'
                  }`}>
                    {row.pending}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                    row.slaPercent >= 90 ? 'bg-green-50 text-success' :
                    row.slaPercent >= 75 ? 'bg-yellow-50 text-warning' :
                    'bg-red-50 text-error'
                  }`}>
                    {row.slaPercent}%
                  </span>
                </td>
                <td className="px-4 py-2.5 font-semibold" style={{ color: resTimeColor(row.resolutionTime) }}>
                  {row.resolutionTime}d
                </td>
                <td className="px-4 py-2.5 text-text-primary">{row.newConnections.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.serviceRequests.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-2.5 border-t border-border-base flex items-center justify-between text-[12px] text-text-secondary">
          <span>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2.5 py-1 border border-border-base rounded hover:bg-background disabled:opacity-40 text-[12px]"
            >Prev</button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-2.5 py-1 border border-border-base rounded hover:bg-background disabled:opacity-40 text-[12px]"
            >Next</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Insights & Exceptions ────────────────────────────────────────────────────
const INSIGHT_ICONS = {
  'trending-up':    TrendingUp,
  'alert-triangle': AlertTriangle,
  'clock':          Clock,
  'zap':            Zap,
  'timer':          Timer,
}

function InsightsSection({ filters }: { filters: Filters }) {
  const insights = useMemo(() => getInsights(filters), [filters])
  return (
    <div className="grid grid-cols-5 gap-4">
      {insights.map((insight) => {
        const Icon    = INSIGHT_ICONS[insight.icon]
        const isError = insight.severity === 'error'
        return (
          <div
            key={insight.id}
            className={`bg-surface border rounded-xl p-4 ${isError ? 'border-error' : 'border-warning'}`}
          >
            <div className={`flex items-center gap-2 mb-2 ${isError ? 'text-error' : 'text-warning'}`}>
              <Icon size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-wide leading-tight">{insight.label}</span>
            </div>
            <p className="text-[15px] font-bold text-text-primary leading-tight">{insight.value}</p>
            <p className="text-[12px] text-text-secondary mt-1">{insight.context}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
import React from 'react'

export function ConsumerServicesPage() {
  const financialYear = useFilterStore((s) => s.financialYear)
  const month         = useFilterStore((s) => s.month)
  const circle        = useFilterStore((s) => s.circle)
  const division      = useFilterStore((s) => s.division)
  const subdivision   = useFilterStore((s) => s.subdivision)

  const filters = useMemo<Filters>(
    () => ({ financialYear, month, circle, division, subdivision }),
    [financialYear, month, circle, division, subdivision],
  )

  const kpi = useMemo(() => getKpiData(filters), [filters])

  const KPI_CARDS = [
    { label: 'Total Consumers',       value: kpi.totalConsumers.toLocaleString(),         trend: '1,243',  trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'new this month'   },
    { label: 'New Connections',        value: kpi.newConnections.toLocaleString(),          trend: '87',     trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month'    },
    { label: 'Complaints Received',    value: kpi.complaintsReceived.toLocaleString(),      trend: '312',    trendDirection: 'down' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month'    },
    { label: 'Complaints Resolved',    value: kpi.complaintsResolved.toLocaleString(),      trend: '285',    trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month'    },
    { label: 'Open Complaints',        value: kpi.openComplaints.toLocaleString(),          trend: '28',     trendDirection: 'down' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month'    },
    { label: 'SLA Compliance',         value: `${kpi.slaCompliance}%`,                     trend: '1.2%',   trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month'    },
    { label: 'Avg Resolution Time',    value: `${kpi.avgResolutionTime}d`,                  trend: '0.3d',   trendDirection: 'down' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month'    },
    { label: 'Service Requests',       value: kpi.serviceRequestsProcessed.toLocaleString(), trend: '143',   trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month'    },
  ]

  return (
    <div>
      <PageHeader
        title="Consumer Services & Grievances"
        subtitle="Service delivery performance, complaint management, and SLA monitoring"
      />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="Key Metrics">
          <div className="grid grid-cols-4 gap-4">
            {KPI_CARDS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>

        <SectionContainer title="Complaints Dashboard">
          <ComplaintsSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="SLA Performance">
          <SlaSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Service Requests">
          <ServiceRequestsSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Consumer Analytics">
          <ConsumerAnalyticsSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Division Performance Heatmap">
          <DivisionHeatmap filters={filters} />
        </SectionContainer>

        <SectionContainer title="Division Operations">
          <EnhancedTable filters={filters} />
        </SectionContainer>

        <SectionContainer title="Insights & Exceptions">
          <InsightsSection filters={filters} />
        </SectionContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Fix React import — move it to the top**

The file above has `import React from 'react'` placed near the bottom for clarity of structure. Move it to be the first import line:

```tsx
import React, { useMemo, useState } from 'react'
```

Remove the standalone `import React from 'react'` that was placed before the `ConsumerServicesPage` function, and replace the `import { useMemo, useState } from 'react'` at the top with the combined form above.

- [ ] **Step 3: Run dev server and visually verify**

```
npm run dev
```

Navigate to `http://localhost:5173` → Consumer Services & Grievances.

Verify:
- 8 KPI cards render in 2 rows of 4
- Complaints received vs resolved ComposedChart renders with bars and a line
- Category donut chart renders with 7 slices
- Status breakdown horizontal bar renders
- Backlog area chart renders
- SLA gauge shows a half-arc with numeric value centred
- All 4 SLA section charts render
- Service request funnel shows 3 horizontal progress bars
- Consumer analytics section shows 3 charts
- Heatmap table shows 5 division rows × 4 metric columns with colour coding
- Division operations table shows sortable columns, search input, SLA badges
- 5 insights cards render at the bottom with coloured borders

- [ ] **Step 4: Verify filter reactivity**

Change the Division filter to "North Goa" — verify KPI numbers change (consumer count drops significantly vs "All"). Change Financial Year — verify numbers shift. Change back to "All" — numbers return to original.

- [ ] **Step 5: Run full test suite**

```
npm test
```

Expected: all tests pass (no regressions in existing tests).

- [ ] **Step 6: Commit**

```
git add src/modules/consumer-services/ConsumerServicesPage.tsx
git commit -m "feat(consumer-services): build complete analytics page with all sections"
```
