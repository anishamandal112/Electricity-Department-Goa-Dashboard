# Meter Management Page — Design Spec

**Date:** 2026-06-17
**Module:** `src/modules/meter-management/`
**Status:** Approved

---

## Overview

Replace the current stub `MeterManagementPage.tsx` with a fully data-driven Meter Management analytics page for the Goa Electricity Department. The page covers smart metering progress, communication performance, meter health monitoring, and division-level operational analytics.

Architecture mirrors the Consumer Services module exactly: a `mockData.ts` file for all types and generator functions, and a `MeterManagementPage.tsx` for all UI — no new dependencies.

---

## Files

| File | Action |
|---|---|
| `src/modules/meter-management/mockData.ts` | Create — all types, constants, generator functions |
| `src/modules/meter-management/MeterManagementPage.tsx` | Replace stub — page shell + 6 section components |

---

## mockData.ts

### Constants

```ts
DIVISIONS: string[]  // 18 Goa ED divisions (same list as Consumer Services)
MONTHS: string[]     // ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']
```

The 18 divisions:
Ponda X, Margao XVI, Calangute XIV, Mapusa XVII, Mormugao IV, Margao V, Bicholim XI, Mapusa XV, Vasco III, Quepem VIII, South Urban VI, Cuncolim XVIII, Panaji II, Pernem XIII, Panaji I, Valpoi XII, Sanguem VII, Canacona IX

### Types

```ts
interface Filters {
  financialYear: string; month: string; circle: string;
  division: string; subdivision: string;
}

type MeterHeatmapMetric =
  | 'commSuccess'       // Communication Success %
  | 'readSuccess'       // Meter Reading Success %
  | 'nonCommunicating'  // Count of non-communicating meters
  | 'faultyMeters'      // Count of faulty meters

interface DivisionMonthCell { division: string; month: string; value: number }

interface MeterTableRow {
  division: string
  totalMeters: number
  smartMeters: number
  smartPct: number           // smart / total * 100
  commSuccessPct: number     // communication success %
  readSuccessPct: number     // reading success %
  faultyMeters: number
  nonCommunicating: number
  replacements: number
  attentionFlag: 'critical' | 'warning' | null
}

interface MeterInsight {
  id: string
  label: string
  value: string
  context: string
  severity: 'error' | 'warning'
  icon: 'wifi-off' | 'alert-triangle' | 'trending-down' | 'target' | 'refresh-cw'
}

interface RolloutPoint { month: string; smart: number; conventional: number }
interface StatusSlice   { name: string; value: number; color: string }
interface DivisionBar   { division: string; value: number }
interface CategoryBar   { category: string; smartPct: number }
interface InstallBar    { division: string; smartPct: number; target: number }
```

### Generator Functions

All functions accept `Filters` and return stable, deterministic data seeded from the filter values.

| Function | Returns | Used by |
|---|---|---|
| `getMeterKpis(filters)` | `{ totalMeters, smartMeters, smartPenetration, readSuccessRate, commSuccessRate, faultyNonComm }` | KPI row |
| `getRolloutTrend(filters)` | `RolloutPoint[]` (12 months) | Area chart |
| `getSmartVsConventional(filters)` | `StatusSlice[]` (2 slices) | Donut chart |
| `getInstallProgressByDivision(filters)` | `InstallBar[]` (18 rows) | Horizontal bar |
| `getHeatmapData(filters, metric)` | `DivisionMonthCell[]` (216 cells) | Heatmap |
| `getMeterStatusDist(filters)` | `StatusSlice[]` (5 slices) | Donut chart |
| `getTopIssueDivisions(filters)` | `DivisionBar[]` (top 5) | Horizontal bar |
| `getNewVsReplacement(filters)` | `{ month, newInstalls, replacements }[]` | Grouped bar |
| `getAdoptionByCategory(filters)` | `CategoryBar[]` (4 categories) | Horizontal bar |
| `getDivisionTableData(filters)` | `MeterTableRow[]` (18 rows) | Enhanced table |
| `getInsights(filters)` | `MeterInsight[]` (4–5 items) | Attention panel |

### Realistic Value Ranges

- Total meters: ~2,80,000–2,90,000 across all 18 divisions
- Smart meter penetration: 28–42% overall; per-division 18–58%
- Communication success: 82–97% per division/month
- Reading success: 88–99% per division/month
- Faulty meters: 40–280 per division
- Non-communicating: 60–420 per division
- Status distribution: Active ~91%, Faulty ~1.5%, Non-Comm ~4%, Tampered ~0.8%, Disconnected ~2.7%
- Domestic smart adoption: ~35%, Commercial ~52%, Industrial ~74%, Government ~68%

---

## MeterManagementPage.tsx

### Section Components

#### `KpiRow` (inline in page)
Six KPI cards in a 6-column grid using the existing `KpiCard` component:

| Label | Value example | Trend |
|---|---|---|
| Total Installed Meters | 2,84,830 | +1,100 vs last month |
| Smart Meters Installed | 1,03,240 | +2,840 vs last month |
| Smart Meter Penetration | 36.2% | +0.9% vs last month |
| Reading Success Rate | 97.4% | +0.2% vs last month |
| Communication Success Rate | 91.8% | −0.4% vs last month |
| Faulty / Non-Communicating | 4,920 | −130 vs last month |

#### `MeteringOverviewSection`
12-column grid:
- `col-span-8`: Area chart — Smart Meter Rollout Trend. Two stacked areas: Smart (blue) and Conventional (gray). Y-axis: meter count. X-axis: Apr–Mar.
- `col-span-4`: Donut chart — Smart vs Conventional Meter Distribution. Two slices with center label showing smart %.
- `full-width`: Horizontal bar chart — Installation Progress by Division. All 18 divisions on Y-axis. X-axis: smart meter %. Reference line at target (30%). Bars colored green ≥ target, amber 20–29%, red < 20%.

#### `CommunicationHeatmap` (PRIMARY ANALYSIS SECTION)
Full-width card. Header shows title, subtitle ("18 divisions × 12 months"), and 4 metric selector buttons (pill/tab style matching Consumer Services).

**Metric selector options:**
- Communication Success Rate %
- Meter Reading Success Rate %
- Non-Communicating Meters
- Faulty Meters

**Heatmap grid:** `gridTemplateColumns: '160px repeat(12, 1fr)'`
Each cell shows the formatted value. Colour thresholds:

| Metric | Green | Amber | Red |
|---|---|---|---|
| commSuccess | ≥ 92% | 80–91% | < 80% |
| readSuccess | ≥ 95% | 85–94% | < 85% |
| nonCommunicating | < 100 | 100–300 | > 300 |
| faultyMeters | < 50 | 50–150 | > 150 |

Cell display format: `%` suffix for rate metrics, plain number for count metrics.

#### `MeterHealthSection`
12-column grid:
- `col-span-4`: Donut — Meter Status Distribution (Active, Faulty, Non-Communicating, Tampered, Disconnected). Center label shows Active count. Legend below.
- `col-span-8`: Horizontal bar — Top 5 Divisions with Meter Issues. Bar value = faulty + non-communicating. Bars color-coded red.

#### `ConsumerMeteringSection`
12-column grid:
- `col-span-8`: Grouped bar — New Meter Installations vs Replacements (monthly, Apr–Mar). Two bars per month: New (blue), Replacement (orange).
- `col-span-4`: Horizontal bar — Smart Meter Adoption by Consumer Category (Domestic, Commercial, Industrial, Government). Each bar shows smart %. Reference line at overall average.

#### `DivisionTable`
Full-width sortable table. Columns:

| Column | Sort | Color coding |
|---|---|---|
| Division | alpha | — |
| Total Meters | numeric | — |
| Smart Meters | numeric | — |
| Smart Meter % | numeric | green ≥ 35%, amber 20–34%, red < 20% |
| Communication Success % | numeric | green ≥ 92%, amber 80–91%, red < 80% |
| Reading Success % | numeric | green ≥ 95%, amber 85–94%, red < 85% |
| Faulty Meters | numeric | red > 150, amber 50–150, green < 50 |
| Non-Communicating | numeric | red > 300, amber 100–300, green < 100 |
| Replacements | numeric | — |
| Attention | — | Critical (red chip) / Warning (amber chip) / — |

Features: search by division name, sort on any column, 5 rows per page with prev/next pagination.

#### `AttentionPanel`
Card with 4–5 insight rows. Each row: severity icon, label, bold value, context text. Matches Consumer Services InsightsPanel visual style.

Insight rules (evaluated from `getDivisionTableData` output):
1. **Lowest communication success** — division with minimum `commSuccessPct`
2. **Highest faulty count** — division with maximum `faultyMeters`
3. **Rising communication failures** — division with largest month-on-month drop in comm success (derived from heatmap data, simplified to worst trailing month)
4. **Rollout below target** — count of divisions where `smartPct < 30%`, list top offender
5. **High replacement rate** — division where `replacements / totalMeters > 15%`

---

## Colour Palette

Reuse the existing `C` constant pattern:

```ts
const C = {
  primary: '#2563EB', success: '#16A34A', warning: '#F59E0B',
  error: '#DC2626', gray: '#9CA3AF', orange: '#EA580C',
  teal: '#0891B2', purple: '#7C3AED', grid: '#E5E7EB',
}
```

Status distribution colours: Active `#16A34A`, Faulty `#DC2626`, Non-Comm `#F59E0B`, Tampered `#7C3AED`, Disconnected `#9CA3AF`.

---

## Lucide Icons Used

`WifiOff`, `AlertTriangle`, `TrendingDown`, `Target`, `RefreshCw`, `ChevronUp`, `ChevronDown`, `Search`

---

## Constraints

- No new npm dependencies
- All data is static mock data — no API calls
- Page must be responsive within the existing AppShell 12-column grid
- All 18 divisions must appear consistently in heatmap, horizontal bars, and table
- Filters accepted but used only as a seed for mock data variation (same as Consumer Services)
