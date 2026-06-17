import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { act } from '@testing-library/react'
import { GlobalFilterBar } from './GlobalFilterBar'
import { useFilterStore } from '../../store/filterStore'

describe('GlobalFilterBar', () => {
  beforeEach(() => {
    act(() => { useFilterStore.getState().resetFilters() })
  })

  it('renders all 5 filter selects', () => {
    render(<GlobalFilterBar />)
    expect(screen.getByRole('combobox', { name: 'Financial Year' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Month' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Circle' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Division' })).toBeInTheDocument()
    expect(screen.getByRole('combobox', { name: 'Subdivision' })).toBeInTheDocument()
  })

  it('defaults financial year to 2024-25', () => {
    render(<GlobalFilterBar />)
    const sel = screen.getByRole('combobox', { name: 'Financial Year' }) as HTMLSelectElement
    expect(sel.value).toBe('2024-25')
  })

  it('updates store when month changes', async () => {
    render(<GlobalFilterBar />)
    const sel = screen.getByRole('combobox', { name: 'Month' })
    await userEvent.selectOptions(sel, 'April')
    expect(useFilterStore.getState().month).toBe('April')
  })
})
