import { BookOpen, DoorOpen, GraduationCap, ShieldCheck } from 'lucide-react'

import { cn } from '../../../shared/lib/cn'
import type { DashboardMetrics } from '../types/dashboard'
import {
  DashboardGauge,
  DashboardGroupedColumns,
} from './dashboard-charts'
import { BRAND_CHART } from './dashboard-palette'
import { DashboardChip, DashboardMeter } from './dashboard-kit'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from './dashboard-section'

/** Attendance is a status: good / watch / low. */
function attendanceStatus(rate: number | null) {
  if (rate == null) return { label: 'No records', chip: 'bg-canvas text-slate-500' }
  if (rate >= 90) return { label: 'Healthy', chip: 'bg-emerald-50 text-emerald-700' }
  if (rate >= 75) return { label: 'Keep an eye on it', chip: 'bg-amber-50 text-amber-700' }
  return { label: 'Low', chip: 'bg-rose-50 text-rose-700' }
}

/** Utilization reads as a sequential brand ramp: busier rooms are darker. */
function utilizationBarClass(rate: number) {
  if (rate >= 70) return 'bg-brand-700'
  if (rate >= 40) return 'bg-brand-500'
  if (rate >= 20) return 'bg-brand-300'
  return 'bg-brand-gray'
}

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}

export function DashboardDeliveryOverview({
  metrics,
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const { delivery } = metrics
  const status = attendanceStatus(delivery.attendanceRate)

  return (
    <DashboardPanel variant="tint" className={className}>
      <DashboardCardHeader
        title="Attendance"
        description="Students who showed up."
        icon={<ShieldCheck className="size-4" />}
      />

      <div className="flex flex-1 flex-col items-center gap-3">
        <DashboardGauge
          value={delivery.attendanceRate}
          size={136}
          strokeWidth={14}
          color={BRAND_CHART.brand500}
          trackColor={BRAND_CHART.brand100}
          label="Present"
        />
        <span
          className={cn(
            'rounded-full px-2.5 py-1 text-[11px] font-semibold',
            status.chip,
          )}
        >
          {status.label}
        </span>
        <p className="text-center text-xs text-slate-500">
          {delivery.attendanceTotal > 0
            ? `${delivery.attendancePresent} of ${delivery.attendanceTotal} check-ins were present`
            : 'No attendance has been taken yet'}
        </p>

        <dl className="mt-auto grid w-full grid-cols-2 gap-2">
          <div className="rounded-2xl bg-white px-3 py-2.5">
            <dt className="text-[11px] font-semibold text-slate-500">Overtime</dt>
            <dd
              className={cn(
                'mt-0.5 text-xl font-bold tabular-nums',
                delivery.overtimeSessions > 0 ? 'text-amber-700' : 'text-ink',
              )}
            >
              {delivery.overtimeSessions.toLocaleString('en-US')}
            </dd>
          </div>
          <div className="rounded-2xl bg-white px-3 py-2.5">
            <dt className="text-[11px] font-semibold text-slate-500">No tutor yet</dt>
            <dd
              className={cn(
                'mt-0.5 text-xl font-bold tabular-nums',
                delivery.unassignedTutorSessions > 0 ? 'text-rose-700' : 'text-ink',
              )}
            >
              {delivery.unassignedTutorSessions.toLocaleString('en-US')}
            </dd>
          </div>
        </dl>
      </div>
    </DashboardPanel>
  )
}

export function DashboardProgramDemand({
  metrics,
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const items = metrics.delivery.programDemand

  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Program demand"
        description="Sessions taught and new enrollments per program."
        icon={<BookOpen className="size-4" />}
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No program activity in this period." />
      ) : (
        <div className="max-h-[26rem] overflow-y-auto pr-1">
          <DashboardGroupedColumns
            items={items.map((item) => ({
              label: item.title,
              values: {
                sessions: item.sessions,
                enrollments: item.enrollments,
              },
            }))}
            series={[
              { key: 'sessions', label: 'Sessions', className: 'bg-brand-500' },
              {
                key: 'enrollments',
                label: 'Enrollments',
                className: 'bg-brand-300',
              },
            ]}
          />
        </div>
      )}
    </DashboardPanel>
  )
}

export function DashboardTutorUtilization({
  metrics,
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const items = metrics.delivery.tutorUtilization
  const maxHours = Math.max(...items.map((item) => item.hours), 1)
  const totalHours = items.reduce((sum, item) => sum + item.hours, 0)

  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Tutor workload"
        description="Finished sessions and teaching hours per tutor."
        icon={<GraduationCap className="size-4" />}
        action={
          items.length > 0 ? (
            <DashboardChip tone="brand">
              {totalHours.toFixed(1)}h in total
            </DashboardChip>
          ) : null
        }
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No tutor sessions delivered in this period." />
      ) : (
        <ul className="grid max-h-[28rem] gap-2 overflow-y-auto pr-1 md:grid-cols-2">
          {items.map((item) => {
            const width = Math.max((item.hours / maxHours) * 100, item.hours > 0 ? 6 : 0)

            return (
              <li
                key={item.tutorId ?? item.name}
                className="flex items-center gap-3 rounded-3xl bg-canvas/70 px-3 py-2.5"
              >
                <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-brand-700">
                  {initials(item.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-ink">
                      {item.name}
                    </p>
                    <p className="shrink-0 text-sm font-bold text-ink tabular-nums">
                      {item.hours.toFixed(1)}h
                    </p>
                  </div>
                  <DashboardMeter
                    className="mt-1.5"
                    value={width}
                    trackClassName="bg-white"
                  />
                  <p className="mt-1 text-[11px] text-slate-500 tabular-nums">
                    {item.sessions.toLocaleString('en-US')} session
                    {item.sessions === 1 ? '' : 's'}
                  </p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </DashboardPanel>
  )
}

export function DashboardClassroomUtilization({
  metrics,
  className,
}: {
  metrics: DashboardMetrics
  className?: string
}) {
  const items = metrics.delivery.classroomUtilization

  return (
    <DashboardPanel className={className}>
      <DashboardCardHeader
        title="Room use"
        description="Booked hours out of opening hours (8am–9pm)."
        icon={<DoorOpen className="size-4" />}
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No classroom bookings in this period." />
      ) : (
        <ul className="max-h-[26rem] space-y-2 overflow-y-auto pr-1">
          {items.map((item) => (
            <li
              key={item.classroomId ?? item.name}
              className="rounded-2xl bg-canvas/70 px-3.5 py-2.5"
              title={`${item.name}: ${item.utilizationRate.toFixed(1)}% booked`}
            >
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="min-w-0 truncate font-semibold text-ink">
                  {item.name}
                </span>
                <span className="shrink-0 font-bold text-ink tabular-nums">
                  {item.utilizationRate.toFixed(1)}%
                </span>
              </div>
              <DashboardMeter
                className="mt-2"
                value={Math.max(item.utilizationRate, item.utilizationRate > 0 ? 4 : 0)}
                trackClassName="bg-white"
                barClassName={utilizationBarClass(item.utilizationRate)}
              />
              <p className="mt-1 text-[11px] text-slate-500 tabular-nums">
                {item.bookedHours.toFixed(1)}h booked · {item.sessions} sessions
              </p>
            </li>
          ))}
        </ul>
      )}
    </DashboardPanel>
  )
}
