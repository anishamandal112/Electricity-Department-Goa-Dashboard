import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'Revenue Collection (₹ Cr)', value: '142.3', trend: '8.4 Cr', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Outstanding Dues (₹ Cr)', value: '38.7', trend: '3.2 Cr', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Billing Efficiency', value: '94.2%', trend: '0.8%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Recovery Rate', value: '96.8%', trend: '0.4%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'division', label: 'Division' },
  { key: 'billed', label: 'Billed (₹ Cr)' },
  { key: 'collected', label: 'Collected (₹ Cr)' },
  { key: 'outstanding', label: 'Outstanding (₹ Cr)' },
  { key: 'recovery', label: 'Recovery %' },
]

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
      {label}
    </div>
  )
}

export function RevenueBillingPage() {
  return (
    <div>
      <PageHeader
        title="Revenue & Billing"
        subtitle="Revenue collection, billing efficiency, and outstanding dues"
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
            <ChartCard title="Monthly Revenue Collection" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Bar Chart — Revenue Collection" />
            </ChartCard>
            <ChartCard title="Outstanding Dues Trend" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Line Chart — Outstanding Dues" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Division-wise Revenue Data">
          <DataTableCard title="Revenue Summary by Division" columns={COLUMNS} data={[]} />
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
