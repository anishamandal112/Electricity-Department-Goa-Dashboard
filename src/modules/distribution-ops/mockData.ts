// --- Types ---
export interface Filters {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
}

export type DivisionHeatmapMetric = 'atcLoss' | 'saifi' | 'saidi' | 'outages' | 'dtFailures'

export interface DistributionKpis {
  energyInput: number
  energySold: number
  atcLoss: number
  distributionLoss: number
  peakDemand: number
  powerAvailability: number
}

export interface EnergyPoint      { month: string; energyInput: number; energySold: number }
export interface AtcLossPoint     { month: string; atcLoss: number }
export interface DivisionLossBar  { division: string; atcLoss: number }
export interface ReliabilityPoint { month: string; saifi: number; saidi: number }
export interface OutagePoint      { month: string; planned: number; unplanned: number }
export interface DtLoadingBar     { category: string; count: number }
export interface DtFailureBar     { division: string; failures: number }
export interface DivisionHeatCell { division: string; month: string; value: number }

export interface DivisionTableRow {
  division: string
  energyInput: number
  energySold: number
  atcLoss: number
  peakDemand: number
  saifi: number
  saidi: number
  outages: number
  dtFailures: number
  status: 'critical' | 'warning' | 'ok'
}

export interface DistributionInsight {
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

export function getDistributionKpis(filters: Filters): DistributionKpis {
  const s = seed(filters.financialYear + filters.month)
  const atcLoss          = parseFloat((13.0 + (s % 130) / 10).toFixed(1))
  const energyInput      = parseFloat((148.0 + (s % 160) / 10).toFixed(1))
  const distributionLoss = parseFloat((atcLoss * 0.67).toFixed(1))
  const energySold       = parseFloat((energyInput * (1 - atcLoss / 100)).toFixed(1))
  const peakDemand       = parseFloat((295.0 + (s % 160) / 5).toFixed(1))
  const powerAvailability = parseFloat((96.0 + (s % 35) / 10).toFixed(1))
  return { energyInput, energySold, atcLoss, distributionLoss, peakDemand, powerAvailability }
}

export function getEnergyTrend(filters: Filters): EnergyPoint[] {
  return MONTHS.map((month, i) => {
    const s = seed(filters.financialYear + month + 'energy')
    const energyInput = parseFloat((140.0 + i * 0.8 + (s % 140) / 10).toFixed(1))
    const atcPct = 0.14 + (s % 50) / 1000
    const energySold = parseFloat((energyInput * (1 - atcPct)).toFixed(1))
    return { month, energyInput, energySold }
  })
}

export function getAtcLossTrend(filters: Filters): AtcLossPoint[] {
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'atc')
    const atcLoss = parseFloat((13.5 + (s % 150) / 10).toFixed(1))
    return { month, atcLoss }
  })
}

export function getDivisionAtcRanking(filters: Filters): DivisionLossBar[] {
  return DIVISIONS
    .map((division) => {
      const s = seed(filters.financialYear + division + 'atcrank')
      const atcLoss = parseFloat((11.0 + (s % 190) / 10).toFixed(1))
      return { division, atcLoss }
    })
    .sort((a, b) => b.atcLoss - a.atcLoss)
}

export function getReliabilityTrend(filters: Filters): ReliabilityPoint[] {
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'reliability')
    const saifi = parseFloat((0.25 + (s % 90) / 100).toFixed(2))
    const saidi = parseFloat((1.0 + (s % 450) / 100).toFixed(2))
    return { month, saifi, saidi }
  })
}

export function getOutageTrend(filters: Filters): OutagePoint[] {
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'outage')
    const planned   = 8  + (s % 13)
    const unplanned = 14 + (s % 20)
    return { month, planned, unplanned }
  })
}

export function getDtLoadingDistribution(filters: Filters): DtLoadingBar[] {
  const s = seed(filters.financialYear + filters.division + 'dtload')
  return [
    { category: 'Normal',     count: 2400 + (s % 280) },
    { category: 'Overloaded', count: 320  + (s % 110) },
    { category: 'Critical',   count: 80   + (s % 55)  },
  ]
}

export function getTopDtFailureDivisions(filters: Filters): DtFailureBar[] {
  return DIVISIONS
    .map((division) => {
      const s = seed(filters.financialYear + division + 'dtfail')
      const failures = 2 + (s % 17)
      return { division, failures }
    })
    .sort((a, b) => b.failures - a.failures)
    .slice(0, 8)
}

export function getDivisionHeatmapData(
  filters: Filters,
  metric: DivisionHeatmapMetric,
): DivisionHeatCell[] {
  const cells: DivisionHeatCell[] = []
  for (const division of DIVISIONS) {
    for (const month of MONTHS) {
      const s = seed(filters.financialYear + division + month + metric)
      let value: number
      if (metric === 'atcLoss') {
        value = parseFloat((10.0 + (s % 230) / 10).toFixed(1))
      } else if (metric === 'saifi') {
        value = parseFloat((0.15 + (s % 120) / 100).toFixed(2))
      } else if (metric === 'saidi') {
        value = parseFloat((0.9 + (s % 480) / 100).toFixed(2))
      } else if (metric === 'outages') {
        value = 2 + (s % 17)
      } else {
        value = s % 11
      }
      cells.push({ division, month, value })
    }
  }
  return cells
}

export function getDivisionTableData(filters: Filters): DivisionTableRow[] {
  return DIVISIONS.map((division) => {
    const s = seed(filters.financialYear + division + 'distops')
    const energyInput = parseFloat((6.5 + (s % 120) / 10).toFixed(1))
    const atcLoss     = parseFloat((11.0 + (s % 180) / 10).toFixed(1))
    const energySold  = parseFloat((energyInput * (1 - atcLoss / 100)).toFixed(1))
    const peakDemand  = parseFloat((12.0 + (s % 200) / 5).toFixed(1))
    const saifi       = parseFloat((0.22 + (s % 90) / 100).toFixed(2))
    const saidi       = parseFloat((1.0  + (s % 480) / 100).toFixed(2))
    const outages     = 3 + (s % 19)
    const dtFailures  = s % 13
    const status: 'critical' | 'warning' | 'ok' =
      atcLoss > 22 || dtFailures > 8 ? 'critical'
      : atcLoss > 16 || dtFailures > 4 ? 'warning'
      : 'ok'
    return { division, energyInput, energySold, atcLoss, peakDemand, saifi, saidi, outages, dtFailures, status }
  })
}

export function getInsights(filters: Filters): DistributionInsight[] {
  const rows = getDivisionTableData(filters)

  const highestAtc    = [...rows].sort((a, b) => b.atcLoss - a.atcLoss)[0]
  const worstSaidi    = [...rows].sort((a, b) => b.saidi - a.saidi)[0]
  const mostOutages   = [...rows].sort((a, b) => b.outages - a.outages)[0]
  const risingDt      = [...rows].sort((a, b) => b.dtFailures - a.dtFailures)[0]
  const deteriorating = rows.find(r => r.status === 'critical') ?? rows.find(r => r.status === 'warning') ?? rows[0]

  return [
    {
      id: 'highest-atc',
      label: 'Highest AT&C Loss',
      value: highestAtc.division,
      context: `${highestAtc.atcLoss}% — ${highestAtc.atcLoss > 22 ? 'critical threshold exceeded' : 'above 15% target'}`,
      severity: 'error',
      icon: 'trending-down',
    },
    {
      id: 'worst-reliability',
      label: 'Worst Reliability (SAIDI)',
      value: worstSaidi.division,
      context: `${worstSaidi.saidi} hrs/consumer this month`,
      severity: 'error',
      icon: 'alert-triangle',
    },
    {
      id: 'most-outages',
      label: 'Most Outage-Prone',
      value: mostOutages.division,
      context: `${mostOutages.outages} outages this month`,
      severity: 'warning',
      icon: 'zap',
    },
    {
      id: 'rising-dt',
      label: 'Rising DT Failures',
      value: risingDt.division,
      context: `${risingDt.dtFailures} failures — trending up`,
      severity: 'warning',
      icon: 'alert-triangle',
    },
    {
      id: 'deteriorating',
      label: 'Month-on-Month Decline',
      value: deteriorating.division,
      context: `AT&C loss at ${deteriorating.atcLoss}% — deteriorating trend`,
      severity: 'warning',
      icon: 'trending-down',
    },
  ]
}
