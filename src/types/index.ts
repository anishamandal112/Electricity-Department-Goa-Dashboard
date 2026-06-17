import type { ComponentType } from 'react'

export interface NavItem {
  icon: ComponentType<{ size?: number | string; className?: string }>
  label: string
  path: string
}

export interface KpiCardProps {
  label: string
  value: string
  trend: string
  trendDirection: 'up' | 'down' | 'neutral'
  trendIsPositive: boolean
  comparisonLabel: string
}

export interface ChartCardProps {
  title: string
  timeContext?: string
  children: React.ReactNode
}

export interface Column {
  key: string
  label: string
}

export interface DataTableCardProps {
  title: string
  columns: Column[]
  data: Record<string, unknown>[]
}

export interface SectionContainerProps {
  title: string
  children: React.ReactNode
  action?: React.ReactNode
}

export interface PageHeaderProps {
  title: string
  subtitle?: string
}
