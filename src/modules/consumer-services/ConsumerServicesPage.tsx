import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'Total Consumers', value: '2,86,420', trend: '1,243', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'new this month' },
  { label: 'New Connections', value: '1,243', trend: '87', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Pending Grievances', value: '347', trend: '62', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Avg Resolution (Days)', value: '4.2', trend: '0.8 days', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'division', label: 'Division' },
  { key: 'consumers', label: 'Total Consumers' },
  { key: 'newConn', label: 'New Connections' },
  { key: 'grievances', label: 'Grievances' },
  { key: 'resolved', label: 'Resolved %' },
]

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
      {label}
    </div>
  )
}

export function ConsumerServicesPage() {
  return (
    <div>
      <PageHeader
        title="Consumer Services & Grievances"
        subtitle="Consumer base, new connections, and grievance resolution"
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
            <ChartCard title="New Connections by Month" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Bar Chart — New Connections" />
            </ChartCard>
            <ChartCard title="Grievance Status Breakdown" timeContext="Current Month">
              <ChartPlaceholder label="Donut Chart — Grievance Status" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Division-wise Consumer Data">
          <DataTableCard title="Consumer Summary by Division" columns={COLUMNS} data={[]} />
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
