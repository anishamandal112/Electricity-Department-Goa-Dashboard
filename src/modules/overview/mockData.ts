// --- Types ---

export interface Filters {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
}

export type OverviewHeatmapMetric =
  | 'atcLoss'
  | 'collectionEff'
  | 'slaCompliance'
  | 'smartMeterPct'
  | 'outstandingDues'

export type PerformerMetric = 'atcLoss' | 'collectionEff' | 'smartMeterPct'

export interface OverviewKpis {
  totalConsumers: number
  energyInput: number
  energySold: number
  openGrievances: number
  atcLoss: number
  revenueCollected: number
  collectionEfficiency: number
  smartMeterPenetration: number
}

export interface AtcLossPoint      { month: string; atcLoss: number }
export interface RevenueTrendPoint { month: string; billed: number; collected: number }
export interface SmartMeterPoint   { month: string; metersInstalled: number }
export interface HeatCell          { division: string; month: string; value: number }

export interface DivisionRank {
  division: string
  primary: number
  collectionEff: number
  grievances: number
}

export interface PerformerRankings {
  best: DivisionRank[]
  worst: DivisionRank[]
}

export interface ExecutiveAlert {
  id: string
  label: string
  value: string
  context: string
  severity: 'error' | 'warning'
  icon: 'trending-down' | 'alert-triangle' | 'zap'
}

// --- Constants ---

export const MONTHS = [
  'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar',
]

export const DIVISIONS = [
  'Ponda X', 'Margao XVI', 'Calangute XIV', 'Mapusa XVII', 'Mormugao IV',
  'Margao V', 'Bicholim XI', 'Mapusa XV', 'Vasco III', 'Quepem VIII',
  'South Urban VI', 'Cuncolim XVIII', 'Panaji II', 'Pernem XIII',
  'Panaji I', 'Valpoi XII', 'Sanguem VII', 'Canacona IX',
]

// --- Seed helper ---

function seed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// --- Generators ---

export function getOverviewKpis(filters: Filters): OverviewKpis {
  const s = seed(filters.financialYear + filters.month)
  const atcLoss             = parseFloat((13.0 + (s % 80) / 10).toFixed(1))
  const energyInput         = parseFloat((142.0 + (s % 120) / 10).toFixed(1))
  const energySold          = parseFloat((energyInput * (1 - atcLoss / 100)).toFixed(1))
  const revenueCollected    = parseFloat((138.0 + (s % 200) / 10).toFixed(1))
  const collectionEfficiency  = parseFloat((94.0 + (s % 50) / 10).toFixed(1))
  const smartMeterPenetration = parseFloat((25.0 + (s % 200) / 10).toFixed(1))
  const totalConsumers      = 612000 + (s % 25000)
  const openGrievances      = 180 + (s % 220)
  return {
    totalConsumers, energyInput, energySold, openGrievances,
    atcLoss, revenueCollected, collectionEfficiency, smartMeterPenetration,
  }
}

export function getAtcLossTrend(filters: Filters): AtcLossPoint[] {
  return MONTHS.map((month, i) => {
    const s = seed(filters.financialYear + month + 'atc')
    const raw = 16.0 + (s % 120) / 10 - i * 0.15
    return { month, atcLoss: parseFloat(Math.max(10, Math.min(30, raw)).toFixed(1)) }
  })
}

export function getRevenueTrend(filters: Filters): RevenueTrendPoint[] {
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'rev')
    const billed    = parseFloat((130.0 + (s % 120) / 10).toFixed(1))
    const collected = parseFloat((billed * (0.93 + (s % 60) / 1000)).toFixed(1))
    return { month, billed, collected }
  })
}

export function getSmartMeterTrend(filters: Filters): SmartMeterPoint[] {
  let cumulative = 45 + (seed(filters.financialYear + 'smstart') % 30)
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'sm')
    cumulative += 8 + (s % 15)
    return { month, metersInstalled: cumulative }
  })
}

export function getOverviewHeatmapData(
  filters: Filters,
  metric: OverviewHeatmapMetric,
): HeatCell[] {
  const cells: HeatCell[] = []
  for (const division of DIVISIONS) {
    for (const month of MONTHS) {
      const s = seed(filters.financialYear + division + month + metric)
      let value: number
      switch (metric) {
        case 'atcLoss':         value = parseFloat((10 + (s % 200) / 10).toFixed(1)); break
        case 'collectionEff':   value = parseFloat((88 + (s % 120) / 10).toFixed(1)); break
        case 'slaCompliance':   value = parseFloat((82 + (s % 150) / 10).toFixed(1)); break
        case 'smartMeterPct':   value = parseFloat((15 + (s % 550) / 10).toFixed(1)); break
        case 'outstandingDues': value = parseFloat((2  + (s % 150) / 10).toFixed(1)); break
        default:                value = 0
      }
      cells.push({ division, month, value })
    }
  }
  return cells
}

export function getPerformerRankings(
  filters: Filters,
  metric: PerformerMetric,
): PerformerRankings {
  const rows = DIVISIONS.map((division) => {
    const s             = seed(filters.financialYear + filters.month + division + 'rank')
    const atcLoss       = parseFloat((10 + (s % 200) / 10).toFixed(1))
    const collectionEff = parseFloat((88 + (s % 120) / 10).toFixed(1))
    const smartMeterPct = parseFloat((15 + (s % 550) / 10).toFixed(1))
    const grievances    = 5 + (s % 30)
    const primary       = metric === 'atcLoss' ? atcLoss
                        : metric === 'collectionEff' ? collectionEff
                        : smartMeterPct
    return { division, primary, collectionEff, grievances }
  })
  const sorted = [...rows].sort((a, b) =>
    metric === 'atcLoss' ? a.primary - b.primary : b.primary - a.primary,
  )
  return { best: sorted.slice(0, 5), worst: sorted.slice(-5).reverse() }
}

export function getExecutiveAlerts(filters: Filters): ExecutiveAlert[] {
  const s             = seed(filters.financialYear + filters.month + 'alerts')
  const worstAtcDiv   = DIVISIONS[s % DIVISIONS.length]
  const atcVal        = parseFloat((24 + (s % 60) / 10).toFixed(1))
  const worstCollDiv  = DIVISIONS[(s >> 4) % DIVISIONS.length]
  const collVal       = parseFloat((82 + (s % 60) / 10).toFixed(1))
  const grievanceCount = 45 + (s % 80)
  const smIssues      = 120 + (s % 200)
  const tFailures     = 18 + (s % 20)
  return [
    {
      id: 'atc',
      label: 'Highest AT&C Loss',
      value: `${worstAtcDiv} — ${atcVal}%`,
      context: `${(atcVal - 15).toFixed(1)}pp above dept. target of 15%`,
      severity: 'error',
      icon: 'trending-down',
    },
    {
      id: 'coll',
      label: 'Lowest Collection Eff.',
      value: `${worstCollDiv} — ${collVal}%`,
      context: `${(96 - collVal).toFixed(1)}pp below dept. average`,
      severity: 'error',
      icon: 'trending-down',
    },
    {
      id: 'griev',
      label: 'Rising Complaint Volumes',
      value: `${grievanceCount} new this month`,
      context: 'Up 18% vs same period last year',
      severity: 'warning',
      icon: 'alert-triangle',
    },
    {
      id: 'sm',
      label: 'Smart Meter Comm. Issues',
      value: `${smIssues} meters offline`,
      context: 'Communication failure > 48 hrs',
      severity: 'warning',
      icon: 'zap',
    },
    {
      id: 'tf',
      label: 'Rising Transformer Failures',
      value: `${tFailures} failures this month`,
      context: 'Up 22% vs last month',
      severity: 'warning',
      icon: 'alert-triangle',
    },
  ]
}
