import type { ChartCardProps } from '../../types'

export function ChartCard({ title, timeContext, children }: ChartCardProps) {
  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4">
      <div className="mb-3">
        <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
        {timeContext && (
          <p className="text-[12px] text-text-secondary mt-0.5">{timeContext}</p>
        )}
      </div>
      <div className="min-h-[220px]">{children}</div>
    </div>
  )
}
