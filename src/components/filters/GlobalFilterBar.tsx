import { useFilterStore } from '../../store/filterStore'

const FINANCIAL_YEARS = ['2022-23', '2023-24', '2024-25', '2025-26']
const MONTHS = [
  'All', 'April', 'May', 'June', 'July', 'August', 'September',
  'October', 'November', 'December', 'January', 'February', 'March',
]
const CIRCLES = ['All', 'North Goa', 'South Goa']
const DIVISIONS = ['All', 'Panaji', 'Mapusa', 'Margao', 'Vasco', 'Ponda', 'Bicholim']
const SUBDIVISIONS = [
  'All', 'Panaji-1', 'Panaji-2', 'Mapusa-1', 'Margao-1', 'Margao-2', 'Vasco-1',
]

const selectCls =
  'text-[13px] border border-border-base rounded-lg px-3 py-1.5 bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary cursor-pointer'

export function GlobalFilterBar() {
  const { financialYear, month, circle, division, subdivision, setFilter, resetFilters } =
    useFilterStore()

  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border-base px-6 py-2.5 flex items-center gap-3 flex-wrap">
      <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wide shrink-0">
        Filters
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

      <select
        value={month}
        onChange={(e) => setFilter('month', e.target.value)}
        className={selectCls}
        aria-label="Month"
      >
        {MONTHS.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>

      <select
        value={circle}
        onChange={(e) => setFilter('circle', e.target.value)}
        className={selectCls}
        aria-label="Circle"
      >
        {CIRCLES.map((c) => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <select
        value={division}
        onChange={(e) => setFilter('division', e.target.value)}
        className={selectCls}
        aria-label="Division"
      >
        {DIVISIONS.map((d) => (
          <option key={d} value={d}>{d}</option>
        ))}
      </select>

      <select
        value={subdivision}
        onChange={(e) => setFilter('subdivision', e.target.value)}
        className={selectCls}
        aria-label="Subdivision"
      >
        {SUBDIVISIONS.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      <button
        onClick={resetFilters}
        className="ml-auto text-[12px] text-text-secondary hover:text-primary transition-colors"
      >
        Reset
      </button>
    </div>
  )
}
