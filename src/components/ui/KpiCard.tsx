import type { KpiCardProps } from '../../types'

export function KpiCard({
  label,
  value,
  trend,
  trendDirection,
  trendIsPositive,
  comparisonLabel,
  benchmark,
}: KpiCardProps) {
  const arrow =
    trendDirection === 'down' ? '↓' : trendDirection === 'up' ? '↑' : '→'

  const trendColor = trendIsPositive ? 'text-success' : 'text-error'
  const isNeutral = trendDirection === 'neutral'

  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm p-4 min-h-[100px] flex flex-col justify-between">
      <p className="text-[13px] font-semibold text-text-secondary truncate">{label}</p>
      <p className="text-[26px] font-bold text-text-primary leading-none mt-1">{value}</p>
      <p className={`text-[12px] mt-1 ${isNeutral ? 'text-text-secondary' : trendColor}`}>
        {arrow} {trend}{' '}
        <span className="text-text-secondary font-normal">{comparisonLabel}</span>
      </p>
      {benchmark && (
        <p className="text-[12px] text-[#9CA3AF] mt-1">{benchmark}</p>
      )}
    </div>
  )
}
