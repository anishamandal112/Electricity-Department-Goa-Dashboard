import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import { DataTableCard } from '../../components/ui/DataTableCard'

const KPIS = [
  { label: 'Smart Meter Coverage', value: '34.8%', trend: '2.1%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Total Meters', value: '2,86,420', trend: '1,243', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Faulty Meters', value: '1,842', trend: '214', trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
  { label: 'Reading Efficiency', value: '98.2%', trend: '0.3%', trendDirection: 'up' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month' },
]

const COLUMNS = [
  { key: 'division', label: 'Division' },
  { key: 'totalMeters', label: 'Total Meters' },
  { key: 'smartMeters', label: 'Smart Meters' },
  { key: 'coverage', label: 'Coverage %' },
  { key: 'faulty', label: 'Faulty' },
]

function ChartPlaceholder({ label }: { label: string }) {
  return (
    <div className="h-52 flex items-center justify-center bg-background rounded-lg text-text-secondary text-[13px]">
      {label}
    </div>
  )
}

export function MeterManagementPage() {
  return (
    <div>
      <PageHeader
        title="Meter Management"
        subtitle="Smart meter deployment, reading efficiency, and faulty meter tracking"
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
            <ChartCard title="Smart Meter Rollout Progress" timeContext="Apr 2024 – Mar 2025">
              <ChartPlaceholder label="Area Chart — Smart Meter Coverage" />
            </ChartCard>
            <ChartCard title="Faulty Meters by Division" timeContext="Current Month">
              <ChartPlaceholder label="Bar Chart — Faulty Meters" />
            </ChartCard>
          </div>
        </SectionContainer>
        <SectionContainer title="Division-wise Meter Data">
          <DataTableCard title="Meter Summary by Division" columns={COLUMNS} data={[]} />
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
