import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { KpiCard } from './KpiCard'

const base = {
  label: 'AT&C Loss',
  value: '12.4%',
  trend: '1.2%',
  trendDirection: 'down' as const,
  trendIsPositive: true,
  comparisonLabel: 'vs Last Month',
}

describe('KpiCard', () => {
  it('renders label and value', () => {
    render(<KpiCard {...base} />)
    expect(screen.getByText('AT&C Loss')).toBeInTheDocument()
    expect(screen.getByText('12.4%')).toBeInTheDocument()
  })

  it('renders down arrow for trendDirection down', () => {
    render(<KpiCard {...base} />)
    expect(screen.getByText(/↓/)).toBeInTheDocument()
  })

  it('renders up arrow for trendDirection up', () => {
    render(<KpiCard {...base} trendDirection="up" />)
    expect(screen.getByText(/↑/)).toBeInTheDocument()
  })

  it('applies success color when trendIsPositive', () => {
    const { container } = render(<KpiCard {...base} trendIsPositive={true} />)
    expect(container.querySelector('.text-success')).toBeInTheDocument()
  })

  it('applies error color when not trendIsPositive', () => {
    const { container } = render(<KpiCard {...base} trendIsPositive={false} />)
    expect(container.querySelector('.text-error')).toBeInTheDocument()
  })
})
