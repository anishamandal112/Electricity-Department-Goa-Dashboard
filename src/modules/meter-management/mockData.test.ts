import { describe, it, expect } from 'vitest'
import {
  getMeterKpis, getRolloutTrend, getSmartVsConventional,
  getInstallProgressByDivision, getHeatmapData,
  getMeterStatusDist, getTopIssueDivisions, getNewVsReplacement,
  getAdoptionByCategory, getDivisionTableData, getInsights,
  MONTHS, DIVISIONS,
  type Filters,
} from './mockData'

const F: Filters = {
  financialYear: '2024-25', month: 'All',
  circle: 'All', division: 'All', subdivision: 'All',
}

describe('DIVISIONS / MONTHS', () => {
  it('has 18 divisions', () => {
    expect(DIVISIONS).toHaveLength(18)
  })
  it('has 12 months starting Apr ending Mar', () => {
    expect(MONTHS).toHaveLength(12)
    expect(MONTHS[0]).toBe('Apr')
    expect(MONTHS[11]).toBe('Mar')
  })
})

describe('getMeterKpis', () => {
  it('is deterministic', () => {
    expect(getMeterKpis(F)).toEqual(getMeterKpis(F))
  })
  it('totalMeters in 270000–300000', () => {
    const v = getMeterKpis(F).totalMeters
    expect(v).toBeGreaterThanOrEqual(270000)
    expect(v).toBeLessThanOrEqual(300000)
  })
  it('smartPenetration in 25–45', () => {
    const v = getMeterKpis(F).smartPenetration
    expect(v).toBeGreaterThanOrEqual(25)
    expect(v).toBeLessThanOrEqual(45)
  })
  it('commSuccessRate in 85–97', () => {
    const v = getMeterKpis(F).commSuccessRate
    expect(v).toBeGreaterThanOrEqual(85)
    expect(v).toBeLessThanOrEqual(97)
  })
  it('varies between financial years', () => {
    const a = getMeterKpis({ ...F, financialYear: '2023-24' }).totalMeters
    const b = getMeterKpis({ ...F, financialYear: '2025-26' }).totalMeters
    expect(a).not.toBe(b)
  })
})

describe('getRolloutTrend', () => {
  it('returns 12 months', () => {
    expect(getRolloutTrend(F)).toHaveLength(12)
  })
  it('first month is Apr, last is Mar', () => {
    const t = getRolloutTrend(F)
    expect(t[0].month).toBe('Apr')
    expect(t[11].month).toBe('Mar')
  })
  it('smart values are positive', () => {
    getRolloutTrend(F).forEach(p => expect(p.smart).toBeGreaterThan(0))
  })
})

describe('getSmartVsConventional', () => {
  it('returns 2 slices', () => {
    expect(getSmartVsConventional(F)).toHaveLength(2)
  })
  it('slices named Smart and Conventional', () => {
    const names = getSmartVsConventional(F).map(s => s.name)
    expect(names).toContain('Smart')
    expect(names).toContain('Conventional')
  })
  it('both values are positive', () => {
    getSmartVsConventional(F).forEach(s => expect(s.value).toBeGreaterThan(0))
  })
})

describe('getInstallProgressByDivision', () => {
  it('returns 18 rows', () => {
    expect(getInstallProgressByDivision(F)).toHaveLength(18)
  })
  it('all smartPct in 15–60', () => {
    getInstallProgressByDivision(F).forEach(d => {
      expect(d.smartPct).toBeGreaterThanOrEqual(15)
      expect(d.smartPct).toBeLessThanOrEqual(60)
    })
  })
  it('target is 30 for all rows', () => {
    getInstallProgressByDivision(F).forEach(d => expect(d.target).toBe(30))
  })
  it('sorted descending by smartPct', () => {
    const rows = getInstallProgressByDivision(F)
    for (let i = 0; i < rows.length - 1; i++) {
      expect(rows[i].smartPct).toBeGreaterThanOrEqual(rows[i + 1].smartPct)
    }
  })
})

describe('getHeatmapData', () => {
  it('returns 216 cells (18 × 12)', () => {
    expect(getHeatmapData(F, 'commSuccess')).toHaveLength(216)
  })
  it('commSuccess cells in 75–99', () => {
    getHeatmapData(F, 'commSuccess').forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(75)
      expect(c.value).toBeLessThanOrEqual(99)
    })
  })
  it('readSuccess cells in 82–99', () => {
    getHeatmapData(F, 'readSuccess').forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(82)
      expect(c.value).toBeLessThanOrEqual(99)
    })
  })
  it('nonCommunicating cells are positive integers', () => {
    getHeatmapData(F, 'nonCommunicating').forEach(c => {
      expect(c.value).toBeGreaterThan(0)
      expect(Number.isInteger(c.value)).toBe(true)
    })
  })
  it('faultyMeters cells are positive integers', () => {
    getHeatmapData(F, 'faultyMeters').forEach(c => {
      expect(c.value).toBeGreaterThan(0)
      expect(Number.isInteger(c.value)).toBe(true)
    })
  })
  it('different metrics produce different values for same cell', () => {
    const a = getHeatmapData(F, 'commSuccess')[0].value
    const b = getHeatmapData(F, 'nonCommunicating')[0].value
    expect(a).not.toBe(b)
  })
  it('is deterministic', () => {
    expect(getHeatmapData(F, 'commSuccess')).toEqual(getHeatmapData(F, 'commSuccess'))
  })
})

describe('getMeterStatusDist', () => {
  it('returns 5 slices', () => {
    expect(getMeterStatusDist(F)).toHaveLength(5)
  })
  it('Active slice is the largest', () => {
    const slices = getMeterStatusDist(F)
    const active = slices.find(s => s.name === 'Active')!
    slices.forEach(s => {
      if (s.name !== 'Active') expect(active.value).toBeGreaterThan(s.value)
    })
  })
})

describe('getTopIssueDivisions', () => {
  it('returns 5 rows', () => {
    expect(getTopIssueDivisions(F)).toHaveLength(5)
  })
  it('sorted descending by value', () => {
    const rows = getTopIssueDivisions(F)
    for (let i = 0; i < rows.length - 1; i++) {
      expect(rows[i].value).toBeGreaterThanOrEqual(rows[i + 1].value)
    }
  })
  it('all values are positive', () => {
    getTopIssueDivisions(F).forEach(r => expect(r.value).toBeGreaterThan(0))
  })
})

describe('getNewVsReplacement', () => {
  it('returns 12 months', () => {
    expect(getNewVsReplacement(F)).toHaveLength(12)
  })
  it('newInstalls > replacements for all months', () => {
    getNewVsReplacement(F).forEach(p => expect(p.newInstalls).toBeGreaterThan(p.replacements))
  })
})

describe('getAdoptionByCategory', () => {
  it('returns 4 categories', () => {
    expect(getAdoptionByCategory(F)).toHaveLength(4)
  })
  it('all smartPct in 25–85', () => {
    getAdoptionByCategory(F).forEach(c => {
      expect(c.smartPct).toBeGreaterThanOrEqual(25)
      expect(c.smartPct).toBeLessThanOrEqual(85)
    })
  })
  it('contains Domestic, Commercial, Industrial, Government', () => {
    const cats = getAdoptionByCategory(F).map(c => c.category)
    expect(cats).toContain('Domestic')
    expect(cats).toContain('Commercial')
    expect(cats).toContain('Industrial')
    expect(cats).toContain('Government')
  })
})

describe('getDivisionTableData', () => {
  it('returns 18 rows', () => {
    expect(getDivisionTableData(F)).toHaveLength(18)
  })
  it('smartMeters <= totalMeters for all rows', () => {
    getDivisionTableData(F).forEach(r => expect(r.smartMeters).toBeLessThanOrEqual(r.totalMeters))
  })
  it('smartPct matches smartMeters/totalMeters', () => {
    getDivisionTableData(F).forEach(r => {
      const expected = parseFloat(((r.smartMeters / r.totalMeters) * 100).toFixed(1))
      expect(r.smartPct).toBe(expected)
    })
  })
  it('commSuccessPct in 78–99', () => {
    getDivisionTableData(F).forEach(r => {
      expect(r.commSuccessPct).toBeGreaterThanOrEqual(78)
      expect(r.commSuccessPct).toBeLessThanOrEqual(99)
    })
  })
  it('attentionFlag is critical, warning, or null', () => {
    getDivisionTableData(F).forEach(r => {
      expect(['critical', 'warning', null]).toContain(r.attentionFlag)
    })
  })
})

describe('getInsights', () => {
  it('returns 4–5 insights', () => {
    const n = getInsights(F).length
    expect(n).toBeGreaterThanOrEqual(4)
    expect(n).toBeLessThanOrEqual(5)
  })
  it('every insight has non-empty value and context', () => {
    getInsights(F).forEach(i => {
      expect(i.value.length).toBeGreaterThan(0)
      expect(i.context.length).toBeGreaterThan(0)
    })
  })
  it('includes low-comm insight', () => {
    const ids = getInsights(F).map(i => i.id)
    expect(ids).toContain('low-comm')
  })
  it('includes high-faulty insight', () => {
    const ids = getInsights(F).map(i => i.id)
    expect(ids).toContain('high-faulty')
  })
})
