import { describe, it, expect, beforeEach } from 'vitest'
import { act } from '@testing-library/react'
import { useFilterStore } from './filterStore'

describe('filterStore', () => {
  beforeEach(() => {
    act(() => { useFilterStore.getState().resetFilters() })
  })

  it('has correct defaults', () => {
    const s = useFilterStore.getState()
    expect(s.financialYear).toBe('2024-25')
    expect(s.month).toBe('All')
    expect(s.circle).toBe('All')
    expect(s.division).toBe('All')
    expect(s.subdivision).toBe('All')
  })

  it('setFilter updates a single key', () => {
    act(() => { useFilterStore.getState().setFilter('month', 'April') })
    const s = useFilterStore.getState()
    expect(s.month).toBe('April')
    expect(s.circle).toBe('All')
  })

  it('resetFilters restores defaults', () => {
    act(() => {
      useFilterStore.getState().setFilter('month', 'June')
      useFilterStore.getState().setFilter('circle', 'North Goa')
    })
    act(() => { useFilterStore.getState().resetFilters() })
    const s = useFilterStore.getState()
    expect(s.month).toBe('All')
    expect(s.circle).toBe('All')
  })
})
