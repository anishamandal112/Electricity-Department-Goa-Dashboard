import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'DT Failures (MTD)', value: '23', trend: '6', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Total Distribution Transformers', value: '4,821', trend: '12', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'added this month' },
  { label: 'Substation Capacity (MVA)', value: '580', trend: '20 MVA', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Asset Uptime', value: '97.2%', trend: '0.4%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'division', label: 'Division' },
  { key: 'totalDTs', label: 'Total DTs' },
  { key: 'dtFailures', label: 'DT Failures' },
  { key: 'failureRate', label: 'Failure Rate %' },
  { key: 'uptime', label: 'Uptime %' },
]

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
      {label}
    </div>
  )
}

export function InfrastructureAssetsPage() {
  return (
    <div>
      <PageHeader
        title="Infrastructure & Assets"
        subtitle="Distribution transformers, substations, and asset uptime"
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
            <ChartCard title="DT Failure Trend" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Line Chart — DT Failures" />
            </ChartCard>
            <ChartCard title="Asset Uptime by Division" timeContext="Current Month">
              <ChartPlaceholder label="Bar Chart — Asset Uptime" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Division-wise Asset Data">
          <DataTableCard title="DT Summary by Division" columns={COLUMNS} data={[]} />
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
