import React, { useMemo, useState } from 'react'
import {
  ResponsiveContainer, ComposedChart, Bar, Line, CartesianGrid, XAxis, YAxis,
  Tooltip, Legend, PieChart, Pie, Cell, BarChart,
  RadialBarChart, RadialBar, LineChart, ReferenceLine,
} from 'recharts'
import { TrendingUp, AlertTriangle, Clock, Zap, Timer, ChevronUp, ChevronDown, Search } from 'lucide-react'
import { useFilterStore } from '../../store/filterStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import {
  getKpiData, getComplaintTrend, getCategoryDistribution,
  getSlaTrend, getResTimeTrend,
  getServiceVolumeByType, getServiceProcessingTime, getServiceRequestStatusMatrix,
  getConnectionsTrend, getConsumerCategoryDist,
  getDivisionMonthHeatmapData, getDivisionTableData, getInsights,
  MONTHS,
  type HeatmapMetric, type Filters, type TableRow,
} from './mockData'

const C = {
  primary: '#2563EB', success: '#16A34A', warning: '#F59E0B',
  error: '#DC2626', purple: '#7C3AED', cyan: '#0891B2', orange: '#EA580C',
  grid: '#E5E7EB',
}
const ax = { fontSize: 11, fill: '#6B7280' }

function resTimeColor(d: number) {
  return d <= 4 ? C.success : d <= 6 ? C.warning : C.error
}

function heatBg(value: number, type: 'complaint' | 'sla' | 'resolution' | 'pending'): string {
  if (type === 'complaint')  return value < 600 ? '#DCFCE7' : value < 900 ? '#FEF9C3' : '#FEE2E2'
  if (type === 'sla')        return value >= 90 ? '#DCFCE7' : value >= 75 ? '#FEF9C3' : '#FEE2E2'
  if (type === 'resolution') return value <= 4  ? '#DCFCE7' : value <= 6  ? '#FEF9C3' : '#FEE2E2'
  return value < 60 ? '#DCFCE7' : value < 100 ? '#FEF9C3' : '#FEE2E2'
}

// ── Complaints Dashboard ─────────────────────────────────────────────────────
function ComplaintsSection({ filters }: { filters: Filters }) {
  const trend      = useMemo(() => getComplaintTrend(filters),       [filters])
  const categories = useMemo(() => getCategoryDistribution(filters), [filters])

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <ChartCard title="Complaints Received vs Resolved" timeContext="Apr – Mar (Financial Year)">
          <ResponsiveContainer width="100%" height={260}>
            <ComposedChart data={trend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} width={48} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="received" name="Received" fill={C.error} opacity={0.65} radius={[2,2,0,0]} />
              <Line type="monotone" dataKey="resolved" name="Resolved" stroke={C.primary} strokeWidth={2} dot={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Category Distribution" timeContext="Current Period">
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85}>
              {categories.map((c) => <Cell key={c.name} fill={c.color} />)}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => v.toLocaleString()} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── SLA Performance ──────────────────────────────────────────────────────────
function SlaSection({ filters }: { filters: Filters }) {
  const kpi     = useMemo(() => getKpiData(filters),      [filters])
  const rtTrend = useMemo(() => getResTimeTrend(filters), [filters])

  return (
    <div className="grid grid-cols-2 gap-4">
      <ChartCard title="SLA Compliance" timeContext="Current Period">
        <div className="relative" style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%" cy="75%"
              innerRadius="55%" outerRadius="80%"
              startAngle={180} endAngle={0}
              data={[{ value: kpi.slaCompliance }]}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={6}
                fill={C.primary}
                background={{ fill: '#E5E7EB' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-x-0 flex flex-col items-center" style={{ bottom: 36 }}>
            <span className="text-[30px] font-bold text-text-primary">{kpi.slaCompliance}%</span>
            <span className="text-[11px] text-text-secondary mt-0.5">Target: 90%</span>
          </div>
        </div>
      </ChartCard>

      <ChartCard title="Resolution Time Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={rtTrend} margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 10]} tick={ax} axisLine={false} tickLine={false} width={36} unit="d" />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v} days`} />
            <ReferenceLine y={5} stroke={C.warning} strokeDasharray="4 2"
              label={{ value: 'Target', fill: C.warning, fontSize: 10, position: 'right' }} />
            <Line type="monotone" dataKey="days" name="Avg Days" stroke={C.primary} strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Service Requests ─────────────────────────────────────────────────────────
function ServiceRequestsSection({ filters }: { filters: Filters }) {
  const volume   = useMemo(() => getServiceVolumeByType(filters),       [filters])
  const procTime = useMemo(() => getServiceProcessingTime(filters),      [filters])
  const matrix   = useMemo(() => getServiceRequestStatusMatrix(filters), [filters])

  return (
    <div className="grid grid-cols-12 gap-4">
      <div className="col-span-5">
        <ChartCard title="Request Volume by Type" timeContext="Current Period">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={volume} margin={{ top: 4, right: 8, bottom: 56, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="type" tick={{ ...ax, textAnchor: 'end' }} angle={-35}
                axisLine={false} tickLine={false} interval={0} height={60} />
              <YAxis tick={ax} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Bar dataKey="volume" name="Requests" fill={C.primary} radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-4">
        <ChartCard title="Avg Processing Time by Type" timeContext="Current Period">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={procTime} layout="vertical" margin={{ left: 8, right: 32 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
              <XAxis type="number" tick={ax} axisLine={false} tickLine={false} unit="d" />
              <YAxis dataKey="type" type="category" tick={ax} axisLine={false} tickLine={false} width={120} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v} days`} />
              <Bar dataKey="days" name="Days" radius={[0,2,2,0]}>
                {procTime.map((p) => (
                  <Cell key={p.type} fill={p.days <= 5 ? C.success : p.days <= 8 ? C.warning : C.error} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="col-span-3">
        <ChartCard title="Request Status" timeContext="Current Period">
          <div className="overflow-auto" style={{ maxHeight: 220 }}>
            <table className="w-full text-[12px]">
              <thead>
                <tr className="border-b border-border-base">
                  <th className="text-left pb-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">Type</th>
                  <th className="text-right pb-2 text-[10px] font-semibold uppercase tracking-wide text-warning">Open</th>
                  <th className="text-right pb-2 text-[10px] font-semibold uppercase tracking-wide text-text-secondary">In Prog</th>
                  <th className="text-right pb-2 text-[10px] font-semibold uppercase tracking-wide text-success">Done</th>
                </tr>
              </thead>
              <tbody>
                {matrix.map((row) => (
                  <tr key={row.type} className="border-b border-border-base last:border-0">
                    <td className="py-1.5 text-text-primary" style={{ maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {row.type}
                    </td>
                    <td className={`py-1.5 text-right font-semibold ${
                      row.open > 150 ? 'text-error' : row.open > 80 ? 'text-warning' : 'text-text-primary'
                    }`}>
                      {row.open}
                    </td>
                    <td className="py-1.5 text-right text-text-secondary">{row.inProgress}</td>
                    <td className="py-1.5 text-right font-semibold text-success">{row.completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Consumer Analytics ───────────────────────────────────────────────────────
function ConsumerAnalyticsSection({ filters }: { filters: Filters }) {
  const connections = useMemo(() => getConnectionsTrend(filters),     [filters])
  const categories  = useMemo(() => getConsumerCategoryDist(filters), [filters])

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="col-span-2">
        <ChartCard title="New Connections vs Disconnections" timeContext="Apr – Mar (Financial Year)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={connections} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} width={40} />
              <Tooltip contentStyle={{ fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="newConnections" name="New Connections" fill={C.success} radius={[2,2,0,0]} />
              <Bar dataKey="disconnections" name="Disconnections"  fill={C.error}   radius={[2,2,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Consumer Category Distribution" timeContext="Current Period">
        <ResponsiveContainer width="100%" height={220}>
          <PieChart>
            <Pie data={categories} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={55} outerRadius={85}>
              {categories.map((c) => <Cell key={c.name} fill={c.color} />)}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
          </PieChart>
        </ResponsiveContainer>
      </ChartCard>
    </div>
  )
}

// ── Division Performance Heatmap ─────────────────────────────────────────────
const HEATMAP_COLS = ['Complaint Volume', 'SLA Compliance %', 'Avg Resolution (Days)', 'Pending Cases']

function DivisionHeatmap({ filters }: { filters: Filters }) {
  const data = useMemo(() => getDivisionHeatmapData(filters), [filters])

  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-border-base">
        <h3 className="text-[14px] font-semibold text-text-primary">Division Performance Heatmap</h3>
        <p className="text-[12px] text-text-secondary mt-0.5">
          Green / Amber / Red by performance threshold
        </p>
      </div>
      <div className="overflow-x-auto p-4">
        <div className="grid" style={{ gridTemplateColumns: '160px repeat(4, 1fr)', minWidth: 580 }}>
          <div />
          {HEATMAP_COLS.map((m) => (
            <div key={m} className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide text-center pb-3 px-2">
              {m}
            </div>
          ))}
          {data.map((row) => (
            <React.Fragment key={row.division}>
              <div className="text-[13px] font-medium text-text-primary py-3 pr-4 flex items-center border-t border-border-base">
                {row.division}
              </div>
              {([
                { val: row.complaintVolume, type: 'complaint'  as const, fmt: (v: number) => v.toLocaleString() },
                { val: row.slaCompliance,   type: 'sla'        as const, fmt: (v: number) => `${v}%`           },
                { val: row.resolutionTime,  type: 'resolution' as const, fmt: (v: number) => `${v}d`           },
                { val: row.pendingCases,    type: 'pending'    as const, fmt: (v: number) => String(v)         },
              ] as const).map(({ val, type, fmt }) => (
                <div
                  key={type}
                  className="py-3 px-2 text-center text-[13px] font-semibold border-t border-border-base mx-1 rounded"
                  style={{ backgroundColor: heatBg(val, type), color: '#111827' }}
                >
                  {fmt(val)}
                </div>
              ))}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Division Operations Table ────────────────────────────────────────────────
type SortDir = 'asc' | 'desc'
type SortKey = keyof TableRow

const TABLE_COLS: { key: SortKey; label: string }[] = [
  { key: 'division',        label: 'Division'   },
  { key: 'consumers',       label: 'Consumers'  },
  { key: 'complaints',      label: 'Complaints' },
  { key: 'resolved',        label: 'Resolved'   },
  { key: 'pending',         label: 'Pending'    },
  { key: 'slaPercent',      label: 'SLA %'      },
  { key: 'resolutionTime',  label: 'Avg Days'   },
  { key: 'newConnections',  label: 'New Conn.'  },
  { key: 'serviceRequests', label: 'Svc Req.'   },
]

function EnhancedTable({ filters }: { filters: Filters }) {
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

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey]
      const cmp = typeof av === 'string'
        ? (av as string).localeCompare(bv as string)
        : (av as number) - (bv as number)
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const paged      = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(sorted.length / PAGE_SIZE)

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
              {TABLE_COLS.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSort(col.key)}
                  className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap cursor-pointer hover:text-text-primary select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {sortKey === col.key
                      ? sortDir === 'asc' ? <ChevronUp size={11} /> : <ChevronDown size={11} />
                      : <ChevronDown size={11} className="opacity-30" />}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.map((row) => (
              <tr key={row.division} className="border-b border-border-base last:border-0 hover:bg-background transition-colors">
                <td className="px-4 py-2.5 font-medium text-text-primary">{row.division}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.consumers.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.complaints.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.resolved.toLocaleString()}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                    row.pending > 100 ? 'bg-red-50 text-error' :
                    row.pending > 50  ? 'bg-yellow-50 text-warning' :
                                        'bg-green-50 text-success'
                  }`}>
                    {row.pending}
                  </span>
                </td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${
                    row.slaPercent >= 90 ? 'bg-green-50 text-success' :
                    row.slaPercent >= 75 ? 'bg-yellow-50 text-warning' :
                                           'bg-red-50 text-error'
                  }`}>
                    {row.slaPercent}%
                  </span>
                </td>
                <td className="px-4 py-2.5 font-semibold" style={{ color: resTimeColor(row.resolutionTime) }}>
                  {row.resolutionTime}d
                </td>
                <td className="px-4 py-2.5 text-text-primary">{row.newConnections.toLocaleString()}</td>
                <td className="px-4 py-2.5 text-text-primary">{row.serviceRequests.toLocaleString()}</td>
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

// ── Insights & Exceptions ────────────────────────────────────────────────────
const INSIGHT_ICONS = {
  'trending-up':    TrendingUp,
  'alert-triangle': AlertTriangle,
  'clock':          Clock,
  'zap':            Zap,
  'timer':          Timer,
} as const

function InsightsSection({ filters }: { filters: Filters }) {
  const insights = useMemo(() => getInsights(filters), [filters])
  return (
    <div className="grid grid-cols-5 gap-4">
      {insights.map((insight) => {
        const Icon    = INSIGHT_ICONS[insight.icon]
        const isError = insight.severity === 'error'
        return (
          <div
            key={insight.id}
            className={`bg-surface border rounded-xl p-4 ${isError ? 'border-error' : 'border-warning'}`}
          >
            <div className={`flex items-center gap-2 mb-2 ${isError ? 'text-error' : 'text-warning'}`}>
              <Icon size={14} />
              <span className="text-[11px] font-semibold uppercase tracking-wide leading-tight">
                {insight.label}
              </span>
            </div>
            <p className="text-[15px] font-bold text-text-primary leading-tight">{insight.value}</p>
            <p className="text-[12px] text-text-secondary mt-1">{insight.context}</p>
          </div>
        )
      })}
    </div>
  )
}

// ── Page ─────────────────────────────────────────────────────────────────────
export function ConsumerServicesPage() {
  const financialYear = useFilterStore((s) => s.financialYear)
  const month         = useFilterStore((s) => s.month)
  const circle        = useFilterStore((s) => s.circle)
  const division      = useFilterStore((s) => s.division)
  const subdivision   = useFilterStore((s) => s.subdivision)

  const filters = useMemo<Filters>(
    () => ({ financialYear, month, circle, division, subdivision }),
    [financialYear, month, circle, division, subdivision],
  )

  const kpi = useMemo(() => getKpiData(filters), [filters])

  const KPI_CARDS = [
    { label: 'Total Consumers',    value: kpi.totalConsumers.toLocaleString(),          trend: '1,243', trendDirection: 'up'   as const, trendIsPositive: true, comparisonLabel: 'new this month'  },
    { label: 'New Connections',    value: kpi.newConnections.toLocaleString(),           trend: '87',    trendDirection: 'up'   as const, trendIsPositive: true, comparisonLabel: 'vs Last Month'   },
    { label: 'Complaints Received',value: kpi.complaintsReceived.toLocaleString(),       trend: '312',   trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month'   },
    { label: 'Complaints Resolved',value: kpi.complaintsResolved.toLocaleString(),       trend: '285',   trendDirection: 'up'   as const, trendIsPositive: true, comparisonLabel: 'vs Last Month'   },
    { label: 'Open Complaints',    value: kpi.openComplaints.toLocaleString(),           trend: '28',    trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month'   },
    { label: 'SLA Compliance',     value: `${kpi.slaCompliance}%`,                      trend: '1.2%',  trendDirection: 'up'   as const, trendIsPositive: true, comparisonLabel: 'vs Last Month'   },
    { label: 'Avg Resolution Time',value: `${kpi.avgResolutionTime}d`,                  trend: '0.3d',  trendDirection: 'down' as const, trendIsPositive: true, comparisonLabel: 'vs Last Month'   },
    { label: 'Service Requests',   value: kpi.serviceRequestsProcessed.toLocaleString(), trend: '143',   trendDirection: 'up'   as const, trendIsPositive: true, comparisonLabel: 'vs Last Month'   },
  ]

  return (
    <div>
      <PageHeader
        title="Consumer Services & Grievances"
        subtitle="Service delivery performance, complaint management, and SLA monitoring"
      />
      <GlobalFilterBar />
      <div className="py-5">
        <SectionContainer title="Key Metrics">
          <div className="grid grid-cols-4 gap-4">
            {KPI_CARDS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>

        <SectionContainer title="Complaints Dashboard">
          <ComplaintsSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="SLA Performance">
          <SlaSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Service Requests">
          <ServiceRequestsSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Consumer Analytics">
          <ConsumerAnalyticsSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Division Performance Heatmap">
          <DivisionHeatmap filters={filters} />
        </SectionContainer>

        <SectionContainer title="Division Operations">
          <EnhancedTable filters={filters} />
        </SectionContainer>

        <SectionContainer title="Insights & Exceptions">
          <InsightsSection filters={filters} />
        </SectionContainer>
      </div>
    </div>
  )
}
