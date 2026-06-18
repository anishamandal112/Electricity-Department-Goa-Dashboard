# Spec: Executive Overview Page Redesign

**Date:** 2026-06-18
**Module:** `src/modules/overview/OverviewPage.tsx`
**Status:** Approved — ready for implementation

---

## Goal

Replace the skeleton Overview page with a fully-featured department-wide analytics landing page for senior GED decision-makers. The page consolidates operations, revenue, metering, and grievance data into a single executive view.

---

## Page Layout (top → bottom)

```
PageHeader + GlobalFilterBar
Section: KPI Overview         (8 cards, 4-col × 2-row grid)
Section: Division Performance Heatmap   (hero section)
Section: Department Performance Summary (3 trend charts)
Section: Top & Bottom Performers        (2 ranked lists)
Section: Executive Alerts               (5 alert cards)
```

No map placeholder — removed per design decision.

---

## Section 1 — KPI Overview

**Component:** Existing `KpiCard`
**Layout:** `grid-cols-4 gap-4` × 2 rows (8 cards total)

| # | Label | Unit | Positive trend direction |
|---|---|---|---|
| 1 | Total Consumers | count (e.g. 6,24,382) | up |
| 2 | Energy Input (MU) | MU | up |
| 3 | Energy Sold (MU) | MU | up |
| 4 | Open Grievances | count | down (fewer = good) |
| 5 | AT&C Loss % | % | down (lower = good) |
| 6 | Revenue Collected (₹ Cr) | ₹ Cr | up |
| 7 | Collection Efficiency % | % | up |
| 8 | Smart Meter Penetration % | % | up |

All trends are vs previous month. Mock data must vary with `financialYear` + `month` filters.

---

## Section 2 — Division Performance Heatmap (Hero)

**Pattern:** Direct port of `DivisionHeatmap` from `DistributionOpsPage`, adapted for cross-domain metrics.

**Grid:** 18 Goa divisions (rows) × 12 months Apr–Mar (columns)

**Metric selector pills (5):**

| Metric key | Label | Green | Amber | Red |
|---|---|---|---|---|
| `atcLoss` | AT&C Loss % | < 15% | 15–25% | > 25% |
| `collectionEff` | Collection Efficiency % | > 95% | 90–95% | < 90% |
| `slaCompliance` | SLA Compliance % | > 95% | 85–95% | < 85% |
| `smartMeterPct` | Smart Meter Penetration % | > 60% | 30–60% | < 30% |
| `outstandingDues` | Outstanding Dues (₹ Cr) | < 5 | 5–15 | > 15 |

**Header:** "Division Performance by Month"
**Subtitle:** "All 18 divisions × 12 months — Green good, Amber watch, Red poor"

Default metric on load: `atcLoss`

Cell formatting:
- `atcLoss`, `collectionEff`, `slaCompliance`, `smartMeterPct` → append `%`
- `outstandingDues` → prepend `₹` and show one decimal place

---

## Section 3 — Department Performance Summary

**Layout:** `grid-cols-3 gap-4`
**Time context label on all charts:** "Apr – Mar (Financial Year)"

### Chart 1 — AT&C Loss Trend
- Type: `LineChart` (Recharts)
- X: months, Y: AT&C Loss %
- Dashed `ReferenceLine` at y=15 labelled "Target 15%", color `#F59E0B`
- Line color: `#DC2626` (error)
- Y domain: [8, 32]

### Chart 2 — Revenue Collection Trend
- Type: `AreaChart` (Recharts)
- Two data keys: `billed` (₹ Cr) and `collected` (₹ Cr)
- `billed` area: blue `#2563EB`, fillOpacity 0.1
- `collected` area: green `#16A34A`, fillOpacity 0.15
- Y formatter: `₹${v} Cr`
- Legend shown

### Chart 3 — Smart Meter Rollout Trend
- Type: `AreaChart` (Recharts)
- Single data key: `metersInstalled` (cumulative, in thousands)
- Area color: teal `#0891B2`, fillOpacity 0.2
- Y formatter: `${v}K`
- Monotone curve (rising trend)

All charts height: 220px inside `ChartCard`.

---

## Section 4 — Top & Bottom Performers

**Layout:** `grid-cols-2 gap-4`

**Shared metric selector** above both columns (pill buttons):
- AT&C Loss % (default)
- Collection Efficiency %
- Smart Meter %

Switching metric re-ranks both lists simultaneously.

### Left panel — Best Performing Divisions
- Border accent: `border-success/40`
- Header: "Best Performing" with green check icon
- 5 division rows, ranked best first
- Each row: division name | metric badge (green) | secondary line (e.g. "Coll. Eff. 97.2% · Grievances: 3")

### Right panel — Attention Required
- Border accent: `border-error/40`
- Header: "Attention Required" with red alert icon
- 5 division rows, ranked worst first
- Each row: division name | metric badge (red) | secondary line

**Badge colors:**
- For AT&C Loss %: green <15, amber 15–25, red >25 (same thresholds as heatmap)
- For Collection Efficiency %: green >95, amber 90–95, red <90
- For Smart Meter %: green >60, amber 30–60, red <30

---

## Section 5 — Executive Alerts

**Layout:** `grid-cols-5 gap-4`
**Pattern:** Direct port of `AttentionPanel` from `DistributionOpsPage`

| # | Label | Severity | Icon |
|---|---|---|---|
| 1 | Highest AT&C Loss | error | `trending-down` |
| 2 | Lowest Collection Efficiency | error | `trending-down` |
| 3 | Rising Complaint Volumes | warning | `alert-triangle` |
| 4 | Smart Meter Comm. Issues | warning | `zap` |
| 5 | Rising Transformer Failures | warning | `alert-triangle` |

Each card:
- Severity-colored icon + label (uppercase, 10px)
- Bold headline value (15px bold) — e.g. "Sanguem VII — 28.4%"
- One-line context string (12px secondary) — e.g. "3.2pp above dept. average"

---

## Mock Data Requirements (`src/modules/overview/mockData.ts`)

All generators accept `Filters` and must vary output with `financialYear` + `month`.

```ts
getOverviewKpis(filters): OverviewKpis
getAtcLossTrend(filters): AtcLossPoint[]         // reuse from Dist Ops pattern
getRevenueTrend(filters): RevenueTrendPoint[]    // { month, billed, collected }
getSmartMeterTrend(filters): SmartMeterPoint[]   // { month, metersInstalled }
getOverviewHeatmapData(filters, metric): HeatCell[]
getPerformerRankings(filters, metric): { best: DivisionRank[], worst: DivisionRank[] }
getExecutiveAlerts(filters): ExecutiveAlert[]
```

Use the same `seed()` deterministic hash pattern from `distribution-ops/mockData.ts`.
Reuse the `DIVISIONS` and `MONTHS` arrays (import from Dist Ops mockData or duplicate).

---

## File Locations

| File | Action |
|---|---|
| `src/modules/overview/OverviewPage.tsx` | Full replacement |
| `src/modules/overview/mockData.ts` | New file |

No new shared components needed — all existing primitives (`KpiCard`, `ChartCard`, `SectionContainer`, `PageHeader`, `GlobalFilterBar`) are sufficient.

---

## Colour / Style Constants

Follow the pattern in `DistributionOpsPage.tsx`:
```ts
const C = {
  primary: '#2563EB', success: '#16A34A', warning: '#F59E0B',
  error: '#DC2626', gray: '#9CA3AF', teal: '#0891B2', grid: '#E5E7EB',
}
const ax = { fontSize: 11, fill: '#6B7280' }
```

---

## Out of Scope

- Real map/GIS visualization (removed)
- Drill-down navigation to module pages
- Export functionality
- Real API integration
