import type { PageHeaderProps } from '../../types'

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="px-6 pt-5 pb-3">
      <h1 className="text-[28px] font-bold text-text-primary leading-tight">{title}</h1>
      {subtitle && (
        <p className="text-[13px] text-text-secondary mt-1">{subtitle}</p>
      )}
    </div>
  )
}
