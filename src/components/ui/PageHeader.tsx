import type { PageHeaderProps } from '../../types'

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border-base px-6 py-3 flex items-center justify-between gap-6">
      <div className="min-w-0">
        <h1 className="text-[22px] font-bold text-text-primary leading-tight truncate">{title}</h1>
        {subtitle && (
          <p className="text-[12px] text-text-secondary mt-0.5 truncate">{subtitle}</p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-wrap shrink-0">
          {children}
        </div>
      )}
    </div>
  )
}
