import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'Budget Utilization', value: '68.4%', trend: '4.2%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'YTD' },
  { label: 'PO Value (₹ Cr)', value: '28.3', trend: '3.1 Cr', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'this month' },
  { label: 'Pending Payments (₹ Cr)', value: '12.7', trend: '2.4 Cr', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Inventory Value (₹ Cr)', value: '45.2', trend: '1.8 Cr', trendDirection: 'neutral' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'category', label: 'Category' },
  { key: 'budget', label: 'Budget (₹ Cr)' },
  { key: 'spent', label: 'Spent (₹ Cr)' },
  { key: 'utilization', label: 'Utilization %' },
  { key: 'pendingPO', label: 'Pending POs' },
]

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
      {label}
    </div>
  )
}

export function ProcurementFinancePage() {
  return (
    <div>
      <PageHeader
        title="Procurement & Finance"
        subtitle="Budget utilization, purchase orders, and payment status"
      />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="Key Metrics">
          <div className="grid grid-cols-4 gap-4">
            {KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>
        <SectionContainer title="Analytics">
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="Budget vs Expenditure" timeContext="FY 2024-25">
              <ChartPlaceholder label="Stacked Bar — Budget vs Expenditure" />
            </ChartCard>
            <ChartCard title="PO Value by Category" timeContext="Current Month">
              <ChartPlaceholder label="Donut Chart — PO Categories" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Budget Summary">
          <DataTableCard title="Budget Utilization by Category" columns={COLUMNS} data={[]} />
        </SectionContainer>
        <SectionContainer title="Insights & Exceptions">
          <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4 text-[13px] text-text-secondary">
            No exceptions flagged for the selected period.
          </div>
        </SectionContainer>
      </div>
    </div>
  )
}
