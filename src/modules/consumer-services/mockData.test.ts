import { describe, it, expect } from 'vitest'
import {
  getKpiData, getComplaintTrend, getCategoryDistribution,
  getDivisionTableData, getInsights,
  getDivisionMonthHeatmapData, getServiceRequestStatusMatrix,
  type Filters,
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
    const div = getKpiData({ ...F, division: 'Panaji I' }).totalConsumers
    expect(div).toBeLessThan(all)
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
  it('returns 18 rows', () => {
    expect(getDivisionTableData(F)).toHaveLength(18)
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

describe('getInsights (updated)', () => {
  it('returns 5 insights', () => {
    expect(getInsights(F)).toHaveLength(5)
  })
  it('every insight has a non-empty value', () => {
    getInsights(F).forEach(i => expect(i.value.length).toBeGreaterThan(0))
  })
  it('includes sla-breach insight', () => {
    const ids = getInsights(F).map(i => i.id)
    expect(ids).toContain('sla-breach')
  })
  it('includes deteriorating insight', () => {
    const ids = getInsights(F).map(i => i.id)
    expect(ids).toContain('deteriorating')
  })
  it('lowest-sla division name is non-empty', () => {
    const sla = getInsights(F).find(i => i.id === 'lowest-sla')!
    expect(sla.value.length).toBeGreaterThan(0)
  })
})

describe('getDivisionMonthHeatmapData', () => {
  it('returns 216 cells (18 divisions × 12 months)', () => {
    expect(getDivisionMonthHeatmapData(F, 'complaintVolume')).toHaveLength(216)
  })
  it('all complaintVolume cells are positive', () => {
    getDivisionMonthHeatmapData(F, 'complaintVolume').forEach(c =>
      expect(c.value).toBeGreaterThan(0)
    )
  })
  it('slaCompliance cells are in 65–99', () => {
    getDivisionMonthHeatmapData(F, 'slaCompliance').forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(65)
      expect(c.value).toBeLessThanOrEqual(99)
    })
  })
  it('resolutionTime cells are in 1.5–9.5', () => {
    getDivisionMonthHeatmapData(F, 'resolutionTime').forEach(c => {
      expect(c.value).toBeGreaterThanOrEqual(1.5)
      expect(c.value).toBeLessThanOrEqual(9.5)
    })
  })
  it('metric change produces different values for same cell', () => {
    const a = getDivisionMonthHeatmapData(F, 'complaintVolume')[0].value
    const b = getDivisionMonthHeatmapData(F, 'slaCompliance')[0].value
    expect(a).not.toBe(b)
  })
  it('is deterministic', () => {
    expect(getDivisionMonthHeatmapData(F, 'pendingComplaints'))
      .toEqual(getDivisionMonthHeatmapData(F, 'pendingComplaints'))
  })
})

describe('getServiceRequestStatusMatrix', () => {
  it('returns 6 rows (one per service type)', () => {
    expect(getServiceRequestStatusMatrix(F)).toHaveLength(6)
  })
  it('open is non-negative', () => {
    getServiceRequestStatusMatrix(F).forEach(r =>
      expect(r.open).toBeGreaterThanOrEqual(0)
    )
  })
  it('all counts are positive integers', () => {
    getServiceRequestStatusMatrix(F).forEach(r => {
      expect(r.open + r.inProgress + r.completed).toBeGreaterThan(0)
    })
  })
  it('month filter changes values', () => {
    const all = getServiceRequestStatusMatrix(F)[0].completed
    const apr = getServiceRequestStatusMatrix({ ...F, month: 'Apr' })[0].completed
    expect(all).not.toBe(apr)
  })
})
