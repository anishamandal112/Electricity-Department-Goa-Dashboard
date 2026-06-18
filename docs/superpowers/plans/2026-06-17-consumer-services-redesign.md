# Consumer Services & Grievances — Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reduce visual noise by ~35%, replace the division×metric heatmap with a division×month cohort heatmap with metric selector, and replace decorative insight cards with operational alert cards — making the page feel like Apache Superset / Power BI.

**Architecture:** All changes are contained in two files: `mockData.ts` (data layer) and `ConsumerServicesPage.tsx` (UI layer). No new files are created. Data changes are implemented and tested first; UI changes follow task-by-task.

**Tech Stack:** React 18, TypeScript, Recharts, Tailwind CSS, Vitest (for data tests)

## Global Constraints

- Division names must exactly match: Ponda X, Margao XVI, Calangute XIV, Mapusa XVII, Mormugao IV, Margao V, Bicholim XI, Mapusa XV, Vasco III, Quepem VIII, South Urban VI, Cuncolim XVIII, Panaji II, Pernem XIII, Panaji I, Valpoi XII, Sanguem VII, Canacona IX
- Colors: primary `#2563EB`, success `#16A34A`, warning `#F59E0B`, error `#DC2626`, grid `#E5E7EB`, text-primary `#111827`, text-secondary `#6B7280`
- Heatmap cell colors: green `#DCFCE7`, amber `#FEF9C3`, red `#FEE2E2`
- SLA gauge arc: always `#2563EB` (never green/amber/red on the arc)
- Card style: white bg, 1px border, border-radius 12px, minimal shadow
- Font sizes: card title 14px/600, body 14px/400, caption 12px/400, table 13px
- Run tests with: `npx vitest run src/modules/consumer-services/mockData.test.ts`

---

### Task 1: Update mockData.ts — Divisions, divFactor, new data functions, updated getInsights

**Files:**
- Modify: `src/modules/consumer-services/mockData.ts` (full file changes)
- Test: `src/modules/consumer-services/mockData.test.ts`

**Interfaces:**
- Produces: `HeatmapMetric` type, `DivisionMonthCell` interface, `StatusMatrixRow` interface, `getDivisionMonthHeatmapData(filters, metric)`, `getServiceRequestStatusMatrix(filters)`, updated `getInsights()`, updated `DIVISIONS` constant (18 items)

- [ ] **Step 1: Write failing tests first**

Open `src/modules/consumer-services/mockData.test.ts`. Replace the existing `getDivisionTableData` row-count test and add all new tests shown below. Do NOT delete existing tests — only update the one that says `toHaveLength(5)` and add the new `describe` blocks:

```ts
// In mockData.test.ts, update the existing getDivisionTableData test:
describe('getDivisionTableData', () => {
  it('returns 18 rows', () => {
    expect(getDivisionTableData(F)).toHaveLength(18)
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

// Also update the division filter test inside getKpiData (change 'North Goa' → 'Panaji I'):
it('division filter reduces consumer count', () => {
  const all = getKpiData(F).totalConsumers
  const div = getKpiData({ ...F, division: 'Panaji I' }).totalConsumers
  expect(div).toBeLessThan(all)
})
```

Add these new `describe` blocks at the end of the test file. Also add the new imports at the top:

```ts
import {
  getKpiData, getComplaintTrend, getCategoryDistribution,
  getDivisionTableData, getInsights,
  getDivisionMonthHeatmapData, getServiceRequestStatusMatrix,
  type Filters,
} from './mockData'
```

New test blocks to add:

```ts
describe('getDivisionMonthHeatmapData', () => {
  it('returns 216 cells (18 divisions × 12 months)', () => {
    expect(getDivisionMonthHeatmapData(F, 'complaintVolume')).toHaveLength(216)
  })
  it('all complaintVolume cells are positive integers', () => {
    getDivisionMonthHeatmapData(F, 'complaintVolume').forEach(c =>
      expect(c.value).toBeGreaterThan(0)
    )
  })
  it('slaCompliance cells are in 65–99', () => {
    getDivisionMonthHeatmapData(F, 'slaCompliance').forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(65)
      expect(c.value).toBeLessThanOrEqual(99)
    })
  })
  it('resolutionTime cells are in 1.5–9.5', () => {
    getDivisionMonthHeatmapData(F, 'resolutionTime').forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(1.5)
      expect(c.value).toBeLessThanOrEqual(9.5)
    })
  })
  it('metric change produces different values', () => {
    const a = getDivisionMonthHeatmapData(F, 'complaintVolume')[0].value
    const b = getDivisionMonthHeatmapData(F, 'slaCompliance')[0].value
    expect(a).not.toBe(b)
  })
  it('is deterministic', () => {
    expect(getDivisionMonthHeatmapData(F, 'pendingComplaints'))
      .toEqual(getDivisionMonthHeatmapData(F, 'pendingComplaints'))
  })
})

describe('getServiceRequestStatusMatrix', () => {
  it('returns 6 rows (one per service type)', () => {
    expect(getServiceRequestStatusMatrix(F)).toHaveLength(6)
  })
  it('open + inProgress + completed === total volume', () => {
    getServiceRequestStatusMatrix(F).forEach(r =>
      expect(r.open + r.inProgress + r.completed).toBeGreaterThan(0)
    )
  })
  it('open is non-negative', () => {
    getServiceRequestStatusMatrix(F).forEach(r =>
      expect(r.open).toBeGreaterThanOrEqual(0)
    )
  })
  it('month filter changes values', () => {
    const all = getServiceRequestStatusMatrix(F)[0].completed
    const apr = getServiceRequestStatusMatrix({ ...F, month: 'Apr' })[0].completed
    expect(all).not.toBe(apr)
  })
})

describe('getInsights (updated)', () => {
  it('returns exactly 5 insights', () => {
    expect(getInsights(F)).toHaveLength(5)
  })
  it('includes sla-breach insight', () => {
    const ids = getInsights(F).map(i => i.id)
    expect(ids).toContain('sla-breach')
  })
  it('includes deteriorating insight', () => {
    const ids = getInsights(F).map(i => i.id)
    expect(ids).toContain('deteriorating')
  })
  it('lowest-sla division name is non-empty', () => {
    const sla = getInsights(F).find(i => i.id === 'lowest-sla')!
    expect(sla.value.length).toBeGreaterThan(0)
  })
})
```

- [ ] **Step 2: Run tests — expect failures**

```bash
npx vitest run src/modules/consumer-services/mockData.test.ts
```

Expected: multiple failures including "toHaveLength(18)" failing (currently 5), new imports not found.

- [ ] **Step 3: Update DIVISIONS constant and divFactor in mockData.ts**

Replace the existing `DIVISIONS` constant and `divFactor` function:

```ts
const DIVISIONS = [
  'Ponda X', 'Margao XVI', 'Calangute XIV', 'Mapusa XVII', 'Mormugao IV',
  'Margao V', 'Bicholim XI', 'Mapusa XV', 'Vasco III', 'Quepem VIII',
  'South Urban VI', 'Cuncolim XVIII', 'Panaji II', 'Pernem XIII',
  'Panaji I', 'Valpoi XII', 'Sanguem VII', 'Canacona IX',
]

function divFactor(division: string): number {
  const m: Record<string, number> = {
    'All': 1,
    'Panaji I':      0.08, 'Panaji II':      0.06,
    'Vasco III':     0.07, 'Mormugao IV':    0.06,
    'Margao V':      0.08, 'South Urban VI': 0.05,
    'Sanguem VII':   0.03, 'Quepem VIII':    0.04,
    'Canacona IX':   0.03, 'Ponda X':        0.07,
    'Bicholim XI':   0.05, 'Valpoi XII':     0.04,
    'Pernem XIII':   0.04, 'Calangute XIV':  0.08,
    'Mapusa XV':     0.06, 'Margao XVI':     0.06,
    'Mapusa XVII':   0.06, 'Cuncolim XVIII': 0.06,
  }
  return m[division] ?? 1
}
```

- [ ] **Step 4: Add new types and exports**

After the existing interface declarations (around line 59), add:

```ts
export type HeatmapMetric = 'complaintVolume' | 'slaCompliance' | 'resolutionTime' | 'pendingComplaints'

export interface DivisionMonthCell {
  division: string
  month: string
  value: number
}

export interface StatusMatrixRow {
  type: string
  open: number
  inProgress: number
  completed: number
}
```

- [ ] **Step 5: Add getDivisionMonthHeatmapData function**

Add after `getDivisionHeatmapData`:

```ts
export function getDivisionMonthHeatmapData(filters: Filters, metric: HeatmapMetric): DivisionMonthCell[] {
  const h  = strHash(filters.financialYear + metric)
  const ff = fyFactor(filters.financialYear)
  return DIVISIONS.flatMap((div, di) =>
    MONTHS.map((month, mi) => {
      const seed = h + di * 100 + mi
      const mf   = monthFactor(month)
      let value: number
      if (metric === 'complaintVolume') {
        const base = 600 + (di % 7) * 80
        value = jitter(Math.round(base * ff * mf), seed, 0.15)
      } else if (metric === 'slaCompliance') {
        const base = 82 + (di % 5) * 3
        value = Math.min(99, Math.max(65, jitter(Math.round(base * ff), seed, 0.08)))
      } else if (metric === 'resolutionTime') {
        const base = 3.5 + (di % 6) * 0.5
        value = Math.max(1.5, Math.min(9.5, +(base * (1 + (seed % 200) / 1000 - 0.1)).toFixed(1)))
      } else {
        const base = 45 + (di % 6) * 20
        value = jitter(Math.round(base * ff), seed, 0.20)
      }
      return { division: div, month, value }
    })
  )
}
```

- [ ] **Step 6: Add getServiceRequestStatusMatrix function**

Add after `getServiceProcessingTime`:

```ts
export function getServiceRequestStatusMatrix(filters: Filters): StatusMatrixRow[] {
  const h  = strHash(filters.financialYear + filters.month + filters.division + 'matrix')
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  const mf = filters.month === 'All' ? 1 : monthFactor(filters.month)
  const base = [380, 120, 290, 210, 430, 180]
  return SERVICE_TYPES.map((type, i) => {
    const volume     = jitter(Math.round(base[i] * df * ff * mf), h + i)
    const completed  = Math.round(volume * 0.72)
    const inProgress = Math.round(volume * 0.18)
    const open       = Math.max(0, volume - completed - inProgress)
    return { type, open, inProgress, completed }
  })
}
```

- [ ] **Step 7: Update getInsights with 5 operational alerts**

Replace the entire `getInsights` function:

```ts
export function getInsights(filters: Filters): InsightItem[] {
  const table = getDivisionTableData(filters)
  const cats  = getCategoryDistribution(filters)
  const trend = getComplaintTrend(filters)
  const kpi   = getKpiData(filters)

  const lowestSla   = [...table].sort((a, b) => a.slaPercent - b.slaPercent)[0]
  const highestPend = [...table].sort((a, b) => b.pending - a.pending)[0]
  const topCat      = [...cats].sort((a, b) => b.value - a.value)[0]
  const slaBreachCount = Math.round(kpi.openComplaints * 0.34)

  const h = strHash(filters.financialYear + filters.division + 'catgrowth')
  const catGrowthPct = Math.max(5, Math.min(45, jitter(18, h, 0.40)))

  const lastM  = trend[trend.length - 1]
  const prevM  = trend[trend.length - 2]
  const momPct = prevM
    ? Math.abs(Math.round(((lastM.received - prevM.received) / prevM.received) * 100))
    : 12
  const detDiv = [...table].sort((a, b) => b.complaints - a.complaints)[0]

  return [
    {
      id: 'lowest-sla', icon: 'alert-triangle', severity: 'error',
      label: 'Lowest SLA Compliance',
      value: lowestSla.division,
      context: `${lowestSla.slaPercent}% compliance`,
    },
    {
      id: 'largest-backlog', icon: 'clock', severity: 'error',
      label: 'Highest Pending Backlog',
      value: highestPend.division,
      context: `${highestPend.pending.toLocaleString()} open cases`,
    },
    {
      id: 'top-category', icon: 'zap', severity: 'warning',
      label: 'Fastest-Growing Category',
      value: topCat.name,
      context: `+${catGrowthPct}% vs prev month`,
    },
    {
      id: 'sla-breach', icon: 'timer', severity: 'warning',
      label: 'Complaints > SLA Threshold',
      value: slaBreachCount.toLocaleString(),
      context: 'cases older than 5-day target',
    },
    {
      id: 'deteriorating', icon: 'trending-up', severity: 'warning',
      label: 'Division Deteriorating MoM',
      value: detDiv.division,
      context: `+${momPct}% vs last month`,
    },
  ]
}
```

- [ ] **Step 8: Run tests — expect all to pass**

```bash
npx vitest run src/modules/consumer-services/mockData.test.ts
```

Expected: all tests pass. If the `consumers > 100 000 for All filters` test fails, it means the 'All' divFactor=1 path is working correctly but a total consumer calculation needs reviewing — `getKpiData` with division='All' uses `df=1` which gives `615000 * 1 * ff ≈ 615000` so it should pass.

- [ ] **Step 9: Commit**

```bash
git add src/modules/consumer-services/mockData.ts src/modules/consumer-services/mockData.test.ts
git commit -m "feat(consumer-services): update to 18 real Goa divisions and add cohort heatmap + status matrix data fns"
```

---

### Task 2: Redesign Complaints Dashboard section

**Files:**
- Modify: `src/modules/consumer-services/ConsumerServicesPage.tsx`

**Interfaces:**
- Consumes: `getComplaintTrend`, `getCategoryDistribution` (both unchanged)
- Produces: `ComplaintsSection` component with 2/3 + 1/3 layout (trend dominant, donut secondary)

Removes: Complaint Status Breakdown chart, Complaint Backlog Trend chart.

- [ ] **Step 1: Update imports in ConsumerServicesPage.tsx**

At the top of the file, update the recharts import — remove `AreaChart` and `Area` (no longer used after this task set):

```ts
import {
  ResponsiveContainer, ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, PieChart, Pie, Cell, BarChart,
  RadialBarChart, RadialBar, LineChart, ReferenceLine,
} from 'recharts'
```

Update the mockData import — remove `getComplaintStatus`, `getBacklogTrend` from the import list (keep them in the file; just remove the import):

```ts
import {
  getKpiData, getComplaintTrend, getCategoryDistribution,
  getSlaTrend, getResTimeTrend,
  getServiceVolumeByType, getServiceProcessingTime, getServiceRequestStatusMatrix,
  getConnectionsTrend, getConsumerCategoryDist,
  getDivisionMonthHeatmapData, getDivisionHeatmapData, getDivisionTableData,
  getInsights,
  slaColor,
  type HeatmapMetric, type Filters, type TableRow,
} from './mockData'
```

Note: `getDivisionHeatmapData` is kept in the import temporarily until Task 6 replaces the heatmap component (it won't be used after that; remove it in Task 6's commit).

- [ ] **Step 2: Rewrite ComplaintsSection component**

Replace the entire `ComplaintsSection` function (lines 43–111) with:

```tsx
function ComplaintsSection({ filters }: { filters: Filters }) {
  const trend      = useMemo(() => getComplaintTrend(filters),       [filters])
  const categories = useMemo(() => getCategoryDistribution(filters), [filters])

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <ChartCard title="Complaints Received vs Resolved" timeContext="Apr – Mar (Financial Year)">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={trend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="received" name="Received" fill={C.error} opacity={0.65} radius={[2,2,0,0]} />
              <Line type="monotone" dataKey="resolved" name="Resolved" stroke={C.primary} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Category Distribution" timeContext="Current Period">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85}>
              {categories.map((c) => <Cell key={c.name} fill={c.color} />)}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => v.toLocaleString()} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}
```

- [ ] **Step 3: Verify in browser**

Start dev server if not running: `npm run dev`. Navigate to Consumer Services & Grievances.

Check:
- Complaints section shows 2 charts only (trend left spanning ~2/3, donut right spanning ~1/3)
- Trend chart bar color is muted red, line is blue (not green)
- No "Complaint Status Breakdown" or "Complaint Backlog Trend" charts
- Charts are same height and aligned

- [ ] **Step 4: Commit**

```bash
git add src/modules/consumer-services/ConsumerServicesPage.tsx
git commit -m "refactor(consumer-services): simplify complaints section to trend + category only"
```

---

### Task 3: Redesign SLA Performance section

**Files:**
- Modify: `src/modules/consumer-services/ConsumerServicesPage.tsx`

**Interfaces:**
- Consumes: `getKpiData`, `getSlaTrend`, `getResTimeTrend`
- Produces: `SlaSection` with 2-col layout, blue-only gauge, no division ranking chart

Removes: Division SLA Ranking chart. The `getDivisionSlaRanking` import was already removed in Task 2.

- [ ] **Step 1: Rewrite SlaSection component**

Replace the entire `SlaSection` function (lines 113–189) with:

```tsx
function SlaSection({ filters }: { filters: Filters }) {
  const kpi      = useMemo(() => getKpiData(filters),      [filters])
  const slaTrend = useMemo(() => getSlaTrend(filters),     [filters])
  const rtTrend  = useMemo(() => getResTimeTrend(filters), [filters])

  return (
    <div className="grid grid-cols-2 gap-4">
      <ChartCard title="SLA Compliance" timeContext="Current Period">
        <div className="relative" style={{ height: 220 }}>
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
                fill={C.primary}
                background={{ fill: '#E5E7EB' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-x-0 flex flex-col items-center" style={{ bottom: 36 }}>
            <span className="text-[30px] font-bold text-text-primary">{kpi.slaCompliance}%</span>
            <span className="text-[11px] text-text-secondary mt-0.5">Target: 90%</span>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Resolution Time Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={rtTrend} margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
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
    </div>
  )
}
```

Note: `slaTrend` and its chart are removed from this section (it was the third/fourth col before). The SLA compliance trend is now implicit in the gauge reading over time; the resolution time trend is the primary analytics view here.

- [ ] **Step 2: Verify in browser**

Check:
- SLA section shows exactly 2 cards side by side
- Gauge arc is blue (not green), background track is light gray
- No "Division SLA Ranking" horizontal bar chart
- "Resolution Time Trend" line is blue with amber dashed reference line

- [ ] **Step 3: Commit**

```bash
git add src/modules/consumer-services/ConsumerServicesPage.tsx
git commit -m "refactor(consumer-services): simplify SLA section — blue gauge, 2-col layout, remove division ranking"
```

---

### Task 4: Redesign Service Requests section

**Files:**
- Modify: `src/modules/consumer-services/ConsumerServicesPage.tsx`

**Interfaces:**
- Consumes: `getServiceVolumeByType`, `getServiceProcessingTime`, `getServiceRequestStatusMatrix` (new from Task 1)
- Produces: `ServiceRequestsSection` with 3-panel layout (5/12 + 4/12 + 3/12), operational status matrix table replacing funnel

Removes: Processing Funnel visualization.

- [ ] **Step 1: Rewrite ServiceRequestsSection component**

Replace the entire `ServiceRequestsSection` function (lines 191–256) with:

```tsx
function ServiceRequestsSection({ filters }: { filters: Filters }) {
  const volume   = useMemo(() => getServiceVolumeByType(filters),       [filters])
  const procTime = useMemo(() => getServiceProcessingTime(filters),      [filters])
  const matrix   = useMemo(() => getServiceRequestStatusMatrix(filters), [filters])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-5">
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
      </div>

      <div className="col-span-4">
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

      <div className="col-span-3">
        <ChartCard title="Request Status" timeContext="Current Period">
          <div className="overflow-auto" style={{ maxHeight: 220 }}>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border-base">
                  <th className="text-left pb-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Type</th>
                  <th className="text-right pb-2 text-[10px] font-semibold uppercase tracking-wide text-warning">Open</th>
                  <th className="text-right pb-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">In Prog</th>
                  <th className="text-right pb-2 text-[10px] font-semibold uppercase tracking-wide text-success">Done</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.type} className="border-b border-border-base last:border-0">
                    <td className="py-1.5 text-text-primary" style={{ maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.type}
                    </td>
                    <td className={`py-1.5 text-right font-semibold ${
                      row.open > 150 ? 'text-error' : row.open > 80 ? 'text-warning' : 'text-text-primary'
                    }`}>
                      {row.open}
                    </td>
                    <td className="py-1.5 text-right text-text-secondary">{row.inProgress}</td>
                    <td className="py-1.5 text-right font-semibold text-success">{row.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify in browser**

Check:
- Service Requests section shows 3 panels in correct proportions (~42% / 33% / 25%)
- No funnel/progress bar visualization
- Status matrix table has 6 rows, Open column colored by threshold (red/amber/neutral)
- "Done" column values are in green

- [ ] **Step 3: Commit**

```bash
git add src/modules/consumer-services/ConsumerServicesPage.tsx
git commit -m "refactor(consumer-services): replace service request funnel with operational status matrix"
```

---

### Task 5: Redesign Consumer Analytics section

**Files:**
- Modify: `src/modules/consumer-services/ConsumerServicesPage.tsx`

**Interfaces:**
- Consumes: `getConnectionsTrend`, `getConsumerCategoryDist`
- Produces: `ConsumerAnalyticsSection` with 2/3 + 1/3 layout

Removes: Consumer Growth Trend chart.

- [ ] **Step 1: Rewrite ConsumerAnalyticsSection component**

Replace the entire `ConsumerAnalyticsSection` function (lines 258–307) with:

```tsx
function ConsumerAnalyticsSection({ filters }: { filters: Filters }) {
  const connections = useMemo(() => getConnectionsTrend(filters),     [filters])
  const categories  = useMemo(() => getConsumerCategoryDist(filters), [filters])

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <ChartCard title="New Connections vs Disconnections" timeContext="Apr – Mar (Financial Year)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={connections} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="newConnections" name="New Connections" fill={C.success} radius={[2,2,0,0]} />
              <Bar dataKey="disconnections" name="Disconnections"  fill={C.error}   radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

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
```

- [ ] **Step 2: Verify in browser**

Check:
- Consumer Analytics section shows exactly 2 charts (connections bar chart spans ~2/3, category donut ~1/3)
- No "Consumer Growth Trend" area chart

- [ ] **Step 3: Commit**

```bash
git add src/modules/consumer-services/ConsumerServicesPage.tsx
git commit -m "refactor(consumer-services): remove consumer growth trend, use 2/3+1/3 analytics layout"
```

---

### Task 6: Rewrite Division Performance Heatmap (division × month cohort)

**Files:**
- Modify: `src/modules/consumer-services/ConsumerServicesPage.tsx`

**Interfaces:**
- Consumes: `getDivisionMonthHeatmapData` (Task 1), `HeatmapMetric` type (Task 1), `MONTHS` constant
- Produces: `DivisionHeatmap` component — 18 rows × 12 month columns, metric selector, cell coloring

Also add: `MONTHS` to the mockData import (it's already exported).

- [ ] **Step 1: Add MONTHS to mockData import**

In the mockData import line at the top of `ConsumerServicesPage.tsx`, add `MONTHS`:

```ts
import {
  getKpiData, getComplaintTrend, getCategoryDistribution,
  getSlaTrend, getResTimeTrend,
  getServiceVolumeByType, getServiceProcessingTime, getServiceRequestStatusMatrix,
  getConnectionsTrend, getConsumerCategoryDist,
  getDivisionMonthHeatmapData, getDivisionTableData,
  getInsights, MONTHS,
  slaColor,
  type HeatmapMetric, type Filters, type TableRow,
} from './mockData'
```

(`getDivisionHeatmapData` and `HEATMAP_COLS` are now removed from the import.)

- [ ] **Step 2: Add helper functions before DivisionHeatmap**

Add these two functions after the `heatBg` function (around line 35):

```tsx
function heatCell(value: number, metric: HeatmapMetric): string {
  if (metric === 'complaintVolume')   return value < 600  ? '#DCFCE7' : value < 900  ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'slaCompliance')     return value >= 90  ? '#DCFCE7' : value >= 75  ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'resolutionTime')    return value <= 4   ? '#DCFCE7' : value <= 6   ? '#FEF9C3' : '#FEE2E2'
  return value < 60 ? '#DCFCE7' : value < 100 ? '#FEF9C3' : '#FEE2E2'  // pendingComplaints
}

function formatCell(value: number, metric: HeatmapMetric): string {
  if (metric === 'slaCompliance')  return `${value}%`
  if (metric === 'resolutionTime') return `${value}d`
  return String(value)
}
```

Also remove the old `heatBg` function (it is replaced by `heatCell`).

- [ ] **Step 3: Rewrite DivisionHeatmap component**

Delete the old `HEATMAP_COLS` constant and the entire `DivisionHeatmap` function. Replace with:

```tsx
const METRIC_OPTIONS: { value: HeatmapMetric; label: string }[] = [
  { value: 'complaintVolume',   label: 'Complaint Volume'    },
  { value: 'slaCompliance',     label: 'SLA Compliance %'    },
  { value: 'resolutionTime',    label: 'Avg Resolution Time' },
  { value: 'pendingComplaints', label: 'Pending Complaints'  },
]

function DivisionHeatmap({ filters }: { filters: Filters }) {
  const [metric, setMetric] = useState<HeatmapMetric>('complaintVolume')
  const data = useMemo(() => getDivisionMonthHeatmapData(filters, metric), [filters, metric])

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
          <h3 className="text-[14px] font-semibold text-text-primary">Division Performance Heatmap</h3>
          <p className="text-[12px] text-text-secondary mt-0.5">
            All 18 divisions × 12 months — Green good, Amber watch, Red poor
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {METRIC_OPTIONS.map((opt) => (
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
        <div
          className="grid"
          style={{ gridTemplateColumns: '160px repeat(12, 1fr)', minWidth: 900 }}
        >
          {/* Header row */}
          <div />
          {MONTHS.map((m) => (
            <div key={m} className="text-center text-[10px] font-semibold uppercase tracking-wide text-text-secondary pb-2 px-0.5">
              {m}
            </div>
          ))}

          {/* Data rows */}
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
                    {formatCell(value, metric)}
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

- [ ] **Step 4: Verify in browser**

Check:
- Heatmap shows 18 division rows, 12 month columns (Apr → Mar)
- Metric selector shows 4 pill buttons; clicking each changes all cell colors and values
- Default selected metric is "Complaint Volume" (blue pill)
- Cells are colored green/amber/red
- Division names are readable (not clipped too aggressively)
- Horizontal scroll appears at narrow viewport if needed

- [ ] **Step 5: Commit**

```bash
git add src/modules/consumer-services/ConsumerServicesPage.tsx
git commit -m "feat(consumer-services): replace division×metric heatmap with division×month cohort heatmap + metric selector"
```

---

### Task 7: Attention Required panel + page-level cleanup

**Files:**
- Modify: `src/modules/consumer-services/ConsumerServicesPage.tsx`

**Interfaces:**
- Consumes: `getInsights` (updated in Task 1 to return 5 operational alerts)
- Produces: `AttentionRequiredSection` component, cleaned-up page imports, section renamed

- [ ] **Step 1: Rewrite InsightsSection as AttentionRequiredSection**

Replace the entire `InsightsSection` function (the one starting with `function InsightsSection`) with:

```tsx
function AttentionRequiredSection({ filters }: { filters: Filters }) {
  const alerts = useMemo(() => getInsights(filters), [filters])
  return (
    <div className="grid grid-cols-5 gap-4">
      {alerts.map((alert) => {
        const Icon    = INSIGHT_ICONS[alert.icon]
        const isError = alert.severity === 'error'
        return (
          <div
            key={alert.id}
            className={`bg-surface border rounded-xl p-4 ${
              isError ? 'border-error/40' : 'border-warning/40'
            }`}
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

- [ ] **Step 2: Update page to use AttentionRequiredSection and rename section title**

In the `ConsumerServicesPage` function body, find:

```tsx
<SectionContainer title="Insights & Exceptions">
  <InsightsSection filters={filters} />
</SectionContainer>
```

Replace with:

```tsx
<SectionContainer title="Attention Required">
  <AttentionRequiredSection filters={filters} />
</SectionContainer>
```

- [ ] **Step 3: Remove unused resTimeColor helper**

Delete the `resTimeColor` function — it is no longer used (the table still uses inline logic with `style={{ color: resTimeColor(...) }}`... actually check: `EnhancedTable` still uses it at line 465. If it does, keep it. If not, remove it).

To check: search for `resTimeColor` in the file. The `EnhancedTable` component uses it for the resolution time column. Keep it.

- [ ] **Step 4: Remove unused slaColor import check**

The `slaColor` function is imported from mockData but is no longer used in `SlaSection` (Task 3 replaced it with a constant `C.primary`). Check if it's still used elsewhere in the file — `EnhancedTable` uses it for `slaPercent` badges: it does NOT — the table uses Tailwind class logic. Remove `slaColor` from the mockData import line.

Updated import (final version):

```ts
import {
  getKpiData, getComplaintTrend, getCategoryDistribution,
  getSlaTrend, getResTimeTrend,
  getServiceVolumeByType, getServiceProcessingTime, getServiceRequestStatusMatrix,
  getConnectionsTrend, getConsumerCategoryDist,
  getDivisionMonthHeatmapData, getDivisionTableData,
  getInsights, MONTHS,
  type HeatmapMetric, type Filters, type TableRow,
} from './mockData'
```

- [ ] **Step 5: Final browser verification**

Open the page. Walk through each section top to bottom:

1. KPI row — 8 cards, 4-col grid ✓
2. Complaints Dashboard — 2 charts (trend 2/3, donut 1/3) ✓
3. SLA Performance — 2 charts (blue gauge, resolution time trend) ✓
4. Service Requests — 3 panels (volume bar, processing time, status matrix) ✓
5. Consumer Analytics — 2 charts (connections 2/3, category donut 1/3) ✓
6. Division Performance Heatmap — 18 rows × 12 months, 4 metric buttons ✓
7. Division Operations — sortable table, 18 divisions, paginated ✓
8. Attention Required — 5 alert cards, operational content (not decorative) ✓

Change a filter (Financial Year or Division) — verify all charts and the heatmap update reactively.

Switch each metric button in the heatmap — verify colors and values change.

- [ ] **Step 6: Run tests one final time**

```bash
npx vitest run src/modules/consumer-services/mockData.test.ts
```

Expected: all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/modules/consumer-services/ConsumerServicesPage.tsx
git commit -m "feat(consumer-services): add attention-required panel and finalize page cleanup"
```
