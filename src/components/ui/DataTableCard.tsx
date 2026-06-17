import type { DataTableCardProps } from '../../types'

export function DataTableCard({ title, columns, data }: DataTableCardProps) {
  return (
    <div className="bg-surface border border-border-base rounded-xl shadow-sm">
      <div className="px-4 py-3 border-b border-border-base">
        <h3 className="text-[14px] font-semibold text-text-primary">{title}</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border-base bg-background">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-secondary uppercase tracking-wide whitespace-nowrap"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-text-secondary text-[13px]"
                >
                  No data available
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border-base last:border-0 hover:bg-background transition-colors"
                >
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-2.5 text-text-primary">
                      {String(row[col.key] ?? '')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
