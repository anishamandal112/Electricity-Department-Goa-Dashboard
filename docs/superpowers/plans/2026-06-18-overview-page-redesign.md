# Overview Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the skeleton `OverviewPage` with a fully-featured, filter-reactive executive landing page covering KPIs, division heatmap, trend charts, performer rankings, and executive alerts.

**Architecture:** Two new files — `mockData.ts` (all data types and seed-based generators) and the replacement `OverviewPage.tsx` (five section sub-components, each consuming `filters` from Zustand). No new shared components are needed; all existing primitives (`KpiCard`, `ChartCard`, `SectionContainer`, `PageHeader`, `GlobalFilterBar`) are reused.

**Tech Stack:** React 18, TypeScript, Tailwind CSS (design token classes), Recharts, Zustand (`useFilterStore`), Lucide React.

## Global Constraints

- All CSS uses design-token Tailwind classes: `bg-surface`, `bg-background`, `border-border-base`, `text-text-primary`, `text-text-secondary`, `text-primary`, `text-success`, `text-warning`, `text-error`
- Colour constants object `C` and axis style `ax` must be defined at module top per existing pattern
- Mock data generators must be deterministic: same `filters` → same output (use `seed()` hash)
- All data must vary when `financialYear` or `month` filter changes
- Chart height: 220px inside `ChartCard`
- Font sizes follow Design.md: card title 14px/600, body 14px, caption 12px, tables 13px
- 18 Goa divisions are the canonical list; do not invent new ones
- No `Math.random()` — use only the `seed()` function for pseudo-randomness

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/modules/overview/mockData.ts` | **Create** | All types, constants, and data generator functions |
| `src/modules/overview/OverviewPage.tsx` | **Replace** | Five section sub-components + page root |

---

## Task 1: Mock Data Layer

**Files:**
- Create: `src/modules/overview/mockData.ts`

**Interfaces — Produces (Task 2 depends on all of these):**
```ts
getOverviewKpis(filters: Filters): OverviewKpis
getAtcLossTrend(filters: Filters): AtcLossPoint[]
getRevenueTrend(filters: Filters): RevenueTrendPoint[]
getSmartMeterTrend(filters: Filters): SmartMeterPoint[]
getOverviewHeatmapData(filters: Filters, metric: OverviewHeatmapMetric): HeatCell[]
getPerformerRankings(filters: Filters, metric: PerformerMetric): PerformerRankings
getExecutiveAlerts(filters: Filters): ExecutiveAlert[]
MONTHS: string[]
DIVISIONS: string[]
```

- [ ] **Step 1: Create `src/modules/overview/mockData.ts` with the full implementation below**

```ts
// --- Types ---

export interface Filters {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
}

export type OverviewHeatmapMetric =
  | 'atcLoss'
  | 'collectionEff'
  | 'slaCompliance'
  | 'smartMeterPct'
  | 'outstandingDues'

export type PerformerMetric = 'atcLoss' | 'collectionEff' | 'smartMeterPct'

export interface OverviewKpis {
  totalConsumers: number
  energyInput: number
  energySold: number
  openGrievances: number
  atcLoss: number
  revenueCollected: number
  collectionEfficiency: number
  smartMeterPenetration: number
}

export interface AtcLossPoint      { month: string; atcLoss: number }
export interface RevenueTrendPoint { month: string; billed: number; collected: number }
export interface SmartMeterPoint   { month: string; metersInstalled: number }
export interface HeatCell          { division: string; month: string; value: number }

export interface DivisionRank {
  division: string
  primary: number
  collectionEff: number
  grievances: number
}

export interface PerformerRankings {
  best: DivisionRank[]
  worst: DivisionRank[]
}

export interface ExecutiveAlert {
  id: string
  label: string
  value: string
  context: string
  severity: 'error' | 'warning'
  icon: 'trending-down' | 'alert-triangle' | 'zap'
}

// --- Constants ---

export const MONTHS = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar',
]

export const DIVISIONS = [
  'Ponda X', 'Margao XVI', 'Calangute XIV', 'Mapusa XVII', 'Mormugao IV',
  'Margao V', 'Bicholim XI', 'Mapusa XV', 'Vasco III', 'Quepem VIII',
  'South Urban VI', 'Cuncolim XVIII', 'Panaji II', 'Pernem XIII',
  'Panaji I', 'Valpoi XII', 'Sanguem VII', 'Canacona IX',
]

// --- Seed helper ---

function seed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// --- Generators ---

export function getOverviewKpis(filters: Filters): OverviewKpis {
  const s = seed(filters.financialYear + filters.month)
  const atcLoss            = parseFloat((13.0 + (s % 80) / 10).toFixed(1))
  const energyInput        = parseFloat((142.0 + (s % 120) / 10).toFixed(1))
  const energySold         = parseFloat((energyInput * (1 - atcLoss / 100)).toFixed(1))
  const revenueCollected   = parseFloat((138.0 + (s % 200) / 10).toFixed(1))
  const collectionEfficiency = parseFloat((94.0 + (s % 50) / 10).toFixed(1))
  const smartMeterPenetration = parseFloat((25.0 + (s % 200) / 10).toFixed(1))
  const totalConsumers     = 612000 + (s % 25000)
  const openGrievances     = 180 + (s % 220)
  return {
    totalConsumers, energyInput, energySold, openGrievances,
    atcLoss, revenueCollected, collectionEfficiency, smartMeterPenetration,
  }
}

export function getAtcLossTrend(filters: Filters): AtcLossPoint[] {
  return MONTHS.map((month, i) => {
    const s = seed(filters.financialYear + month + 'atc')
    const raw = 16.0 + (s % 120) / 10 - i * 0.15
    return { month, atcLoss: parseFloat(Math.max(10, Math.min(30, raw)).toFixed(1)) }
  })
}

export function getRevenueTrend(filters: Filters): RevenueTrendPoint[] {
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'rev')
    const billed    = parseFloat((130.0 + (s % 120) / 10).toFixed(1))
    const collected = parseFloat((billed * (0.93 + (s % 60) / 1000)).toFixed(1))
    return { month, billed, collected }
  })
}

export function getSmartMeterTrend(filters: Filters): SmartMeterPoint[] {
  let cumulative = 45 + (seed(filters.financialYear + 'smstart') % 30)
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'sm')
    cumulative += 8 + (s % 15)
    return { month, metersInstalled: cumulative }
  })
}

export function getOverviewHeatmapData(
  filters: Filters,
  metric: OverviewHeatmapMetric,
): HeatCell[] {
  const cells: HeatCell[] = []
  for (const division of DIVISIONS) {
    for (const month of MONTHS) {
      const s = seed(filters.financialYear + division + month + metric)
      let value: number
      switch (metric) {
        case 'atcLoss':         value = parseFloat((10 + (s % 200) / 10).toFixed(1)); break
        case 'collectionEff':   value = parseFloat((88 + (s % 120) / 10).toFixed(1)); break
        case 'slaCompliance':   value = parseFloat((82 + (s % 150) / 10).toFixed(1)); break
        case 'smartMeterPct':   value = parseFloat((15 + (s % 550) / 10).toFixed(1)); break
        case 'outstandingDues': value = parseFloat((2  + (s % 150) / 10).toFixed(1)); break
      }
      cells.push({ division, month, value })
    }
  }
  return cells
}

export function getPerformerRankings(
  filters: Filters,
  metric: PerformerMetric,
): PerformerRankings {
  const rows = DIVISIONS.map((division) => {
    const s           = seed(filters.financialYear + filters.month + division + 'rank')
    const atcLoss     = parseFloat((10 + (s % 200) / 10).toFixed(1))
    const collectionEff = parseFloat((88 + (s % 120) / 10).toFixed(1))
    const smartMeterPct = parseFloat((15 + (s % 550) / 10).toFixed(1))
    const grievances  = 5 + (s % 30)
    const primary     = metric === 'atcLoss' ? atcLoss
                      : metric === 'collectionEff' ? collectionEff
                      : smartMeterPct
    return { division, primary, collectionEff, grievances }
  })
  // lower is better for atcLoss; higher is better for collectionEff / smartMeterPct
  const sorted = [...rows].sort((a, b) =>
    metric === 'atcLoss' ? a.primary - b.primary : b.primary - a.primary,
  )
  return { best: sorted.slice(0, 5), worst: sorted.slice(-5).reverse() }
}

export function getExecutiveAlerts(filters: Filters): ExecutiveAlert[] {
  const s             = seed(filters.financialYear + filters.month + 'alerts')
  const worstAtcDiv   = DIVISIONS[s % DIVISIONS.length]
  const atcVal        = parseFloat((24 + (s % 60) / 10).toFixed(1))
  const worstCollDiv  = DIVISIONS[(s >> 4) % DIVISIONS.length]
  const collVal       = parseFloat((82 + (s % 60) / 10).toFixed(1))
  const grievanceCount = 45 + (s % 80)
  const smIssues      = 120 + (s % 200)
  const tFailures     = 18 + (s % 20)
  return [
    {
      id: 'atc',
      label: 'Highest AT&C Loss',
      value: `${worstAtcDiv} — ${atcVal}%`,
      context: `${(atcVal - 15).toFixed(1)}pp above dept. target of 15%`,
      severity: 'error',
      icon: 'trending-down',
    },
    {
      id: 'coll',
      label: 'Lowest Collection Eff.',
      value: `${worstCollDiv} — ${collVal}%`,
      context: `${(96 - collVal).toFixed(1)}pp below dept. average`,
      severity: 'error',
      icon: 'trending-down',
    },
    {
      id: 'griev',
      label: 'Rising Complaint Volumes',
      value: `${grievanceCount} new this month`,
      context: 'Up 18% vs same period last year',
      severity: 'warning',
      icon: 'alert-triangle',
    },
    {
      id: 'sm',
      label: 'Smart Meter Comm. Issues',
      value: `${smIssues} meters offline`,
      context: 'Communication failure > 48 hrs',
      severity: 'warning',
      icon: 'zap',
    },
    {
      id: 'tf',
      label: 'Rising Transformer Failures',
      value: `${tFailures} failures this month`,
      context: 'Up 22% vs last month',
      severity: 'warning',
      icon: 'alert-triangle',
    },
  ]
}
```

- [ ] **Step 2: Verify the file compiles cleanly**

Run: `npx tsc --noEmit`
Expected: no errors in `src/modules/overview/mockData.ts`

- [ ] **Step 3: Commit**

```bash
git add src/modules/overview/mockData.ts
git commit -m "feat(overview): add mock data layer with all generators"
```

---

## Task 2: OverviewPage — Full Replacement

**Files:**
- Modify: `src/modules/overview/OverviewPage.tsx` (full replacement)

**Interfaces — Consumes (all from Task 1):**
```ts
import {
  getOverviewKpis, getAtcLossTrend, getRevenueTrend, getSmartMeterTrend,
  getOverviewHeatmapData, getPerformerRankings, getExecutiveAlerts,
  MONTHS, DIVISIONS,
  type Filters, type OverviewHeatmapMetric, type PerformerMetric,
  type DivisionRank, type ExecutiveAlert,
} from './mockData'
```

- [ ] **Step 1: Replace `src/modules/overview/OverviewPage.tsx` with the full implementation below**

```tsx
import React, { useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import { TrendingDown, AlertTriangle, Zap, CheckCircle, AlertCircle } from 'lucide-react'
import { useFilterStore } from '../../store/filterStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import {
  getOverviewKpis, getAtcLossTrend, getRevenueTrend, getSmartMeterTrend,
  getOverviewHeatmapData, getPerformerRankings, getExecutiveAlerts,
  MONTHS, DIVISIONS,
  type Filters, type OverviewHeatmapMetric, type PerformerMetric,
  type DivisionRank, type ExecutiveAlert,
} from './mockData'

const C = {
  primary: '#2563EB', success: '#16A34A', warning: '#F59E0B',
  error: '#DC2626', gray: '#9CA3AF', teal: '#0891B2', grid: '#E5E7EB',
}
const ax = { fontSize: 11, fill: '#6B7280' }

// ── Heatmap helpers ───────────────────────────────────────────────────────────

function heatCell(value: number, metric: OverviewHeatmapMetric): string {
  if (metric === 'atcLoss')         return value < 15 ? '#DCFCE7' : value < 25 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'collectionEff')   return value > 95 ? '#DCFCE7' : value > 90 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'slaCompliance')   return value > 95 ? '#DCFCE7' : value > 85 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'smartMeterPct')   return value > 60 ? '#DCFCE7' : value > 30 ? '#FEF9C3' : '#FEE2E2'
  return value < 5 ? '#DCFCE7' : value < 15 ? '#FEF9C3' : '#FEE2E2' // outstandingDues
}

function formatHeatCell(value: number, metric: OverviewHeatmapMetric): string {
  if (metric === 'outstandingDues') return `₹${value.toFixed(1)}`
  return `${value}%`
}

// ── Badge helper ──────────────────────────────────────────────────────────────

function metricBadge(value: number, metric: PerformerMetric) {
  let cls: string
  if (metric === 'atcLoss') {
    cls = value < 15 ? 'bg-green-50 text-success' : value < 25 ? 'bg-yellow-50 text-warning' : 'bg-red-50 text-error'
  } else if (metric === 'collectionEff') {
    cls = value > 95 ? 'bg-green-50 text-success' : value > 90 ? 'bg-yellow-50 text-warning' : 'bg-red-50 text-error'
  } else {
    cls = value > 60 ? 'bg-green-50 text-success' : value > 30 ? 'bg-yellow-50 text-warning' : 'bg-red-50 text-error'
  }
  return (
    <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${cls}`}>
      {value}%
    </span>
  )
}

// ── Section 1: KPI Overview ───────────────────────────────────────────────────

function KpiSection({ filters }: { filters: Filters }) {
  const kpi = useMemo(() => getOverviewKpis(filters), [filters])

  const cards = [
    { label: 'Total Consumers',          value: kpi.totalConsumers.toLocaleString('en-IN'),  trend: '2,140', trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Energy Input (MU)',         value: String(kpi.energyInput),                     trend: '3.1 MU', trendDirection: 'up'  as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Energy Sold (MU)',          value: String(kpi.energySold),                      trend: '2.4 MU', trendDirection: 'up'  as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Open Grievances',           value: String(kpi.openGrievances),                  trend: '12',    trendDirection: 'down' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'AT&C Loss %',              value: `${kpi.atcLoss}%`,                           trend: '0.8%',  trendDirection: 'down' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Revenue Collected (₹ Cr)', value: `₹${kpi.revenueCollected}`,                  trend: '₹4.2 Cr', trendDirection: 'up' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Collection Efficiency %',  value: `${kpi.collectionEfficiency}%`,               trend: '0.3%',  trendDirection: 'up'  as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Smart Meter Penetration %', value: `${kpi.smartMeterPenetration}%`,             trend: '1.4%',  trendDirection: 'up'  as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
  ]

  return (
    <div className="grid grid-cols-4 gap-4">
      {cards.map((k) => <KpiCard key={k.label} {...k} />)}
    </div>
  )
}

// ── Section 2: Division Performance Heatmap ───────────────────────────────────

const HEAT_METRICS: { value: OverviewHeatmapMetric; label: string }[] = [
  { value: 'atcLoss',         label: 'AT&C Loss %'              },
  { value: 'collectionEff',   label: 'Collection Efficiency %'  },
  { value: 'slaCompliance',   label: 'SLA Compliance %'         },
  { value: 'smartMeterPct',   label: 'Smart Meter Penetration %' },
  { value: 'outstandingDues', label: 'Outstanding Dues (₹ Cr)'  },
]

function DivisionHeatmap({ filters }: { filters: Filters }) {
  const [metric, setMetric] = useState<OverviewHeatmapMetric>('atcLoss')
  const data = useMemo(() => getOverviewHeatmapData(filters, metric), [filters, metric])

  const cellMap = useMemo(() => {
    const m: Record<string, Record<string, number>> = {}
    for (const cell of data) {
      if (!m[cell.division]) m[cell.division] = {}
      m[cell.division][cell.month] = cell.value
    }
    return m
  }, [data])

  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border-base flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-text-primary">Division Performance by Month</h3>
          <p className="text-[12px] text-text-secondary mt-0.5">
            All 18 divisions × 12 months — Green good, Amber watch, Red poor
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {HEAT_METRICS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMetric(opt.value)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
                metric === opt.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-transparent text-text-secondary border-border-base hover:text-text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="grid" style={{ gridTemplateColumns: '160px repeat(12, 1fr)', minWidth: 900 }}>
          <div />
          {MONTHS.map((m) => (
            <div
              key={m}
              className="text-center text-[10px] font-semibold uppercase tracking-wide text-text-secondary pb-2 px-0.5"
            >
              {m}
            </div>
          ))}
          {DIVISIONS.map((div) => (
            <React.Fragment key={div}>
              <div
                className="text-[12px] font-medium text-text-primary py-1.5 pr-3 flex items-center border-t border-border-base"
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {div}
              </div>
              {MONTHS.map((month) => {
                const value = cellMap[div]?.[month] ?? 0
                return (
                  <div
                    key={month}
                    className="py-1.5 text-center text-[10px] font-semibold border-t border-border-base mx-0.5 rounded"
                    style={{ backgroundColor: heatCell(value, metric), color: '#111827' }}
                  >
                    {formatHeatCell(value, metric)}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Section 3: Department Performance Summary ─────────────────────────────────

function DeptPerformanceSummary({ filters }: { filters: Filters }) {
  const atcTrend    = useMemo(() => getAtcLossTrend(filters),    [filters])
  const revTrend    = useMemo(() => getRevenueTrend(filters),     [filters])
  const meterTrend  = useMemo(() => getSmartMeterTrend(filters),  [filters])

  return (
    <div className="grid grid-cols-3 gap-4">
      <ChartCard title="AT&C Loss Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={atcTrend} margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={40}
              tickFormatter={(v) => `${v}%`} domain={[8, 32]} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
            <ReferenceLine y={15} stroke={C.warning} strokeDasharray="4 2"
              label={{ value: 'Target 15%', fill: C.warning, fontSize: 10, position: 'right' }} />
            <Line type="monotone" dataKey="atcLoss" name="AT&C Loss %"
              stroke={C.error} strokeWidth={2} dot={{ r: 3, fill: C.error }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Revenue Collection Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={revTrend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={52}
              tickFormatter={(v) => `₹${v}`} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `₹${v} Cr`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="billed" name="Billed"
              stroke={C.primary} fill={C.primary} fillOpacity={0.1} strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="collected" name="Collected"
              stroke={C.success} fill={C.success} fillOpacity={0.15} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Smart Meter Rollout Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={meterTrend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={44}
              tickFormatter={(v) => `${v}K`} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}K meters`} />
            <Area type="monotone" dataKey="metersInstalled" name="Meters Installed"
              stroke={C.teal} fill={C.teal} fillOpacity={0.2} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Section 4: Top & Bottom Performers ───────────────────────────────────────

const PERFORMER_METRICS: { value: PerformerMetric; label: string }[] = [
  { value: 'atcLoss',       label: 'AT&C Loss %'            },
  { value: 'collectionEff', label: 'Collection Efficiency %' },
  { value: 'smartMeterPct', label: 'Smart Meter %'           },
]

function RankedList({
  title,
  rows,
  metric,
  accent,
  icon: Icon,
}: {
  title: string
  rows: DivisionRank[]
  metric: PerformerMetric
  accent: string
  icon: React.ElementType
}) {
  return (
    <div className={`bg-surface border rounded-xl shadow-sm overflow-hidden ${accent}`}>
      <div className="px-4 py-3 border-b border-border-base flex items-center gap-2">
        <Icon size={14} className={accent.includes('success') ? 'text-success' : 'text-error'} />
        <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="divide-y divide-border-base">
        {rows.map((row, idx) => (
          <div key={row.division} className="px-4 py-2.5 flex items-center justify-between gap-4 hover:bg-background transition-colors">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-[11px] font-bold text-text-secondary w-4 shrink-0">{idx + 1}</span>
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-text-primary truncate">{row.division}</p>
                <p className="text-[11px] text-text-secondary">
                  Coll. Eff. {row.collectionEff}% · Grievances: {row.grievances}
                </p>
              </div>
            </div>
            {metricBadge(row.primary, metric)}
          </div>
        ))}
      </div>
    </div>
  )
}

function TopBottomPerformers({ filters }: { filters: Filters }) {
  const [metric, setMetric] = useState<PerformerMetric>('atcLoss')
  const { best, worst } = useMemo(() => getPerformerRankings(filters, metric), [filters, metric])

  return (
    <div className="space-y-3">
      <div className="flex gap-1.5">
        {PERFORMER_METRICS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setMetric(opt.value)}
            className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
              metric === opt.value
                ? 'bg-primary text-white border-primary'
                : 'bg-transparent text-text-secondary border-border-base hover:text-text-primary'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <RankedList
          title="Best Performing Divisions"
          rows={best}
          metric={metric}
          accent="border-success/40"
          icon={CheckCircle}
        />
        <RankedList
          title="Attention Required"
          rows={worst}
          metric={metric}
          accent="border-error/40"
          icon={AlertCircle}
        />
      </div>
    </div>
  )
}

// ── Section 5: Executive Alerts ───────────────────────────────────────────────

const ALERT_ICONS: Record<ExecutiveAlert['icon'], React.ElementType> = {
  'trending-down':  TrendingDown,
  'alert-triangle': AlertTriangle,
  'zap':            Zap,
}

function ExecutiveAlertsPanel({ filters }: { filters: Filters }) {
  const alerts = useMemo(() => getExecutiveAlerts(filters), [filters])
  return (
    <div className="grid grid-cols-5 gap-4">
      {alerts.map((alert) => {
        const Icon    = ALERT_ICONS[alert.icon]
        const isError = alert.severity === 'error'
        return (
          <div
            key={alert.id}
            className={`bg-surface border rounded-xl p-4 ${isError ? 'border-error/40' : 'border-warning/40'}`}
          >
            <div className={`flex items-center gap-2 mb-2 ${isError ? 'text-error' : 'text-warning'}`}>
              <Icon size={14} />
              <span className="text-[10px] font-semibold uppercase tracking-wide leading-tight">
                {alert.label}
              </span>
            </div>
            <p className="text-[15px] font-bold text-text-primary leading-tight">{alert.value}</p>
            <p className="text-[12px] text-text-secondary mt-1">{alert.context}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function OverviewPage() {
  const financialYear = useFilterStore((s) => s.financialYear)
  const month         = useFilterStore((s) => s.month)
  const circle        = useFilterStore((s) => s.circle)
  const division      = useFilterStore((s) => s.division)
  const subdivision   = useFilterStore((s) => s.subdivision)

  const filters = useMemo<Filters>(
    () => ({ financialYear, month, circle, division, subdivision }),
    [financialYear, month, circle, division, subdivision],
  )

  return (
    <div>
      <PageHeader title="Overview" subtitle="Department-wide performance summary — Goa Electricity Department">
        <GlobalFilterBar />
      </PageHeader>
      <div className="py-5">
        <SectionContainer title="KPI Overview">
          <KpiSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Division Performance Heatmap">
          <DivisionHeatmap filters={filters} />
        </SectionContainer>

        <SectionContainer title="Department Performance Summary">
          <DeptPerformanceSummary filters={filters} />
        </SectionContainer>

        <SectionContainer title="Top & Bottom Performers">
          <TopBottomPerformers filters={filters} />
        </SectionContainer>

        <SectionContainer title="Executive Alerts">
          <ExecutiveAlertsPanel filters={filters} />
        </SectionContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: zero errors

- [ ] **Step 3: Start the dev server and verify the page visually**

Run: `npm run dev`
Open: `http://localhost:5173` (or whichever port is shown)

Check each section renders correctly:
- 8 KPI cards in a 4×2 grid
- Heatmap with all 18 divisions and 12 month columns; metric pills switch colours
- 3 trend charts side by side
- Performer lists re-rank when metric pills are clicked
- 5 alert cards in a row

- [ ] **Step 4: Change the Financial Year filter and confirm all data updates**

Expected: KPI values, heatmap values, chart lines, performer rankings, and alert values all change.

- [ ] **Step 5: Commit**

```bash
git add src/modules/overview/OverviewPage.tsx
git commit -m "feat(overview): implement full executive overview page"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| 8 KPIs (Total Consumers, Energy Input, Energy Sold, AT&C Loss %, Revenue Collected, Collection Efficiency %, Smart Meter Penetration %, Open Grievances) | Task 1 `getOverviewKpis` + Task 2 `KpiSection` |
| Division heatmap — 18 divisions × 12 months | Task 1 `getOverviewHeatmapData` + Task 2 `DivisionHeatmap` |
| Heatmap metric selector (5 metrics) | Task 2 `HEAT_METRICS` + `DivisionHeatmap` |
| AT&C Loss Trend chart | Task 1 `getAtcLossTrend` + Task 2 `DeptPerformanceSummary` |
| Revenue Collection Trend | Task 1 `getRevenueTrend` + Task 2 `DeptPerformanceSummary` |
| Smart Meter Rollout Trend | Task 1 `getSmartMeterTrend` + Task 2 `DeptPerformanceSummary` |
| Top & Bottom performers (ranked card lists, shared metric selector) | Task 1 `getPerformerRankings` + Task 2 `TopBottomPerformers` + `RankedList` |
| Executive alerts (5 types, error/warning severity) | Task 1 `getExecutiveAlerts` + Task 2 `ExecutiveAlertsPanel` |
| Filter-reactive data | `useMemo(filters)` in every section component |
| No map placeholder | Removed — not present in the page |

**Placeholder scan:** No TBDs, no "similar to above", no incomplete steps. All code is complete.

**Type consistency:**
- `OverviewHeatmapMetric` defined in Task 1, used in `heatCell`, `formatHeatCell`, `DivisionHeatmap`, `HEAT_METRICS` in Task 2 ✓
- `PerformerMetric` defined in Task 1, used in `metricBadge`, `getPerformerRankings`, `RankedList`, `PERFORMER_METRICS` in Task 2 ✓
- `DivisionRank` defined in Task 1, used in `RankedList` prop type in Task 2 ✓
- `ExecutiveAlert['icon']` union defined in Task 1, keyed by `ALERT_ICONS` in Task 2 ✓
- `Filters` interface defined in Task 1, consumed by every section prop in Task 2 ✓
