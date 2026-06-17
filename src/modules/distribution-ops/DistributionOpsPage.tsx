import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'SAIFI (Interruptions/Consumer)', value: '3.2', trend: '0.4', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'SAIDI (Hours/Consumer)', value: '8.4', trend: '1.1 hrs', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Peak Demand (MW)', value: '312.4', trend: '8.2 MW', trendDirection: 'up' as const, trendIsPositive: false, comparisonLabel: 'vs Last Month' },
  { label: 'Feeder Availability', value: '97.8%', trend: '0.3%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'feeder', label: 'Feeder' },
  { key: 'saifi', label: 'SAIFI' },
  { key: 'saidi', label: 'SAIDI (hrs)' },
  { key: 'availability', label: 'Availability %' },
  { key: 'incidents', label: 'Incidents' },
]

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
      {label}
    </div>
  )
}

export function DistributionOpsPage() {
  return (
    <div>
      <PageHeader
        title="Distribution Operations"
        subtitle="Reliability indices, feeder performance, and outage analysis"
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
            <ChartCard title="SAIFI / SAIDI Trend" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Line Chart — SAIFI & SAIDI" />
            </ChartCard>
            <ChartCard title="Peak Demand by Month" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Area Chart — Peak Demand" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Feeder Performance">
          <DataTableCard title="Feeder-wise Reliability" columns={COLUMNS} data={[]} />
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
