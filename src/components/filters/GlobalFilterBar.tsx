import { useFilterStore } from '../../store/filterStore'

const FINANCIAL_YEARS = ['2022-23', '2023-24', '2024-25', '2025-26']

const selectCls =
  'text-[12px] border border-border-base rounded-lg px-2.5 py-1 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer'

export function GlobalFilterBar() {
  const { financialYear, setFilter } = useFilterStore()

  return (
    <>
      <span className="text-[10px] font-semibold text-text-secondary uppercase tracking-wide shrink-0">
        Financial Year
      </span>

      <select
        value={financialYear}
        onChange={(e) => setFilter('financialYear', e.target.value)}
        className={selectCls}
        aria-label="Financial Year"
      >
        {FINANCIAL_YEARS.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
    </>
  )
}
