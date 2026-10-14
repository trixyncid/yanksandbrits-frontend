import { format, parseISO } from 'date-fns'
import { useEffect, useMemo, useRef, useState } from 'react'

import type { TimetableColumn } from '../../../shared/components/timetable'
import { formatHourLabel } from '../../../shared/components/timetable/utils'
import { cn } from '../../../shared/lib/cn'
import {
  packEventLanes,
  type WeekScheduleEvent,
} from '../../schedules/lib/map-week-schedule-events'
import { AdminWeekEventCard } from './admin-week-event-card'

/** Weekday office open (9am). */
const START_HOUR = 9
/** Weekday office close (8pm). The last row is 7pm to 8pm. */
const END_HOUR = 20
const ROW_HEIGHT = 64
/** Keeps the 9am label clear of the sticky header / overflow clip. */
const TOP_PAD = 12
/** Extra space under the 8pm marker so overflow scroll does not clip it. */
const BOTTOM_PAD = 24
const TIME_COL_WIDTH = 72
const HEADER_HEIGHT = 52
const COLUMN_MIN_WIDTH = 140

function hourOffsetTop(hour: number) {
  return TOP_PAD + (hour - START_HOUR) * ROW_HEIGHT
}

type AdminWeekCalendarProps = {
  dateKey: string
  classrooms: TimetableColumn[]
  events: WeekScheduleEvent[]
  onEventClick?: (event: WeekScheduleEvent) => void
  onSlotSelect?: (
    classroom: TimetableColumn,
    startHour: number,
    endHour: number,
  ) => void
  className?: string
}

function jakartaNowParts(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now)

  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '0'

  const hour = Number(get('hour'))
  const minute = Number(get('minute'))

  return {
    hourFraction: hour + minute / 60,
    dateKey: `${get('year')}-${get('month')}-${get('day')}`,
  }
}

function useJakartaNow(enabled: boolean) {
  const [now, setNow] = useState(() => jakartaNowParts())

  useEffect(() => {
    if (!enabled) return
    setNow(jakartaNowParts())
    const id = window.setInterval(() => setNow(jakartaNowParts()), 30_000)
    return () => window.clearInterval(id)
  }, [enabled])

  return now
}

function hoursInRange() {
  return Array.from(
    { length: END_HOUR - START_HOUR },
    (_, index) => START_HOUR + index,
  )
}

export function AdminWeekCalendar({
  dateKey,
  classrooms,
  events,
  onEventClick,
  onSlotSelect,
  className,
}: AdminWeekCalendarProps) {
  const hours = useMemo(() => hoursInRange(), [])
  const hourLabels = useMemo(() => [...hours, END_HOUR], [hours])
  const gridHeight = hours.length * ROW_HEIGHT
  const bodyHeight = TOP_PAD + gridHeight + BOTTOM_PAD
  const todayKey = jakartaNowParts().dateKey
  const isViewingToday = dateKey === todayKey
  const now = useJakartaNow(isViewingToday)
  const nowVisible =
    isViewingToday &&
    now.hourFraction >= START_HOUR &&
    now.hourFraction <= END_HOUR
  const nowTop = hourOffsetTop(now.hourFraction)

  const eventsByClassroom = useMemo(() => {
    const map = new Map<string, ReturnType<typeof packEventLanes>>()
    for (const classroom of classrooms) {
      const columnEvents = events.filter(
        (event) => event.classroomId === classroom.id,
      )
      map.set(classroom.id, packEventLanes(columnEvents))
    }
    return map
  }, [classrooms, events])

  const [drag, setDrag] = useState<{
    classroomId: string
    startHour: number
    endHour: number
  } | null>(null)
  const dragRef = useRef(drag)
  dragRef.current = drag
  const onSlotSelectRef = useRef(onSlotSelect)
  onSlotSelectRef.current = onSlotSelect
  const classroomsRef = useRef(classrooms)
  classroomsRef.current = classrooms

  useEffect(() => {
    function onUp() {
      const current = dragRef.current
      if (!current) return
      const classroom = classroomsRef.current.find(
        (item) => item.id === current.classroomId,
      )
      if (classroom) {
        onSlotSelectRef.current?.(
          classroom,
          current.startHour,
          current.endHour,
        )
      }
      setDrag(null)
    }

    window.addEventListener('mouseup', onUp)
    return () => window.removeEventListener('mouseup', onUp)
  }, [])

  function beginDrag(classroomId: string, hour: number) {
    if (!onSlotSelect) return
    setDrag({ classroomId, startHour: hour, endHour: hour + 1 })
  }

  function updateDrag(classroomId: string, hour: number) {
    setDrag((current) => {
      if (!current || current.classroomId !== classroomId) return current
      const start = Math.min(current.startHour, hour)
      const end = Math.max(current.startHour, hour) + 1
      return { ...current, startHour: start, endHour: end }
    })
  }

  const columnCount = Math.max(classrooms.length, 1)
  const gridTemplateColumns = `${TIME_COL_WIDTH}px repeat(${columnCount}, minmax(${COLUMN_MIN_WIDTH}px, 1fr))`

  return (
    <div
      className={cn(
        'overflow-auto overscroll-contain rounded-3xl bg-canvas/70 ring-1 ring-brand-100',
        className,
      )}
      style={{ maxHeight: '78vh' }}
    >
      <div
        className="min-w-max"
        style={{ minWidth: TIME_COL_WIDTH + columnCount * COLUMN_MIN_WIDTH }}
      >
        <div
          className="sticky top-0 z-20 grid border-b border-brand-100 bg-brand-50/95 backdrop-blur"
          style={{
            gridTemplateColumns,
            height: HEADER_HEIGHT,
          }}
        >
          <div className="border-r border-brand-100" />
          {classrooms.length === 0 ? (
            <div className="flex items-center justify-center px-3 text-sm text-brand-500/55">
              No classrooms
            </div>
          ) : (
            classrooms.map((classroom) => (
              <div
                key={classroom.id}
                className="flex items-center justify-center border-r border-brand-100 px-2 last:border-r-0"
              >
                <span
                  className="inline-flex max-w-full items-center truncate rounded-full bg-white px-3 py-1 text-xs font-bold text-ink shadow-sm"
                  title={classroom.label}
                >
                  {classroom.label}
                </span>
              </div>
            ))
          )}
        </div>

        <div
          className="relative grid"
          style={{
            gridTemplateColumns,
            height: bodyHeight,
          }}
        >
          <div className="relative border-r border-brand-100 bg-white/70">
            {hourLabels.map((hour) => (
              <div
                key={hour}
                className={cn(
                  'absolute right-2 text-[11px] font-semibold tabular-nums',
                  hour === END_HOUR || hour === START_HOUR
                    ? 'text-brand-500'
                    : 'text-brand-500/55',
                )}
                style={{
                  top: hourOffsetTop(hour) - 7,
                }}
              >
                {formatHourLabel(hour)}
              </div>
            ))}
            {nowVisible ? (
              <div
                className="absolute right-1.5 z-10 -translate-y-1/2 rounded-full bg-rose-500 px-1.5 py-0.5 text-[10px] font-bold text-white"
                style={{ top: nowTop }}
              >
                {formatHourLabel(now.hourFraction)}
              </div>
            ) : null}
          </div>

          {classrooms.map((classroom) => {
            const packed = eventsByClassroom.get(classroom.id) ?? []
            const columnDrag =
              drag?.classroomId === classroom.id ? drag : null

            return (
              <div
                key={classroom.id}
                className="relative border-r border-brand-100 bg-white/80 last:border-r-0"
              >
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="absolute inset-x-0 border-t border-brand-100/70 hover:bg-brand-500/5"
                    style={{
                      top: hourOffsetTop(hour),
                      height: ROW_HEIGHT,
                    }}
                    onMouseDown={(event) => {
                      if (!onSlotSelect || event.button !== 0) return
                      event.preventDefault()
                      beginDrag(classroom.id, hour)
                    }}
                    onMouseEnter={() => {
                      if (!drag || drag.classroomId !== classroom.id) return
                      updateDrag(classroom.id, hour)
                    }}
                  />
                ))}

                {/* Soft end-of-day band after office close so 8pm has breathing room */}
                <div
                  className="pointer-events-none absolute inset-x-0 border-t border-dashed border-brand-200/80 bg-brand-100/35"
                  style={{
                    top: TOP_PAD + gridHeight,
                    height: BOTTOM_PAD,
                  }}
                />

                {columnDrag ? (
                  <div
                    className="pointer-events-none absolute inset-x-1 z-[5] rounded-2xl bg-brand-500/12 ring-2 ring-brand-500/30"
                    style={{
                      top: hourOffsetTop(columnDrag.startHour) + 2,
                      height:
                        (columnDrag.endHour - columnDrag.startHour) *
                          ROW_HEIGHT -
                        4,
                    }}
                  />
                ) : null}

                {packed.map((event) => {
                  const widthPct = 100 / event.laneCount
                  const leftPct = event.lane * widthPct
                  return (
                    <AdminWeekEventCard
                      key={event.id}
                      event={event}
                      onClick={
                        onEventClick ? () => onEventClick(event) : undefined
                      }
                      style={{
                        top: hourOffsetTop(event.startHour) + 2,
                        height: Math.max(
                          event.durationHours * ROW_HEIGHT - 4,
                          36,
                        ),
                        left: `calc(${leftPct}% + 3px)`,
                        width: `calc(${widthPct}% - 6px)`,
                        zIndex: 6,
                      }}
                    />
                  )
                })}
              </div>
            )
          })}

          {nowVisible ? (
            <div
              className="pointer-events-none absolute z-10 border-t border-dashed border-rose-400"
              style={{
                top: nowTop,
                left: TIME_COL_WIDTH,
                right: 0,
              }}
            />
          ) : null}
        </div>
      </div>
    </div>
  )
}

export const ADMIN_WEEK_HOURS = { startHour: START_HOUR, endHour: END_HOUR }

/** Format a yyyy-MM-dd key for display helpers. */
export function formatAdminScheduleDate(dateKey: string) {
  return format(parseISO(dateKey), 'EEEE, d MMM yyyy')
}
