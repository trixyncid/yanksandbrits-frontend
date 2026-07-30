import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'

import { cn } from '../../lib/cn'
import { TimetableEventCard } from './timetable-event-card'
import type {
  TimetableColumn,
  TimetableEvent,
  TimetableSlotRange,
} from './types'
import { formatHourLabel } from './utils'

type TimetableClassroomColumnProps = {
  column: TimetableColumn
  hours: number[]
  events: TimetableEvent[]
  width: number
  headerHeight: number
  rowHeight: number
  rangeStartHour: number
  isLast: boolean
  onEventClick?: (event: TimetableEvent) => void
  onSlotRangeSelect?: (
    column: TimetableColumn,
    range: TimetableSlotRange,
  ) => void
}

function normalizeRange(a: number, b: number): TimetableSlotRange {
  const startHour = Math.min(a, b)
  const endHour = Math.max(a, b) + 1
  return { startHour, endHour }
}

export function TimetableClassroomColumn({
  column,
  hours,
  events,
  width,
  headerHeight,
  rowHeight,
  rangeStartHour,
  isLast,
  onEventClick,
  onSlotRangeSelect,
}: TimetableClassroomColumnProps) {
  const [selection, setSelection] = useState<TimetableSlotRange | null>(null)
  const originHourRef = useRef<number | null>(null)
  const hoverHourRef = useRef<number | null>(null)
  const activePointerIdRef = useRef<number | null>(null)

  function hourFromClientY(
    clientY: number,
    target: HTMLElement,
  ): number | null {
    const bounds = target.getBoundingClientRect()
    const offsetY = clientY - bounds.top
    const index = Math.floor(offsetY / rowHeight)
    if (index < 0 || index >= hours.length) {
      return null
    }
    return hours[index] ?? null
  }

  function updateSelection(origin: number, hover: number) {
    hoverHourRef.current = hover
    setSelection(normalizeRange(origin, hover))
  }

  function clearDrag() {
    originHourRef.current = null
    hoverHourRef.current = null
    activePointerIdRef.current = null
    setSelection(null)
  }

  function handlePointerDown(
    event: ReactPointerEvent<HTMLButtonElement>,
    hour: number,
  ) {
    if (event.button !== 0 || !onSlotRangeSelect) {
      return
    }

    event.preventDefault()
    activePointerIdRef.current = event.pointerId
    originHourRef.current = hour
    updateSelection(hour, hour)

    const grid = event.currentTarget.parentElement
    if (grid instanceof HTMLElement) {
      grid.setPointerCapture(event.pointerId)
    }
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      activePointerIdRef.current == null ||
      event.pointerId !== activePointerIdRef.current ||
      originHourRef.current == null
    ) {
      return
    }

    const hour = hourFromClientY(event.clientY, event.currentTarget)
    if (hour == null) {
      return
    }

    updateSelection(originHourRef.current, hour)
  }

  function finishSelection(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      activePointerIdRef.current == null ||
      event.pointerId !== activePointerIdRef.current ||
      originHourRef.current == null
    ) {
      return
    }

    const origin = originHourRef.current
    const hover = hoverHourRef.current ?? origin
    const range = normalizeRange(origin, hover)

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    clearDrag()
    onSlotRangeSelect?.(column, range)
  }

  function handlePointerCancel(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      activePointerIdRef.current == null ||
      event.pointerId !== activePointerIdRef.current
    ) {
      return
    }
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    clearDrag()
  }

  const selectionLabel = selection
    ? `${formatHourLabel(selection.startHour)} – ${formatHourLabel(selection.endHour)}`
    : null

  return (
    <div
      className="relative shrink-0 border-r border-slate-200 last:border-r-0"
      style={{ width }}
    >
      <div
        className={cn(
          'sticky top-0 z-20 flex items-center justify-center border-b border-white/15 bg-gradient-to-b from-[#5A8BC9] via-[#4274B9] to-[#2F5A94] px-3 text-center text-xs font-semibold text-white shadow-[0_6px_12px_-8px_rgba(47,90,148,0.45)]',
          isLast ? 'rounded-tr-2xl' : '',
        )}
        style={{ height: headerHeight }}
      >
        {column.label}
      </div>

      <div
        className="relative touch-none select-none bg-white"
        style={{ height: hours.length * rowHeight }}
        onPointerMove={handlePointerMove}
        onPointerUp={finishSelection}
        onPointerCancel={handlePointerCancel}
      >
        {hours.map((hour, index) => {
          const isSelected =
            selection != null &&
            hour >= selection.startHour &&
            hour < selection.endHour

          return (
            <button
              key={`${column.id}-${hour}`}
              type="button"
              onPointerDown={(event) => handlePointerDown(event, hour)}
              className={cn(
                'absolute inset-x-0 border-t border-slate-200 transition-colors',
                isSelected ? 'bg-[#4274B9]/18' : 'hover:bg-[#F8FBFF]',
                index === hours.length - 1 && isLast ? 'rounded-br-2xl' : '',
              )}
              style={{
                top: index * rowHeight,
                height: rowHeight,
              }}
              aria-label={`Select ${column.label} from ${formatHourLabel(hour)}`}
            />
          )
        })}

        {selection ? (
          <div
            className="pointer-events-none absolute inset-x-1.5 z-[5] overflow-hidden rounded-xl border border-[#4274B9]/50 bg-[#4274B9]/20 shadow-sm"
            style={{
              top: (selection.startHour - rangeStartHour) * rowHeight + 4,
              height:
                (selection.endHour - selection.startHour) * rowHeight - 8,
            }}
          >
            <div className="px-2.5 py-2">
              <p className="text-[11px] font-bold text-[#1E3A5F]">
                New session
              </p>
              <p className="mt-0.5 text-[10px] font-semibold text-[#2F5A94]">
                {selectionLabel}
              </p>
            </div>
          </div>
        ) : null}

        {events.map((event) => (
          <TimetableEventCard
            key={event.id}
            event={event}
            rangeStartHour={rangeStartHour}
            rowHeight={rowHeight}
            onClick={onEventClick}
          />
        ))}
      </div>
    </div>
  )
}
