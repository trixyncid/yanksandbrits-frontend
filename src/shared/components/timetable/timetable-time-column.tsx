import { cn } from '../../lib/cn'
import { formatHourLabel } from './utils'

type TimetableTimeColumnProps = {
  hours: number[]
  width: number
  headerHeight: number
  rowHeight: number
}

export function TimetableTimeColumn({
  hours,
  width,
  headerHeight,
  rowHeight,
}: TimetableTimeColumnProps) {
  return (
    <div
      className="sticky left-0 z-30 shrink-0 border-r border-[#4274B9]/25 shadow-[8px_0_16px_-12px_rgba(47,90,148,0.35)]"
      style={{ width }}
    >
      <div
        className="sticky top-0 z-40 flex items-center justify-center rounded-tl-2xl bg-gradient-to-b from-[#5A8BC9] via-[#4274B9] to-[#2F5A94] text-xs font-semibold text-white shadow-[0_6px_12px_-8px_rgba(47,90,148,0.45)]"
        style={{ height: headerHeight }}
      >
        Time
      </div>

      <div>
        {hours.map((hour, index) => (
          <div
            key={hour}
            className={cn(
              'flex items-start justify-center border-t border-white/15 bg-gradient-to-b from-[#5A8BC9] to-[#4274B9] px-2 pt-2.5 text-center text-[11px] font-medium text-white',
              index === hours.length - 1 ? 'rounded-bl-2xl' : '',
            )}
            style={{ height: rowHeight }}
          >
            {formatHourLabel(hour)}
          </div>
        ))}
      </div>
    </div>
  )
}
