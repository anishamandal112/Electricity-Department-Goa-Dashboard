# Meter Management Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the stub `MeterManagementPage.tsx` with a fully data-driven Meter Management analytics page covering smart metering progress, communication performance, meter health, and division-level monitoring.

**Architecture:** Two-file module mirroring Consumer Services — `mockData.ts` owns all types, constants, and deterministic generator functions; `MeterManagementPage.tsx` owns all UI as self-contained section components fed by those generators. No new dependencies.

**Tech Stack:** React, TypeScript, Recharts, Lucide Icons, Tailwind CSS, Zustand (filterStore), Vitest

## Global Constraints

- No new npm dependencies — use only packages already in the project
- All data is static mock data — no API calls, no async
- Filters accepted as seeds for data variation (same approach as Consumer Services)
- All 18 Goa ED divisions must appear consistently across heatmap, bars, and table
- Desktop-first layout using 12-column grid
- Follow all naming, colour, and component patterns established in `src/modules/consumer-services/`

---

## File Map

| File | Action |
|---|---|
| `src/modules/meter-management/mockData.ts` | Create |
| `src/modules/meter-management/mockData.test.ts` | Create |
| `src/modules/meter-management/MeterManagementPage.tsx` | Replace stub |

---

### Task 1: mockData.ts + tests

**Files:**
- Create: `src/modules/meter-management/mockData.ts`
- Create: `src/modules/meter-management/mockData.test.ts`

**Interfaces:**
- Produces: `Filters`, `MeterHeatmapMetric`, `DivisionMonthCell`, `MeterTableRow`, `MeterInsight`, `RolloutPoint`, `StatusSlice`, `DivisionInstallBar`, `DivisionIssueBar`, `CategoryBar`, `NewVsReplacementPoint`, `DIVISIONS`, `MONTHS`, and all generator functions listed below

- [ ] **Step 1: Write the failing tests**

Create `src/modules/meter-management/mockData.test.ts`:

```ts
import { describe, it, expect } from 'vitest'
import {
  getMeterKpis, getRolloutTrend, getSmartVsConventional,
  getInstallProgressByDivision, getHeatmapData,
  getMeterStatusDist, getTopIssueDivisions, getNewVsReplacement,
  getAdoptionByCategory, getDivisionTableData, getInsights,
  MONTHS, DIVISIONS,
  type Filters,
} from './mockData'

const F: Filters = {
  financialYear: '2024-25', month: 'All',
  circle: 'All', division: 'All', subdivision: 'All',
}

describe('DIVISIONS / MONTHS', () => {
  it('has 18 divisions', () => {
    expect(DIVISIONS).toHaveLength(18)
  })
  it('has 12 months starting Apr ending Mar', () => {
    expect(MONTHS).toHaveLength(12)
    expect(MONTHS[0]).toBe('Apr')
    expect(MONTHS[11]).toBe('Mar')
  })
})

describe('getMeterKpis', () => {
  it('is deterministic', () => {
    expect(getMeterKpis(F)).toEqual(getMeterKpis(F))
  })
  it('totalMeters in 270000–300000', () => {
    const v = getMeterKpis(F).totalMeters
    expect(v).toBeGreaterThanOrEqual(270000)
    expect(v).toBeLessThanOrEqual(300000)
  })
  it('smartPenetration in 25–45', () => {
    const v = getMeterKpis(F).smartPenetration
    expect(v).toBeGreaterThanOrEqual(25)
    expect(v).toBeLessThanOrEqual(45)
  })
  it('commSuccessRate in 85–97', () => {
    const v = getMeterKpis(F).commSuccessRate
    expect(v).toBeGreaterThanOrEqual(85)
    expect(v).toBeLessThanOrEqual(97)
  })
  it('varies between financial years', () => {
    const a = getMeterKpis({ ...F, financialYear: '2023-24' }).totalMeters
    const b = getMeterKpis({ ...F, financialYear: '2025-26' }).totalMeters
    expect(a).not.toBe(b)
  })
})

describe('getRolloutTrend', () => {
  it('returns 12 months', () => {
    expect(getRolloutTrend(F)).toHaveLength(12)
  })
  it('first month is Apr, last is Mar', () => {
    const t = getRolloutTrend(F)
    expect(t[0].month).toBe('Apr')
    expect(t[11].month).toBe('Mar')
  })
  it('smart values are positive', () => {
    getRolloutTrend(F).forEach(p => expect(p.smart).toBeGreaterThan(0))
  })
})

describe('getSmartVsConventional', () => {
  it('returns 2 slices', () => {
    expect(getSmartVsConventional(F)).toHaveLength(2)
  })
  it('slices named Smart and Conventional', () => {
    const names = getSmartVsConventional(F).map(s => s.name)
    expect(names).toContain('Smart')
    expect(names).toContain('Conventional')
  })
  it('both values are positive', () => {
    getSmartVsConventional(F).forEach(s => expect(s.value).toBeGreaterThan(0))
  })
})

describe('getInstallProgressByDivision', () => {
  it('returns 18 rows', () => {
    expect(getInstallProgressByDivision(F)).toHaveLength(18)
  })
  it('all smartPct in 15–60', () => {
    getInstallProgressByDivision(F).forEach(d => {
      expect(d.smartPct).toBeGreaterThanOrEqual(15)
      expect(d.smartPct).toBeLessThanOrEqual(60)
    })
  })
  it('target is 30 for all rows', () => {
    getInstallProgressByDivision(F).forEach(d => expect(d.target).toBe(30))
  })
  it('sorted descending by smartPct', () => {
    const rows = getInstallProgressByDivision(F)
    for (let i = 0; i < rows.length - 1; i++) {
      expect(rows[i].smartPct).toBeGreaterThanOrEqual(rows[i + 1].smartPct)
    }
  })
})

describe('getHeatmapData', () => {
  it('returns 216 cells (18 × 12)', () => {
    expect(getHeatmapData(F, 'commSuccess')).toHaveLength(216)
  })
  it('commSuccess cells in 75–99', () => {
    getHeatmapData(F, 'commSuccess').forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(75)
      expect(c.value).toBeLessThanOrEqual(99)
    })
  })
  it('readSuccess cells in 82–99', () => {
    getHeatmapData(F, 'readSuccess').forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(82)
      expect(c.value).toBeLessThanOrEqual(99)
    })
  })
  it('nonCommunicating cells are positive integers', () => {
    getHeatmapData(F, 'nonCommunicating').forEach(c => {
      expect(c.value).toBeGreaterThan(0)
      expect(Number.isInteger(c.value)).toBe(true)
    })
  })
  it('faultyMeters cells are positive integers', () => {
    getHeatmapData(F, 'faultyMeters').forEach(c => {
      expect(c.value).toBeGreaterThan(0)
      expect(Number.isInteger(c.value)).toBe(true)
    })
  })
  it('different metrics produce different values for same cell', () => {
    const a = getHeatmapData(F, 'commSuccess')[0].value
    const b = getHeatmapData(F, 'nonCommunicating')[0].value
    expect(a).not.toBe(b)
  })
  it('is deterministic', () => {
    expect(getHeatmapData(F, 'commSuccess')).toEqual(getHeatmapData(F, 'commSuccess'))
  })
})

describe('getMeterStatusDist', () => {
  it('returns 5 slices', () => {
    expect(getMeterStatusDist(F)).toHaveLength(5)
  })
  it('Active slice is the largest', () => {
    const slices = getMeterStatusDist(F)
    const active = slices.find(s => s.name === 'Active')!
    slices.forEach(s => {
      if (s.name !== 'Active') expect(active.value).toBeGreaterThan(s.value)
    })
  })
})

describe('getTopIssueDivisions', () => {
  it('returns 5 rows', () => {
    expect(getTopIssueDivisions(F)).toHaveLength(5)
  })
  it('sorted descending by value', () => {
    const rows = getTopIssueDivisions(F)
    for (let i = 0; i < rows.length - 1; i++) {
      expect(rows[i].value).toBeGreaterThanOrEqual(rows[i + 1].value)
    }
  })
  it('all values are positive', () => {
    getTopIssueDivisions(F).forEach(r => expect(r.value).toBeGreaterThan(0))
  })
})

describe('getNewVsReplacement', () => {
  it('returns 12 months', () => {
    expect(getNewVsReplacement(F)).toHaveLength(12)
  })
  it('newInstalls > replacements for all months', () => {
    getNewVsReplacement(F).forEach(p => expect(p.newInstalls).toBeGreaterThan(p.replacements))
  })
})

describe('getAdoptionByCategory', () => {
  it('returns 4 categories', () => {
    expect(getAdoptionByCategory(F)).toHaveLength(4)
  })
  it('all smartPct in 25–85', () => {
    getAdoptionByCategory(F).forEach(c => {
      expect(c.smartPct).toBeGreaterThanOrEqual(25)
      expect(c.smartPct).toBeLessThanOrEqual(85)
    })
  })
  it('contains Domestic, Commercial, Industrial, Government', () => {
    const cats = getAdoptionByCategory(F).map(c => c.category)
    expect(cats).toContain('Domestic')
    expect(cats).toContain('Commercial')
    expect(cats).toContain('Industrial')
    expect(cats).toContain('Government')
  })
})

describe('getDivisionTableData', () => {
  it('returns 18 rows', () => {
    expect(getDivisionTableData(F)).toHaveLength(18)
  })
  it('smartMeters <= totalMeters for all rows', () => {
    getDivisionTableData(F).forEach(r => expect(r.smartMeters).toBeLessThanOrEqual(r.totalMeters))
  })
  it('smartPct matches smartMeters/totalMeters', () => {
    getDivisionTableData(F).forEach(r => {
      const expected = parseFloat(((r.smartMeters / r.totalMeters) * 100).toFixed(1))
      expect(r.smartPct).toBe(expected)
    })
  })
  it('commSuccessPct in 78–99', () => {
    getDivisionTableData(F).forEach(r => {
      expect(r.commSuccessPct).toBeGreaterThanOrEqual(78)
      expect(r.commSuccessPct).toBeLessThanOrEqual(99)
    })
  })
  it('attentionFlag is critical, warning, or null', () => {
    getDivisionTableData(F).forEach(r => {
      expect(['critical', 'warning', null]).toContain(r.attentionFlag)
    })
  })
})

describe('getInsights', () => {
  it('returns 4–5 insights', () => {
    const n = getInsights(F).length
    expect(n).toBeGreaterThanOrEqual(4)
    expect(n).toBeLessThanOrEqual(5)
  })
  it('every insight has non-empty value and context', () => {
    getInsights(F).forEach(i => {
      expect(i.value.length).toBeGreaterThan(0)
      expect(i.context.length).toBeGreaterThan(0)
    })
  })
  it('includes low-comm insight', () => {
    const ids = getInsights(F).map(i => i.id)
    expect(ids).toContain('low-comm')
  })
  it('includes high-faulty insight', () => {
    const ids = getInsights(F).map(i => i.id)
    expect(ids).toContain('high-faulty')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

```
npx vitest run src/modules/meter-management/mockData.test.ts
```

Expected: multiple failures — `mockData.ts` does not exist yet.

- [ ] **Step 3: Create mockData.ts**

Create `src/modules/meter-management/mockData.ts`:

```ts
// --- Types ---
export interface Filters {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
}

export type MeterHeatmapMetric =
  | 'commSuccess'
  | 'readSuccess'
  | 'nonCommunicating'
  | 'faultyMeters'

export interface DivisionMonthCell { division: string; month: string; value: number }

export interface MeterKpis {
  totalMeters: number
  smartMeters: number
  smartPenetration: number
  readSuccessRate: number
  commSuccessRate: number
  faultyNonComm: number
}

export interface MeterTableRow {
  division: string
  totalMeters: number
  smartMeters: number
  smartPct: number
  commSuccessPct: number
  readSuccessPct: number
  faultyMeters: number
  nonCommunicating: number
  replacements: number
  attentionFlag: 'critical' | 'warning' | null
}

export interface MeterInsight {
  id: string
  label: string
  value: string
  context: string
  severity: 'error' | 'warning'
  icon: 'wifi-off' | 'alert-triangle' | 'trending-down' | 'target' | 'refresh-cw'
}

export interface RolloutPoint { month: string; smart: number; conventional: number }
export interface StatusSlice { name: string; value: number; color: string }
export interface DivisionInstallBar { division: string; smartPct: number; target: number }
export interface DivisionIssueBar { division: string; value: number }
export interface CategoryBar { category: string; smartPct: number }
export interface NewVsReplacementPoint { month: string; newInstalls: number; replacements: number }

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

// --- Seed helpers ---
function seed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// --- Generators ---
export function getMeterKpis(filters: Filters): MeterKpis {
  const s = seed(filters.financialYear + filters.month)
  const totalMeters = 275000 + (s % 15000)
  const smartPct = 0.28 + (s % 100) / 580
  const smartMeters = Math.round(totalMeters * smartPct)
  const smartPenetration = parseFloat(((smartMeters / totalMeters) * 100).toFixed(1))
  const readSuccessRate = parseFloat((95.0 + (s % 20) / 5).toFixed(1))
  const commSuccessRate = parseFloat((88.0 + (s % 40) / 4.5).toFixed(1))
  const faultyNonComm = 3500 + (s % 2000)
  return { totalMeters, smartMeters, smartPenetration, readSuccessRate, commSuccessRate, faultyNonComm }
}

export function getRolloutTrend(filters: Filters): RolloutPoint[] {
  return MONTHS.map((month, i) => {
    const s = seed(filters.financialYear + month + 'rollout')
    const smart = 88000 + i * 1400 + (s % 900)
    const conventional = 192000 - i * 500 + (s % 600)
    return { month, smart, conventional }
  })
}

export function getSmartVsConventional(filters: Filters): StatusSlice[] {
  const kpi = getMeterKpis(filters)
  return [
    { name: 'Smart',        value: kpi.smartMeters,                    color: '#2563EB' },
    { name: 'Conventional', value: kpi.totalMeters - kpi.smartMeters,  color: '#E5E7EB' },
  ]
}

export function getInstallProgressByDivision(filters: Filters): DivisionInstallBar[] {
  return getDivisionTableData(filters)
    .map((row) => ({ division: row.division, smartPct: row.smartPct, target: 30 }))
    .sort((a, b) => b.smartPct - a.smartPct)
}

export function getHeatmapData(filters: Filters, metric: MeterHeatmapMetric): DivisionMonthCell[] {
  const cells: DivisionMonthCell[] = []
  for (const division of DIVISIONS) {
    for (const month of MONTHS) {
      const s = seed(filters.financialYear + division + month + metric)
      let value: number
      if (metric === 'commSuccess') {
        value = parseFloat((78.0 + (s % 210) / 10).toFixed(1))
      } else if (metric === 'readSuccess') {
        value = parseFloat((84.0 + (s % 150) / 9).toFixed(1))
      } else if (metric === 'nonCommunicating') {
        value = 55 + (s % 420)
      } else {
        value = 28 + (s % 220)
      }
      cells.push({ division, month, value })
    }
  }
  return cells
}

export function getMeterStatusDist(filters: Filters): StatusSlice[] {
  const { totalMeters } = getMeterKpis(filters)
  return [
    { name: 'Active',            value: Math.round(totalMeters * 0.910), color: '#16A34A' },
    { name: 'Non-Communicating', value: Math.round(totalMeters * 0.040), color: '#F59E0B' },
    { name: 'Disconnected',      value: Math.round(totalMeters * 0.027), color: '#9CA3AF' },
    { name: 'Faulty',            value: Math.round(totalMeters * 0.015), color: '#DC2626' },
    { name: 'Tampered',          value: Math.round(totalMeters * 0.008), color: '#7C3AED' },
  ]
}

export function getTopIssueDivisions(filters: Filters): DivisionIssueBar[] {
  return getDivisionTableData(filters)
    .map((row) => ({ division: row.division, value: row.faultyMeters + row.nonCommunicating }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
}

export function getNewVsReplacement(filters: Filters): NewVsReplacementPoint[] {
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'install')
    const newInstalls = 900 + (s % 1100)
    const replacements = 280 + (s % 500)
    return { month, newInstalls, replacements }
  })
}

export function getAdoptionByCategory(filters: Filters): CategoryBar[] {
  const s = seed(filters.financialYear + filters.division + 'adoption')
  return [
    { category: 'Industrial',  smartPct: 70 + (s % 12) },
    { category: 'Government',  smartPct: 63 + ((s >> 4) % 12) },
    { category: 'Commercial',  smartPct: 46 + ((s >> 8) % 14) },
    { category: 'Domestic',    smartPct: 28 + ((s >> 12) % 14) },
  ]
}

export function getDivisionTableData(filters: Filters): MeterTableRow[] {
  return DIVISIONS.map((division) => {
    const s = seed(filters.financialYear + division + 'table')
    const totalMeters = 9000 + (s % 26000)
    const rawPct = 0.18 + (s % 100) / 238
    const smartMeters = Math.round(totalMeters * rawPct)
    const smartPct = parseFloat(((smartMeters / totalMeters) * 100).toFixed(1))
    const commSuccessPct = parseFloat((80.0 + (s % 170) / 9).toFixed(1))
    const readSuccessPct = parseFloat((88.0 + (s % 110) / 10).toFixed(1))
    const faultyMeters = 38 + (s % 240)
    const nonCommunicating = 58 + (s % 380)
    const replacements = 90 + (s % 520)

    const isCritical = commSuccessPct < 82 || faultyMeters > 200 || nonCommunicating > 350
    const isWarning = !isCritical && (commSuccessPct < 88 || faultyMeters > 120 || nonCommunicating > 200 || smartPct < 22)
    const attentionFlag: MeterTableRow['attentionFlag'] = isCritical ? 'critical' : isWarning ? 'warning' : null

    return { division, totalMeters, smartMeters, smartPct, commSuccessPct, readSuccessPct, faultyMeters, nonCommunicating, replacements, attentionFlag }
  })
}

export function getInsights(filters: Filters): MeterInsight[] {
  const rows = getDivisionTableData(filters)
  const insights: MeterInsight[] = []

  const lowestComm = rows.reduce((a, b) => a.commSuccessPct < b.commSuccessPct ? a : b)
  insights.push({
    id: 'low-comm',
    label: 'Lowest Communication Success Rate',
    value: `${lowestComm.commSuccessPct}%`,
    context: `${lowestComm.division} — below 88% threshold`,
    severity: lowestComm.commSuccessPct < 82 ? 'error' : 'warning',
    icon: 'wifi-off',
  })

  const highestFaulty = rows.reduce((a, b) => a.faultyMeters > b.faultyMeters ? a : b)
  insights.push({
    id: 'high-faulty',
    label: 'Highest Faulty Meter Count',
    value: highestFaulty.faultyMeters.toLocaleString(),
    context: `${highestFaulty.division} — requires field inspection`,
    severity: highestFaulty.faultyMeters > 150 ? 'error' : 'warning',
    icon: 'alert-triangle',
  })

  const worstNonComm = rows.reduce((a, b) =>
    (a.nonCommunicating / a.totalMeters) > (b.nonCommunicating / b.totalMeters) ? a : b)
  insights.push({
    id: 'rising-failures',
    label: 'Rising Communication Failures',
    value: `${worstNonComm.nonCommunicating} meters`,
    context: `${worstNonComm.division} — highest non-communicating ratio`,
    severity: worstNonComm.nonCommunicating > 300 ? 'error' : 'warning',
    icon: 'trending-down',
  })

  const belowTarget = rows.filter((r) => r.smartPct < 30)
  if (belowTarget.length > 0) {
    const worst = belowTarget.reduce((a, b) => a.smartPct < b.smartPct ? a : b)
    insights.push({
      id: 'below-target',
      label: 'Rollout Below 30% Target',
      value: `${belowTarget.length} divisions`,
      context: `Worst: ${worst.division} at ${worst.smartPct}%`,
      severity: 'warning',
      icon: 'target',
    })
  }

  const highRepl = rows.filter((r) => r.replacements / r.totalMeters > 0.15)
  if (highRepl.length > 0) {
    const worst = highRepl.reduce((a, b) =>
      a.replacements / a.totalMeters > b.replacements / b.totalMeters ? a : b)
    insights.push({
      id: 'high-replacement',
      label: 'High Replacement Requirement',
      value: `${Math.round((worst.replacements / worst.totalMeters) * 100)}% replacement rate`,
      context: `${worst.division} — ${worst.replacements} replacements pending`,
      severity: 'warning',
      icon: 'refresh-cw',
    })
  }

  return insights
}
```

- [ ] **Step 4: Run tests to verify they pass**

```
npx vitest run src/modules/meter-management/mockData.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```
git add src/modules/meter-management/mockData.ts src/modules/meter-management/mockData.test.ts
git commit -m "feat(meter-management): add mockData with types, generators, and tests"
```

---

### Task 2: MeterManagementPage.tsx

**Files:**
- Modify: `src/modules/meter-management/MeterManagementPage.tsx` (replace stub entirely)

**Interfaces:**
- Consumes: all exports from `./mockData` (Task 1)
- Consumes: `KpiCard`, `ChartCard`, `SectionContainer`, `PageHeader`, `GlobalFilterBar` from shared components
- Consumes: `useFilterStore` from `../../store/filterStore`
- Produces: `MeterManagementPage` export (already wired in `App.tsx`)

- [ ] **Step 1: Replace MeterManagementPage.tsx**

Replace `src/modules/meter-management/MeterManagementPage.tsx` entirely:

```tsx
import React, { useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import {
  WifiOff, AlertTriangle, TrendingDown, Target, RefreshCw,
  ChevronUp, ChevronDown, Search,
} from 'lucide-react'
import { useFilterStore } from '../../store/filterStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import {
  getMeterKpis, getRolloutTrend, getSmartVsConventional, getInstallProgressByDivision,
  getHeatmapData, getMeterStatusDist, getTopIssueDivisions, getNewVsReplacement,
  getAdoptionByCategory, getDivisionTableData, getInsights,
  MONTHS,
  type MeterHeatmapMetric, type Filters, type MeterTableRow, type MeterInsight,
} from './mockData'

const C = {
  primary: '#2563EB', success: '#16A34A', warning: '#F59E0B',
  error: '#DC2626', gray: '#9CA3AF', orange: '#EA580C',
  teal: '#0891B2', purple: '#7C3AED', grid: '#E5E7EB',
}
const ax = { fontSize: 11, fill: '#6B7280' }

// ── Helpers ───────────────────────────────────────────────────────────────────

function heatCell(value: number, metric: MeterHeatmapMetric): string {
  if (metric === 'commSuccess')
    return value >= 92 ? '#DCFCE7' : value >= 80 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'readSuccess')
    return value >= 95 ? '#DCFCE7' : value >= 85 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'nonCommunicating')
    return value < 100 ? '#DCFCE7' : value <= 300 ? '#FEF9C3' : '#FEE2E2'
  return value < 50 ? '#DCFCE7' : value <= 150 ? '#FEF9C3' : '#FEE2E2'
}

function formatHeatCell(value: number, metric: MeterHeatmapMetric): string {
  if (metric === 'commSuccess' || metric === 'readSuccess') return `${value}%`
  return String(value)
}

// ── Metering Overview ─────────────────────────────────────────────────────────

function MeteringOverviewSection({ filters }: { filters: Filters }) {
  const rollout       = useMemo(() => getRolloutTrend(filters),             [filters])
  const svDist        = useMemo(() => getSmartVsConventional(filters),      [filters])
  const installProg   = useMemo(() => getInstallProgressByDivision(filters), [filters])
  const kpi           = useMemo(() => getMeterKpis(filters),                [filters])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Area chart */}
        <div className="col-span-8">
          <ChartCard title="Smart Meter Rollout Trend" timeContext="Apr – Mar (Financial Year)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={rollout} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
                <YAxis tick={ax} axisLine={false} tickLine={false} width={52}
                  tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
                <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => v.toLocaleString()} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="smart" name="Smart" stroke={C.primary}
                  fill={C.primary} fillOpacity={0.15} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="conventional" name="Conventional" stroke={C.gray}
                  fill={C.gray} fillOpacity={0.10} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Donut */}
        <div className="col-span-4">
          <ChartCard title="Smart vs Conventional" timeContext="Current Period">
            <div className="relative" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={svDist} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={60} outerRadius={88}>
                    {svDist.map((s) => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => v.toLocaleString()} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none" style={{ paddingBottom: 28 }}>
                <span className="text-[22px] font-bold text-text-primary">{kpi.smartPenetration}%</span>
                <span className="text-[10px] text-text-secondary">Smart</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Installation progress — all 18 divisions */}
      <ChartCard title="Smart Meter Installation Progress by Division" timeContext="Current Period">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={installProg} layout="vertical"
            margin={{ top: 4, right: 56, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
            <XAxis type="number" tick={ax} axisLine={false} tickLine={false}
              domain={[0, 65]} unit="%" />
            <YAxis dataKey="division" type="category" tick={ax} axisLine={false}
              tickLine={false} width={130} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
            <ReferenceLine x={30} stroke={C.warning} strokeDasharray="4 2"
              label={{ value: 'Target 30%', fill: C.warning, fontSize: 10, position: 'right' }} />
            <Bar dataKey="smartPct" name="Smart %" radius={[0, 2, 2, 0]} maxBarSize={14}>
              {installProg.map((d) => (
                <Cell
                  key={d.division}
                  fill={d.smartPct >= 30 ? C.success : d.smartPct >= 20 ? C.warning : C.error}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Communication Heatmap ─────────────────────────────────────────────────────

const HEAT_METRICS: { value: MeterHeatmapMetric; label: string }[] = [
  { value: 'commSuccess',      label: 'Communication Success %'  },
  { value: 'readSuccess',      label: 'Reading Success %'        },
  { value: 'nonCommunicating', label: 'Non-Communicating Meters' },
  { value: 'faultyMeters',     label: 'Faulty Meters'            },
]

function CommunicationHeatmap({ filters }: { filters: Filters }) {
  const [metric, setMetric] = useState<MeterHeatmapMetric>('commSuccess')
  const data = useMemo(() => getHeatmapData(filters, metric), [filters, metric])

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
            Smart Meter Communication Performance
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

// ── Meter Health ──────────────────────────────────────────────────────────────

function MeterHealthSection({ filters }: { filters: Filters }) {
  const statusDist = useMemo(() => getMeterStatusDist(filters), [filters])
  const topIssues  = useMemo(() => getTopIssueDivisions(filters), [filters])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4">
        <ChartCard title="Meter Status Distribution" timeContext="Current Period">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusDist} dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={55} outerRadius={82}>
                {statusDist.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => v.toLocaleString()} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-8">
        <ChartCard title="Top Divisions with Meter Issues" timeContext="Faulty + Non-Communicating">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topIssues} layout="vertical"
              margin={{ top: 4, right: 40, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={ax} axisLine={false} tickLine={false} />
              <YAxis dataKey="division" type="category" tick={ax} axisLine={false}
                tickLine={false} width={130} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="value" name="Faulty + Non-Comm"
                fill={C.error} radius={[0, 2, 2, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Consumer Metering Analytics ───────────────────────────────────────────────

function ConsumerMeteringSection({ filters }: { filters: Filters }) {
  const newVsRepl  = useMemo(() => getNewVsReplacement(filters),    [filters])
  const adoption   = useMemo(() => getAdoptionByCategory(filters),  [filters])

  const avgAdoption = Math.round(adoption.reduce((s, c) => s + c.smartPct, 0) / adoption.length)

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <ChartCard title="New Meter Installations vs Replacements" timeContext="Apr – Mar (Financial Year)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={newVsRepl} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="newInstalls"  name="New Installations" fill={C.primary} radius={[2, 2, 0, 0]} />
              <Bar dataKey="replacements" name="Replacements"       fill={C.orange}  radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-4">
        <ChartCard title="Smart Adoption by Consumer Category" timeContext="Current Period">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={adoption} layout="vertical"
              margin={{ top: 4, right: 48, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={ax} axisLine={false} tickLine={false}
                domain={[0, 100]} unit="%" />
              <YAxis dataKey="category" type="category" tick={ax} axisLine={false}
                tickLine={false} width={80} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
              <ReferenceLine x={avgAdoption} stroke={C.warning} strokeDasharray="4 2"
                label={{ value: 'Avg', fill: C.warning, fontSize: 10, position: 'right' }} />
              <Bar dataKey="smartPct" name="Smart %" fill={C.teal}
                radius={[0, 2, 2, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Division Performance Table ────────────────────────────────────────────────

type SortDir = 'asc' | 'desc'
type SortKey = keyof Omit<MeterTableRow, 'attentionFlag'>

const TABLE_COLS: { key: SortKey | 'attentionFlag'; label: string }[] = [
  { key: 'division',         label: 'Division'          },
  { key: 'totalMeters',      label: 'Total Meters'      },
  { key: 'smartMeters',      label: 'Smart Meters'      },
  { key: 'smartPct',         label: 'Smart %'           },
  { key: 'commSuccessPct',   label: 'Comm Success %'    },
  { key: 'readSuccessPct',   label: 'Read Success %'    },
  { key: 'faultyMeters',     label: 'Faulty'            },
  { key: 'nonCommunicating', label: 'Non-Comm'          },
  { key: 'replacements',     label: 'Replacements'      },
  { key: 'attentionFlag',    label: 'Attention'         },
]

function DivisionTable({ filters }: { filters: Filters }) {
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

  function pctBadge(value: number, good: number, warn: number) {
    const cls = value >= good ? 'bg-green-50 text-success'
      : value >= warn ? 'bg-yellow-50 text-warning'
      : 'bg-red-50 text-error'
    return <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${cls}`}>{value}%</span>
  }

  function countBadge(value: number, warn: number, bad: number) {
    const cls = value > bad ? 'bg-red-50 text-error'
      : value > warn ? 'bg-yellow-50 text-warning'
      : 'bg-green-50 text-success'
    return <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${cls}`}>{value.toLocaleString()}</span>
  }

  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm">
      <div className="px-4 py-3 border-b border-border-base flex items-center justify-between gap-4">
        <h3 className="text-[14px] font-semibold text-text-primary">Division Performance Summary</h3>
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
                const isSortable = col.key !== 'attentionFlag'
                return (
                  <th
                    key={col.key}
                    onClick={isSortable ? () => handleSort(col.key as SortKey) : undefined}
                    className={`text-left px-4 py-2.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap select-none ${isSortable ? 'cursor-pointer hover:text-text-primary' : ''}`}
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
                <td className="px-4 py-2.5 text-text-primary">{row.totalMeters.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.smartMeters.toLocaleString()}</td>
                <td className="px-4 py-2.5">{pctBadge(row.smartPct, 35, 20)}</td>
                <td className="px-4 py-2.5">{pctBadge(row.commSuccessPct, 92, 80)}</td>
                <td className="px-4 py-2.5">{pctBadge(row.readSuccessPct, 95, 85)}</td>
                <td className="px-4 py-2.5">{countBadge(row.faultyMeters, 50, 150)}</td>
                <td className="px-4 py-2.5">{countBadge(row.nonCommunicating, 100, 300)}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.replacements.toLocaleString()}</td>
                <td className="px-4 py-2.5">
                  {row.attentionFlag === 'critical' && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-error">Critical</span>
                  )}
                  {row.attentionFlag === 'warning' && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-50 text-warning">Warning</span>
                  )}
                  {row.attentionFlag === null && (
                    <span className="text-[11px] text-text-secondary">—</span>
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

// ── Attention Required ────────────────────────────────────────────────────────

const INSIGHT_ICONS: Record<MeterInsight['icon'], React.ComponentType<{ size?: number; className?: string }>> = {
  'wifi-off':       WifiOff,
  'alert-triangle': AlertTriangle,
  'trending-down':  TrendingDown,
  'target':         Target,
  'refresh-cw':     RefreshCw,
}

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

// ── Page ──────────────────────────────────────────────────────────────────────

export function MeterManagementPage() {
  const financialYear = useFilterStore((s) => s.financialYear)
  const month         = useFilterStore((s) => s.month)
  const circle        = useFilterStore((s) => s.circle)
  const division      = useFilterStore((s) => s.division)
  const subdivision   = useFilterStore((s) => s.subdivision)

  const filters = useMemo<Filters>(
    () => ({ financialYear, month, circle, division, subdivision }),
    [financialYear, month, circle, division, subdivision],
  )

  const kpi = useMemo(() => getMeterKpis(filters), [filters])

  const KPI_CARDS = [
    { label: 'Total Installed Meters',      value: kpi.totalMeters.toLocaleString(),    trend: '1,100',  trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Smart Meters Installed',      value: kpi.smartMeters.toLocaleString(),    trend: '2,840',  trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Smart Meter Penetration',     value: `${kpi.smartPenetration}%`,          trend: '0.9%',   trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Reading Success Rate',        value: `${kpi.readSuccessRate}%`,           trend: '0.2%',   trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Communication Success Rate',  value: `${kpi.commSuccessRate}%`,           trend: '0.4%',   trendDirection: 'down' as const, trendIsPositive: false, comparisonLabel: 'vs Last Month' },
    { label: 'Faulty / Non-Communicating',  value: kpi.faultyNonComm.toLocaleString(),  trend: '130',    trendDirection: 'down' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
  ]

  return (
    <div>
      <PageHeader
        title="Meter Management"
        subtitle="Smart metering deployment, communication performance, and meter health monitoring"
      />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="KPI Overview">
          <div className="grid grid-cols-6 gap-4">
            {KPI_CARDS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>

        <SectionContainer title="Metering Overview">
          <MeteringOverviewSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Smart Meter Communication Performance">
          <CommunicationHeatmap filters={filters} />
        </SectionContainer>

        <SectionContainer title="Meter Health & Exceptions">
          <MeterHealthSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Consumer Metering Analytics">
          <ConsumerMeteringSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Division Performance Table">
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

- [ ] **Step 2: Run the full test suite**

```
npx vitest run
```

Expected: all tests pass (no TypeScript errors from the existing test files).

- [ ] **Step 3: Verify the page renders**

Start the dev server and open the Meter Management module in a browser:

```
npm run dev
```

Check:
- KPI row shows 6 cards with real values
- Metering Overview: area chart, donut with center label, horizontal bar showing all 18 divisions
- Heatmap: 18 rows × 12 columns, colour-coded, metric selector switches all cells
- Meter Health: donut (5 slices) + top-5 horizontal bar
- Consumer Metering: grouped bar + adoption bar with avg reference line
- Division Table: sortable columns, search, pagination, colour-coded badges, Attention column
- Attention panel: 4–5 insight cards with severity colouring

- [ ] **Step 4: Commit**

```
git add src/modules/meter-management/MeterManagementPage.tsx
git commit -m "feat(meter-management): implement full analytics page — heatmap, table, health, insights"
```
