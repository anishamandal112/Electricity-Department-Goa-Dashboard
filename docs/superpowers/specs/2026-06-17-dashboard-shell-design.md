# GED Executive Analytics Dashboard — Application Shell Design

**Date:** 2026-06-17
**Scope:** Foundation, layout, routing, reusable components, and navigation only. No module-level data or charts.

---

## 1. Tech Stack

| Concern | Choice | Rationale |
|---|---|---|
| Framework | React 18 + Vite | Fast dev server, modern tooling |
| Styling | Tailwind CSS v3 | Utility-first; maps cleanly to Design.md tokens |
| Routing | React Router v6 | Standard SPA routing with nested outlet |
| State | Zustand | Minimal global store for filter state |
| Charts | Recharts | React-native composable API, clean aesthetic |
| Font | DM Sans (Google Fonts) | Specified in Design.md |
| Icons | Lucide React | Clean, consistent icon set |

---

## 2. Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx        # Root layout wrapper
│   │   ├── Sidebar.tsx         # Collapsible left navigation
│   │   └── TopBar.tsx          # Slim department header bar
│   ├── ui/
│   │   ├── KpiCard.tsx
│   │   ├── ChartCard.tsx
│   │   ├── DataTableCard.tsx
│   │   ├── SectionContainer.tsx
│   │   └── PageHeader.tsx
│   └── filters/
│       └── GlobalFilterBar.tsx
├── modules/
│   ├── overview/
│   │   └── OverviewPage.tsx
│   ├── consumer-services/
│   │   └── ConsumerServicesPage.tsx
│   ├── meter-management/
│   │   └── MeterManagementPage.tsx
│   ├── distribution-ops/
│   │   └── DistributionOpsPage.tsx
│   ├── revenue-billing/
│   │   └── RevenueBillingPage.tsx
│   ├── procurement-finance/
│   │   └── ProcurementFinancePage.tsx
│   └── infrastructure-assets/
│       └── InfrastructureAssetsPage.tsx
├── store/
│   └── filterStore.ts
├── types/
│   └── index.ts
├── App.tsx
└── main.tsx
```

---

## 3. Routing

All routes are children of `AppShell`, which renders a persistent sidebar and `<Outlet />`.

| Path | Component |
|---|---|
| `/` | Redirect → `/overview` |
| `/overview` | OverviewPage |
| `/consumer-services` | ConsumerServicesPage |
| `/meter-management` | MeterManagementPage |
| `/distribution-ops` | DistributionOpsPage |
| `/revenue-billing` | RevenueBillingPage |
| `/procurement-finance` | ProcurementFinancePage |
| `/infrastructure-assets` | InfrastructureAssetsPage |

No nested routing at this phase.

---

## 4. Layout Architecture

### AppShell
- Fixed sidebar on the left (240px expanded, 64px collapsed icon-only).
- Main content area shifts with `ml-[240px]` / `ml-[64px]` via CSS transition.
- Main area is scrollable; sidebar is fixed.

### Sidebar
- `bg-surface border-r border-border-base` — white rail, not dark.
- Nav items: icon + label. Icon-only when collapsed.
- Active item: `bg-blue-50 text-primary font-medium border-r-2 border-primary`.
- Collapse toggle button at bottom of sidebar.
- Collapse state held in local React state (purely UI, not in Zustand).

### TopBar
- Slim 32px bar at top of main content area.
- Displays: "Goa Electricity Department — Executive Analytics Dashboard".
- Not a primary navigation element.

---

## 5. Page Template

Every module page follows this structure top to bottom:

```
<PageHeader title="..." subtitle="..." />
<GlobalFilterBar />
<SectionContainer title="Key Metrics">
  <div className="grid grid-cols-4 gap-4">
    <KpiCard /> × 4–6
  </div>
</SectionContainer>
<SectionContainer title="Analytics">
  <ChartCard /> × 2–3
</SectionContainer>
<SectionContainer title="Detailed Data">
  <DataTableCard />
</SectionContainer>
<SectionContainer title="Insights & Exceptions">
  {/* exception list placeholder */}
</SectionContainer>
```

---

## 6. Reusable Components

### PageHeader
Props: `title: string`, `subtitle?: string`
Renders the page title (28px/700) and optional subtitle below the top bar.

### GlobalFilterBar
- Sticky below PageHeader.
- 5 select inputs: Financial Year, Month, Circle, Division, Subdivision.
- Reads/writes Zustand `filterStore` directly.
- Consistent appearance across all module pages.

### SectionContainer
Props: `title: string`, `children: ReactNode`, `action?: ReactNode`
- Section heading (20px/600) with optional right-aligned action slot (e.g. Export button).
- Provides consistent vertical spacing between sections.

### KpiCard
Props: `label: string`, `value: string`, `trend: string`, `trendDirection: 'up' | 'down' | 'neutral'`, `comparisonLabel: string`
- Height: 100–120px.
- `bg-surface border border-border-base rounded-xl shadow-sm`.
- Trend indicator: green arrow down for improvement (e.g. loss reduction), red arrow up for negative trends. Direction semantics are metric-specific — passed via `trendDirection`.
- At shell phase: renders with placeholder/mock prop values.

### ChartCard
Props: `title: string`, `timeContext?: string`, `children: ReactNode`
- Card frame only. Chart rendered in `children` slot.
- Header: card title (14px/600) + time context caption.
- At shell phase: renders a grey placeholder box in the chart slot.

### DataTableCard
Props: `title: string`, `columns: { key: string; label: string }[]`, `data: Record<string, unknown>[]`
- Card frame with table inside.
- Uses plain HTML `<table>` at shell phase — no third-party table library yet.
- At shell phase: renders empty table with column headers and "No data" state.
- Full sorting, search, pagination, export to be added per module.

---

## 7. Global Filter State (Zustand)

```ts
// src/store/filterStore.ts
interface FilterState {
  financialYear: string    // default: "2024-25"
  month: string            // default: "All"
  circle: string           // default: "All"
  division: string         // default: "All"
  subdivision: string      // default: "All"
  setFilter: (key: keyof Omit<FilterState, 'setFilter' | 'resetFilters'>, value: string) => void
  resetFilters: () => void
}
```

All module pages subscribe to this store. Filter changes will drive mock data in future phases.

---

## 8. Visual System

### Tailwind Theme Extensions (`tailwind.config.js`)

```js
colors: {
  background: '#F8FAFC',
  surface: '#FFFFFF',
  'border-base': '#E5E7EB',
  primary: '#2563EB',
  success: '#16A34A',
  warning: '#F59E0B',
  error: '#DC2626',
  'text-primary': '#111827',
  'text-secondary': '#6B7280',
}
```

### Rules
- Page background: `bg-background` everywhere.
- Cards: `bg-surface border border-border-base rounded-xl shadow-sm`.
- No colored card backgrounds unless representing status.
- No tinted page sections.
- DM Sans loaded via `<link>` in `index.html`.

---

## 9. Module Sidebar Navigation

| Icon | Label | Route |
|---|---|---|
| LayoutDashboard | Overview | /overview |
| Users | Consumer Services & Grievances | /consumer-services |
| Gauge | Meter Management | /meter-management |
| Zap | Distribution Operations | /distribution-ops |
| Receipt | Revenue & Billing | /revenue-billing |
| ShoppingCart | Procurement & Finance | /procurement-finance |
| Building2 | Infrastructure & Assets | /infrastructure-assets |

All icons sourced from Lucide React.

---

## 10. What This Phase Does NOT Include

- Real data or API connections
- Chart data (Recharts charts will be placeholder boxes at shell phase)
- Full table sorting/search/pagination/export
- Authentication or user management
- Module-specific business logic
- Responsive/mobile layout (desktop-first per CLAUDE.md)
