import React, { useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import { TrendingUp, TrendingDown, AlertTriangle, Zap } from 'lucide-react'
import { useFilterStore } from '../../store/filterStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import {
  getProcurementKpis, getCostTrend, getAppcTrend, getRenewableTrend,
  getDivisionHeatmapData, getInsights,
  MONTHS,
  type HeatmapMetric, type Filters, type ProcurementInsight,
} from './mockData'

const C = {
  primary: '#2563EB', success: '#16A34A', warning: '#F59E0B',
  error: '#DC2626', gray: '#9CA3AF', orange: '#EA580C',
  teal: '#0891B2', purple: '#7C3AED', green: '#16A34A', grid: '#E5E7EB',
}
const ax = { fontSize: 11, fill: '#6B7280' }

// ── Heatmap helpers ───────────────────────────────────────────────────────────

function heatCell(value: number, metric: HeatmapMetric): string {
  if (metric === 'collectionEfficiency') return value >= 92 ? '#DCFCE7' : value >= 85 ? '#FEF9C3' : '#FEE2E2'
  return value < 2.0 ? '#DCFCE7' : value < 4.0 ? '#FEF9C3' : '#FEE2E2'
}

function formatHeatCell(value: number, metric: HeatmapMetric): string {
  if (metric === 'collectionEfficiency') return `${value}%`
  return `₹${value}`
}

// ── Cost Monitoring ───────────────────────────────────────────────────────────

function CostMonitoringSection({ filters }: { filters: Filters }) {
  const costTrend = useMemo(() => getCostTrend(filters), [filters])
  const appcTrend = useMemo(() => getAppcTrend(filters), [filters])

  return (
    <div className="grid grid-cols-2 gap-4">
      <ChartCard title="Procurement Cost Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={costTrend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={52}
              tickFormatter={(v) => `₹${v}`} />
            <Tooltip contentStyle={{ fontSize: 12 }}
              formatter={(v: number) => [`₹${v} Cr`, 'Procurement Cost']} />
            <Area type="monotone" dataKey="cost" name="Procurement Cost (₹ Cr)"
              stroke={C.primary} fill={C.primary} fillOpacity={0.15} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Average Power Purchase Cost Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={appcTrend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={48}
              tickFormatter={(v) => `₹${v}`} domain={[4.5, 6.5]} />
            <Tooltip contentStyle={{ fontSize: 12 }}
              formatter={(v: number) => [`₹${v}/kWh`, 'APPC']} />
            <Line type="monotone" dataKey="appc" name="APPC (₹/kWh)"
              stroke={C.orange} strokeWidth={2} dot={{ r: 3, fill: C.orange }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Renewable Energy ──────────────────────────────────────────────────────────

function RenewableEnergySection({ filters }: { filters: Filters }) {
  const renewTrend = useMemo(() => getRenewableTrend(filters), [filters])

  return (
    <ChartCard title="Renewable Energy Share Trend" timeContext="Apr – Mar (Financial Year)">
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={renewTrend} margin={{ top: 4, right: 48, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
          <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
          <YAxis tick={ax} axisLine={false} tickLine={false} width={40}
            tickFormatter={(v) => `${v}%`} domain={[10, 40]} />
          <Tooltip contentStyle={{ fontSize: 12 }}
            formatter={(v: number) => [`${v}%`, 'Renewable Share']} />
          <ReferenceLine y={25} stroke={C.green} strokeDasharray="4 2"
            label={{ value: 'Target 25%', fill: C.green, fontSize: 10, position: 'right' }} />
          <Area type="monotone" dataKey="renewable" name="Renewable Share %"
            stroke={C.teal} fill={C.teal} fillOpacity={0.18} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  )
}

// ── Division Financial Performance Heatmap ────────────────────────────────────

const HEAT_METRICS: { value: HeatmapMetric; label: string }[] = [
  { value: 'collectionEfficiency', label: 'Collection Efficiency %' },
  { value: 'outstandingDues',      label: 'Outstanding Dues (₹ Cr)' },
]

function DivisionHeatmap({ filters }: { filters: Filters }) {
  const [metric, setMetric] = useState<HeatmapMetric>('collectionEfficiency')
  const data = useMemo(() => getDivisionHeatmapData(filters, metric), [filters, metric])

  const cellMap = useMemo(() => {
    const m: Record<string, Record<string, number>> = {}
    for (const cell of data) {
      if (!m[cell.division]) m[cell.division] = {}
      m[cell.division][cell.month] = cell.value
    }
    return m
  }, [data])

  const divisions = [...new Set(data.map((c) => c.division))]

  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border-base flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-[14px] font-semibold text-text-primary">
            Division Financial Performance by Month
          </h3>
          <p className="text-[12px] text-text-secondary mt-0.5">
            All 18 divisions × 12 months — Green good, Amber watch, Red poor
          </p>
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {HEAT_METRICS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMetric(opt.value)}
              className={`px-3 py-1 text-[11px] font-semibold rounded-full border transition-colors ${
                metric === opt.value
                  ? 'bg-primary text-white border-primary'
                  : 'bg-transparent text-text-secondary border-border-base hover:text-text-primary'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto p-4">
        <div className="grid" style={{ gridTemplateColumns: '160px repeat(12, 1fr)', minWidth: 900 }}>
          <div />
          {MONTHS.map((m) => (
            <div key={m}
              className="text-center text-[10px] font-semibold uppercase tracking-wide text-text-secondary pb-2 px-0.5">
              {m}
            </div>
          ))}
          {divisions.map((div) => (
            <React.Fragment key={div}>
              <div
                className="text-[12px] font-medium text-text-primary py-1.5 pr-3 flex items-center border-t border-border-base"
                style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
              >
                {div}
              </div>
              {MONTHS.map((month) => {
                const value = cellMap[div]?.[month] ?? 0
                return (
                  <div
                    key={month}
                    className="py-1.5 text-center text-[10px] font-semibold border-t border-border-base mx-0.5 rounded"
                    style={{ backgroundColor: heatCell(value, metric), color: '#111827' }}
                  >
                    {formatHeatCell(value, metric)}
                  </div>
                )
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Attention Required ────────────────────────────────────────────────────────

const INSIGHT_ICONS: Record<ProcurementInsight['icon'], React.ElementType> = {
  'trending-up':    TrendingUp,
  'trending-down':  TrendingDown,
  'alert-triangle': AlertTriangle,
  'zap':            Zap,
}

function AttentionPanel({ filters }: { filters: Filters }) {
  const alerts = useMemo(() => getInsights(filters), [filters])
  return (
    <div className="grid grid-cols-5 gap-4">
      {alerts.map((alert) => {
        const Icon    = INSIGHT_ICONS[alert.icon]
        const isError = alert.severity === 'error'
        return (
          <div
            key={alert.id}
            className={`bg-surface border rounded-xl p-4 ${isError ? 'border-error/40' : 'border-warning/40'}`}
          >
            <div className={`flex items-center gap-2 mb-2 ${isError ? 'text-error' : 'text-warning'}`}>
              <Icon size={14} />
              <span className="text-[10px] font-semibold uppercase tracking-wide leading-tight">
                {alert.label}
              </span>
            </div>
            <p className="text-[15px] font-bold text-text-primary leading-tight">{alert.value}</p>
            <p className="text-[12px] text-text-secondary mt-1">{alert.context}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function ProcurementFinancePage() {
  const financialYear = useFilterStore((s) => s.financialYear)
  const month         = useFilterStore((s) => s.month)
  const circle        = useFilterStore((s) => s.circle)
  const division      = useFilterStore((s) => s.division)
  const subdivision   = useFilterStore((s) => s.subdivision)

  const filters = useMemo<Filters>(
    () => ({ financialYear, month, circle, division, subdivision }),
    [financialYear, month, circle, division, subdivision],
  )

  const kpi = useMemo(() => getProcurementKpis(filters), [filters])

  const KPI_CARDS = [
    {
      label: 'Total Energy Procured',
      value: `${kpi.totalEnergyProcured} MU`,
      trend: '4.1 MU',
      trendDirection: 'up' as const,
      trendIsPositive: true,
      comparisonLabel: 'vs Last Month',
    },
    {
      label: 'Procurement Cost (₹ Cr)',
      value: String(kpi.procurementCost),
      trend: '3.8 Cr',
      trendDirection: 'up' as const,
      trendIsPositive: false,
      comparisonLabel: 'vs Last Month',
    },
    {
      label: 'ACS (₹/kWh)',
      value: `₹${kpi.acs}`,
      trend: '0.12',
      trendDirection: 'up' as const,
      trendIsPositive: false,
      comparisonLabel: 'vs Last Month',
    },
    {
      label: 'APPC (₹/kWh)',
      value: `₹${kpi.appc}`,
      trend: '0.08',
      trendDirection: 'down' as const,
      trendIsPositive: true,
      comparisonLabel: 'vs Last Month',
    },
    {
      label: 'Renewable Energy Share',
      value: `${kpi.renewableShare}%`,
      trend: '1.2%',
      trendDirection: kpi.renewableShare >= 25 ? 'up' as const : 'down' as const,
      trendIsPositive: kpi.renewableShare >= 25,
      comparisonLabel: 'Target 25%',
    },
    {
      label: 'Peak Procurement Cost',
      value: `₹${kpi.peakProcurementCost}/kWh`,
      trend: '0.15',
      trendDirection: 'up' as const,
      trendIsPositive: false,
      comparisonLabel: 'vs Last Month',
    },
  ]

  return (
    <div>
      <PageHeader
        title="Procurement & Finance"
        subtitle="Power procurement costs, source mix, financial efficiency and renewable energy monitoring"
      >
        <GlobalFilterBar />
      </PageHeader>
      <div className="py-5">
        <SectionContainer>
          <div className="grid grid-cols-6 gap-4">
            {KPI_CARDS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>

        <SectionContainer title="Cost Monitoring">
          <CostMonitoringSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Renewable Energy">
          <RenewableEnergySection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Division Financial Performance">
          <DivisionHeatmap filters={filters} />
        </SectionContainer>

        <SectionContainer title="Attention Required">
          <AttentionPanel filters={filters} />
        </SectionContainer>
      </div>
    </div>
  )
}
