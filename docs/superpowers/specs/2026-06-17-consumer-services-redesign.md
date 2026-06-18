# Consumer Services & Grievances — Page Redesign Spec

**Date:** 2026-06-17
**Status:** Approved

---

## Goal

Reduce visual noise, remove redundant charts (~35%), and make the page feel closer to Apache Superset / Power BI enterprise dashboards. Replace decorative elements with operational signal.

---

## Data Constants

### 18 Real Goa Divisions (replace the current 5 placeholder divisions everywhere)

```
Ponda X, Margao XVI, Calangute XIV, Mapusa XVII, Mormugao IV,
Margao V, Bicholim XI, Mapusa XV, Vasco III, Quepem VIII,
South Urban VI, Cuncolim XVIII, Panaji II, Pernem XIII,
Panaji I, Valpoi XII, Sanguem VII, Canacona IX
```

The `DIVISIONS` constant in `mockData.ts` must use this exact list. `divFactor()` must be updated so each of the 18 divisions produces a sensible weight (roughly proportional to known consumer density; exact values are fine to approximate).

---

## What Gets Removed

These charts are removed from the page. Their mock data functions may stay in the file but their imports and usages are deleted.

| Removed Component | Current mock fn |
|---|---|
| Complaint Status Breakdown | `getComplaintStatus` |
| Complaint Backlog Trend | `getBacklogTrend` |
| Consumer Growth Trend | `getConsumerGrowthTrend` |
| Division SLA Ranking | `getDivisionSlaRanking` |
| Processing Funnel | `getServiceRequestFunnel` |

---

## New Mock Data Functions Required

### `getDivisionMonthHeatmapData(filters, metric)`

Returns a 2D structure: one row per division (18), one column per month (Apr–Mar, 12 months).

```ts
type HeatmapMetric = 'complaintVolume' | 'slaCompliance' | 'resolutionTime' | 'pendingComplaints'

interface DivisionMonthCell {
  division: string
  month: string
  value: number
}

getDivisionMonthHeatmapData(filters: Filters, metric: HeatmapMetric): DivisionMonthCell[]
```

Each cell value is generated with the same `jitter` + `strHash` pattern keyed on `division + month + metric`. Ranges:
- `complaintVolume`: 400–1200 per division/month
- `slaCompliance`: 68–99%
- `resolutionTime`: 1.5–9 days
- `pendingComplaints`: 30–180

### `getServiceRequestStatusMatrix(filters)`

Returns per-type counts for Open, In Progress, Completed. Filter by `month` (if not "All", apply `monthFactor`).

```ts
interface StatusMatrixRow {
  type: string        // same SERVICE_TYPES list
  open: number
  inProgress: number
  completed: number
}

getServiceRequestStatusMatrix(filters: Filters): StatusMatrixRow[]
```

Derive from the existing per-type volume: `completed ≈ volume × 0.72`, `inProgress ≈ volume × 0.18`, `open = volume - completed - inProgress`.

---

## Page Layout

```
PageHeader
GlobalFilterBar
─────────────────────────────────────
KPI Row (8 cards, 4-col grid)           ← unchanged
─────────────────────────────────────
Section: Complaints Dashboard
  [2/3 width] Received vs Resolved trend (ComposedChart, 260px tall)
  [1/3 width] Category Distribution (donut PieChart)
─────────────────────────────────────
Section: SLA Performance
  [1/2] SLA Compliance Gauge (blue arc, neutral track)
  [1/2] Resolution Time Trend (LineChart)
─────────────────────────────────────
Section: Service Requests
  [5/12] Request Volume by Type (BarChart, angled labels)
  [4/12] Avg Processing Time by Type (horizontal BarChart, threshold colors)
  [3/12] Operational Status Matrix (compact table)
─────────────────────────────────────
Section: Consumer Analytics
  [2/3] New Connections vs Disconnections (grouped BarChart)
  [1/3] Consumer Category Distribution (donut PieChart)
─────────────────────────────────────
Section: Division Performance Heatmap  ← full width, redesigned
─────────────────────────────────────
Section: Division Operations           ← unchanged
─────────────────────────────────────
Section: Attention Required            ← replaces Insights & Exceptions
```

---

## Section Specs

### Complaints Dashboard

Two-column layout using `grid-cols-3`: trend spans 2 cols, donut spans 1 col.

**Received vs Resolved Trend**
- `ComposedChart` at 260px height
- `Bar` for Received: fill `#DC2626`, opacity 0.65, radius `[2,2,0,0]`
- `Line` for Resolved: stroke `#2563EB`, strokeWidth 2, no dots
- No vertical gridlines
- Make this the visually dominant element of the section

**Category Distribution**
- Donut PieChart, innerRadius 55, outerRadius 85
- Existing category colors (no change)
- `Tooltip` + `Legend` at fontSize 11

---

### SLA Performance

Two-column grid (`grid-cols-2`).

**SLA Compliance Gauge**
- `RadialBarChart` semicircle (startAngle 180, endAngle 0)
- Arc fill: `#2563EB` (always blue — not green/amber/red)
- Background track: `#E5E7EB`
- Center label: value in 28px bold, "Target: 90%" in 11px secondary below
- No color-coded severity on the arc itself

**Resolution Time Trend**
- `LineChart` at 220px height
- Reference line at y=5 (target), amber dashed
- Line stroke: `#2563EB`
- Dots: r=3

---

### Service Requests

Three-column grid using fractional widths (`grid-cols-12` or flex with `basis`). Approximate: 5/12 + 4/12 + 3/12.

**Request Volume by Type** — existing `BarChart`, no changes besides removing the col-3 constraint.

**Avg Processing Time by Type** — existing horizontal `BarChart` with threshold coloring.

**Operational Status Matrix**
- A compact styled table inside a `ChartCard`
- Columns: Type | Open | In Progress | Completed
- 6 rows (SERVICE_TYPES)
- Open count: amber text if > 80, red if > 150
- Completed: green text
- Font size 12px, row height compact (py-2)
- No pagination needed

---

### Consumer Analytics

Two-column grid (`grid-cols-3`): connections chart spans 2 cols, category donut spans 1.

**New Connections vs Disconnections** — existing grouped `BarChart`, no changes.

**Consumer Category Distribution** — existing donut, no changes.

---

### Division Performance Heatmap (Redesigned)

Full-width card. Structure:

```
[Card header]  "Division Performance Heatmap"
[Metric selector row]  4 buttons: Complaint Volume | SLA Compliance % | Avg Resolution Time | Pending Complaints
[Heatmap grid]
  Rows = 18 divisions (all listed above)
  Columns = Apr May Jun Jul Aug Sep Oct Nov Dec Jan Feb Mar
  Cells = colored background + value text
```

**Metric Selector**
- Pill/tab style buttons, single select
- Active: `#2563EB` background, white text
- Inactive: border, secondary text
- State managed with `useState<HeatmapMetric>` inside the component

**Grid Layout**
- CSS Grid: `gridTemplateColumns: '180px repeat(12, 1fr)'`
- Header row: month abbreviations, centered, uppercase 10px
- Division column: 13px medium text, right-padded
- Cell: centered value, 12px semibold, rounded 4px, colored background, 8px horizontal padding
- Row separator: `border-t border-border-base`

**Color thresholds per metric:**
| Metric | Green | Amber | Red |
|---|---|---|---|
| complaintVolume | < 600 | 600–900 | > 900 |
| slaCompliance | ≥ 90% | 75–89% | < 75% |
| resolutionTime | ≤ 4d | 4–6d | > 6d |
| pendingComplaints | < 60 | 60–100 | > 100 |

**Cell value formatting:**
- complaintVolume: integer
- slaCompliance: `${v}%`
- resolutionTime: `${v}d`
- pendingComplaints: integer

Default selected metric on load: `complaintVolume`.

---

### Division Operations Table

No changes. Keep existing `EnhancedTable` component as-is.

---

### Attention Required Panel (replaces Insights & Exceptions)

5 alert cards in a single-row grid (`grid-cols-5`).

Each card:
- White background, 1px border
- Border color: `#DC2626` for error severity, `#F59E0B` for warning severity
- Top: icon (14px) + label (11px uppercase, color-matched to severity)
- Middle: value (15px bold, text-primary) — division name or category name
- Bottom: context string (12px secondary)

**5 Alerts (derived from `getInsights` — rename the section, keep the data fn):**
1. **Lowest SLA Compliance** — division name + `X% compliance` (error)
2. **Highest Pending Backlog** — division name + `N open cases` (error)
3. **Fastest-Growing Category** — category name + `+X% vs prev month` (warning)
4. **Complaints > SLA Threshold** — count of complaints older than 5-day target (warning) — derive as `openComplaints × 0.34` rounded
5. **Division Deteriorating MoM** — division where complaints grew most MoM + `+X% vs last month` (warning)

Update `getInsights` to return these 5 specific alerts. Alert #4 needs a `slaBreachCount` field. Alert #5 needs to compare last two months of trend per division (can approximate using two jitter seeds).

---

## Gauge Styling: Blue-Only Arc

The current `slaColor()` function returns green/amber/red for the gauge fill. For the gauge component specifically, override with a constant `#2563EB`. The function itself is not removed (it's still used in the table's SLA % badge coloring).

---

## File Changes Summary

| File | Changes |
|---|---|
| `mockData.ts` | Update `DIVISIONS` (18 divisions), update `divFactor()`, add `getDivisionMonthHeatmapData()`, add `getServiceRequestStatusMatrix()`, update `getInsights()` with 5 operational alerts |
| `ConsumerServicesPage.tsx` | Remove 5 chart components, redesign `SlaSection`, `ServiceRequestsSection`, `ConsumerAnalyticsSection`, `DivisionHeatmap`, `InsightsSection`; update layout grids; add metric selector state to heatmap |

No new files. No routing changes.
