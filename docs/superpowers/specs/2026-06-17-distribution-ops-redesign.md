# Distribution Operations Page — Design Spec
**Date:** 2026-06-17
**Status:** Approved

---

## Overview

Replace the placeholder `DistributionOpsPage.tsx` with a full analytics page for the Goa Electricity Department's Distribution Operations module. This is the primary operational page — covering energy flow, AT&C losses, reliability indices, transformer health, and division-level performance.

Two files are produced:
- `src/modules/distribution-ops/mockData.ts` — all types, generators, and seed logic
- `src/modules/distribution-ops/DistributionOpsPage.tsx` — full page with sub-components

Follows the exact same architecture as `MeterManagementPage.tsx` and `ConsumerServicesPage.tsx`.

---

## Section Order

1. KPI Overview
2. Energy & Loss Analytics
3. Network Reliability
4. Distribution Infrastructure
5. Division Performance Heatmap
6. Operations Table
7. Attention Required

---

## Section 1 — KPI Overview

Six `KpiCard` components in a `grid-cols-6` row.

| Label | Sample Value | Trend | Direction | Positive? |
|---|---|---|---|---|
| Energy Input (MU) | 142.6 | 3.2 MU | up | true |
| Energy Sold (MU) | 118.4 | 2.1 MU | up | true |
| AT&C Loss % | 16.9% | 1.2% | down | true |
| Distribution Loss % | 11.4% | 0.8% | down | true |
| Peak Demand (MW) | 312.4 | 8.2 MW | up | false |
| Power Availability % | 97.8% | 0.3% | up | true |

---

## Section 2 — Energy & Loss Analytics

Three charts in two rows.

**Row 1 — `grid-cols-12`:**
- `col-span-7`: **Energy Input vs Energy Sold** — dual-line AreaChart, Apr–Mar. Two `Area` series: `energyInput` (blue) and `energySold` (green). Fills at 15% opacity.
- `col-span-5`: **AT&C Loss Trend** — single LineChart, Apr–Mar. `ReferenceLine` at y=15 labelled "Target 15%" in amber. Line colored red when above target (via `Cell` or stroke on the line).

**Row 2 — full width:**
- **Division-wise AT&C Loss Ranking** — horizontal `BarChart`, all 18 divisions sorted descending. Bar fill: green if <15%, amber if 15–25%, red if >25%. `ReferenceLine` at x=15 (target).

---

## Section 3 — Network Reliability

`grid-cols-2` layout:

- **SAIFI & SAIDI Trend** — dual `LineChart` with two Y-axes. Left axis: SAIFI (interruptions/consumer). Right axis: SAIDI (hours/consumer). Apr–Mar. Both lines use dot markers.
- **Planned vs Unplanned Outages** — stacked `BarChart` by month. Two series: `planned` (blue) and `unplanned` (red/error). Legend shown.

---

## Section 4 — Distribution Infrastructure

`grid-cols-12` layout:

- `col-span-5`: **Transformer Loading Distribution** — horizontal `BarChart` with three category rows: Normal (<80% load), Overloaded (80–100%), Critical (>100%). Bar fill: green / amber / red respectively. Shows count of DTs in each category.
- `col-span-7`: **Top Divisions by DT Failures** — horizontal `BarChart`, top 8 divisions sorted descending. Single red bar series. `maxBarSize={14}`.

---

## Section 5 — Division Performance Heatmap

Full-width component. Rows = all 18 Goa ED divisions. Columns = 12 months (Apr–Mar).

**Metric selector pill buttons (5 options):**

| Metric key | Label | Green | Amber | Red |
|---|---|---|---|---|
| `atcLoss` | AT&C Loss % | <15% | 15–25% | >25% |
| `saifi` | SAIFI | <3 | 3–6 | >6 |
| `saidi` | SAIDI (hrs) | <8 | 8–15 | >15 |
| `outages` | Outages | <5 | 5–10 | >10 |
| `dtFailures` | DT Failures | <2 | 2–5 | >5 |

Cell displays the raw value. Color coding uses the same inline `backgroundColor` style as other heatmaps (hex fills: `#DCFCE7`, `#FEF9C3`, `#FEE2E2`).

---

## Section 6 — Operations Table

Sortable, paginated (8 rows/page), searchable by division name. Hand-rolled (no MUI DataGrid).

**Columns:**

| Key | Label | Format |
|---|---|---|
| `division` | Division | plain text |
| `energyInput` | Energy Input (MU) | 1 decimal |
| `energySold` | Energy Sold (MU) | 1 decimal |
| `atcLoss` | AT&C Loss % | colour badge (green/amber/red) |
| `peakDemand` | Peak Demand (MW) | 1 decimal |
| `saifi` | SAIFI | 1 decimal |
| `saidi` | SAIDI (hrs) | 1 decimal |
| `outages` | Outages | integer |
| `dtFailures` | DT Failures | integer |
| `status` | Status | badge: Critical / Warning / OK |

Sort toggles on all columns except `status`. `ChevronUp`/`ChevronDown` icons (lucide-react). Search input top-right of card header.

---

## Section 7 — Attention Required

Five insight cards in `grid-cols-5`. Each card: icon + severity border + label + bold value + context line.

| id | Label | Icon | Severity |
|---|---|---|---|
| `highest-atc` | Highest AT&C Loss Division | `trending-down` | error |
| `worst-reliability` | Worst Reliability (SAIDI) | `alert-triangle` | error |
| `most-outages` | Most Outage-Prone Division | `zap` | warning |
| `rising-dt` | Rising DT Failures | `alert-triangle` | warning |
| `deteriorating` | Month-on-Month Decline | `trending-down` | warning |

---

## Data Model (`mockData.ts`)

### Types

```ts
export interface Filters {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
}

export type DivisionHeatmapMetric = 'atcLoss' | 'saifi' | 'saidi' | 'outages' | 'dtFailures'

export interface DistributionKpis {
  energyInput: number       // MU
  energySold: number        // MU
  atcLoss: number           // %
  distributionLoss: number  // %
  peakDemand: number        // MW
  powerAvailability: number // %
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
```

### Exported Generators

All accept `filters: Filters` and derive a numeric seed from `financialYear` so data shifts per year but stays deterministic. Division filter narrows where applicable.

| Function | Returns |
|---|---|
| `getDistributionKpis(filters)` | `DistributionKpis` |
| `getEnergyTrend(filters)` | `EnergyPoint[]` (12 months) |
| `getAtcLossTrend(filters)` | `AtcLossPoint[]` (12 months) |
| `getDivisionAtcRanking(filters)` | `DivisionLossBar[]` (18 divisions) |
| `getReliabilityTrend(filters)` | `ReliabilityPoint[]` (12 months) |
| `getOutageTrend(filters)` | `OutagePoint[]` (12 months) |
| `getDtLoadingDistribution(filters)` | `DtLoadingBar[]` (3 rows) |
| `getTopDtFailureDivisions(filters)` | `DtFailureBar[]` (top 8) |
| `getDivisionHeatmapData(filters, metric)` | `DivisionHeatCell[]` (18 × 12 = 216 cells) |
| `getDivisionTableData(filters)` | `DivisionTableRow[]` (18 rows) |
| `getInsights(filters)` | `DistributionInsight[]` (5 items) |

### Constants

```ts
export const MONTHS = ['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar']

export const DIVISIONS = [
  'Panaji', 'Mapusa', 'Calangute', 'Bicholim', 'Ponda',
  'Vasco', 'Margao', 'Quepem', 'Sanguem', 'Canacona',
  'Mormugao', 'Cortalim', 'Pernem', 'Sattari', 'Dharbandora',
  'Curchorem', 'Cuncolim', 'Sanquelim',
]
```

---

## Implementation Notes

- Color palette constant `C` mirrors existing pages: `primary`, `success`, `warning`, `error`, `gray`, `grid`
- Axis style constant `ax = { fontSize: 11, fill: '#6B7280' }` shared across all charts
- Each logical section is its own function component receiving `filters: Filters`
- `useMemo` wraps every data call, keyed on `filters`
- `useFilterStore` destructured at page root, assembled into `filters` memo
- Heatmap uses inline `style={{ gridTemplateColumns: '160px repeat(12, 1fr)' }}` identical to existing heatmaps
- No new npm dependencies
