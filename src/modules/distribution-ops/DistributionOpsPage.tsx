import React, { useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import { TrendingDown, AlertTriangle, Zap, ChevronUp, ChevronDown, Search } from 'lucide-react'
import { useFilterStore } from '../../store/filterStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import {
  getDistributionKpis, getEnergyTrend, getAtcLossTrend, getDivisionAtcRanking,
  getReliabilityTrend, getOutageTrend, getDtLoadingDistribution, getTopDtFailureDivisions,
  getDivisionHeatmapData, getDivisionTableData, getInsights,
  MONTHS,
  type DivisionHeatmapMetric, type Filters, type DivisionTableRow, type DistributionInsight,
} from './mockData'

const C = {
  primary: '#2563EB', success: '#16A34A', warning: '#F59E0B',
  error: '#DC2626', gray: '#9CA3AF', orange: '#EA580C',
  teal: '#0891B2', purple: '#7C3AED', grid: '#E5E7EB',
}
const ax = { fontSize: 11, fill: '#6B7280' }

// ── Heatmap helpers ───────────────────────────────────────────────────────────

function heatCell(value: number, metric: DivisionHeatmapMetric): string {
  if (metric === 'atcLoss')    return value < 15 ? '#DCFCE7' : value < 25 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'saifi')      return value < 0.5 ? '#DCFCE7' : value < 0.8 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'saidi')      return value < 2.0 ? '#DCFCE7' : value < 4.0 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'outages')    return value < 5 ? '#DCFCE7' : value < 10 ? '#FEF9C3' : '#FEE2E2'
  return value < 2 ? '#DCFCE7' : value < 5 ? '#FEF9C3' : '#FEE2E2'
}

function formatHeatCell(value: number, metric: DivisionHeatmapMetric): string {
  if (metric === 'atcLoss')                    return `${value}%`
  if (metric === 'saifi' || metric === 'saidi') return value.toFixed(1)
  return String(value)
}

// ── Table sort types ──────────────────────────────────────────────────────────

type SortDir = 'asc' | 'desc'
type SortKey = keyof Omit<DivisionTableRow, 'status'>

// ── Energy & Loss Analytics ───────────────────────────────────────────────────

function atcBarColor(value: number): string {
  return value < 15 ? C.success : value < 25 ? C.warning : C.error
}

function EnergyLossSection({ filters }: { filters: Filters }) {
  const energyTrend  = useMemo(() => getEnergyTrend(filters),        [filters])
  const atcTrend     = useMemo(() => getAtcLossTrend(filters),       [filters])
  const divisionRank = useMemo(() => getDivisionAtcRanking(filters), [filters])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-7">
          <ChartCard title="Energy Input vs Energy Sold" timeContext="Apr – Mar (Financial Year)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={energyTrend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
                <YAxis tick={ax} axisLine={false} tickLine={false} width={60}
                  tickFormatter={(v) => `${v} MU`} />
                <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v} MU`} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="energyInput" name="Energy Input"
                  stroke={C.primary} fill={C.primary} fillOpacity={0.15} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="energySold" name="Energy Sold"
                  stroke={C.success} fill={C.success} fillOpacity={0.15} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-span-5">
          <ChartCard title="AT&C Loss Trend" timeContext="Apr – Mar (Financial Year)">
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={atcTrend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
                <YAxis tick={ax} axisLine={false} tickLine={false} width={40}
                  tickFormatter={(v) => `${v}%`} domain={[8, 32]} />
                <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
                <ReferenceLine y={15} stroke={C.warning} strokeDasharray="4 2"
                  label={{ value: 'Target 15%', fill: C.warning, fontSize: 10, position: 'right' }} />
                <Line type="monotone" dataKey="atcLoss" name="AT&C Loss %"
                  stroke={C.error} strokeWidth={2} dot={{ r: 3, fill: C.error }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      <ChartCard title="Division-wise AT&C Loss Ranking" timeContext="Current Period">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={divisionRank} layout="vertical"
            margin={{ top: 4, right: 56, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
            <XAxis type="number" tick={ax} axisLine={false} tickLine={false}
              domain={[0, 32]} unit="%" />
            <YAxis dataKey="division" type="category" tick={ax} axisLine={false}
              tickLine={false} width={130} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
            <ReferenceLine x={15} stroke={C.warning} strokeDasharray="4 2"
              label={{ value: 'Target 15%', fill: C.warning, fontSize: 10, position: 'right' }} />
            <Bar dataKey="atcLoss" name="AT&C Loss %" radius={[0, 2, 2, 0]} maxBarSize={14}>
              {divisionRank.map((d) => (
                <Cell key={d.division} fill={atcBarColor(d.atcLoss)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Network Reliability ───────────────────────────────────────────────────────

function NetworkReliabilitySection({ filters }: { filters: Filters }) {
  const reliability = useMemo(() => getReliabilityTrend(filters), [filters])
  const outages     = useMemo(() => getOutageTrend(filters),       [filters])

  return (
    <div className="grid grid-cols-2 gap-4">
      <ChartCard title="SAIFI & SAIDI Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={reliability} margin={{ top: 4, right: 40, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis yAxisId="saifi" tick={ax} axisLine={false} tickLine={false}
              width={36} tickFormatter={(v) => v.toFixed(1)} />
            <YAxis yAxisId="saidi" orientation="right" tick={ax} axisLine={false}
              tickLine={false} width={44} tickFormatter={(v) => `${v}h`} />
            <Tooltip contentStyle={{ fontSize: 12 }}
              formatter={(v: number, name: string) =>
                name === 'SAIFI' ? v.toFixed(2) : `${v.toFixed(2)} hrs`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line yAxisId="saifi" type="monotone" dataKey="saifi" name="SAIFI"
              stroke={C.primary} strokeWidth={2} dot={{ r: 3, fill: C.primary }} />
            <Line yAxisId="saidi" type="monotone" dataKey="saidi" name="SAIDI (hrs)"
              stroke={C.error} strokeWidth={2} dot={{ r: 3, fill: C.error }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <ChartCard title="Planned vs Unplanned Outages" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={outages} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={36} />
            <Tooltip contentStyle={{ fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="planned"   name="Planned"   fill={C.primary} radius={[2, 2, 0, 0]} stackId="a" />
            <Bar dataKey="unplanned" name="Unplanned" fill={C.error}   radius={[2, 2, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Distribution Infrastructure ───────────────────────────────────────────────

function DistributionInfraSection({ filters }: { filters: Filters }) {
  const dtLoading  = useMemo(() => getDtLoadingDistribution(filters), [filters])
  const topFailure = useMemo(() => getTopDtFailureDivisions(filters), [filters])

  const LOAD_COLORS: Record<string, string> = {
    Normal:     C.success,
    Overloaded: C.warning,
    Critical:   C.error,
  }

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-5">
        <ChartCard title="Transformer Loading Distribution" timeContext="Current Period">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={dtLoading} layout="vertical"
              margin={{ top: 4, right: 48, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={ax} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={ax} axisLine={false}
                tickLine={false} width={80} />
              <Tooltip contentStyle={{ fontSize: 12 }}
                formatter={(v: number) => `${v.toLocaleString()} DTs`} />
              <Bar dataKey="count" name="DT Count" radius={[0, 2, 2, 0]} maxBarSize={28}>
                {dtLoading.map((d) => (
                  <Cell key={d.category} fill={LOAD_COLORS[d.category] ?? C.gray} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-7">
        <ChartCard title="Top Divisions by DT Failures" timeContext="Current Period">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topFailure} layout="vertical"
              margin={{ top: 4, right: 40, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={ax} axisLine={false} tickLine={false} />
              <YAxis dataKey="division" type="category" tick={ax} axisLine={false}
                tickLine={false} width={130} />
              <Tooltip contentStyle={{ fontSize: 12 }}
                formatter={(v: number) => `${v} failures`} />
              <Bar dataKey="failures" name="DT Failures"
                fill={C.error} radius={[0, 2, 2, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Division Performance Heatmap ──────────────────────────────────────────────

const HEAT_METRICS: { value: DivisionHeatmapMetric; label: string }[] = [
  { value: 'atcLoss',    label: 'AT&C Loss %'  },
  { value: 'saifi',      label: 'SAIFI'         },
  { value: 'saidi',      label: 'SAIDI (hrs)'   },
  { value: 'outages',    label: 'Outages'       },
  { value: 'dtFailures', label: 'DT Failures'   },
]

function DivisionHeatmap({ filters }: { filters: Filters }) {
  const [metric, setMetric] = useState<DivisionHeatmapMetric>('atcLoss')
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
            Division Performance by Month
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

// ── Operations Table ──────────────────────────────────────────────────────────

const TABLE_COLS: { key: SortKey | 'status'; label: string }[] = [
  { key: 'division',    label: 'Division'          },
  { key: 'energyInput', label: 'Energy Input (MU)' },
  { key: 'energySold',  label: 'Energy Sold (MU)'  },
  { key: 'atcLoss',     label: 'AT&C Loss %'       },
  { key: 'peakDemand',  label: 'Peak Demand (MW)'  },
  { key: 'saifi',       label: 'SAIFI'             },
  { key: 'saidi',       label: 'SAIDI (hrs)'       },
  { key: 'outages',     label: 'Outages'           },
  { key: 'dtFailures',  label: 'DT Failures'       },
  { key: 'status',      label: 'Status'            },
]

function DivisionTable({ filters }: { filters: Filters }) {
  const data = useMemo(() => getDivisionTableData(filters), [filters])
  const [sortKey, setSortKey] = useState<SortKey>('division')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(0)
  const PAGE_SIZE = 8

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const filtered = useMemo(
    () => data.filter((r) => r.division.toLowerCase().includes(search.toLowerCase())),
    [data, search],
  )

  const sorted = useMemo(
    () => [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      const cmp = typeof av === 'string'
        ? (av as string).localeCompare(bv as string)
        : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    }),
    [filtered, sortKey, sortDir],
  )

  const paged      = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

  function atcBadge(value: number) {
    const cls = value < 15
      ? 'bg-green-50 text-success'
      : value < 25
      ? 'bg-yellow-50 text-warning'
      : 'bg-red-50 text-error'
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${cls}`}>
        {value}%
      </span>
    )
  }

  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm">
      <div className="px-4 py-3 border-b border-border-base flex items-center justify-between gap-4">
        <h3 className="text-[14px] font-semibold text-text-primary">Division Operations Summary</h3>
        <div className="relative">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-secondary" />
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0) }}
            placeholder="Search division…"
            className="pl-8 pr-3 py-1.5 text-[12px] border border-border-base rounded-lg bg-background text-text-primary focus:outline-none focus:ring-1 focus:ring-primary w-48"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-base bg-background">
              {TABLE_COLS.map((col) => {
                const isSortable = col.key !== 'status'
                return (
                  <th
                    key={col.key}
                    onClick={isSortable ? () => handleSort(col.key as SortKey) : undefined}
                    className={`text-left px-4 py-2.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap select-none ${
                      isSortable ? 'cursor-pointer hover:text-text-primary' : ''
                    }`}
                  >
                    <span className="inline-flex items-center gap-1">
                      {col.label}
                      {isSortable && (sortKey === col.key
                        ? sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                        : <ChevronDown size={11} className="opacity-30" />)}
                    </span>
                  </th>
                )
              })}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.division}
                className="border-b border-border-base last:border-0 hover:bg-background transition-colors">
                <td className="px-4 py-2.5 font-medium text-text-primary">{row.division}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.energyInput} MU</td>
                <td className="px-4 py-2.5 text-text-primary">{row.energySold} MU</td>
                <td className="px-4 py-2.5">{atcBadge(row.atcLoss)}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.peakDemand} MW</td>
                <td className="px-4 py-2.5 text-text-primary">{row.saifi.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.saidi.toFixed(2)}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.outages}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.dtFailures}</td>
                <td className="px-4 py-2.5">
                  {row.status === 'critical' && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-error">Critical</span>
                  )}
                  {row.status === 'warning' && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-50 text-warning">Warning</span>
                  )}
                  {row.status === 'ok' && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-green-50 text-success">OK</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="px-4 py-2.5 border-t border-border-base flex items-center justify-between text-[12px] text-text-secondary">
          <span>
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, sorted.length)} of {sorted.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-2.5 py-1 border border-border-base rounded hover:bg-background disabled:opacity-40 text-[12px]"
            >
              Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="px-2.5 py-1 border border-border-base rounded hover:bg-background disabled:opacity-40 text-[12px]"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Attention Required ────────────────────────────────────────────────────────

const INSIGHT_ICONS: Record<DistributionInsight['icon'], React.ElementType> = {
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

export function DistributionOpsPage() {
  const financialYear = useFilterStore((s) => s.financialYear)
  const month         = useFilterStore((s) => s.month)
  const circle        = useFilterStore((s) => s.circle)
  const division      = useFilterStore((s) => s.division)
  const subdivision   = useFilterStore((s) => s.subdivision)

  const filters = useMemo<Filters>(
    () => ({ financialYear, month, circle, division, subdivision }),
    [financialYear, month, circle, division, subdivision],
  )

  const kpi = useMemo(() => getDistributionKpis(filters), [filters])

  const KPI_CARDS = [
    { label: 'Energy Input (MU)',     value: String(kpi.energyInput),     trend: '3.2 MU', trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Energy Sold (MU)',      value: String(kpi.energySold),      trend: '2.1 MU', trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'AT&C Loss %',          value: `${kpi.atcLoss}%`,           trend: '1.2%',   trendDirection: 'down' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Distribution Loss %',  value: `${kpi.distributionLoss}%`,  trend: '0.8%',   trendDirection: 'down' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Peak Demand (MW)',      value: String(kpi.peakDemand),      trend: '8.2 MW', trendDirection: 'up'   as const, trendIsPositive: false, comparisonLabel: 'vs Last Month' },
    { label: 'Power Availability %', value: `${kpi.powerAvailability}%`, trend: '0.3%',   trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
  ]

  return (
    <div>
      <PageHeader
        title="Distribution Operations"
        subtitle="Energy flow, AT&C losses, network reliability, and division performance"
      />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="KPI Overview">
          <div className="grid grid-cols-6 gap-4">
            {KPI_CARDS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>

        <SectionContainer title="Energy & Loss Analytics">
          <EnergyLossSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Network Reliability">
          <NetworkReliabilitySection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Distribution Infrastructure">
          <DistributionInfraSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Division Performance Heatmap">
          <DivisionHeatmap filters={filters} />
        </SectionContainer>

        <SectionContainer title="Operations Table">
          <DivisionTable filters={filters} />
        </SectionContainer>

        <SectionContainer title="Attention Required">
          <AttentionPanel filters={filters} />
        </SectionContainer>
      </div>
    </div>
  )
}
