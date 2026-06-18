import type { SectionContainerProps } from '../../types'

export function SectionContainer({ title, children, action }: SectionContainerProps) {
  return (
    <section className="px-6 mb-6">
      {(title || action) && (
        <div className="flex items-center justify-between mb-3">
          {title && <h2 className="text-[20px] font-semibold text-text-primary">{title}</h2>}
          {action && <div>{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}
