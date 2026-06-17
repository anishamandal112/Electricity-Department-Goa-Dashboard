---
name: energy-flow-section
description: Spec for the Energy Flow pipeline diagram on the Distribution Operations page
metadata:
  type: project
---

# Energy Flow — Power Procurement to Sales

**Location:** Distribution Operations page, immediately after the KPI Overview section and before Energy & Loss Analytics.

---

## Purpose

Show at a glance how energy moves through the network from procurement to end-consumer sale, and where losses occur at each voltage stage. This gives senior decision-makers a single-screen summary of T&D loss breakdown without needing to dig into charts.

---

## Data Model

Add `getEnergyFlow(filters: Filters): EnergyFlowData` to `mockData.ts`.

```ts
export interface EnergyFlowData {
  procurement: number    // MU total procured
  ehvLoss: number        // MU lost at EHV (>33 kV)
  hvLoss: number         // MU lost at HV (33 kV)
  distLoss: number       // MU lost at distribution (11 kV & LT)
  afterEhv: number       // MU = procurement - ehvLoss
  afterHv: number        // MU = afterEhv - hvLoss
  sold: number           // MU = afterHv - distLoss
  ehvLossPct: number     // % of procurement
  hvLossPct: number      // % of procurement
  distLossPct: number    // % of procurement
  totalLoss: number      // MU = ehvLoss + hvLoss + distLoss
  totalLossPct: number   // % of procurement
  afterEhvPct: number    // % of procurement remaining after EHV (e.g. 98.8)
  afterHvPct: number     // % of procurement remaining after HV (e.g. 96.0)
  soldPct: number        // % of procurement sold (e.g. 92.8)
}
```

Generator uses the existing `seed()` helper. Loss percentages are seeded to sum to a value consistent with the existing `atcLoss` KPI. Typical ranges:
- EHV loss: 1.0–1.5% of procurement
- HV loss: 2.5–3.2% of procurement
- Distribution loss: 3.0–3.8% of procurement
- Total: ~7–8%

`procurement` is seeded to match the `energyInput` value from `getDistributionKpis` for the same filters.

---

## Component: `EnergyFlowSection`

Self-contained function component in `DistributionOpsPage.tsx`. Receives `filters: Filters`. Calls `getEnergyFlow(filters)` via `useMemo`.

### Visual structure

```
┌────────────────────────────────────────────────────────────────────┐
│  [Node: Procurement] →[Loss chip]→ [Node: After EHV] →[Loss chip]→ │
│  [Node: After HV] →[Loss chip]→ [Node: Energy Sold]               │
│                                                                    │
│  Legend: ■ >33kV Loss  ■ 33kV Loss  ■ 11kV&LT       Total: X MU  │
└────────────────────────────────────────────────────────────────────┘
```

#### Node cards (5 total)

Each card is a flex column with:
- Icon row: Zap icon for Procurement and Sold; Activity icon for the two intermediate nodes
- Label: uppercase small caps (e.g. "POWER PROCUREMENT", "AFTER EHV (> 33 KV)")
- Primary value: large bold number + "MU"
- Secondary: "100%" for Procurement; "X% remains" for intermediate nodes; "X% of input" for Sold

Visual differentiation:
- Procurement card: blue left-border accent or blue top-border, light blue background tint
- Intermediate cards (After EHV, After HV): neutral surface with blue border
- Sold card: green background tint, green border, green icon

#### Loss connectors (3 total, between node pairs)

Each connector is a narrow column containing:
- Stage label (e.g. "> 33 KV LOSS", "33 KV LOSS", "11 KV & LT")
- Loss MU value in red, prefixed with `−` (e.g. `−59.3`)
- "X% of input" in small gray text
- A right-pointing arrow icon (ChevronRight) between the connector and next card

#### Bottom summary bar

Full-width row below the pipeline:
- Left cluster: three legend entries, each with a colored square + text
  - Blue square: `> 33 kV Loss  59.3 MU (1.20%)`
  - Cyan square: `33 kV Loss  136.8 MU (2.76%)`
  - Red dot: `11 kV & LT  160.9 MU (3.24%)`
- Right: `Total T&D Loss:` label + bold red value `357 MU (7.2%)`

---

## Placement in Page

In `DistributionOpsPage`, add a new `SectionContainer` immediately after the KPI Overview section:

```tsx
<SectionContainer title="Energy Flow — Power Procurement to Sales">
  <EnergyFlowSection filters={filters} />
</SectionContainer>
```

The section title also carries a subtitle: `T&D Loss: X% · Total unaccounted: Y MU` rendered as a small gray line below the title (use existing `SectionContainer` subtitle prop if available, otherwise render inline).

---

## Styling conventions

- Match existing color tokens: `text-text-primary`, `text-text-secondary`, `bg-surface`, `border-border-base`
- Loss values: `text-error` (`#DC2626`)
- Sold card green: `bg-green-50`, `border-green-400`, icon in `text-success`
- Procurement card: `bg-blue-50`, `border-blue-400`
- Intermediate cards: `bg-surface border-border-base`
- All type sizes follow existing page conventions: labels at `text-[11px]`, values at `text-[22px]` or `text-[24px]` bold, secondary at `text-[12px]`

---

## Files changed

| File | Change |
|---|---|
| `src/modules/distribution-ops/mockData.ts` | Add `EnergyFlowData` interface + `getEnergyFlow()` generator |
| `src/modules/distribution-ops/DistributionOpsPage.tsx` | Add `EnergyFlowSection` component + one new `SectionContainer` in the page |

No new files. No new dependencies.
