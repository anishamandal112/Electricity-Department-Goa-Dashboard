import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Sidebar } from './Sidebar'

const renderSidebar = (collapsed = false) =>
  render(
    <MemoryRouter>
      <Sidebar collapsed={collapsed} onToggle={() => {}} />
    </MemoryRouter>
  )

describe('Sidebar', () => {
  it('renders all 6 nav item labels when expanded', () => {
    renderSidebar(false)
    expect(screen.getByText('Overview')).toBeInTheDocument()
    expect(screen.getByText('Consumer Services & Grievances')).toBeInTheDocument()
    expect(screen.getByText('Meter Management')).toBeInTheDocument()
    expect(screen.getByText('Distribution Operations')).toBeInTheDocument()
    expect(screen.getByText('Revenue & Billing')).toBeInTheDocument()
    expect(screen.getByText('Procurement & Finance')).toBeInTheDocument()
  })

  it('hides nav labels when collapsed', () => {
    renderSidebar(true)
    expect(screen.queryByText('Overview')).not.toBeInTheDocument()
  })

  it('renders collapse toggle button', () => {
    renderSidebar(false)
    expect(screen.getByRole('button', { name: /collapse sidebar/i })).toBeInTheDocument()
  })
})
