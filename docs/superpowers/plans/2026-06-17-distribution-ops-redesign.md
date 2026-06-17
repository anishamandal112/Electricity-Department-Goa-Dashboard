# Distribution Operations Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the placeholder `DistributionOpsPage.tsx` with a full analytics page covering energy flow, AT&C losses, network reliability, transformer health, and division performance.

**Architecture:** Two files — `mockData.ts` for all types and deterministic generators, `DistributionOpsPage.tsx` for the page split into focused sub-components. Pattern mirrors `MeterManagementPage` exactly: each logical section is its own function component accepting `filters: Filters`, all data calls wrapped in `useMemo`.

**Tech Stack:** React 18, TypeScript, Recharts (already installed), Tailwind CSS, lucide-react, Vitest

## Global Constraints

- No new npm dependencies
- Hand-rolled sortable/paginated table — no MUI DataGrid
- 18 Goa ED divisions: same names as in `src/modules/meter-management/mockData.ts`
- Color palette: `C = { primary:'#2563EB', success:'#16A34A', warning:'#F59E0B', error:'#DC2626', gray:'#9CA3AF', orange:'#EA580C', teal:'#0891B2', purple:'#7C3AED', grid:'#E5E7EB' }`
- Axis style: `ax = { fontSize: 11, fill: '#6B7280' }`
- Heatmap cell colors: green `#DCFCE7`, amber `#FEF9C3`, red `#FEE2E2`
- All generators must be deterministic (same `Filters` → same output)
- Run `npm test` after every mockData task; run `npm run build` after every page task

---

## File Map

| File | Action | Responsibility |
|---|---|---|
| `src/modules/distribution-ops/mockData.ts` | Create | All types, constants, and 11 generator functions |
| `src/modules/distribution-ops/mockData.test.ts` | Create | Vitest tests for all generators |
| `src/modules/distribution-ops/DistributionOpsPage.tsx` | Replace | Full page with 7 sub-components |

---

## Task 1: mockData.ts — Types, Constants, and All Generators

**Files:**
- Create: `src/modules/distribution-ops/mockData.ts`
- Create: `src/modules/distribution-ops/mockData.test.ts`

**Interfaces:**
- Produces: All types and generator functions consumed by Tasks 2–6

- [ ] **Step 1: Write the failing tests**

Create `src/modules/distribution-ops/mockData.test.ts`:

```typescript
import { describe, it, expect } from 'vitest'
import {
  getDistributionKpis, getEnergyTrend, getAtcLossTrend, getDivisionAtcRanking,
  getReliabilityTrend, getOutageTrend, getDtLoadingDistribution, getTopDtFailureDivisions,
  getDivisionHeatmapData, getDivisionTableData, getInsights,
  MONTHS, DIVISIONS,
  type Filters,
} from './mockData'

const F: Filters = {
  financialYear: '2024-25', month: 'All',
  circle: 'All', division: 'All', subdivision: 'All',
}

describe('getDistributionKpis', () => {
  it('is deterministic', () => {
    expect(getDistributionKpis(F)).toEqual(getDistributionKpis(F))
  })
  it('energyInput > energySold', () => {
    const k = getDistributionKpis(F)
    expect(k.energyInput).toBeGreaterThan(k.energySold)
  })
  it('atcLoss in 12–28', () => {
    const v = getDistributionKpis(F).atcLoss
    expect(v).toBeGreaterThanOrEqual(12)
    expect(v).toBeLessThanOrEqual(28)
  })
  it('powerAvailability in 94–99.9', () => {
    const v = getDistributionKpis(F).powerAvailability
    expect(v).toBeGreaterThanOrEqual(94)
    expect(v).toBeLessThanOrEqual(99.9)
  })
  it('varies between financial years', () => {
    const a = getDistributionKpis({ ...F, financialYear: '2023-24' }).atcLoss
    const b = getDistributionKpis({ ...F, financialYear: '2025-26' }).atcLoss
    expect(a).not.toBe(b)
  })
})

describe('getEnergyTrend', () => {
  it('returns 12 months', () => expect(getEnergyTrend(F)).toHaveLength(12))
  it('first month is Apr, last is Mar', () => {
    const t = getEnergyTrend(F)
    expect(t[0].month).toBe('Apr')
    expect(t[11].month).toBe('Mar')
  })
  it('energyInput > energySold for every month', () => {
    getEnergyTrend(F).forEach(p => expect(p.energyInput).toBeGreaterThan(p.energySold))
  })
})

describe('getAtcLossTrend', () => {
  it('returns 12 months', () => expect(getAtcLossTrend(F)).toHaveLength(12))
  it('all atcLoss values in 10–30', () => {
    getAtcLossTrend(F).forEach(p => {
      expect(p.atcLoss).toBeGreaterThanOrEqual(10)
      expect(p.atcLoss).toBeLessThanOrEqual(30)
    })
  })
})

describe('getDivisionAtcRanking', () => {
  it('returns 18 rows', () => expect(getDivisionAtcRanking(F)).toHaveLength(18))
  it('sorted descending by atcLoss', () => {
    const rows = getDivisionAtcRanking(F)
    for (let i = 1; i < rows.length; i++)
      expect(rows[i - 1].atcLoss).toBeGreaterThanOrEqual(rows[i].atcLoss)
  })
})

describe('getReliabilityTrend', () => {
  it('returns 12 months', () => expect(getReliabilityTrend(F)).toHaveLength(12))
  it('saifi in 0.2–1.2', () => {
    getReliabilityTrend(F).forEach(p => {
      expect(p.saifi).toBeGreaterThanOrEqual(0.2)
      expect(p.saifi).toBeLessThanOrEqual(1.2)
    })
  })
  it('saidi in 0.8–6.0', () => {
    getReliabilityTrend(F).forEach(p => {
      expect(p.saidi).toBeGreaterThanOrEqual(0.8)
      expect(p.saidi).toBeLessThanOrEqual(6.0)
    })
  })
})

describe('getOutageTrend', () => {
  it('returns 12 months', () => expect(getOutageTrend(F)).toHaveLength(12))
  it('all counts positive', () => {
    getOutageTrend(F).forEach(p => {
      expect(p.planned).toBeGreaterThan(0)
      expect(p.unplanned).toBeGreaterThan(0)
    })
  })
})

describe('getDtLoadingDistribution', () => {
  it('returns exactly 3 rows', () => expect(getDtLoadingDistribution(F)).toHaveLength(3))
  it('categories are Normal, Overloaded, Critical', () => {
    const cats = getDtLoadingDistribution(F).map(r => r.category)
    expect(cats).toEqual(['Normal', 'Overloaded', 'Critical'])
  })
  it('all counts positive', () => {
    getDtLoadingDistribution(F).forEach(r => expect(r.count).toBeGreaterThan(0))
  })
})

describe('getTopDtFailureDivisions', () => {
  it('returns 8 rows', () => expect(getTopDtFailureDivisions(F)).toHaveLength(8))
  it('sorted descending by failures', () => {
    const rows = getTopDtFailureDivisions(F)
    for (let i = 1; i < rows.length; i++)
      expect(rows[i - 1].failures).toBeGreaterThanOrEqual(rows[i].failures)
  })
})

describe('getDivisionHeatmapData', () => {
  it('returns 216 cells (18 × 12)', () => {
    expect(getDivisionHeatmapData(F, 'atcLoss')).toHaveLength(216)
  })
  it('atcLoss cells in 8–35', () => {
    getDivisionHeatmapData(F, 'atcLoss').forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(8)
      expect(c.value).toBeLessThanOrEqual(35)
    })
  })
  it('saifi cells in 0.1–1.5', () => {
    getDivisionHeatmapData(F, 'saifi').forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(0.1)
      expect(c.value).toBeLessThanOrEqual(1.5)
    })
  })
  it('metric change produces different values', () => {
    const a = getDivisionHeatmapData(F, 'atcLoss')[0].value
    const b = getDivisionHeatmapData(F, 'saifi')[0].value
    expect(a).not.toBe(b)
  })
  it('is deterministic', () => {
    expect(getDivisionHeatmapData(F, 'outages')).toEqual(getDivisionHeatmapData(F, 'outages'))
  })
})

describe('getDivisionTableData', () => {
  it('returns 18 rows', () => expect(getDivisionTableData(F)).toHaveLength(18))
  it('all divisions present', () => {
    const names = getDivisionTableData(F).map(r => r.division)
    DIVISIONS.forEach(d => expect(names).toContain(d))
  })
  it('status is critical, warning, or ok', () => {
    getDivisionTableData(F).forEach(r =>
      expect(['critical', 'warning', 'ok']).toContain(r.status)
    )
  })
  it('atcLoss in 10–30 for all rows', () => {
    getDivisionTableData(F).forEach(r => {
      expect(r.atcLoss).toBeGreaterThanOrEqual(10)
      expect(r.atcLoss).toBeLessThanOrEqual(30)
    })
  })
})

describe('getInsights', () => {
  it('returns exactly 5 insights', () => expect(getInsights(F)).toHaveLength(5))
  it('every insight has a non-empty value', () => {
    getInsights(F).forEach(i => expect(i.value.length).toBeGreaterThan(0))
  })
  it('includes highest-atc insight', () => {
    expect(getInsights(F).map(i => i.id)).toContain('highest-atc')
  })
  it('includes deteriorating insight', () => {
    expect(getInsights(F).map(i => i.id)).toContain('deteriorating')
  })
  it('is deterministic', () => {
    expect(getInsights(F)).toEqual(getInsights(F))
  })
})

describe('MONTHS / DIVISIONS', () => {
  it('MONTHS has 12 entries starting Apr', () => {
    expect(MONTHS).toHaveLength(12)
    expect(MONTHS[0]).toBe('Apr')
    expect(MONTHS[11]).toBe('Mar')
  })
  it('DIVISIONS has 18 entries', () => {
    expect(DIVISIONS).toHaveLength(18)
  })
})
```

- [ ] **Step 2: Run tests — verify they fail (module not found)**

```bash
npm test -- mockData.test.ts --reporter=verbose 2>&1 | head -30
```

Expected: `Cannot find module './mockData'`

- [ ] **Step 3: Create `src/modules/distribution-ops/mockData.ts`**

```typescript
// --- Types ---
export interface Filters {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
}

export type DivisionHeatmapMetric = 'atcLoss' | 'saifi' | 'saidi' | 'outages' | 'dtFailures'

export interface DistributionKpis {
  energyInput: number
  energySold: number
  atcLoss: number
  distributionLoss: number
  peakDemand: number
  powerAvailability: number
}

export interface EnergyPoint      { month: string; energyInput: number; energySold: number }
export interface AtcLossPoint     { month: string; atcLoss: number }
export interface DivisionLossBar  { division: string; atcLoss: number }
export interface ReliabilityPoint { month: string; saifi: number; saidi: number }
export interface OutagePoint      { month: string; planned: number; unplanned: number }
export interface DtLoadingBar     { category: string; count: number }
export interface DtFailureBar     { division: string; failures: number }
export interface DivisionHeatCell { division: string; month: string; value: number }

export interface DivisionTableRow {
  division: string
  energyInput: number
  energySold: number
  atcLoss: number
  peakDemand: number
  saifi: number
  saidi: number
  outages: number
  dtFailures: number
  status: 'critical' | 'warning' | 'ok'
}

export interface DistributionInsight {
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

export function getDistributionKpis(filters: Filters): DistributionKpis {
  const s = seed(filters.financialYear + filters.month)
  const energyInput = parseFloat((148.0 + (s % 180) / 10).toFixed(1))
  const atcLoss     = parseFloat((14.0 + (s % 140) / 10).toFixed(1))
  const distLoss    = parseFloat((atcLoss * 0.67).toFixed(1))
  const energySold  = parseFloat((energyInput * (1 - atcLoss / 100)).toFixed(1))
  const peakDemand  = parseFloat((295.0 + (s % 180) / 5).toFixed(1))
  const powerAvailability = parseFloat((96.5 + (s % 30) / 10).toFixed(1))
  return { energyInput, energySold, atcLoss, distributionLoss: distLoss, peakDemand, powerAvailability }
}

export function getEnergyTrend(filters: Filters): EnergyPoint[] {
  return MONTHS.map((month, i) => {
    const s = seed(filters.financialYear + month + 'energy')
    const energyInput = parseFloat((140.0 + i * 0.8 + (s % 160) / 10).toFixed(1))
    const atcPct = 0.14 + (s % 60) / 1000
    const energySold = parseFloat((energyInput * (1 - atcPct)).toFixed(1))
    return { month, energyInput, energySold }
  })
}

export function getAtcLossTrend(filters: Filters): AtcLossPoint[] {
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'atc')
    const atcLoss = parseFloat((13.5 + (s % 165) / 10).toFixed(1))
    return { month, atcLoss }
  })
}

export function getDivisionAtcRanking(filters: Filters): DivisionLossBar[] {
  return DIVISIONS
    .map((division) => {
      const s = seed(filters.financialYear + division + 'atcrank')
      const atcLoss = parseFloat((11.0 + (s % 200) / 10).toFixed(1))
      return { division, atcLoss }
    })
    .sort((a, b) => b.atcLoss - a.atcLoss)
}

export function getReliabilityTrend(filters: Filters): ReliabilityPoint[] {
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'reliability')
    const saifi = parseFloat((0.25 + (s % 95) / 100).toFixed(2))
    const saidi = parseFloat((1.2 + (s % 480) / 100).toFixed(2))
    return { month, saifi, saidi }
  })
}

export function getOutageTrend(filters: Filters): OutagePoint[] {
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'outage')
    const planned   = 8  + (s % 14)
    const unplanned = 14 + (s % 22)
    return { month, planned, unplanned }
  })
}

export function getDtLoadingDistribution(filters: Filters): DtLoadingBar[] {
  const s = seed(filters.financialYear + filters.division + 'dtload')
  return [
    { category: 'Normal',     count: 2400 + (s % 300) },
    { category: 'Overloaded', count: 320  + (s % 120) },
    { category: 'Critical',   count: 80   + (s % 60)  },
  ]
}

export function getTopDtFailureDivisions(filters: Filters): DtFailureBar[] {
  return DIVISIONS
    .map((division) => {
      const s = seed(filters.financialYear + division + 'dtfail')
      const failures = 2 + (s % 18)
      return { division, failures }
    })
    .sort((a, b) => b.failures - a.failures)
    .slice(0, 8)
}

export function getDivisionHeatmapData(
  filters: Filters,
  metric: DivisionHeatmapMetric,
): DivisionHeatCell[] {
  const cells: DivisionHeatCell[] = []
  for (const division of DIVISIONS) {
    for (const month of MONTHS) {
      const s = seed(filters.financialYear + division + month + metric)
      let value: number
      if (metric === 'atcLoss') {
        value = parseFloat((10.0 + (s % 250) / 10).toFixed(1))
      } else if (metric === 'saifi') {
        value = parseFloat((0.15 + (s % 135) / 100).toFixed(2))
      } else if (metric === 'saidi') {
        value = parseFloat((0.8 + (s % 520) / 100).toFixed(2))
      } else if (metric === 'outages') {
        value = 2 + (s % 18)
      } else {
        value = (s % 12)
      }
      cells.push({ division, month, value })
    }
  }
  return cells
}

export function getDivisionTableData(filters: Filters): DivisionTableRow[] {
  return DIVISIONS.map((division) => {
    const s = seed(filters.financialYear + division + 'distops')
    const energyInput = parseFloat((6.5 + (s % 130) / 10).toFixed(1))
    const atcLoss     = parseFloat((11.0 + (s % 190) / 10).toFixed(1))
    const energySold  = parseFloat((energyInput * (1 - atcLoss / 100)).toFixed(1))
    const peakDemand  = parseFloat((12.0 + (s % 220) / 5).toFixed(1))
    const saifi       = parseFloat((0.2 + (s % 100) / 100).toFixed(2))
    const saidi       = parseFloat((1.0 + (s % 500) / 100).toFixed(2))
    const outages     = 3 + (s % 20)
    const dtFailures  = (s % 14)
    const status: 'critical' | 'warning' | 'ok' =
      atcLoss > 22 || dtFailures > 8 ? 'critical'
      : atcLoss > 16 || dtFailures > 4 ? 'warning'
      : 'ok'
    return { division, energyInput, energySold, atcLoss, peakDemand, saifi, saidi, outages, dtFailures, status }
  })
}

export function getInsights(filters: Filters): DistributionInsight[] {
  const rows = getDivisionTableData(filters)

  const highestAtc   = [...rows].sort((a, b) => b.atcLoss - a.atcLoss)[0]
  const worstSaidi   = [...rows].sort((a, b) => b.saidi - a.saidi)[0]
  const mostOutages  = [...rows].sort((a, b) => b.outages - a.outages)[0]
  const risingDt     = [...rows].sort((a, b) => b.dtFailures - a.dtFailures)[0]

  // deteriorating: division with highest atcLoss among warning/critical
  const deteriorating = rows.find(r => r.status === 'critical') ?? rows.find(r => r.status === 'warning') ?? rows[0]

  return [
    {
      id: 'highest-atc',
      label: 'Highest AT&C Loss',
      value: highestAtc.division,
      context: `${highestAtc.atcLoss}% — ${highestAtc.atcLoss > 22 ? 'critical threshold exceeded' : 'above 15% target'}`,
      severity: 'error',
      icon: 'trending-down',
    },
    {
      id: 'worst-reliability',
      label: 'Worst Reliability (SAIDI)',
      value: worstSaidi.division,
      context: `${worstSaidi.saidi} hrs/consumer this month`,
      severity: 'error',
      icon: 'alert-triangle',
    },
    {
      id: 'most-outages',
      label: 'Most Outage-Prone',
      value: mostOutages.division,
      context: `${mostOutages.outages} outages this month`,
      severity: 'warning',
      icon: 'zap',
    },
    {
      id: 'rising-dt',
      label: 'Rising DT Failures',
      value: risingDt.division,
      context: `${risingDt.dtFailures} failures — trending up`,
      severity: 'warning',
      icon: 'alert-triangle',
    },
    {
      id: 'deteriorating',
      label: 'Month-on-Month Decline',
      value: deteriorating.division,
      context: `AT&C loss at ${deteriorating.atcLoss}% — deteriorating trend`,
      severity: 'warning',
      icon: 'trending-down',
    },
  ]
}
```

- [ ] **Step 4: Run tests — verify all pass**

```bash
npm test -- src/modules/distribution-ops/mockData.test.ts --reporter=verbose
```

Expected: All tests green. Fix any range failures by adjusting seed arithmetic in the relevant generator until the range assertion passes.

- [ ] **Step 5: Commit**

```bash
git add src/modules/distribution-ops/mockData.ts src/modules/distribution-ops/mockData.test.ts
git commit -m "feat(distribution-ops): add mockData types and generators"
```

---

## Task 2: Page Shell + KPI Overview + Energy & Loss Analytics

**Files:**
- Replace: `src/modules/distribution-ops/DistributionOpsPage.tsx`

**Interfaces:**
- Consumes: `getDistributionKpis`, `getEnergyTrend`, `getAtcLossTrend`, `getDivisionAtcRanking`, `Filters`, `MONTHS` from `./mockData`
- Produces: `DistributionOpsPage` export; `EnergyLossSection` sub-component

- [ ] **Step 1: Replace `DistributionOpsPage.tsx` with the shell + first two sections**

```typescript
import React, { useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import {
  TrendingDown, AlertTriangle, Zap,
  ChevronUp, ChevronDown, Search,
} from 'lucide-react'
import { useFilterStore } from '../../store/filterStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import {
  getDistributionKpis, getEnergyTrend, getAtcLossTrend, getDivisionAtcRanking,
  getReliabilityTrend, getOutageTrend, getDtLoadingDistribution, getTopDtFailureDivisions,
  getDivisionHeatmapData, getDivisionTableData, getInsights,
  MONTHS,
  type DivisionHeatmapMetric, type Filters, type DivisionTableRow, type DistributionInsight,
} from './mockData'

const C = {
  primary: '#2563EB', success: '#16A34A', warning: '#F59E0B',
  error: '#DC2626', gray: '#9CA3AF', orange: '#EA580C',
  teal: '#0891B2', purple: '#7C3AED', grid: '#E5E7EB',
}
const ax = { fontSize: 11, fill: '#6B7280' }

// ── Energy & Loss Analytics ───────────────────────────────────────────────────

function atcBarColor(value: number): string {
  return value < 15 ? C.success : value < 25 ? C.warning : C.error
}

function EnergyLossSection({ filters }: { filters: Filters }) {
  const energyTrend   = useMemo(() => getEnergyTrend(filters),          [filters])
  const atcTrend      = useMemo(() => getAtcLossTrend(filters),         [filters])
  const divisionRank  = useMemo(() => getDivisionAtcRanking(filters),   [filters])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Energy Input vs Sold */}
        <div className="col-span-7">
          <ChartCard title="Energy Input vs Energy Sold" timeContext="Apr – Mar (Financial Year)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={energyTrend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
                <YAxis tick={ax} axisLine={false} tickLine={false} width={52}
                  tickFormatter={(v) => `${v} MU`} />
                <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v} MU`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="energyInput" name="Energy Input"
                  stroke={C.primary} fill={C.primary} fillOpacity={0.15} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="energySold" name="Energy Sold"
                  stroke={C.success} fill={C.success} fillOpacity={0.15} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* AT&C Loss Trend */}
        <div className="col-span-5">
          <ChartCard title="AT&C Loss Trend" timeContext="Apr – Mar (Financial Year)">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={atcTrend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
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
        </div>
      </div>

      {/* Division AT&C Ranking */}
      <ChartCard title="Division-wise AT&C Loss Ranking" timeContext="Current Period">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={divisionRank} layout="vertical"
            margin={{ top: 4, right: 56, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
            <XAxis type="number" tick={ax} axisLine={false} tickLine={false}
              domain={[0, 32]} unit="%" />
            <YAxis dataKey="division" type="category" tick={ax} axisLine={false}
              tickLine={false} width={130} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
            <ReferenceLine x={15} stroke={C.warning} strokeDasharray="4 2"
              label={{ value: 'Target 15%', fill: C.warning, fontSize: 10, position: 'right' }} />
            <Bar dataKey="atcLoss" name="AT&C Loss %" radius={[0, 2, 2, 0]} maxBarSize={14}>
              {divisionRank.map((d) => (
                <Bar key={d.division} dataKey="atcLoss" fill={atcBarColor(d.atcLoss)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Placeholders for later tasks ──────────────────────────────────────────────

function NetworkReliabilitySection(_: { filters: Filters }) {
  return <div className="h-40 flex items-center justify-center text-text-secondary text-[13px]">Network Reliability — coming in Task 3</div>
}

function DistributionInfraSection(_: { filters: Filters }) {
  return <div className="h-40 flex items-center justify-center text-text-secondary text-[13px]">Distribution Infrastructure — coming in Task 3</div>
}

function DivisionHeatmap(_: { filters: Filters }) {
  return <div className="h-40 flex items-center justify-center text-text-secondary text-[13px]">Division Heatmap — coming in Task 4</div>
}

function DivisionTable(_: { filters: Filters }) {
  return <div className="h-40 flex items-center justify-center text-text-secondary text-[13px]">Operations Table — coming in Task 5</div>
}

function AttentionPanel(_: { filters: Filters }) {
  return <div className="h-40 flex items-center justify-center text-text-secondary text-[13px]">Attention Required — coming in Task 6</div>
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function DistributionOpsPage() {
  const financialYear = useFilterStore((s) => s.financialYear)
  const month         = useFilterStore((s) => s.month)
  const circle        = useFilterStore((s) => s.circle)
  const division      = useFilterStore((s) => s.division)
  const subdivision   = useFilterStore((s) => s.subdivision)

  const filters = useMemo<Filters>(
    () => ({ financialYear, month, circle, division, subdivision }),
    [financialYear, month, circle, division, subdivision],
  )

  const kpi = useMemo(() => getDistributionKpis(filters), [filters])

  const KPI_CARDS = [
    { label: 'Energy Input (MU)',      value: String(kpi.energyInput),        trend: '3.2 MU', trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Energy Sold (MU)',       value: String(kpi.energySold),         trend: '2.1 MU', trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'AT&C Loss %',           value: `${kpi.atcLoss}%`,              trend: '1.2%',   trendDirection: 'down' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Distribution Loss %',   value: `${kpi.distributionLoss}%`,     trend: '0.8%',   trendDirection: 'down' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Peak Demand (MW)',       value: String(kpi.peakDemand),         trend: '8.2 MW', trendDirection: 'up'   as const, trendIsPositive: false, comparisonLabel: 'vs Last Month' },
    { label: 'Power Availability %',  value: `${kpi.powerAvailability}%`,    trend: '0.3%',   trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
  ]

  return (
    <div>
      <PageHeader
        title="Distribution Operations"
        subtitle="Energy flow, AT&C losses, network reliability, and division performance"
      />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="KPI Overview">
          <div className="grid grid-cols-6 gap-4">
            {KPI_CARDS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>

        <SectionContainer title="Energy & Loss Analytics">
          <EnergyLossSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Network Reliability">
          <NetworkReliabilitySection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Distribution Infrastructure">
          <DistributionInfraSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Division Performance Heatmap">
          <DivisionHeatmap filters={filters} />
        </SectionContainer>

        <SectionContainer title="Operations Table">
          <DivisionTable filters={filters} />
        </SectionContainer>

        <SectionContainer title="Attention Required">
          <AttentionPanel filters={filters} />
        </SectionContainer>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Fix the Bar Cell render bug**

The `<Bar>` inside a `<BarChart>` cannot have child `<Bar>` elements. Replace the Division AT&C Ranking `<Bar>` block with a `Cell` import approach:

Add `Cell` to the recharts import at the top:
```typescript
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine,
} from 'recharts'
```

Replace the ranking Bar block inside `EnergyLossSection`:
```tsx
<Bar dataKey="atcLoss" name="AT&C Loss %" radius={[0, 2, 2, 0]} maxBarSize={14}>
  {divisionRank.map((d) => (
    <Cell key={d.division} fill={atcBarColor(d.atcLoss)} />
  ))}
</Bar>
```

- [ ] **Step 3: Build and verify no TypeScript errors**

```bash
npm run build 2>&1 | tail -20
```

Expected: Build completes with no errors.

- [ ] **Step 4: Commit**

```bash
git add src/modules/distribution-ops/DistributionOpsPage.tsx
git commit -m "feat(distribution-ops): add page shell, KPI overview, and energy/loss analytics"
```

---

## Task 3: Network Reliability + Distribution Infrastructure

**Files:**
- Modify: `src/modules/distribution-ops/DistributionOpsPage.tsx`

**Interfaces:**
- Consumes: `getReliabilityTrend`, `getOutageTrend`, `getDtLoadingDistribution`, `getTopDtFailureDivisions` from `./mockData`
- Produces: `NetworkReliabilitySection`, `DistributionInfraSection` (replace placeholders)

- [ ] **Step 1: Replace `NetworkReliabilitySection` placeholder**

Find and replace the placeholder function:

```tsx
function NetworkReliabilitySection({ filters }: { filters: Filters }) {
  const reliability = useMemo(() => getReliabilityTrend(filters), [filters])
  const outages     = useMemo(() => getOutageTrend(filters),       [filters])

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* SAIFI & SAIDI dual-axis trend */}
      <ChartCard title="SAIFI & SAIDI Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={reliability} margin={{ top: 4, right: 40, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis yAxisId="saifi" tick={ax} axisLine={false} tickLine={false}
              width={36} tickFormatter={(v) => v.toFixed(1)} />
            <YAxis yAxisId="saidi" orientation="right" tick={ax} axisLine={false}
              tickLine={false} width={44} tickFormatter={(v) => `${v}h`} />
            <Tooltip contentStyle={{ fontSize: 12 }}
              formatter={(v: number, name: string) =>
                name === 'SAIFI' ? v.toFixed(2) : `${v.toFixed(2)} hrs`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="saifi" type="monotone" dataKey="saifi" name="SAIFI"
              stroke={C.primary} strokeWidth={2} dot={{ r: 3, fill: C.primary }} />
            <Line yAxisId="saidi" type="monotone" dataKey="saidi" name="SAIDI (hrs)"
              stroke={C.error} strokeWidth={2} dot={{ r: 3, fill: C.error }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* Planned vs Unplanned Outages */}
      <ChartCard title="Planned vs Unplanned Outages" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={outages} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="planned"   name="Planned"   fill={C.primary} radius={[2, 2, 0, 0]} stackId="a" />
            <Bar dataKey="unplanned" name="Unplanned" fill={C.error}   radius={[2, 2, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
```

- [ ] **Step 2: Replace `DistributionInfraSection` placeholder**

```tsx
function DistributionInfraSection({ filters }: { filters: Filters }) {
  const dtLoading  = useMemo(() => getDtLoadingDistribution(filters), [filters])
  const topFailure = useMemo(() => getTopDtFailureDivisions(filters), [filters])

  const LOAD_COLORS: Record<string, string> = {
    Normal:     C.success,
    Overloaded: C.warning,
    Critical:   C.error,
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      {/* DT Loading Distribution */}
      <div className="col-span-5">
        <ChartCard title="Transformer Loading Distribution" timeContext="Current Period">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dtLoading} layout="vertical"
              margin={{ top: 4, right: 48, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={ax} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={ax} axisLine={false}
                tickLine={false} width={80} />
              <Tooltip contentStyle={{ fontSize: 12 }}
                formatter={(v: number) => `${v.toLocaleString()} DTs`} />
              <Bar dataKey="count" name="DT Count" radius={[0, 2, 2, 0]} maxBarSize={28}>
                {dtLoading.map((d) => (
                  <Cell key={d.category} fill={LOAD_COLORS[d.category] ?? C.gray} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Top DT Failure Divisions */}
      <div className="col-span-7">
        <ChartCard title="Top Divisions by DT Failures" timeContext="Current Period">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topFailure} layout="vertical"
              margin={{ top: 4, right: 40, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={ax} axisLine={false} tickLine={false} />
              <YAxis dataKey="division" type="category" tick={ax} axisLine={false}
                tickLine={false} width={130} />
              <Tooltip contentStyle={{ fontSize: 12 }}
                formatter={(v: number) => `${v} failures`} />
              <Bar dataKey="failures" name="DT Failures"
                fill={C.error} radius={[0, 2, 2, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build 2>&1 | tail -20
```

Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/modules/distribution-ops/DistributionOpsPage.tsx
git commit -m "feat(distribution-ops): add network reliability and infrastructure sections"
```

---

## Task 4: Division Performance Heatmap

**Files:**
- Modify: `src/modules/distribution-ops/DistributionOpsPage.tsx`

**Interfaces:**
- Consumes: `getDivisionHeatmapData`, `DivisionHeatmapMetric`, `MONTHS` from `./mockData`
- Produces: `DivisionHeatmap` component (replaces placeholder)

- [ ] **Step 1: Add heatmap helper functions after the `ax` constant**

Add these two helpers near the top of the file (after the `ax` constant, before the first section component):

```typescript
function heatCell(value: number, metric: DivisionHeatmapMetric): string {
  if (metric === 'atcLoss')    return value < 15 ? '#DCFCE7' : value < 25 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'saifi')      return value < 0.5 ? '#DCFCE7' : value < 0.8 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'saidi')      return value < 2.0 ? '#DCFCE7' : value < 4.0 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'outages')    return value < 5 ? '#DCFCE7' : value < 10 ? '#FEF9C3' : '#FEE2E2'
  return value < 2 ? '#DCFCE7' : value < 5 ? '#FEF9C3' : '#FEE2E2'
}

function formatHeatCell(value: number, metric: DivisionHeatmapMetric): string {
  if (metric === 'atcLoss') return `${value}%`
  if (metric === 'saifi' || metric === 'saidi') return value.toFixed(1)
  return String(value)
}
```

- [ ] **Step 2: Replace `DivisionHeatmap` placeholder**

```tsx
const HEAT_METRICS: { value: DivisionHeatmapMetric; label: string }[] = [
  { value: 'atcLoss',    label: 'AT&C Loss %'        },
  { value: 'saifi',      label: 'SAIFI'               },
  { value: 'saidi',      label: 'SAIDI (hrs)'         },
  { value: 'outages',    label: 'Outages'             },
  { value: 'dtFailures', label: 'DT Failures'         },
]

function DivisionHeatmap({ filters }: { filters: Filters }) {
  const [metric, setMetric] = useState<DivisionHeatmapMetric>('atcLoss')
  const data = useMemo(() => getDivisionHeatmapData(filters, metric), [filters, metric])

  const cellMap = useMemo(() => {
    const m: Record<string, Record<string, number>> = {}
    for (const cell of data) {
      if (!m[cell.division]) m[cell.division] = {}
      m[cell.division][cell.month] = cell.value
    }
    return m
  }, [data])

  const divisions = [...new Set(data.map((c) => c.division))]

  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border-base flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-text-primary">
            Division Performance by Month
          </h3>
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
            <div key={m}
              className="text-center text-[10px] font-semibold uppercase tracking-wide text-text-secondary pb-2 px-0.5">
              {m}
            </div>
          ))}
          {divisions.map((div) => (
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
```

- [ ] **Step 3: Build and verify**

```bash
npm run build 2>&1 | tail -20
```

Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/modules/distribution-ops/DistributionOpsPage.tsx
git commit -m "feat(distribution-ops): add division performance heatmap"
```

---

## Task 5: Operations Table

**Files:**
- Modify: `src/modules/distribution-ops/DistributionOpsPage.tsx`

**Interfaces:**
- Consumes: `getDivisionTableData`, `DivisionTableRow` from `./mockData`
- Produces: `DivisionTable` component (replaces placeholder)

- [ ] **Step 1: Add sort type definitions after the heatmap helpers**

```typescript
type SortDir = 'asc' | 'desc'
type SortKey = keyof Omit<DivisionTableRow, 'status'>
```

- [ ] **Step 2: Replace `DivisionTable` placeholder**

```tsx
const TABLE_COLS: { key: SortKey | 'status'; label: string }[] = [
  { key: 'division',    label: 'Division'          },
  { key: 'energyInput', label: 'Energy Input (MU)' },
  { key: 'energySold',  label: 'Energy Sold (MU)'  },
  { key: 'atcLoss',     label: 'AT&C Loss %'       },
  { key: 'peakDemand',  label: 'Peak Demand (MW)'  },
  { key: 'saifi',       label: 'SAIFI'             },
  { key: 'saidi',       label: 'SAIDI (hrs)'       },
  { key: 'outages',     label: 'Outages'           },
  { key: 'dtFailures',  label: 'DT Failures'       },
  { key: 'status',      label: 'Status'            },
]

function DivisionTable({ filters }: { filters: Filters }) {
  const data = useMemo(() => getDivisionTableData(filters), [filters])
  const [sortKey, setSortKey] = useState<SortKey>('division')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(0)
  const PAGE_SIZE = 8

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(
    () => data.filter((r) => r.division.toLowerCase().includes(search.toLowerCase())),
    [data, search],
  )

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      const cmp = typeof av === 'string'
        ? (av as string).localeCompare(bv as string)
        : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    }),
    [filtered, sortKey, sortDir],
  )

  const paged      = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  function atcBadge(value: number) {
    const cls = value < 15
      ? 'bg-green-50 text-success'
      : value < 25
      ? 'bg-yellow-50 text-warning'
      : 'bg-red-50 text-error'
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${cls}`}>
        {value}%
      </span>
    )
  }

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
              {TABLE_COLS.map((col) => {
                const isSortable = col.key !== 'status'
                return (
                  <th
                    key={col.key}
                    onClick={isSortable ? () => handleSort(col.key as SortKey) : undefined}
                    className={`text-left px-4 py-2.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap select-none ${
                      isSortable ? 'cursor-pointer hover:text-text-primary' : ''
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {isSortable && (sortKey === col.key
                        ? sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                        : <ChevronDown size={11} className="opacity-30" />)}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.division}
                className="border-b border-border-base last:border-0 hover:bg-background transition-colors">
                <td className="px-4 py-2.5 font-medium text-text-primary">{row.division}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.energyInput} MU</td>
                <td className="px-4 py-2.5 text-text-primary">{row.energySold} MU</td>
                <td className="px-4 py-2.5">{atcBadge(row.atcLoss)}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.peakDemand} MW</td>
                <td className="px-4 py-2.5 text-text-primary">{row.saifi.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.saidi.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.outages}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.dtFailures}</td>
                <td className="px-4 py-2.5">
                  {row.status === 'critical' && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-error">Critical</span>
                  )}
                  {row.status === 'warning' && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-50 text-warning">Warning</span>
                  )}
                  {row.status === 'ok' && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-green-50 text-success">OK</span>
                  )}
                </td>
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
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-2.5 py-1 border border-border-base rounded hover:bg-background disabled:opacity-40 text-[12px]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Build and verify**

```bash
npm run build 2>&1 | tail -20
```

Expected: No TypeScript errors.

- [ ] **Step 4: Commit**

```bash
git add src/modules/distribution-ops/DistributionOpsPage.tsx
git commit -m "feat(distribution-ops): add sortable operations table"
```

---

## Task 6: Attention Required + Final Assembly

**Files:**
- Modify: `src/modules/distribution-ops/DistributionOpsPage.tsx`

**Interfaces:**
- Consumes: `getInsights`, `DistributionInsight` from `./mockData`
- Produces: `AttentionPanel` (replaces placeholder); fully working page

- [ ] **Step 1: Add icon map constant after the `HEAT_METRICS` array**

```typescript
const INSIGHT_ICONS: Record<
  DistributionInsight['icon'],
  React.ComponentType<{ size?: number; className?: string }>
> = {
  'trending-down':  TrendingDown,
  'alert-triangle': AlertTriangle,
  'zap':            Zap,
}
```

- [ ] **Step 2: Replace `AttentionPanel` placeholder**

```tsx
function AttentionPanel({ filters }: { filters: Filters }) {
  const alerts = useMemo(() => getInsights(filters), [filters])
  return (
    <div className="grid grid-cols-5 gap-4">
      {alerts.map((alert) => {
        const Icon    = INSIGHT_ICONS[alert.icon]
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
```

- [ ] **Step 3: Remove unused imports**

Verify the top import list only includes what is actually used. Remove `getInsights` from the unused warning if it was declared elsewhere — it is used by `AttentionPanel`. The `DistributionInsight` type import is needed for the icon map type annotation. Confirm the `TrendingDown` import resolves (it should already be in the import block from Task 2).

- [ ] **Step 4: Run all tests**

```bash
npm test 2>&1 | tail -30
```

Expected: All tests pass, including the existing Consumer Services and Meter Management tests.

- [ ] **Step 5: Final build**

```bash
npm run build 2>&1 | tail -20
```

Expected: No errors, no warnings about unused variables.

- [ ] **Step 6: Commit**

```bash
git add src/modules/distribution-ops/DistributionOpsPage.tsx
git commit -m "feat(distribution-ops): add attention required panel — page complete"
```
