import { describe, it, expect } from 'vitest'
import {
  getKpiData, getComplaintTrend, getCategoryDistribution,
  getDivisionTableData, getInsights, type Filters,
} from './mockData'

const F: Filters = {
  financialYear: '2024-25', month: 'All',
  circle: 'All', division: 'All', subdivision: 'All',
}

describe('getKpiData', () => {
  it('is deterministic', () => {
    expect(getKpiData(F)).toEqual(getKpiData(F))
  })
  it('consumers > 100 000 for All filters', () => {
    expect(getKpiData(F).totalConsumers).toBeGreaterThan(100000)
  })
  it('division filter reduces consumer count', () => {
    const all = getKpiData(F).totalConsumers
    const ng  = getKpiData({ ...F, division: 'North Goa' }).totalConsumers
    expect(ng).toBeLessThan(all)
  })
  it('slaCompliance in 70–99', () => {
    const v = getKpiData(F).slaCompliance
    expect(v).toBeGreaterThanOrEqual(70)
    expect(v).toBeLessThanOrEqual(99)
  })
  it('varies between financial years', () => {
    const a = getKpiData({ ...F, financialYear: '2023-24' }).totalConsumers
    const b = getKpiData({ ...F, financialYear: '2025-26' }).totalConsumers
    expect(a).not.toBe(b)
  })
})

describe('getComplaintTrend', () => {
  it('returns 12 months', () => {
    expect(getComplaintTrend(F)).toHaveLength(12)
  })
  it('first month is Apr, last is Mar', () => {
    const t = getComplaintTrend(F)
    expect(t[0].month).toBe('Apr')
    expect(t[11].month).toBe('Mar')
  })
  it('resolved < received for every month', () => {
    getComplaintTrend(F).forEach(p => expect(p.resolved).toBeLessThan(p.received))
  })
})

describe('getCategoryDistribution', () => {
  it('returns 7 categories', () => {
    expect(getCategoryDistribution(F)).toHaveLength(7)
  })
  it('all values positive', () => {
    getCategoryDistribution(F).forEach(c => expect(c.value).toBeGreaterThan(0))
  })
})

describe('getDivisionTableData', () => {
  it('returns 5 rows', () => {
    expect(getDivisionTableData(F)).toHaveLength(5)
  })
  it('pending === complaints − resolved', () => {
    getDivisionTableData(F).forEach(r =>
      expect(r.pending).toBe(r.complaints - r.resolved)
    )
  })
  it('slaPercent in 68–99', () => {
    getDivisionTableData(F).forEach(r => {
      expect(r.slaPercent).toBeGreaterThanOrEqual(68)
      expect(r.slaPercent).toBeLessThanOrEqual(99)
    })
  })
})

describe('getInsights', () => {
  it('returns 5 insights', () => {
    expect(getInsights(F)).toHaveLength(5)
  })
  it('every insight has a non-empty value', () => {
    getInsights(F).forEach(i => expect(i.value.length).toBeGreaterThan(0))
  })
})
