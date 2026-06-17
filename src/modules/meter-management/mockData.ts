// --- Types ---
export interface Filters {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
}

export type MeterHeatmapMetric =
  | 'commSuccess'
  | 'readSuccess'
  | 'nonCommunicating'
  | 'faultyMeters'

export interface DivisionMonthCell { division: string; month: string; value: number }

export interface MeterKpis {
  totalMeters: number
  smartMeters: number
  smartPenetration: number
  readSuccessRate: number
  commSuccessRate: number
  faultyNonComm: number
}

export interface MeterTableRow {
  division: string
  totalMeters: number
  smartMeters: number
  smartPct: number
  commSuccessPct: number
  readSuccessPct: number
  faultyMeters: number
  nonCommunicating: number
  replacements: number
  attentionFlag: 'critical' | 'warning' | null
}

export interface MeterInsight {
  id: string
  label: string
  value: string
  context: string
  severity: 'error' | 'warning'
  icon: 'wifi-off' | 'alert-triangle' | 'trending-down' | 'target' | 'refresh-cw'
}

export interface RolloutPoint { month: string; smart: number; conventional: number }
export interface StatusSlice { name: string; value: number; color: string }
export interface DivisionInstallBar { division: string; smartPct: number; target: number }
export interface DivisionIssueBar { division: string; value: number }
export interface CategoryBar { category: string; smartPct: number }
export interface NewVsReplacementPoint { month: string; newInstalls: number; replacements: number }

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

// --- Seed helpers ---
function seed(s: string): number {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0
  return Math.abs(h)
}

// --- Generators ---
export function getMeterKpis(filters: Filters): MeterKpis {
  const s = seed(filters.financialYear + filters.month)
  const totalMeters = 275000 + (s % 15000)
  const smartPct = 0.28 + (s % 100) / 580
  const smartMeters = Math.round(totalMeters * smartPct)
  const smartPenetration = parseFloat(((smartMeters / totalMeters) * 100).toFixed(1))
  const readSuccessRate = parseFloat((95.0 + (s % 20) / 5).toFixed(1))
  const commSuccessRate = parseFloat((88.0 + (s % 40) / 4.5).toFixed(1))
  const faultyNonComm = 3500 + (s % 2000)
  return { totalMeters, smartMeters, smartPenetration, readSuccessRate, commSuccessRate, faultyNonComm }
}

export function getRolloutTrend(filters: Filters): RolloutPoint[] {
  return MONTHS.map((month, i) => {
    const s = seed(filters.financialYear + month + 'rollout')
    const smart = 88000 + i * 1400 + (s % 900)
    const conventional = 192000 - i * 500 + (s % 600)
    return { month, smart, conventional }
  })
}

export function getSmartVsConventional(filters: Filters): StatusSlice[] {
  const kpi = getMeterKpis(filters)
  return [
    { name: 'Smart',        value: kpi.smartMeters,                   color: '#2563EB' },
    { name: 'Conventional', value: kpi.totalMeters - kpi.smartMeters, color: '#E5E7EB' },
  ]
}

export function getInstallProgressByDivision(filters: Filters): DivisionInstallBar[] {
  return getDivisionTableData(filters)
    .map((row) => ({ division: row.division, smartPct: row.smartPct, target: 30 }))
    .sort((a, b) => b.smartPct - a.smartPct)
}

export function getHeatmapData(filters: Filters, metric: MeterHeatmapMetric): DivisionMonthCell[] {
  const cells: DivisionMonthCell[] = []
  for (const division of DIVISIONS) {
    for (const month of MONTHS) {
      const s = seed(filters.financialYear + division + month + metric)
      let value: number
      if (metric === 'commSuccess') {
        value = parseFloat((78.0 + (s % 210) / 10).toFixed(1))
      } else if (metric === 'readSuccess') {
        value = parseFloat((84.0 + (s % 120) / 8).toFixed(1))
      } else if (metric === 'nonCommunicating') {
        value = 55 + (s % 420)
      } else {
        value = 28 + (s % 220)
      }
      cells.push({ division, month, value })
    }
  }
  return cells
}

export function getMeterStatusDist(filters: Filters): StatusSlice[] {
  const { totalMeters } = getMeterKpis(filters)
  return [
    { name: 'Active',            value: Math.round(totalMeters * 0.910), color: '#16A34A' },
    { name: 'Non-Communicating', value: Math.round(totalMeters * 0.040), color: '#F59E0B' },
    { name: 'Disconnected',      value: Math.round(totalMeters * 0.027), color: '#9CA3AF' },
    { name: 'Faulty',            value: Math.round(totalMeters * 0.015), color: '#DC2626' },
    { name: 'Tampered',          value: Math.round(totalMeters * 0.008), color: '#7C3AED' },
  ]
}

export function getTopIssueDivisions(filters: Filters): DivisionIssueBar[] {
  return getDivisionTableData(filters)
    .map((row) => ({ division: row.division, value: row.faultyMeters + row.nonCommunicating }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
}

export function getNewVsReplacement(filters: Filters): NewVsReplacementPoint[] {
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'install')
    const newInstalls = 900 + (s % 1100)
    const replacements = 280 + (s % 500)
    return { month, newInstalls, replacements }
  })
}

export function getAdoptionByCategory(filters: Filters): CategoryBar[] {
  const s = seed(filters.financialYear + filters.division + 'adoption')
  return [
    { category: 'Industrial', smartPct: 70 + (s % 12) },
    { category: 'Government', smartPct: 63 + ((s >> 4) % 12) },
    { category: 'Commercial', smartPct: 46 + ((s >> 8) % 14) },
    { category: 'Domestic',   smartPct: 28 + ((s >> 12) % 14) },
  ]
}

export function getDivisionTableData(filters: Filters): MeterTableRow[] {
  return DIVISIONS.map((division) => {
    const s = seed(filters.financialYear + division + 'table')
    const totalMeters = 9000 + (s % 26000)
    const rawPct = 0.18 + (s % 100) / 238
    const smartMeters = Math.round(totalMeters * rawPct)
    const smartPct = parseFloat(((smartMeters / totalMeters) * 100).toFixed(1))
    const commSuccessPct = parseFloat((80.0 + (s % 170) / 9).toFixed(1))
    const readSuccessPct = parseFloat((88.0 + (s % 110) / 10).toFixed(1))
    const faultyMeters = 38 + (s % 240)
    const nonCommunicating = 58 + (s % 380)
    const replacements = 90 + (s % 520)

    const isCritical = commSuccessPct < 82 || faultyMeters > 200 || nonCommunicating > 350
    const isWarning = !isCritical && (commSuccessPct < 88 || faultyMeters > 120 || nonCommunicating > 200 || smartPct < 22)
    const attentionFlag: MeterTableRow['attentionFlag'] = isCritical ? 'critical' : isWarning ? 'warning' : null

    return { division, totalMeters, smartMeters, smartPct, commSuccessPct, readSuccessPct, faultyMeters, nonCommunicating, replacements, attentionFlag }
  })
}

export function getInsights(filters: Filters): MeterInsight[] {
  const rows = getDivisionTableData(filters)
  const insights: MeterInsight[] = []

  const lowestComm = rows.reduce((a, b) => a.commSuccessPct < b.commSuccessPct ? a : b)
  insights.push({
    id: 'low-comm',
    label: 'Lowest Communication Success Rate',
    value: `${lowestComm.commSuccessPct}%`,
    context: `${lowestComm.division} — below 88% threshold`,
    severity: lowestComm.commSuccessPct < 82 ? 'error' : 'warning',
    icon: 'wifi-off',
  })

  const highestFaulty = rows.reduce((a, b) => a.faultyMeters > b.faultyMeters ? a : b)
  insights.push({
    id: 'high-faulty',
    label: 'Highest Faulty Meter Count',
    value: highestFaulty.faultyMeters.toLocaleString(),
    context: `${highestFaulty.division} — requires field inspection`,
    severity: highestFaulty.faultyMeters > 150 ? 'error' : 'warning',
    icon: 'alert-triangle',
  })

  const worstNonComm = rows.reduce((a, b) =>
    (a.nonCommunicating / a.totalMeters) > (b.nonCommunicating / b.totalMeters) ? a : b)
  insights.push({
    id: 'rising-failures',
    label: 'Rising Communication Failures',
    value: `${worstNonComm.nonCommunicating} meters`,
    context: `${worstNonComm.division} — highest non-communicating ratio`,
    severity: worstNonComm.nonCommunicating > 300 ? 'error' : 'warning',
    icon: 'trending-down',
  })

  const belowTarget = rows.filter((r) => r.smartPct < 30)
  if (belowTarget.length > 0) {
    const worst = belowTarget.reduce((a, b) => a.smartPct < b.smartPct ? a : b)
    insights.push({
      id: 'below-target',
      label: 'Rollout Below 30% Target',
      value: `${belowTarget.length} divisions`,
      context: `Worst: ${worst.division} at ${worst.smartPct}%`,
      severity: 'warning',
      icon: 'target',
    })
  }

  const highRepl = rows.filter((r) => r.replacements / r.totalMeters > 0.15)
  if (highRepl.length > 0) {
    const worst = highRepl.reduce((a, b) =>
      a.replacements / a.totalMeters > b.replacements / b.totalMeters ? a : b)
    insights.push({
      id: 'high-replacement',
      label: 'High Replacement Requirement',
      value: `${Math.round((worst.replacements / worst.totalMeters) * 100)}% replacement rate`,
      context: `${worst.division} — ${worst.replacements} replacements pending`,
      severity: 'warning',
      icon: 'refresh-cw',
    })
  }

  return insights
}
