# Consumer Services & Grievances — Page Design Spec

**Date:** 2026-06-17
**Module:** Consumer Services & Grievances
**Status:** Approved

---

## Overview

Replace the current placeholder `ConsumerServicesPage.tsx` with a fully-built analytics page covering service delivery performance, complaint management, SLA monitoring, and division-level analysis for the Goa Electricity Department.

---

## Architecture

**Approach:** Modular with separate data file.

- `src/modules/consumer-services/mockData.ts` — all mock data and filter-reactive data selectors
- `src/modules/consumer-services/ConsumerServicesPage.tsx` — page layout with inline section components

No new dependencies. Uses existing component library (`KpiCard`, `ChartCard`, `DataTableCard`, `SectionContainer`, `PageHeader`, `GlobalFilterBar`) and Recharts for all visualisations.

---

## Mock Data

Seed values deterministically from `(financialYear, month, division)` so data changes meaningfully when filters change. Cover:

- **Financial years:** 2023-24, 2024-25, 2025-26
- **Months:** Apr–Mar (12 months)
- **Divisions:** North Goa, South Goa, East Goa, West Goa, Central Goa
- **Circles:** Panaji, Margao, Vasco, Mapusa, Ponda

All data must use realistic GED values (e.g. consumer counts in the 2–4 lakh range, complaint resolution times 2–8 days, SLA compliance 75–98%).

---

## Sections

### Section 1 — KPI Overview

Grid: `grid-cols-4`, 2 rows of 4 cards.

| KPI | Example Value | Trend Direction | Positive When |
|-----|--------------|-----------------|---------------|
| Total Consumers | 2,86,420 | up | always |
| New Connections | 1,243 | up | up |
| Complaints Received | 4,812 | down | down |
| Complaints Resolved | 4,465 | up | up |
| Open Complaints | 347 | down | down |
| SLA Compliance % | 92.8% | up | up |
| Avg Resolution Time | 4.2 days | down | down |
| Service Requests Processed | 2,134 | up | up |

---

### Section 2 — Complaints Dashboard

Grid: 2-column layout, then 3-column layout.

**Row 1 (full-width):**
- Complaints Received vs Resolved Trend — Recharts `ComposedChart`: monthly bars (received) with a line overlay (resolved). 12 months of data.

**Row 2 (3-col):**
- Complaint Category Distribution — `PieChart` (donut, innerRadius 60). Categories: Billing Issues, Power Outages, Voltage Fluctuation, Meter Issues, New Connections, Service Requests, Others.
- Complaint Status Breakdown — horizontal `BarChart`. Statuses: Resolved, Pending, Escalated, Withdrawn.
- Complaint Backlog Trend — `AreaChart`. Monthly open complaint count, 12 months.

---

### Section 3 — SLA Performance

Grid: 2-col left block + 2-col right block.

**Left (2-col span):**
- SLA Compliance Gauge — Recharts `RadialBarChart` rendered as a half-arc (startAngle 180, endAngle 0). Single bar showing current SLA %. Display numeric value in centre.
- SLA Compliance Trend — `LineChart`, 12 months, reference line at 90% target.

**Right (2-col span):**
- Resolution Time Trend — `LineChart`, monthly avg days, 12 months, reference line at 5-day target.
- Division-wise SLA Ranking — horizontal `BarChart`, 5 bars (one per division), colour-coded: ≥90% green, 75–89% amber, <75% red.

---

### Section 4 — Service Requests

Grid: `grid-cols-3`.

- Request Volume by Type — vertical `BarChart`. Types: Load Enhancement, Load Reduction, Name Change, Meter Shifting, Reconnection, Temporary Connection.
- Processing Funnel — custom horizontal bars showing 3 stages: Submitted → In Process → Completed. Each stage as a percentage-width bar with count label.
- Avg Processing Time by Type — horizontal `BarChart`, one bar per request type (days).

---

### Section 5 — Consumer Analytics

Grid: `grid-cols-3`.

- Consumer Growth Trend — `AreaChart`, monthly total consumer count, 12 months.
- New Connections vs Disconnections — grouped `BarChart`, 12 months, two series.
- Consumer Category Distribution — `PieChart` (donut). Categories: Domestic, Commercial, Industrial, Government.

---

### Section 6 — Division Performance Heatmap

Full width. Custom CSS grid: 5 rows (divisions) × 4 columns (metrics).

Metrics: Complaint Volume, SLA Compliance, Resolution Time, Pending Cases.

Each cell: metric value + background colour by threshold:
- Complaint Volume: low=green, mid=amber, high=red
- SLA Compliance: high=green, mid=amber, low=red
- Resolution Time: low=green, mid=amber, high=red
- Pending Cases: low=green, mid=amber, high=red

Column headers pinned at top. Row headers = division names.

---

### Section 7 — Division Operations Table

Full width. Enhanced `DataTableCard` with:

**Columns:**
| Column | Notes |
|--------|-------|
| Division | Text |
| Consumers | Number, formatted |
| Complaints | Number |
| Resolved | Number |
| Pending | Number, amber/red badge if >50 |
| SLA % | Badge: green ≥90%, amber 75–89%, red <75% |
| Avg Resolution Time | Days, colour-coded |
| New Connections | Number |
| Service Requests | Number |

**Enhancements to DataTableCard:**
- Sortable column headers (click to sort asc/desc, chevron icon)
- Search/filter input above the table
- Pagination (10 rows per page)
- Colour badges for SLA % and Pending columns

These enhancements are implemented inline within `ConsumerServicesPage.tsx` as a local `EnhancedTable` component — no changes to the shared `DataTableCard`.

---

### Section 8 — Insights & Exceptions

Full width. Five exception cards in a horizontal `grid-cols-5`.

Each card: icon (Lucide), label, primary metric, delta/context. Red/amber border accent.

| Exception | Icon | Example |
|-----------|------|---------|
| Highest complaint growth | TrendingUp | South Goa +34% MoM |
| Lowest SLA division | AlertTriangle | East Goa 71.2% |
| Largest pending backlog | Clock | North Goa 124 open |
| Fastest growing complaint category | Zap | Billing Issues +28% |
| Highest resolution time | Timer | West Goa 7.8 days avg |

---

## Filter Reactivity

All data selectors in `mockData.ts` accept `{ financialYear, month, division, circle, subdivision }` and return filtered/computed data. The page subscribes to `useFilterStore` via `useFilterStore(state => ...)` selectors and passes filter values into data functions inside `useMemo`.

---

## Design Tokens

Follow `Design.md`:
- Background: `#F8FAFC` (`bg-background`)
- Surface: `#FFFFFF` (`bg-surface`)
- Border: `#E5E7EB` (`border-border-base`)
- Primary: `#2563EB`
- Success: `#16A34A`
- Warning: `#F59E0B`
- Error: `#DC2626`
- Font: DM Sans, all existing size classes

Gauge, heatmap, and funnel use these same tokens — no custom colour schemes.

---

## Out of Scope

- MUI DataGrid (not installed, not needed)
- New shared components (all enhancements are local to this page)
- Backend / API integration
- Changes to other module pages
