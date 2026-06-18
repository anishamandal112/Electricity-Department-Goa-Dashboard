import React, { useMemo, useState } from 'react'
import {
  ResponsiveContainer, AreaChart, Area, LineChart, Line, BarChart, Bar, Cell,
  CartesianGrid, XAxis, YAxis, Tooltip, Legend,
} from 'recharts'
import { TrendingDown, AlertTriangle, IndianRupee, ChevronUp, ChevronDown, Search, ArrowRight, Zap, Activity, CheckCircle, AlertCircle } from 'lucide-react'
import { useFilterStore } from '../../store/filterStore'
import { PageHeader } from '../../components/ui/PageHeader'
import { GlobalFilterBar } from '../../components/filters/GlobalFilterBar'
import { SectionContainer } from '../../components/ui/SectionContainer'
import { KpiCard } from '../../components/ui/KpiCard'
import { ChartCard } from '../../components/ui/ChartCard'
import {
  getRevenueKpis, getRevenueTrend, getCollectionEfficiencyTrend,
  getBillingEfficiencyTrend, getOutstandingDuesTrend,
  getDuesByCategory, getAgingAnalysis, getRecoveryFunnel,
  getDivisionHeatmapData, getDivisionTableData, getInsights,
  MONTHS,
  type HeatmapMetric, type Filters, type DivisionTableRow, type RevenueInsight,
} from './mockData'

const C = {
  primary: '#2563EB', success: '#16A34A', warning: '#F59E0B',
  error: '#DC2626', gray: '#9CA3AF', orange: '#EA580C',
  teal: '#0891B2', purple: '#7C3AED', grid: '#E5E7EB',
}
const ax = { fontSize: 11, fill: '#6B7280' }

// ── Heatmap helpers ───────────────────────────────────────────────────────────

function heatCell(value: number, metric: HeatmapMetric): string {
  if (metric === 'collectionEfficiency') return value >= 92 ? '#DCFCE7' : value >= 85 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'billingEfficiency')    return value >= 94 ? '#DCFCE7' : value >= 88 ? '#FEF9C3' : '#FEE2E2'
  if (metric === 'outstandingDues')      return value < 2.0 ? '#DCFCE7' : value < 4.0 ? '#FEF9C3' : '#FEE2E2'
  return value >= 9 ? '#DCFCE7' : value >= 6 ? '#FEF9C3' : '#FEE2E2'
}

function formatHeatCell(value: number, metric: HeatmapMetric): string {
  if (metric === 'collectionEfficiency' || metric === 'billingEfficiency') return `${value}%`
  if (metric === 'outstandingDues')  return `₹${value}`
  return `₹${value}`
}

// ── Sort helpers ──────────────────────────────────────────────────────────────

type SortDir = 'asc' | 'desc'
type SortKey = keyof Omit<DivisionTableRow, 'attention'>

// ── Revenue Performance ───────────────────────────────────────────────────────

function RevenuePerformanceSection({ filters }: { filters: Filters }) {
  const trend     = useMemo(() => getRevenueTrend(filters),              [filters])
  const collTrend = useMemo(() => getCollectionEfficiencyTrend(filters), [filters])
  const billTrend = useMemo(() => getBillingEfficiencyTrend(filters),    [filters])

  return (
    <div className="space-y-4">
      <ChartCard title="Revenue Billed vs Revenue Collected" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={trend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={60}
              tickFormatter={(v) => `₹${v} Cr`} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `₹${v} Cr`} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Area type="monotone" dataKey="revenueBilled" name="Revenue Billed"
              stroke={C.primary} fill={C.primary} fillOpacity={0.12} strokeWidth={2} dot={false} />
            <Area type="monotone" dataKey="revenueCollected" name="Revenue Collected"
              stroke={C.success} fill={C.success} fillOpacity={0.12} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Billing Efficiency Trend" timeContext="Apr – Mar (Financial Year)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={billTrend} margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} width={44}
                tickFormatter={(v) => `${v}%`} domain={[80, 100]} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="billingEfficiency" name="Billing Efficiency %"
                stroke={C.purple} strokeWidth={2} dot={{ r: 3, fill: C.purple }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Collection Efficiency Trend" timeContext="Apr – Mar (Financial Year)">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={collTrend} margin={{ top: 4, right: 24, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
              <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
              <YAxis tick={ax} axisLine={false} tickLine={false} width={44}
                tickFormatter={(v) => `${v}%`} domain={[75, 100]} />
              <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `${v}%`} />
              <Line type="monotone" dataKey="collectionEfficiency" name="Collection Efficiency %"
                stroke={C.teal} strokeWidth={2} dot={{ r: 3, fill: C.teal }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  )
}

// ── Outstanding Dues Analysis ─────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  Domestic:   C.primary,
  Commercial: C.teal,
  Industrial: C.orange,
  Government: C.purple,
}

function OutstandingDuesSection({ filters }: { filters: Filters }) {
  const duesTrend = useMemo(() => getOutstandingDuesTrend(filters), [filters])
  const byCategory = useMemo(() => getDuesByCategory(filters),      [filters])
  const aging      = useMemo(() => getAgingAnalysis(filters),       [filters])

  const AGING_COLORS = ['#DCFCE7', '#FEF9C3', '#FED7AA', '#FEE2E2']
  const AGING_TEXT   = ['#16A34A', '#854D0E', '#9A3412', '#7F1D1D']

  return (
    <div className="space-y-4">
      <ChartCard title="Outstanding Dues Trend" timeContext="Apr – Mar (Financial Year)">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={duesTrend} margin={{ top: 4, right: 16, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="month" tick={ax} axisLine={false} tickLine={false} />
            <YAxis tick={ax} axisLine={false} tickLine={false} width={60}
              tickFormatter={(v) => `₹${v} Cr`} />
            <Tooltip contentStyle={{ fontSize: 12 }} formatter={(v: number) => `₹${v} Cr`} />
            <Area type="monotone" dataKey="outstandingDues" name="Outstanding Dues"
              stroke={C.error} fill={C.error} fillOpacity={0.12} strokeWidth={2} dot={false} />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid grid-cols-12 gap-4">
        <div className="col-span-6">
          <ChartCard title="Dues by Consumer Category" timeContext="Current Period">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={byCategory} layout="vertical"
                margin={{ top: 4, right: 64, bottom: 4, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
                <XAxis type="number" tick={ax} axisLine={false} tickLine={false}
                  tickFormatter={(v) => `₹${v}`} />
                <YAxis dataKey="category" type="category" tick={ax} axisLine={false}
                  tickLine={false} width={88} />
                <Tooltip contentStyle={{ fontSize: 12 }}
                  formatter={(v: number, name: string) =>
                    name === 'dues' ? [`₹${v} Cr`, 'Outstanding Dues'] : [v.toLocaleString(), 'Consumers']} />
                <Bar dataKey="dues" name="dues" radius={[0, 3, 3, 0]} maxBarSize={28}>
                  {byCategory.map((d) => (
                    <Cell key={d.category} fill={CATEGORY_COLORS[d.category] ?? C.gray} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        <div className="col-span-6">
          <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4 h-full">
            <h3 className="text-[14px] font-semibold text-text-primary mb-1">Aging Analysis</h3>
            <p className="text-[12px] text-text-secondary mb-4">Outstanding dues by age bucket</p>
            <div className="space-y-3">
              {aging.map((bucket, i) => (
                <div key={bucket.bucket}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[13px] font-medium text-text-primary">{bucket.bucket}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-[13px] font-semibold text-text-primary">₹{bucket.amount} Cr</span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded"
                        style={{ backgroundColor: AGING_COLORS[i], color: AGING_TEXT[i] }}
                      >
                        {bucket.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${bucket.percentage}%`, backgroundColor: [C.success, C.warning, C.orange, C.error][i] }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Revenue Recovery Funnel ───────────────────────────────────────────────────

const FUNNEL_STAGE_CONFIG = [
  { Icon: Zap,           color: '#2563EB', bg: '#EFF6FF', borderColor: '#BFDBFE', iconBg: '#DBEAFE' },
  { Icon: Activity,      color: '#0891B2', bg: '#F0FDFA', borderColor: '#99F6E4', iconBg: '#CCFBF1' },
  { Icon: IndianRupee,   color: '#7C3AED', bg: '#F5F3FF', borderColor: '#DDD6FE', iconBg: '#EDE9FE' },
  { Icon: CheckCircle,   color: '#16A34A', bg: '#F0FDF4', borderColor: '#BBF7D0', iconBg: '#DCFCE7' },
  { Icon: AlertCircle,   color: '#DC2626', bg: '#FEF2F2', borderColor: '#FECACA', iconBg: '#FEE2E2' },
]

const STAGE_LABELS = ['Energy Sold', 'Energy Billed', 'Revenue Billed', 'Revenue Collected', 'Outstanding Dues']

function RecoveryFunnelSection({ filters }: { filters: Filters }) {
  const steps = useMemo(() => getRecoveryFunnel(filters), [filters])

  const energySold      = steps[0].value
  const outstandingDues = steps[steps.length - 1].value
  const unbilledLoss    = steps[1].loss!
  const collectionGap   = steps[3].loss!

  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm p-6">
      <div className="mb-5">
        <h3 className="text-[14px] font-semibold text-text-primary">
          Energy-to-Revenue Conversion
        </h3>
        <p className="text-[12px] text-text-secondary mt-0.5">
          Revenue leakage: {unbilledLoss} MU unbilled · ₹{collectionGap} Cr collection gap · ₹{outstandingDues} Cr pending recovery
        </p>
      </div>

      <div className="flex items-stretch justify-between overflow-x-auto pb-1">
        {steps.map((step, i) => {
          const cfg    = FUNNEL_STAGE_CONFIG[i]
          const isLast = i === steps.length - 1
          const nextStep = steps[i + 1]

          const pctRemains = i === 0
            ? '100%'
            : i === 1
            ? `${(step.value / energySold * 100).toFixed(1)}% remains`
            : null

          return (
            <React.Fragment key={step.stage}>
              <div
                className="flex-shrink-0 rounded-xl border-2 p-4 text-center flex flex-col items-center"
                style={{ backgroundColor: cfg.bg, borderColor: cfg.borderColor, minWidth: 148 }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
                  style={{ backgroundColor: cfg.iconBg }}>
                  <cfg.Icon size={18} style={{ color: cfg.color }} />
                </div>
                <div className="text-[9px] font-bold uppercase tracking-widest mb-2 leading-tight"
                  style={{ color: cfg.color }}>
                  {STAGE_LABELS[i]}
                </div>
                <div className="text-[26px] font-bold text-text-primary leading-none">
                  {step.unit === '₹ Cr' ? `₹${step.value}` : step.value.toLocaleString()}
                </div>
                <div className="text-[12px] text-text-secondary mt-1">
                  {step.unit === '₹ Cr' ? 'Cr' : step.unit}
                </div>
                {pctRemains && (
                  <div className="text-[11px] font-semibold mt-2" style={{ color: cfg.color }}>
                    {pctRemains}
                  </div>
                )}
                {isLast && (
                  <div className="text-[11px] font-semibold mt-2 text-error">Pending Recovery</div>
                )}
              </div>

              {!isLast && (
                <div className="flex flex-col items-center justify-center flex-shrink-0 px-1">
                  {nextStep.loss !== null ? (
                    <>
                      <ArrowRight size={16} className="text-text-secondary mb-2" />
                      <div className="text-[9px] font-bold uppercase tracking-wide text-text-secondary mb-0.5 text-center whitespace-nowrap">
                        {nextStep.lossLabel}
                      </div>
                      <div className="text-[14px] font-bold text-error leading-tight">
                        {nextStep.unit !== '₹ Cr' ? `−${nextStep.loss} MU` : `−₹${nextStep.loss} Cr`}
                      </div>
                      <div className="text-[9px] text-text-secondary mt-0.5 text-center">
                        {nextStep.unit !== '₹ Cr'
                          ? `${(nextStep.loss / steps[i].value * 100).toFixed(2)}% of input`
                          : `${(nextStep.loss / steps[i].value * 100).toFixed(2)}% uncollected`}
                      </div>
                    </>
                  ) : (
                    <ArrowRight size={16} className="text-text-secondary" />
                  )}
                </div>
              )}
            </React.Fragment>
          )
        })}
      </div>

      <div className="mt-5 pt-4 border-t border-border-base flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-6 flex-wrap">
          <div className="flex items-center gap-2 text-[12px] text-text-secondary">
            <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-primary" />
            <span>Unbilled Energy</span>
            <span className="font-bold text-text-primary">
              {unbilledLoss} MU
              <span className="font-normal text-text-secondary ml-1">
                ({(unbilledLoss / energySold * 100).toFixed(2)}%)
              </span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-[12px] text-text-secondary">
            <div className="w-3 h-3 rounded-sm flex-shrink-0 bg-error" />
            <span>Collection Gap</span>
            <span className="font-bold text-text-primary">₹{collectionGap} Cr</span>
          </div>
        </div>
        <div className="text-[13px] text-text-secondary">
          Total Pending Recovery:{' '}
          <span className="font-bold text-error text-[16px]">₹{outstandingDues} Cr</span>
        </div>
      </div>
    </div>
  )
}

// ── Division Performance Heatmap ──────────────────────────────────────────────

const HEAT_METRICS: { value: HeatmapMetric; label: string }[] = [
  { value: 'collectionEfficiency', label: 'Collection Efficiency %' },
  { value: 'billingEfficiency',    label: 'Billing Efficiency %'    },
  { value: 'outstandingDues',      label: 'Outstanding Dues (₹ Cr)' },
  { value: 'revenueCollected',     label: 'Revenue Collected (₹ Cr)'},
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
            Division Performance by Month
          </h3>
          <p className="text-[12px] text-text-secondary mt-0.5">
            All 18 Goa ED Divisions × 12 months — Green good, Amber watch, Red poor
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

// ── Revenue & Billing Table ───────────────────────────────────────────────────

const ATTENTION_CONFIG: Record<DivisionTableRow['attention'], { label: string; cls: string }> = {
  'low-collection': { label: 'Low Collection',  cls: 'bg-red-50 text-error'    },
  'high-dues':      { label: 'High Dues',       cls: 'bg-red-50 text-error'    },
  'growing-dues':   { label: 'Growing Dues',    cls: 'bg-orange-50 text-orange-700' },
  'deteriorating':  { label: 'Deteriorating',   cls: 'bg-yellow-50 text-warning' },
  'below-target':   { label: 'Below Target',    cls: 'bg-yellow-50 text-warning' },
  'ok':             { label: 'On Track',        cls: 'bg-green-50 text-success' },
}

const TABLE_COLS: { key: SortKey | 'attention'; label: string }[] = [
  { key: 'division',            label: 'Division'              },
  { key: 'revenueBilled',       label: 'Revenue Billed (₹ Cr)' },
  { key: 'revenueCollected',    label: 'Revenue Collected (₹ Cr)' },
  { key: 'billingEfficiency',   label: 'Billing Eff. %'        },
  { key: 'collectionEfficiency',label: 'Collection Eff. %'     },
  { key: 'outstandingDues',     label: 'Outstanding (₹ Cr)'    },
  { key: 'revenueRealization',  label: 'Realization %'         },
  { key: 'attention',           label: 'Attention Required'    },
]

function DivisionTable({ filters }: { filters: Filters }) {
  const data = useMemo(() => getDivisionTableData(filters), [filters])
  const [sortKey, setSortKey] = useState<SortKey>('division')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [search,  setSearch]  = useState('')
  const [page,    setPage]    = useState(0)
  const PAGE_SIZE = 9

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

  function effBadge(value: number, threshHigh: number, threshLow: number) {
    const cls = value >= threshHigh
      ? 'bg-green-50 text-success'
      : value >= threshLow
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
        <h3 className="text-[14px] font-semibold text-text-primary">Revenue & Billing by Division</h3>
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
                const isSortable = col.key !== 'attention'
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
                <td className="px-4 py-2.5 font-medium text-text-primary whitespace-nowrap">{row.division}</td>
                <td className="px-4 py-2.5 text-text-primary">₹{row.revenueBilled}</td>
                <td className="px-4 py-2.5 text-text-primary">₹{row.revenueCollected}</td>
                <td className="px-4 py-2.5">{effBadge(row.billingEfficiency, 94, 88)}</td>
                <td className="px-4 py-2.5">{effBadge(row.collectionEfficiency, 92, 85)}</td>
                <td className="px-4 py-2.5 text-text-primary">₹{row.outstandingDues}</td>
                <td className="px-4 py-2.5">{effBadge(row.revenueRealization, 90, 82)}</td>
                <td className="px-4 py-2.5">
                  <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold ${ATTENTION_CONFIG[row.attention].cls}`}>
                    {ATTENTION_CONFIG[row.attention].label}
                  </span>
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
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="px-2.5 py-1 border border-border-base rounded hover:bg-background disabled:opacity-40 text-[12px]">
              Prev
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="px-2.5 py-1 border border-border-base rounded hover:bg-background disabled:opacity-40 text-[12px]">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Attention Panel ───────────────────────────────────────────────────────────

const INSIGHT_ICONS: Record<RevenueInsight['icon'], React.ElementType> = {
  'trending-down':  TrendingDown,
  'alert-triangle': AlertTriangle,
  'rupee':          IndianRupee,
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

export function RevenueBillingPage() {
  const financialYear = useFilterStore((s) => s.financialYear)
  const month         = useFilterStore((s) => s.month)
  const circle        = useFilterStore((s) => s.circle)
  const division      = useFilterStore((s) => s.division)
  const subdivision   = useFilterStore((s) => s.subdivision)

  const filters = useMemo<Filters>(
    () => ({ financialYear, month, circle, division, subdivision }),
    [financialYear, month, circle, division, subdivision],
  )

  const kpi = useMemo(() => getRevenueKpis(filters), [filters])

  const KPI_CARDS = [
    { label: 'Revenue Billed (₹ Cr)',    value: `₹${kpi.revenueBilled}`,       trend: '8.2 Cr',  trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Revenue Collected (₹ Cr)', value: `₹${kpi.revenueCollected}`,    trend: '6.4 Cr',  trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Collection Efficiency %',  value: `${kpi.collectionEfficiency}%`, trend: '0.8%',    trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month', benchmark: 'Target: 100%' },
    { label: 'Billing Efficiency %',     value: `${kpi.billingEfficiency}%`,    trend: '0.5%',    trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month', benchmark: 'National Avg: 87.6%' },
    { label: 'Outstanding Dues (₹ Cr)',  value: `₹${kpi.outstandingDues}`,     trend: '2.1 Cr',  trendDirection: 'down' as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
    { label: 'Revenue Realization %',    value: `${kpi.revenueRealization}%`,   trend: '0.6%',    trendDirection: 'up'   as const, trendIsPositive: true,  comparisonLabel: 'vs Last Month' },
  ]

  return (
    <div>
      <PageHeader
        title="Revenue & Billing"
        subtitle="Billing efficiency, revenue collection, outstanding dues, and revenue leakage analysis"
      >
        <GlobalFilterBar />
      </PageHeader>
      <div className="py-5">
        <SectionContainer>
          <div className="grid grid-cols-6 gap-4">
            {KPI_CARDS.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </SectionContainer>

        <SectionContainer title="Revenue Performance">
          <RevenuePerformanceSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Revenue Recovery Flow">
          <RecoveryFunnelSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Outstanding Dues Analysis">
          <OutstandingDuesSection filters={filters} />
        </SectionContainer>

        <SectionContainer title="Division Performance Heatmap">
          <DivisionHeatmap filters={filters} />
        </SectionContainer>

        <SectionContainer title="Revenue & Billing Table">
          <DivisionTable filters={filters} />
        </SectionContainer>

        <SectionContainer title="Attention Required">
          <AttentionPanel filters={filters} />
        </SectionContainer>
      </div>
    </div>
  )
}
