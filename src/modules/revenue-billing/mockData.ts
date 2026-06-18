// --- Types ---
export interface Filters {
  financialYear: string
  month: string
  circle: string
  division: string
  subdivision: string
}

export type HeatmapMetric = 'collectionEfficiency' | 'billingEfficiency' | 'outstandingDues' | 'revenueCollected'

export interface RevenueKpis {
  revenueBilled: number
  revenueCollected: number
  collectionEfficiency: number
  billingEfficiency: number
  outstandingDues: number
  revenueRealization: number
}

export interface RevenueTrendPoint {
  month: string
  revenueBilled: number
  revenueCollected: number
}

export interface CollectionEfficiencyPoint { month: string; collectionEfficiency: number }
export interface BillingEfficiencyPoint    { month: string; billingEfficiency: number }
export interface OutstandingDuesPoint      { month: string; outstandingDues: number }

export interface DuesByCategory {
  category: string
  dues: number
  consumers: number
}

export interface AgingBucket {
  bucket: string
  amount: number
  percentage: number
}

export interface RecoveryFunnelStep {
  stage: string
  value: number
  unit: string
  loss: number | null
  lossLabel: string | null
}

export interface DivisionHeatCell {
  division: string
  month: string
  value: number
}

export interface DivisionTableRow {
  division: string
  revenueBilled: number
  revenueCollected: number
  billingEfficiency: number
  collectionEfficiency: number
  outstandingDues: number
  revenueRealization: number
  attention: 'low-collection' | 'high-dues' | 'growing-dues' | 'deteriorating' | 'below-target' | 'ok'
}

export interface RevenueInsight {
  id: string
  label: string
  value: string
  context: string
  severity: 'error' | 'warning'
  icon: 'trending-down' | 'alert-triangle' | 'rupee'
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

export function getRevenueKpis(filters: Filters): RevenueKpis {
  const s = seed(filters.financialYear + filters.month + 'rev')
  const revenueBilled        = parseFloat((148.0 + (s % 180) / 10).toFixed(1))
  const collectionEfficiency = parseFloat((88.0  + (s % 100) / 10).toFixed(1))
  const billingEfficiency    = parseFloat((91.0  + (s % 80)  / 10).toFixed(1))
  const revenueCollected     = parseFloat((revenueBilled * collectionEfficiency / 100).toFixed(1))
  const outstandingDues      = parseFloat((revenueBilled - revenueCollected + (s % 200) / 10).toFixed(1))
  const revenueRealization   = parseFloat((revenueCollected / revenueBilled * 100).toFixed(1))
  return { revenueBilled, revenueCollected, collectionEfficiency, billingEfficiency, outstandingDues, revenueRealization }
}

export function getRevenueTrend(filters: Filters): RevenueTrendPoint[] {
  return MONTHS.map((month, i) => {
    const s = seed(filters.financialYear + month + 'revtrend')
    const base = 130.0 + i * 1.2
    const revenueBilled    = parseFloat((base + (s % 160) / 10).toFixed(1))
    const collEff          = 0.87 + (s % 90) / 1000
    const revenueCollected = parseFloat((revenueBilled * collEff).toFixed(1))
    return { month, revenueBilled, revenueCollected }
  })
}

export function getCollectionEfficiencyTrend(filters: Filters): CollectionEfficiencyPoint[] {
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'colleff')
    const collectionEfficiency = parseFloat((87.0 + (s % 110) / 10).toFixed(1))
    return { month, collectionEfficiency }
  })
}

export function getBillingEfficiencyTrend(filters: Filters): BillingEfficiencyPoint[] {
  return MONTHS.map((month) => {
    const s = seed(filters.financialYear + month + 'billeff')
    const billingEfficiency = parseFloat((90.0 + (s % 80) / 10).toFixed(1))
    return { month, billingEfficiency }
  })
}

export function getOutstandingDuesTrend(filters: Filters): OutstandingDuesPoint[] {
  return MONTHS.map((month, i) => {
    const s = seed(filters.financialYear + month + 'dues')
    const base = 32.0 + i * 0.5
    const outstandingDues = parseFloat((base + (s % 80) / 10).toFixed(1))
    return { month, outstandingDues }
  })
}

export function getDuesByCategory(filters: Filters): DuesByCategory[] {
  const s = seed(filters.financialYear + filters.month + 'duescat')
  return [
    { category: 'Domestic',    dues: parseFloat((18.4 + (s % 80) / 10).toFixed(1)),  consumers: 42000 + (s % 8000) },
    { category: 'Commercial',  dues: parseFloat((9.2  + (s % 60) / 10).toFixed(1)),  consumers: 8400  + (s % 2000) },
    { category: 'Industrial',  dues: parseFloat((7.6  + (s % 50) / 10).toFixed(1)),  consumers: 620   + (s % 200)  },
    { category: 'Government',  dues: parseFloat((3.5  + (s % 40) / 10).toFixed(1)),  consumers: 1800  + (s % 500)  },
  ]
}

export function getAgingAnalysis(filters: Filters): AgingBucket[] {
  const s = seed(filters.financialYear + filters.month + 'aging')
  const a0_30  = parseFloat((14.2 + (s % 60) / 10).toFixed(1))
  const a31_60 = parseFloat((9.8  + (s % 50) / 10).toFixed(1))
  const a61_90 = parseFloat((6.4  + (s % 40) / 10).toFixed(1))
  const a90p   = parseFloat((8.3  + (s % 70) / 10).toFixed(1))
  const total  = a0_30 + a31_60 + a61_90 + a90p
  return [
    { bucket: '0–30 Days',  amount: a0_30,  percentage: parseFloat((a0_30  / total * 100).toFixed(1)) },
    { bucket: '31–60 Days', amount: a31_60, percentage: parseFloat((a31_60 / total * 100).toFixed(1)) },
    { bucket: '61–90 Days', amount: a61_90, percentage: parseFloat((a61_90 / total * 100).toFixed(1)) },
    { bucket: '90+ Days',   amount: a90p,   percentage: parseFloat((a90p   / total * 100).toFixed(1)) },
  ]
}

export function getRecoveryFunnel(filters: Filters): RecoveryFunnelStep[] {
  const s = seed(filters.financialYear + filters.month + 'funnel')
  const energyInput     = parseFloat((165.0 + (s % 200) / 10).toFixed(1))
  const billingEff      = 0.91 + (s % 70) / 1000
  const energyBilled    = parseFloat((energyInput * billingEff).toFixed(1))
  const tariff          = 4.82
  const revenueBilled   = parseFloat((energyBilled * tariff / 10).toFixed(1))
  const collEff         = 0.89 + (s % 80) / 1000
  const revenueCollected = parseFloat((revenueBilled * collEff).toFixed(1))
  const outstanding     = parseFloat((revenueBilled - revenueCollected).toFixed(1))

  return [
    { stage: 'Energy Input',        value: energyInput,      unit: 'MU',    loss: null,                                     lossLabel: null                            },
    { stage: 'Energy Billed',       value: energyBilled,     unit: 'MU',    loss: parseFloat((energyInput - energyBilled).toFixed(1)),    lossLabel: 'Unbilled Energy'     },
    { stage: 'Revenue Billed',      value: revenueBilled,    unit: '₹ Cr',  loss: null,                                     lossLabel: null                            },
    { stage: 'Revenue Collected',   value: revenueCollected, unit: '₹ Cr',  loss: parseFloat((revenueBilled - revenueCollected).toFixed(1)), lossLabel: 'Collection Gap'    },
    { stage: 'Outstanding Dues',    value: outstanding,      unit: '₹ Cr',  loss: null,                                     lossLabel: 'Pending Recovery'              },
  ]
}

export function getDivisionHeatmapData(filters: Filters, metric: HeatmapMetric): DivisionHeatCell[] {
  const cells: DivisionHeatCell[] = []
  for (const division of DIVISIONS) {
    for (const month of MONTHS) {
      const s = seed(filters.financialYear + division + month + metric)
      let value: number
      if (metric === 'collectionEfficiency') {
        value = parseFloat((82.0 + (s % 150) / 10).toFixed(1))
      } else if (metric === 'billingEfficiency') {
        value = parseFloat((86.0 + (s % 120) / 10).toFixed(1))
      } else if (metric === 'outstandingDues') {
        value = parseFloat((1.2  + (s % 120) / 10).toFixed(1))
      } else {
        value = parseFloat((6.0  + (s % 160) / 10).toFixed(1))
      }
      cells.push({ division, month, value })
    }
  }
  return cells
}

export function getDivisionTableData(filters: Filters): DivisionTableRow[] {
  return DIVISIONS.map((division) => {
    const s = seed(filters.financialYear + division + 'revbill')
    const revenueBilled        = parseFloat((7.2  + (s % 140) / 10).toFixed(1))
    const billingEfficiency    = parseFloat((87.0 + (s % 110) / 10).toFixed(1))
    const collectionEfficiency = parseFloat((82.0 + (s % 140) / 10).toFixed(1))
    const revenueCollected     = parseFloat((revenueBilled * collectionEfficiency / 100).toFixed(1))
    const outstandingDues      = parseFloat((revenueBilled - revenueCollected + (s % 50) / 10).toFixed(1))
    const revenueRealization   = parseFloat((revenueCollected / revenueBilled * 100).toFixed(1))

    let attention: DivisionTableRow['attention'] = 'ok'
    if (collectionEfficiency < 85)     attention = 'low-collection'
    else if (outstandingDues > 4.0)    attention = 'high-dues'
    else if (collectionEfficiency < 88) attention = 'below-target'
    else if (billingEfficiency < 90)    attention = 'deteriorating'

    return { division, revenueBilled, revenueCollected, billingEfficiency, collectionEfficiency, outstandingDues, revenueRealization, attention }
  })
}

export function getInsights(filters: Filters): RevenueInsight[] {
  const rows = getDivisionTableData(filters)
  const lowestColl  = [...rows].sort((a, b) => a.collectionEfficiency - b.collectionEfficiency)[0]
  const highestDues = [...rows].sort((a, b) => b.outstandingDues - a.outstandingDues)[0]
  const lowestBill  = [...rows].sort((a, b) => a.billingEfficiency - b.billingEfficiency)[0]
  const worstReal   = [...rows].sort((a, b) => a.revenueRealization - b.revenueRealization)[0]
  const belowTarget = rows.filter(r => r.collectionEfficiency < 88).length

  return [
    {
      id: 'lowest-collection',
      label: 'Lowest Collection Efficiency',
      value: lowestColl.division,
      context: `${lowestColl.collectionEfficiency}% — target is 92%`,
      severity: 'error',
      icon: 'trending-down',
    },
    {
      id: 'highest-dues',
      label: 'Highest Outstanding Dues',
      value: highestDues.division,
      context: `₹${highestDues.outstandingDues} Cr pending recovery`,
      severity: 'error',
      icon: 'rupee',
    },
    {
      id: 'lowest-billing',
      label: 'Lowest Billing Efficiency',
      value: lowestBill.division,
      context: `${lowestBill.billingEfficiency}% — unbilled consumers flagged`,
      severity: 'warning',
      icon: 'alert-triangle',
    },
    {
      id: 'worst-realization',
      label: 'Revenue Realization Decline',
      value: worstReal.division,
      context: `${worstReal.revenueRealization}% realization this period`,
      severity: 'warning',
      icon: 'trending-down',
    },
    {
      id: 'below-target',
      label: 'Divisions Below Target',
      value: `${belowTarget} Divisions`,
      context: `Collection efficiency < 88% target`,
      severity: 'warning',
      icon: 'alert-triangle',
    },
  ]
}
