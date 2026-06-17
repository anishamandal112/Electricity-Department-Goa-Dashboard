import { describe, it, expect } from 'vitest'
import {
  getDistributionKpis, getEnergyTrend, getAtcLossTrend, getDivisionAtcRanking,
  getReliabilityTrend, getOutageTrend, getDtLoadingDistribution, getTopDtFailureDivisions,
  getDivisionHeatmapData, getDivisionTableData, getInsights,
  MONTHS, DIVISIONS,
  type Filters,
} from './mockData'

const F: Filters = {
  financialYear: '2024-25', month: 'All',
  circle: 'All', division: 'All', subdivision: 'All',
}

describe('getDistributionKpis', () => {
  it('is deterministic', () => {
    expect(getDistributionKpis(F)).toEqual(getDistributionKpis(F))
  })
  it('energyInput > energySold', () => {
    const k = getDistributionKpis(F)
    expect(k.energyInput).toBeGreaterThan(k.energySold)
  })
  it('atcLoss in 12–28', () => {
    const v = getDistributionKpis(F).atcLoss
    expect(v).toBeGreaterThanOrEqual(12)
    expect(v).toBeLessThanOrEqual(28)
  })
  it('powerAvailability in 94–99.9', () => {
    const v = getDistributionKpis(F).powerAvailability
    expect(v).toBeGreaterThanOrEqual(94)
    expect(v).toBeLessThanOrEqual(99.9)
  })
  it('varies between financial years', () => {
    const a = getDistributionKpis({ ...F, financialYear: '2023-24' }).atcLoss
    const b = getDistributionKpis({ ...F, financialYear: '2025-26' }).atcLoss
    expect(a).not.toBe(b)
  })
})

describe('getEnergyTrend', () => {
  it('returns 12 months', () => expect(getEnergyTrend(F)).toHaveLength(12))
  it('first month is Apr, last is Mar', () => {
    const t = getEnergyTrend(F)
    expect(t[0].month).toBe('Apr')
    expect(t[11].month).toBe('Mar')
  })
  it('energyInput > energySold for every month', () => {
    getEnergyTrend(F).forEach(p => expect(p.energyInput).toBeGreaterThan(p.energySold))
  })
})

describe('getAtcLossTrend', () => {
  it('returns 12 months', () => expect(getAtcLossTrend(F)).toHaveLength(12))
  it('all atcLoss values in 10–30', () => {
    getAtcLossTrend(F).forEach(p => {
      expect(p.atcLoss).toBeGreaterThanOrEqual(10)
      expect(p.atcLoss).toBeLessThanOrEqual(30)
    })
  })
})

describe('getDivisionAtcRanking', () => {
  it('returns 18 rows', () => expect(getDivisionAtcRanking(F)).toHaveLength(18))
  it('sorted descending by atcLoss', () => {
    const rows = getDivisionAtcRanking(F)
    for (let i = 1; i < rows.length; i++)
      expect(rows[i - 1].atcLoss).toBeGreaterThanOrEqual(rows[i].atcLoss)
  })
})

describe('getReliabilityTrend', () => {
  it('returns 12 months', () => expect(getReliabilityTrend(F)).toHaveLength(12))
  it('saifi in 0.2–1.2', () => {
    getReliabilityTrend(F).forEach(p => {
      expect(p.saifi).toBeGreaterThanOrEqual(0.2)
      expect(p.saifi).toBeLessThanOrEqual(1.2)
    })
  })
  it('saidi in 0.8–6.0', () => {
    getReliabilityTrend(F).forEach(p => {
      expect(p.saidi).toBeGreaterThanOrEqual(0.8)
      expect(p.saidi).toBeLessThanOrEqual(6.0)
    })
  })
})

describe('getOutageTrend', () => {
  it('returns 12 months', () => expect(getOutageTrend(F)).toHaveLength(12))
  it('all counts positive', () => {
    getOutageTrend(F).forEach(p => {
      expect(p.planned).toBeGreaterThan(0)
      expect(p.unplanned).toBeGreaterThan(0)
    })
  })
})

describe('getDtLoadingDistribution', () => {
  it('returns exactly 3 rows', () => expect(getDtLoadingDistribution(F)).toHaveLength(3))
  it('categories are Normal, Overloaded, Critical', () => {
    const cats = getDtLoadingDistribution(F).map(r => r.category)
    expect(cats).toEqual(['Normal', 'Overloaded', 'Critical'])
  })
  it('all counts positive', () => {
    getDtLoadingDistribution(F).forEach(r => expect(r.count).toBeGreaterThan(0))
  })
})

describe('getTopDtFailureDivisions', () => {
  it('returns 8 rows', () => expect(getTopDtFailureDivisions(F)).toHaveLength(8))
  it('sorted descending by failures', () => {
    const rows = getTopDtFailureDivisions(F)
    for (let i = 1; i < rows.length; i++)
      expect(rows[i - 1].failures).toBeGreaterThanOrEqual(rows[i].failures)
  })
})

describe('getDivisionHeatmapData', () => {
  it('returns 216 cells (18 × 12)', () => {
    expect(getDivisionHeatmapData(F, 'atcLoss')).toHaveLength(216)
  })
  it('atcLoss cells in 8–35', () => {
    getDivisionHeatmapData(F, 'atcLoss').forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(8)
      expect(c.value).toBeLessThanOrEqual(35)
    })
  })
  it('saifi cells in 0.1–1.5', () => {
    getDivisionHeatmapData(F, 'saifi').forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(0.1)
      expect(c.value).toBeLessThanOrEqual(1.5)
    })
  })
  it('metric change produces different values', () => {
    const a = getDivisionHeatmapData(F, 'atcLoss')[0].value
    const b = getDivisionHeatmapData(F, 'saifi')[0].value
    expect(a).not.toBe(b)
  })
  it('is deterministic', () => {
    expect(getDivisionHeatmapData(F, 'outages')).toEqual(getDivisionHeatmapData(F, 'outages'))
  })
})

describe('getDivisionTableData', () => {
  it('returns 18 rows', () => expect(getDivisionTableData(F)).toHaveLength(18))
  it('all divisions present', () => {
    const names = getDivisionTableData(F).map(r => r.division)
    DIVISIONS.forEach(d => expect(names).toContain(d))
  })
  it('status is critical, warning, or ok', () => {
    getDivisionTableData(F).forEach(r =>
      expect(['critical', 'warning', 'ok']).toContain(r.status)
    )
  })
  it('atcLoss in 10–30 for all rows', () => {
    getDivisionTableData(F).forEach(r => {
      expect(r.atcLoss).toBeGreaterThanOrEqual(10)
      expect(r.atcLoss).toBeLessThanOrEqual(30)
    })
  })
})

describe('getInsights', () => {
  it('returns exactly 5 insights', () => expect(getInsights(F)).toHaveLength(5))
  it('every insight has a non-empty value', () => {
    getInsights(F).forEach(i => expect(i.value.length).toBeGreaterThan(0))
  })
  it('includes highest-atc insight', () => {
    expect(getInsights(F).map(i => i.id)).toContain('highest-atc')
  })
  it('includes deteriorating insight', () => {
    expect(getInsights(F).map(i => i.id)).toContain('deteriorating')
  })
  it('is deterministic', () => {
    expect(getInsights(F)).toEqual(getInsights(F))
  })
})

describe('MONTHS / DIVISIONS', () => {
  it('MONTHS has 12 entries starting Apr', () => {
    expect(MONTHS).toHaveLength(12)
    expect(MONTHS[0]).toBe('Apr')
    expect(MONTHS[11]).toBe('Mar')
  })
  it('DIVISIONS has 18 entries', () => {
    expect(DIVISIONS).toHaveLength(18)
  })
})
