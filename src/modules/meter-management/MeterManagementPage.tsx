import React, { useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend, ReferenceLine,
} from 'recharts'
import {
  WifiOff, AlertTriangle, TrendingDown, Target, RefreshCw,
  ChevronUp, ChevronDown, Search,
} from 'lucide-react'
import { useFilterStore } from '../../store/filterStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import {
  getMeterKpis, getRolloutTrend, getSmartVsConventional, getInstallProgressByDivision,
  getHeatmapData, getMeterStatusDist, getTopIssueDivisions, getNewVsReplacement,
  getAdoptionByCategory, getDivisionTableData, getInsights,
  MONTHS,
  type MeterHeatmapMetric, type Filters, type MeterTableRow, type MeterInsight,
} from './mockData'

const C = {
  primary: '#2563EB', success: '#16A34A', warning: '#F59E0B',
  error: '#DC2626', gray: '#9CA3AF', orange: '#EA580C',
  teal: '#0891B2', purple: '#7C3AED', grid: '#E5E7EB',
}
const ax = { fontSize: 11, fill: '#6B7280' }

// ── Helpers ───────────────────────────────────────────────────────────────────

function heatCell(value: number, metric: MeterHeatmapMetric): string {
  if (metric === 'commSuccess')
    return value >= 92 ? '#DCFCE7' : value >= 80 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'readSuccess')
    return value >= 95 ? '#DCFCE7' : value >= 85 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'nonCommunicating')
    return value < 100 ? '#DCFCE7' : value <= 300 ? '#FEF9C3' : '#FEE2E2'
  return value < 50 ? '#DCFCE7' : value <= 150 ? '#FEF9C3' : '#FEE2E2'
}

function formatHeatCell(value: number, metric: MeterHeatmapMetric): string {
  if (metric === 'commSuccess' || metric === 'readSuccess') return `${value}%`
  return String(value)
}

// ── Metering Overview ─────────────────────────────────────────────────────────

function MeteringOverviewSection({ filters }: { filters: Filters }) {
  const rollout     = useMemo(() => getRolloutTrend(filters),              [filters])
  const svDist      = useMemo(() => getSmartVsConventional(filters),       [filters])
  const installProg = useMemo(() => getInstallProgressByDivision(filters), [filters])
  const kpi         = useMemo(() => getMeterKpis(filters),                 [filters])

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        {/* Area chart — rollout trend */}
        <div className="col-span-8">
          <ChartCard title="Smart Meter Rollout Trend" timeContext="Apr – Mar (Financial Year)">
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={rollout} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
                <YAxis tick={ax} axisLine={false} tickLine={false} width={52}
                  tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
                <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => v.toLocaleString()} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="smart" name="Smart" stroke={C.primary}
                  fill={C.primary} fillOpacity={0.15} strokeWidth={2} dot={false} />
                <Area type="monotone" dataKey="conventional" name="Conventional" stroke={C.gray}
                  fill={C.gray} fillOpacity={0.10} strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Donut — smart vs conventional */}
        <div className="col-span-4">
          <ChartCard title="Smart vs Conventional" timeContext="Current Period">
            <div className="relative" style={{ height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={svDist} dataKey="value" nameKey="name"
                    cx="50%" cy="50%" innerRadius={60} outerRadius={88}>
                    {svDist.map((s) => <Cell key={s.name} fill={s.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => v.toLocaleString()} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </PieChart>
              </ResponsiveContainer>
              <div
                className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
                style={{ paddingBottom: 28 }}
              >
                <span className="text-[22px] font-bold text-text-primary">{kpi.smartPenetration}%</span>
                <span className="text-[10px] text-text-secondary">Smart</span>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>

      {/* Horizontal bar — all 18 divisions */}
      <ChartCard title="Smart Meter Installation Progress by Division" timeContext="Current Period">
        <ResponsiveContainer width="100%" height={420}>
          <BarChart data={installProg} layout="vertical"
            margin={{ top: 4, right: 56, bottom: 4, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
            <XAxis type="number" tick={ax} axisLine={false} tickLine={false}
              domain={[0, 65]} unit="%" />
            <YAxis dataKey="division" type="category" tick={ax} axisLine={false}
              tickLine={false} width={130} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
            <ReferenceLine x={30} stroke={C.warning} strokeDasharray="4 2"
              label={{ value: 'Target 30%', fill: C.warning, fontSize: 10, position: 'right' }} />
            <Bar dataKey="smartPct" name="Smart %" radius={[0, 2, 2, 0]} maxBarSize={14}>
              {installProg.map((d) => (
                <Cell
                  key={d.division}
                  fill={d.smartPct >= 30 ? C.success : d.smartPct >= 20 ? C.warning : C.error}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Communication Heatmap ─────────────────────────────────────────────────────

const HEAT_METRICS: { value: MeterHeatmapMetric; label: string }[] = [
  { value: 'commSuccess',      label: 'Communication Success %'  },
  { value: 'readSuccess',      label: 'Reading Success %'        },
  { value: 'nonCommunicating', label: 'Non-Communicating Meters' },
  { value: 'faultyMeters',     label: 'Faulty Meters'            },
]

function CommunicationHeatmap({ filters }: { filters: Filters }) {
  const [metric, setMetric] = useState<MeterHeatmapMetric>('commSuccess')
  const data = useMemo(() => getHeatmapData(filters, metric), [filters, metric])

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
            Smart Meter Communication Performance
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
          {/* Header row */}
          <div />
          {MONTHS.map((m) => (
            <div key={m}
              className="text-center text-[10px] font-semibold uppercase tracking-wide text-text-secondary pb-2 px-0.5">
              {m}
            </div>
          ))}

          {/* Data rows */}
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

// ── Meter Health & Exceptions ─────────────────────────────────────────────────

function MeterHealthSection({ filters }: { filters: Filters }) {
  const statusDist = useMemo(() => getMeterStatusDist(filters),    [filters])
  const topIssues  = useMemo(() => getTopIssueDivisions(filters),  [filters])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-4">
        <ChartCard title="Meter Status Distribution" timeContext="Current Period">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusDist} dataKey="value" nameKey="name"
                cx="50%" cy="50%" innerRadius={55} outerRadius={82}>
                {statusDist.map((s) => <Cell key={s.name} fill={s.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => v.toLocaleString()} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconSize={10} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-8">
        <ChartCard title="Top Divisions with Meter Issues" timeContext="Faulty + Non-Communicating">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={topIssues} layout="vertical"
              margin={{ top: 4, right: 40, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={ax} axisLine={false} tickLine={false} />
              <YAxis dataKey="division" type="category" tick={ax} axisLine={false}
                tickLine={false} width={130} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="value" name="Faulty + Non-Comm"
                fill={C.error} radius={[0, 2, 2, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Consumer Metering Analytics ───────────────────────────────────────────────

function ConsumerMeteringSection({ filters }: { filters: Filters }) {
  const newVsRepl = useMemo(() => getNewVsReplacement(filters),   [filters])
  const adoption  = useMemo(() => getAdoptionByCategory(filters), [filters])

  const avgAdoption = Math.round(adoption.reduce((s, c) => s + c.smartPct, 0) / adoption.length)

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-8">
        <ChartCard title="New Meter Installations vs Replacements" timeContext="Apr – Mar (Financial Year)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={newVsRepl} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} width={44} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="newInstalls"  name="New Installations" fill={C.primary} radius={[2, 2, 0, 0]} />
              <Bar dataKey="replacements" name="Replacements"       fill={C.orange}  radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-4">
        <ChartCard title="Smart Adoption by Consumer Category" timeContext="Current Period">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={adoption} layout="vertical"
              margin={{ top: 4, right: 48, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={ax} axisLine={false} tickLine={false}
                domain={[0, 100]} unit="%" />
              <YAxis dataKey="category" type="category" tick={ax} axisLine={false}
                tickLine={false} width={80} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
              <ReferenceLine x={avgAdoption} stroke={C.warning} strokeDasharray="4 2"
                label={{ value: 'Avg', fill: C.warning, fontSize: 10, position: 'right' }} />
              <Bar dataKey="smartPct" name="Smart %" fill={C.teal}
                radius={[0, 2, 2, 0]} maxBarSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Division Performance Table ────────────────────────────────────────────────

type SortDir = 'asc' | 'desc'
type SortKey = keyof Omit<MeterTableRow, 'attentionFlag'>

const TABLE_COLS: { key: SortKey | 'attentionFlag'; label: string }[] = [
  { key: 'division',         label: 'Division'       },
  { key: 'totalMeters',      label: 'Total Meters'   },
  { key: 'smartMeters',      label: 'Smart Meters'   },
  { key: 'smartPct',         label: 'Smart %'        },
  { key: 'commSuccessPct',   label: 'Comm Success %' },
  { key: 'readSuccessPct',   label: 'Read Success %' },
  { key: 'faultyMeters',     label: 'Faulty'         },
  { key: 'nonCommunicating', label: 'Non-Comm'       },
  { key: 'replacements',     label: 'Replacements'   },
  { key: 'attentionFlag',    label: 'Attention'      },
]

function DivisionTable({ filters }: { filters: Filters }) {
  const data = useMemo(() => getDivisionTableData(filters), [filters])
  const [sortKey, setSortKey] = useState<SortKey>('division')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(0)
  const PAGE_SIZE = 5

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

  function pctBadge(value: number, good: number, warn: number) {
    const cls = value >= good
      ? 'bg-green-50 text-success'
      : value >= warn
      ? 'bg-yellow-50 text-warning'
      : 'bg-red-50 text-error'
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${cls}`}>
        {value}%
      </span>
    )
  }

  function countBadge(value: number, warn: number, bad: number) {
    const cls = value > bad
      ? 'bg-red-50 text-error'
      : value > warn
      ? 'bg-yellow-50 text-warning'
      : 'bg-green-50 text-success'
    return (
      <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${cls}`}>
        {value.toLocaleString()}
      </span>
    )
  }

  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm">
      <div className="px-4 py-3 border-b border-border-base flex items-center justify-between gap-4">
        <h3 className="text-[14px] font-semibold text-text-primary">Division Performance Summary</h3>
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
                const isSortable = col.key !== 'attentionFlag'
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
                <td className="px-4 py-2.5 text-text-primary">{row.totalMeters.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.smartMeters.toLocaleString()}</td>
                <td className="px-4 py-2.5">{pctBadge(row.smartPct, 35, 20)}</td>
                <td className="px-4 py-2.5">{pctBadge(row.commSuccessPct, 92, 80)}</td>
                <td className="px-4 py-2.5">{pctBadge(row.readSuccessPct, 95, 85)}</td>
                <td className="px-4 py-2.5">{countBadge(row.faultyMeters, 50, 150)}</td>
                <td className="px-4 py-2.5">{countBadge(row.nonCommunicating, 100, 300)}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.replacements.toLocaleString()}</td>
                <td className="px-4 py-2.5">
                  {row.attentionFlag === 'critical' && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-red-50 text-error">
                      Critical
                    </span>
                  )}
                  {row.attentionFlag === 'warning' && (
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-yellow-50 text-warning">
                      Warning
                    </span>
                  )}
                  {row.attentionFlag === null && (
                    <span className="text-[11px] text-text-secondary">—</span>
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

const INSIGHT_ICONS: Record<MeterInsight['icon'], React.ElementType> = {
  'wifi-off':       WifiOff,
  'alert-triangle': AlertTriangle,
  'trending-down':  TrendingDown,
  'target':         Target,
  'refresh-cw':     RefreshCw,
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

export function MeterManagementPage() {
  const financialYear = useFilterStore((s) => s.financialYear)
  const month         = useFilterStore((s) => s.month)
  const circle        = useFilterStore((s) => s.circle)
  const division      = useFilterStore((s) => s.division)
  const subdivision   = useFilterStore((s) => s.subdivision)

  const filters = useMemo<Filters>(
    () => ({ financialYear, month, circle, division, subdivision }),
    [financialYear, month, circle, division, subdivision],
  )

  const kpi = useMemo(() => getMeterKpis(filters), [filters])

  const KPI_CARDS = [
    { label: 'Total Installed Meters',     value: kpi.totalMeters.toLocaleString(),   trend: '1,100', trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Smart Meters Installed',     value: kpi.smartMeters.toLocaleString(),   trend: '2,840', trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Smart Meter Penetration',    value: `${kpi.smartPenetration}%`,         trend: '0.9%',  trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Reading Success Rate',       value: `${kpi.readSuccessRate}%`,          trend: '0.2%',  trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Communication Success Rate', value: `${kpi.commSuccessRate}%`,          trend: '0.4%',  trendDirection: 'down' as const, trendIsPositive: false, comparisonLabel: 'vs Last Month' },
    { label: 'Faulty / Non-Communicating', value: kpi.faultyNonComm.toLocaleString(), trend: '130',   trendDirection: 'down' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
  ]

  return (
    <div>
      <PageHeader
        title="Meter Management"
        subtitle="Smart metering deployment, communication performance, and meter health monitoring"
      />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="KPI Overview">
          <div className="grid grid-cols-6 gap-4">
            {KPI_CARDS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>

        <SectionContainer title="Metering Overview">
          <MeteringOverviewSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Smart Meter Communication Performance">
          <CommunicationHeatmap filters={filters} />
        </SectionContainer>

        <SectionContainer title="Meter Health & Exceptions">
          <MeterHealthSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Consumer Metering Analytics">
          <ConsumerMeteringSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Division Performance Table">
          <DivisionTable filters={filters} />
        </SectionContainer>

        <SectionContainer title="Attention Required">
          <AttentionPanel filters={filters} />
        </SectionContainer>
      </div>
    </div>
  )
}
