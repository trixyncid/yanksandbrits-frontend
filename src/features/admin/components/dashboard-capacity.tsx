import { cn } from '../../../shared/lib/cn'
import type { DashboardMetrics } from '../types/dashboard'
import { DashboardGauge, DashboardGroupedColumns } from './dashboard-charts'
import {
  DashboardCardHeader,
  DashboardEmptyState,
  DashboardPanel,
} from './dashboard-section'

function attendanceColor(rate: number | null) {
  if (rate == null) return '#94A3B8'
  if (rate >= 90) return '#3D9B6E'
  if (rate >= 75) return '#D97706'
  return '#C45B6E'
}

function utilizationBarClass(rate: number) {
  if (rate >= 70) return 'bg-[#3D9B6E]'
  if (rate >= 40) return 'bg-[#4274B9]'
  if (rate >= 20) return 'bg-[#D97706]'
  return 'bg-slate-300'
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

  return (
    <DashboardPanel variant="tint" className={className}>
      <DashboardCardHeader
        title="Delivery quality"
        description="Attendance and scheduling gaps."
      />

      <div className="flex flex-1 flex-col items-center gap-5">
        <DashboardGauge
          value={delivery.attendanceRate}
          size={136}
          strokeWidth={12}
          color={attendanceColor(delivery.attendanceRate)}
          label="Attendance"
        />
        <p className="text-center text-sm text-slate-500">
          {delivery.attendanceTotal > 0
            ? `${delivery.attendancePresent} of ${delivery.attendanceTotal} present`
            : 'No attendance records'}
        </p>

        <dl className="grid w-full grid-cols-2 gap-3">
          <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[#D8E6FA]">
            <dt className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
              Overtime
            </dt>
            <dd
              className={cn(
                'mt-1 text-2xl font-bold tabular-nums',
                delivery.overtimeSessions > 0 ? 'text-[#9A3412]' : 'text-slate-900',
              )}
            >
              {delivery.overtimeSessions.toLocaleString('en-US')}
            </dd>
          </div>
          <div className="rounded-2xl bg-white px-4 py-3 ring-1 ring-[#D8E6FA]">
            <dt className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
              Unassigned
            </dt>
            <dd
              className={cn(
                'mt-1 text-2xl font-bold tabular-nums',
                delivery.unassignedTutorSessions > 0
                  ? 'text-[#6E2433]'
                  : 'text-slate-900',
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
}: {
  metrics: DashboardMetrics
}) {
  const items = metrics.delivery.programDemand

  return (
    <DashboardPanel>
      <DashboardCardHeader
        title="Program demand"
        description="Sessions delivered and new program enrollments."
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No program activity in this period." />
      ) : (
        <DashboardGroupedColumns
          items={items.map((item) => ({
            label: item.title,
            values: {
              sessions: item.sessions,
              enrollments: item.enrollments,
            },
          }))}
          series={[
            { key: 'sessions', label: 'Sessions', className: 'bg-[#4274B9]' },
            {
              key: 'enrollments',
              label: 'Enrollments',
              className: 'bg-[#3D9B6E]',
            },
          ]}
        />
      )}
    </DashboardPanel>
  )
}

export function DashboardTutorUtilization({
  metrics,
}: {
  metrics: DashboardMetrics
}) {
  const items = metrics.delivery.tutorUtilization
  const maxHours = Math.max(...items.map((item) => item.hours), 1)

  return (
    <DashboardPanel variant="quiet">
      <DashboardCardHeader
        title="Tutor utilization"
        description="Finished sessions and teaching hours by tutor."
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No tutor sessions delivered in this period." />
      ) : (
        <ul className="max-h-[28rem] space-y-3 overflow-y-auto pr-1">
          {items.map((item) => {
            const width = Math.max((item.hours / maxHours) * 100, item.hours > 0 ? 8 : 0)

            return (
              <li key={item.tutorId ?? item.name} className="flex items-center gap-3">
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#EDF4FF] text-xs font-bold text-[#2F5A94]">
                  {initials(item.name)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="truncate text-sm font-semibold text-slate-900">
                      {item.name}
                    </p>
                    <p className="shrink-0 text-sm font-bold text-slate-900 tabular-nums">
                      {item.hours.toFixed(1)}h
                    </p>
                  </div>
                  <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#5A8BC9]"
                      style={{ width: `${width}%` }}
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-400 tabular-nums">
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
}: {
  metrics: DashboardMetrics
}) {
  const items = metrics.delivery.classroomUtilization

  return (
    <DashboardPanel>
      <DashboardCardHeader
        title="Room utilization"
        description="Booked hours vs operating capacity (8am–9pm daily)."
      />

      {items.length === 0 ? (
        <DashboardEmptyState message="No classroom usage in this period." />
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.classroomId ?? item.name} className="space-y-2">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="font-semibold text-slate-700">{item.name}</span>
                <div className="text-right">
                  <span className="font-bold text-slate-900 tabular-nums">
                    {item.utilizationRate.toFixed(1)}%
                  </span>
                  <span className="ml-2 text-xs font-medium text-slate-400 tabular-nums">
                    {item.bookedHours.toFixed(1)}h · {item.sessions} sessions
                  </span>
                </div>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    'h-full rounded-full transition-all duration-500',
                    utilizationBarClass(item.utilizationRate),
                  )}
                  style={{
                    width: `${Math.min(Math.max(item.utilizationRate, item.utilizationRate > 0 ? 4 : 0), 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardPanel>
  )
}
