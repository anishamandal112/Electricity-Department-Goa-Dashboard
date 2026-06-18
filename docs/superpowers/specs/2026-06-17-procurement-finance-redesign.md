---
name: procurement-finance-redesign
description: Full Procurement & Finance page spec — power procurement costs, source mix, financial efficiency, renewable energy monitoring, division heatmap
metadata:
  type: project
---

# Procurement & Finance Page — Design Spec

## Overview

Analytics workspace for power procurement costs, source mix, collection efficiency, and renewable energy monitoring. Audience: Secretary (Power), Chief Engineer, SEs, EEs.

---

## KPI Overview (6 cards, grid-cols-6)

| Metric | Unit | Notes |
|---|---|---|
| Total Energy Procured | MU | Monthly total |
| Procurement Cost | ₹ Cr | Monthly |
| Average Cost of Supply (ACS) | ₹/kWh | Total cost / units sold |
| Average Power Purchase Cost (APPC) | ₹/kWh | Blended purchase rate |
| Renewable Energy Share | % | Solar + Wind + Hydro share |
| Peak Procurement Cost | ₹/kWh | Peak-hour rate |

---

## Cost Monitoring Section (2 charts, grid-cols-2)

- **Procurement Cost Trend** — Area chart, Apr–Mar, ₹ Cr/month
- **Average Power Purchase Cost Trend** — Line chart, Apr–Mar, ₹/kWh

---

## Renewable Energy Section (1 full-width chart)

- **Renewable Energy Share Trend** — Area chart with reference line at 25% target

---

## Division Financial Performance Heatmap

- **Rows:** All 18 Goa ED Divisions
- **Columns:** Apr–Mar (12 months)
- **Metric Selector:** Collection Efficiency % | Outstanding Dues (₹ Cr)
- **Color coding:**
  - Collection Efficiency: ≥92% green, ≥85% amber, <85% red
  - Outstanding Dues: <2 Cr green, <4 Cr amber, ≥4 Cr red

---

## Attention Required (5 alert cards)

1. Highest Procurement Cost Increase — division with biggest MoM cost spike
2. Lowest Collection Efficiency — worst-performing division this month
3. Highest Outstanding Dues — division with most unpaid dues
4. Deteriorating Financial Performance — consistent trend down across 3+ months
5. Renewable Target Below Threshold — state renewable % below 25% target

---

## Data Model (mockData.ts)

```typescript
Filters, ProcurementKpis, CostTrendPoint, AppCTrendPoint,
RenewableTrendPoint, DivisionHeatCell, DivisionTableRow, ProcurementInsight
```

All generators are deterministic based on filter seed — no random() calls.
Same 18 divisions as DistributionOps.

---

## Implementation Notes

- Follow exact same component structure as DistributionOpsPage / RevenueBillingPage
- Use recharts for all charts
- Heatmap component reused pattern from DistributionOps (DivisionHeatmap)
- Attention cards follow same 5-column grid as AttentionPanel in DistributionOps
