// --- Types ---

export interface Filters {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
}

export type HeatmapMetric = 'collectionEfficiency' | 'outstandingDues'

export interface ProcurementKpis {
  totalEnergyProcured: number   // MU
  procurementCost: number       // ₹ Cr
  acs: number                   // ₹/kWh
  appc: number                  // ₹/kWh
  renewableShare: number        // %
  peakProcurementCost: number   // ₹/kWh
}

export interface CostTrendPoint    { month: string; cost: number }
export interface AppCTrendPoint    { month: string; appc: number }
export interface RenewableTrendPoint { month: string; renewable: number }
export interface DivisionHeatCell  { division: string; month: string; value: number }

export interface DivisionTableRow {
  division: string
  energyProcured: number    // MU
  procurementCost: number   // ₹ Cr
  collectionEff: number     // %
  outstandingDues: number   // ₹ Cr
  renewableShare: number    // %
  attention: 'critical' | 'warning' | 'ok'
}

export interface ProcurementInsight {
  id: string
  label: string
  value: string
  context: string
  severity: 'error' | 'warning'
  icon: 'trending-up' | 'alert-triangle' | 'zap' | 'trending-down'
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

export function getProcurementKpis(filters: Filters): ProcurementKpis {
  const s = seed(filters.financialYear + filters.month)
  const totalEnergyProcured = parseFloat((165.0 + (s % 200) / 10).toFixed(1))
  const appc                = parseFloat((5.10 + (s % 80) / 100).toFixed(2))
  const procurementCost     = parseFloat(((totalEnergyProcured * appc) / 10).toFixed(2))
  const acs                 = parseFloat((appc + 1.40 + (s % 40) / 100).toFixed(2))
  const renewableShare      = parseFloat((18.0 + (s % 160) / 10).toFixed(1))
  const peakProcurementCost = parseFloat((7.80 + (s % 120) / 100).toFixed(2))
  return { totalEnergyProcured, procurementCost, acs, appc, renewableShare, peakProcurementCost }
}

export function getCostTrend(filters: Filters): CostTrendPoint[] {
  return MONTHS.map((month, i) => {
    const s    = seed(filters.financialYear + month + 'cost')
    const cost = parseFloat((85.0 + i * 3.2 + (s % 140) / 10).toFixed(1))
    return { month, cost }
  })
}

export function getAppcTrend(filters: Filters): AppCTrendPoint[] {
  return MONTHS.map((month) => {
    const s    = seed(filters.financialYear + month + 'appc')
    const appc = parseFloat((4.90 + (s % 90) / 100).toFixed(2))
    return { month, appc }
  })
}

export function getRenewableTrend(filters: Filters): RenewableTrendPoint[] {
  return MONTHS.map((month, i) => {
    const s         = seed(filters.financialYear + month + 'renew')
    const base      = i < 3 ? 22 : i < 6 ? 18 : i < 9 ? 20 : 24  // seasonal variation
    const renewable = parseFloat((base + (s % 80) / 10).toFixed(1))
    return { month, renewable }
  })
}

export function getDivisionHeatmapData(
  filters: Filters,
  metric: HeatmapMetric,
): DivisionHeatCell[] {
  const cells: DivisionHeatCell[] = []
  for (const division of DIVISIONS) {
    for (const month of MONTHS) {
      const s = seed(filters.financialYear + division + month + metric)
      let value: number
      if (metric === 'collectionEfficiency') {
        value = parseFloat((80.0 + (s % 180) / 10).toFixed(1))
      } else {
        value = parseFloat((0.8 + (s % 55) / 10).toFixed(1))
      }
      cells.push({ division, month, value })
    }
  }
  return cells
}

export function getDivisionTableData(filters: Filters): DivisionTableRow[] {
  return DIVISIONS.map((division) => {
    const s              = seed(filters.financialYear + filters.month + division)
    const energyProcured = parseFloat((8.0 + (s % 120) / 10).toFixed(1))
    const appc           = parseFloat((5.00 + (s % 80) / 100).toFixed(2))
    const procurementCost = parseFloat(((energyProcured * appc) / 10).toFixed(2))
    const collectionEff  = parseFloat((80.0 + (s % 180) / 10).toFixed(1))
    const outstandingDues = parseFloat((0.8 + (s % 55) / 10).toFixed(1))
    const renewableShare  = parseFloat((15.0 + (s % 200) / 10).toFixed(1))
    const attention: DivisionTableRow['attention'] =
      collectionEff < 84 || outstandingDues > 5.0
        ? 'critical'
        : collectionEff < 90 || outstandingDues > 3.5
        ? 'warning'
        : 'ok'
    return { division, energyProcured, procurementCost, collectionEff, outstandingDues, renewableShare, attention }
  })
}

export function getInsights(filters: Filters): ProcurementInsight[] {
  const table = getDivisionTableData(filters)

  const lowestColl = [...table].sort((a, b) => a.collectionEff - b.collectionEff)[0]
  const highestDues = [...table].sort((a, b) => b.outstandingDues - a.outstandingDues)[0]
  const s = seed(filters.financialYear + filters.month + 'insights')
  const costIncreasePct = parseFloat((8.0 + (s % 120) / 10).toFixed(1))
  const worstDiv = [...table].sort((a, b) =>
    (a.collectionEff - b.collectionEff) + (b.outstandingDues - a.outstandingDues)
  )[0]
  const renewTrend = getRenewableTrend(filters)
  const lastRenew  = renewTrend[renewTrend.length - 1]?.renewable ?? 22

  return [
    {
      id: 'cost-increase',
      label: 'Highest Procurement Cost Increase',
      value: `+${costIncreasePct}% MoM`,
      context: `${DIVISIONS[s % DIVISIONS.length]} — peak hour purchases up sharply`,
      severity: costIncreasePct > 12 ? 'error' : 'warning',
      icon: 'trending-up',
    },
    {
      id: 'low-collection',
      label: 'Lowest Collection Efficiency',
      value: `${lowestColl.collectionEff}%`,
      context: `${lowestColl.division} — below 85% threshold`,
      severity: lowestColl.collectionEff < 84 ? 'error' : 'warning',
      icon: 'trending-down',
    },
    {
      id: 'high-dues',
      label: 'Highest Outstanding Dues',
      value: `₹${highestDues.outstandingDues} Cr`,
      context: `${highestDues.division} — aging >90 days`,
      severity: highestDues.outstandingDues > 4.5 ? 'error' : 'warning',
      icon: 'alert-triangle',
    },
    {
      id: 'deteriorating',
      label: 'Deteriorating Financial Performance',
      value: `${worstDiv.division}`,
      context: `Collection ${worstDiv.collectionEff}% + dues ₹${worstDiv.outstandingDues} Cr`,
      severity: worstDiv.attention === 'critical' ? 'error' : 'warning',
      icon: 'alert-triangle',
    },
    {
      id: 'renewable-threshold',
      label: 'Renewable Target Below Threshold',
      value: `${lastRenew}%`,
      context: lastRenew < 25 ? `Below 25% target — ${(25 - lastRenew).toFixed(1)}% gap` : 'On track with 25% target',
      severity: lastRenew < 20 ? 'error' : 'warning',
      icon: 'zap',
    },
  ]
}
