import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'AT&C Loss', value: '12.4%', trend: '1.2%', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Energy Input (MU)', value: '142.3', trend: '3.1 MU', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Collection Efficiency', value: '96.8%', trend: '0.4%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Billing Efficiency', value: '94.2%', trend: '0.8%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'circle', label: 'Circle' },
  { key: 'atcLoss', label: 'AT&C Loss' },
  { key: 'collectionEff', label: 'Collection Eff.' },
  { key: 'billingEff', label: 'Billing Eff.' },
  { key: 'status', label: 'Status' },
]

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
      {label}
    </div>
  )
}

export function OverviewPage() {
  return (
    <div>
      <PageHeader title="Overview" subtitle="Department-wide performance summary" />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="Key Metrics">
          <div className="grid grid-cols-4 gap-4">
            {KPIS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>
        <SectionContainer title="Analytics">
          <div className="grid grid-cols-2 gap-4">
            <ChartCard title="AT&C Loss Trend" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Line Chart — AT&C Loss" />
            </ChartCard>
            <ChartCard title="Energy Input vs Energy Sold" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Bar Chart — Energy Input / Sold" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Division-wise Performance">
          <DataTableCard title="Circle Summary" columns={COLUMNS} data={[]} />
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
