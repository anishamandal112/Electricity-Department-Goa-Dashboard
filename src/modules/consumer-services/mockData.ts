// --- Types ---
export interface Filters {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
}

export interface KpiData {
  totalConsumers: number
  newConnections: number
  complaintsReceived: number
  complaintsResolved: number
  openComplaints: number
  slaCompliance: number
  avgResolutionTime: number
  serviceRequestsProcessed: number
}

export interface MonthlyComplaintPoint { month: string; received: number; resolved: number }
export interface CategoryPoint { name: string; value: number; color: string }
export interface StatusPoint { name: string; value: number }
export interface BacklogPoint { month: string; backlog: number }
export interface SlaPoint { month: string; compliance: number }
export interface ResTimePoint { month: string; days: number }
export interface DivisionSlaPoint { division: string; compliance: number; fill: string }
export interface ServiceVolumePoint { type: string; volume: number }
export interface FunnelData { submitted: number; inProcess: number; completed: number }
export interface ProcessingTimePoint { type: string; days: number }
export interface ConsumerGrowthPoint { month: string; consumers: number }
export interface ConnectionsPoint { month: string; newConnections: number; disconnections: number }
export interface ConsumerCategoryPoint { name: string; value: number; color: string }
export interface HeatmapRow {
  division: string
  complaintVolume: number
  slaCompliance: number
  resolutionTime: number
  pendingCases: number
}
export interface TableRow {
  division: string
  consumers: number
  complaints: number
  resolved: number
  pending: number
  slaPercent: number
  resolutionTime: number
  newConnections: number
  serviceRequests: number
}
export interface InsightItem {
  id: string
  label: string
  value: string
  context: string
  severity: 'error' | 'warning'
  icon: 'trending-up' | 'alert-triangle' | 'clock' | 'zap' | 'timer'
}

export type HeatmapMetric = 'complaintVolume' | 'slaCompliance' | 'resolutionTime' | 'pendingComplaints'

export interface DivisionMonthCell {
  division: string
  month: string
  value: number
}

export interface StatusMatrixRow {
  type: string
  open: number
  inProgress: number
  completed: number
}

// --- Constants ---
export const MONTHS = [
  'Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar',
]

const DIVISIONS = [
  'Ponda X', 'Margao XVI', 'Calangute XIV', 'Mapusa XVII', 'Mormugao IV',
  'Margao V', 'Bicholim XI', 'Mapusa XV', 'Vasco III', 'Quepem VIII',
  'South Urban VI', 'Cuncolim XVIII', 'Panaji II', 'Pernem XIII',
  'Panaji I', 'Valpoi XII', 'Sanguem VII', 'Canacona IX',
]

export const COMPLAINT_CATEGORIES: { name: string; color: string }[] = [
  { name: 'Billing Issues',      color: '#DC2626' },
  { name: 'Power Outages',       color: '#F59E0B' },
  { name: 'Voltage Fluctuation', color: '#EA580C' },
  { name: 'Meter Issues',        color: '#7C3AED' },
  { name: 'New Connections',     color: '#16A34A' },
  { name: 'Service Requests',    color: '#2563EB' },
  { name: 'Others',              color: '#6B7280' },
]

const SERVICE_TYPES = [
  'Load Enhancement','Load Reduction','Name Change',
  'Meter Shifting','Reconnection','Temporary Connection',
]

// --- Helpers ---
function strHash(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i)
  return Math.abs(h)
}

function jitter(base: number, seed: number, pct = 0.10): number {
  const r = ((seed % 1000) / 1000 - 0.5) * 2 * pct
  return Math.round(base * (1 + r))
}

function divFactor(division: string): number {
  const m: Record<string, number> = {
    'All': 1,
    'Panaji I':      0.08, 'Panaji II':      0.06,
    'Vasco III':     0.07, 'Mormugao IV':    0.06,
    'Margao V':      0.08, 'South Urban VI': 0.05,
    'Sanguem VII':   0.03, 'Quepem VIII':    0.04,
    'Canacona IX':   0.03, 'Ponda X':        0.07,
    'Bicholim XI':   0.05, 'Valpoi XII':     0.04,
    'Pernem XIII':   0.04, 'Calangute XIV':  0.08,
    'Mapusa XV':     0.06, 'Margao XVI':     0.06,
    'Mapusa XVII':   0.06, 'Cuncolim XVIII': 0.06,
  }
  return m[division] ?? 1
}

function fyFactor(fy: string): number {
  return fy === '2023-24' ? 0.94 : fy === '2025-26' ? 1.05 : 1
}

function monthFactor(month: string): number {
  const idx = MONTHS.indexOf(month)
  if (idx < 0) return 1
  return [0.9,1.15,1.18,1.08,0.95,0.9,0.85,0.82,0.87,0.92,0.96,0.88][idx]
}

export function slaColor(pct: number): string {
  return pct >= 90 ? '#16A34A' : pct >= 75 ? '#F59E0B' : '#DC2626'
}

// --- Data Functions ---

export function getKpiData(filters: Filters): KpiData {
  const h  = strHash(filters.financialYear + filters.division + filters.circle)
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  const mf = filters.month === 'All' ? 1 : monthFactor(filters.month)
  return {
    totalConsumers:           jitter(Math.round(615000 * df * ff), h),
    newConnections:           jitter(Math.round(1420 * df * ff * mf), h + 1),
    complaintsReceived:       jitter(Math.round(4100 * df * ff * mf), h + 2),
    complaintsResolved:       jitter(Math.round(3770 * df * ff * mf), h + 3),
    openComplaints:           jitter(Math.round(390 * df * ff), h + 4),
    slaCompliance:            Math.min(99, Math.max(70, jitter(91, h + 5, 0.12))),
    avgResolutionTime:        Math.max(1.5, Math.min(9, +(4.2 * (1 + ((h + 6) % 200) / 1000 - 0.1)).toFixed(1))),
    serviceRequestsProcessed: jitter(Math.round(2050 * df * ff * mf), h + 7),
  }
}

export function getComplaintTrend(filters: Filters): MonthlyComplaintPoint[] {
  const h  = strHash(filters.financialYear + filters.division)
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  return MONTHS.map((month, i) => {
    const received = jitter(Math.round(4100 * df * ff * monthFactor(month)), h + i)
    const resolved = jitter(Math.round(received * 0.91), h + i + 50)
    return { month, received, resolved }
  })
}

export function getCategoryDistribution(filters: Filters): CategoryPoint[] {
  const h = strHash(filters.financialYear + filters.month + filters.division)
  const baseWeights = [28, 22, 15, 12, 10, 8, 5]
  return COMPLAINT_CATEGORIES.map(({ name, color }, i) => ({
    name, color,
    value: jitter(baseWeights[i] * 42, h + i, 0.15),
  }))
}

export function getComplaintStatus(filters: Filters): StatusPoint[] {
  const h     = strHash(filters.financialYear + filters.division + 'status')
  const total = jitter(4100, h, 0.1)
  return [
    { name: 'Resolved',  value: Math.round(total * 0.88) },
    { name: 'Pending',   value: Math.round(total * 0.08) },
    { name: 'Escalated', value: Math.round(total * 0.025) },
    { name: 'Withdrawn', value: Math.round(total * 0.015) },
  ]
}

export function getBacklogTrend(filters: Filters): BacklogPoint[] {
  const h  = strHash(filters.financialYear + filters.division + 'backlog')
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  return MONTHS.map((month, i) => ({
    month,
    backlog: jitter(Math.round(390 * df * ff * monthFactor(month)), h + i),
  }))
}

export function getSlaTrend(filters: Filters): SlaPoint[] {
  const h  = strHash(filters.financialYear + filters.division + 'sla')
  const ff = fyFactor(filters.financialYear)
  return MONTHS.map((month, i) => ({
    month,
    compliance: Math.min(99, Math.max(68, jitter(Math.round(91 * ff), h + i, 0.06))),
  }))
}

export function getResTimeTrend(filters: Filters): ResTimePoint[] {
  const h  = strHash(filters.financialYear + filters.division + 'restime')
  const ff = fyFactor(filters.financialYear)
  return MONTHS.map((_month, i) => ({
    month: MONTHS[i],
    days: Math.max(1.5, Math.min(9, +(4.2 * ff * (1 + ((h + i) % 200) / 1000 - 0.1)).toFixed(1))),
  }))
}

export function getDivisionSlaRanking(filters: Filters): DivisionSlaPoint[] {
  const h  = strHash(filters.financialYear + 'slarank')
  const ff = fyFactor(filters.financialYear)
  return DIVISIONS.map((division, i) => {
    const compliance = Math.min(99, Math.max(68, jitter(Math.round(88 * ff), h + i, 0.10)))
    return { division, compliance, fill: slaColor(compliance) }
  }).sort((a, b) => b.compliance - a.compliance)
}

export function getServiceVolumeByType(filters: Filters): ServiceVolumePoint[] {
  const h  = strHash(filters.financialYear + filters.month + filters.division + 'svc')
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  const mf = filters.month === 'All' ? 1 : monthFactor(filters.month)
  const base = [380, 120, 290, 210, 430, 180]
  return SERVICE_TYPES.map((type, i) => ({
    type,
    volume: jitter(Math.round(base[i] * df * ff * mf), h + i),
  }))
}

export function getServiceRequestFunnel(filters: Filters): FunnelData {
  const h         = strHash(filters.financialYear + filters.division + 'funnel')
  const df        = divFactor(filters.division)
  const ff        = fyFactor(filters.financialYear)
  const submitted = jitter(Math.round(2400 * df * ff), h)
  const inProcess = jitter(Math.round(submitted * 0.62), h + 1)
  const completed = jitter(Math.round(submitted * 0.87), h + 2)
  return { submitted, inProcess, completed }
}

export function getServiceProcessingTime(filters: Filters): ProcessingTimePoint[] {
  const h    = strHash(filters.financialYear + filters.division + 'proctime')
  const base = [12, 8, 5, 7, 3, 10]
  return SERVICE_TYPES.map((type, i) => ({
    type,
    days: Math.max(1, +(base[i] * (1 + ((h + i) % 200) / 1000 - 0.1)).toFixed(1)),
  }))
}

export function getServiceRequestStatusMatrix(filters: Filters): StatusMatrixRow[] {
  const h  = strHash(filters.financialYear + filters.month + filters.division + 'matrix')
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  const mf = filters.month === 'All' ? 1 : monthFactor(filters.month)
  const base = [380, 120, 290, 210, 430, 180]
  return SERVICE_TYPES.map((type, i) => {
    const volume     = jitter(Math.round(base[i] * df * ff * mf), h + i)
    const completed  = Math.round(volume * 0.72)
    const inProgress = Math.round(volume * 0.18)
    const open       = Math.max(0, volume - completed - inProgress)
    return { type, open, inProgress, completed }
  })
}

export function getConsumerGrowthTrend(filters: Filters): ConsumerGrowthPoint[] {
  const h  = strHash(filters.financialYear + filters.division + 'growth')
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  let consumers = Math.round(608000 * df * ff)
  return MONTHS.map((month, i) => {
    consumers += jitter(Math.round(1250 * df), h + i, 0.3)
    return { month, consumers }
  })
}

export function getConnectionsTrend(filters: Filters): ConnectionsPoint[] {
  const h  = strHash(filters.financialYear + filters.division + 'conn')
  const df = divFactor(filters.division)
  const ff = fyFactor(filters.financialYear)
  return MONTHS.map((month, i) => ({
    month,
    newConnections: jitter(Math.round(1420 * df * ff * monthFactor(month)), h + i),
    disconnections: jitter(Math.round(180  * df * ff), h + i + 30),
  }))
}

export function getConsumerCategoryDist(filters: Filters): ConsumerCategoryPoint[] {
  const h = strHash(filters.financialYear + filters.division + 'catdist')
  return [
    { name: 'Domestic',   color: '#2563EB', value: jitter(78, h,     0.05) },
    { name: 'Commercial', color: '#7C3AED', value: jitter(14, h + 1, 0.08) },
    { name: 'Industrial', color: '#EA580C', value: jitter(5,  h + 2, 0.15) },
    { name: 'Government', color: '#0891B2', value: jitter(3,  h + 3, 0.15) },
  ]
}

export function getDivisionHeatmapData(filters: Filters): HeatmapRow[] {
  const h  = strHash(filters.financialYear + 'heat')
  const ff = fyFactor(filters.financialYear)
  return DIVISIONS.map((division, i) => ({
    division,
    complaintVolume: jitter(Math.round(820 * ff), h + i,      0.20),
    slaCompliance:   Math.min(99, Math.max(68, jitter(88, h + i + 10, 0.10))),
    resolutionTime:  Math.max(1.5, +(4.2 * (1 + ((h + i + 20) % 200) / 1000 - 0.1)).toFixed(1)),
    pendingCases:    jitter(Math.round(80 * ff), h + i + 30, 0.25),
  }))
}

export function getDivisionMonthHeatmapData(filters: Filters, metric: HeatmapMetric): DivisionMonthCell[] {
  const h  = strHash(filters.financialYear + metric)
  const ff = fyFactor(filters.financialYear)
  return DIVISIONS.flatMap((div, di) =>
    MONTHS.map((month, mi) => {
      const seed = h + di * 100 + mi
      const mf   = monthFactor(month)
      let value: number
      if (metric === 'complaintVolume') {
        const base = 600 + (di % 7) * 80
        value = jitter(Math.round(base * ff * mf), seed, 0.15)
      } else if (metric === 'slaCompliance') {
        const base = 82 + (di % 5) * 3
        value = Math.min(99, Math.max(65, jitter(Math.round(base * ff), seed, 0.08)))
      } else if (metric === 'resolutionTime') {
        const base = 3.5 + (di % 6) * 0.5
        value = Math.max(1.5, Math.min(9.5, +(base * (1 + (seed % 200) / 1000 - 0.1)).toFixed(1)))
      } else {
        const base = 45 + (di % 6) * 20
        value = jitter(Math.round(base * ff), seed, 0.20)
      }
      return { division: div, month, value }
    })
  )
}

export function getDivisionTableData(filters: Filters): TableRow[] {
  const h  = strHash(filters.financialYear + 'table')
  const ff = fyFactor(filters.financialYear)
  const mf = filters.month === 'All' ? 1 : monthFactor(filters.month)
  return DIVISIONS.map((division, i) => {
    const df         = divFactor(division)
    const complaints = jitter(Math.round(4100 * df * ff * mf), h + i)
    const resolved   = jitter(Math.round(complaints * 0.91), h + i + 5)
    return {
      division,
      consumers:       jitter(Math.round(615000 * df * ff), h + i + 10),
      complaints,
      resolved,
      pending:         complaints - resolved,
      slaPercent:      Math.min(99, Math.max(68, jitter(88, h + i + 20, 0.10))),
      resolutionTime:  Math.max(1.5, +(4.2 * (1 + ((h + i + 30) % 200) / 1000 - 0.1)).toFixed(1)),
      newConnections:  jitter(Math.round(1420 * df * ff * mf), h + i + 40),
      serviceRequests: jitter(Math.round(2050 * df * ff * mf), h + i + 50),
    }
  })
}

export function getInsights(filters: Filters): InsightItem[] {
  const table = getDivisionTableData(filters)
  const cats  = getCategoryDistribution(filters)
  const trend = getComplaintTrend(filters)
  const kpi   = getKpiData(filters)

  const lowestSla   = [...table].sort((a, b) => a.slaPercent - b.slaPercent)[0]
  const highestPend = [...table].sort((a, b) => b.pending - a.pending)[0]
  const topCat      = [...cats].sort((a, b) => b.value - a.value)[0]
  const slaBreachCount = Math.round(kpi.openComplaints * 0.34)

  const h = strHash(filters.financialYear + filters.division + 'catgrowth')
  const catGrowthPct = Math.max(5, Math.min(45, jitter(18, h, 0.40)))

  const lastM  = trend[trend.length - 1]
  const prevM  = trend[trend.length - 2]
  const momPct = prevM
    ? Math.abs(Math.round(((lastM.received - prevM.received) / prevM.received) * 100))
    : 12
  const detDiv = [...table].sort((a, b) => b.complaints - a.complaints)[0]

  return [
    {
      id: 'lowest-sla', icon: 'alert-triangle', severity: 'error',
      label: 'Lowest SLA Compliance',
      value: lowestSla.division,
      context: `${lowestSla.slaPercent}% compliance`,
    },
    {
      id: 'largest-backlog', icon: 'clock', severity: 'error',
      label: 'Highest Pending Backlog',
      value: highestPend.division,
      context: `${highestPend.pending.toLocaleString()} open cases`,
    },
    {
      id: 'top-category', icon: 'zap', severity: 'warning',
      label: 'Fastest-Growing Category',
      value: topCat.name,
      context: `+${catGrowthPct}% vs prev month`,
    },
    {
      id: 'sla-breach', icon: 'timer', severity: 'warning',
      label: 'Complaints > SLA Threshold',
      value: slaBreachCount.toLocaleString(),
      context: 'cases older than 5-day target',
    },
    {
      id: 'deteriorating', icon: 'trending-up', severity: 'warning',
      label: 'Division Deteriorating MoM',
      value: detDiv.division,
      context: `+${momPct}% vs last month`,
    },
  ]
}
