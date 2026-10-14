import { useQuery } from '@tanstack/react-query'
import { CalendarClock } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import {
  fetchTutorWorkingSchedule,
} from '../api/compensation-api'
import type { UserDetail } from '../api/users-api'
import {
  formatStaffCurrency,
  formatStaffTime,
  StaffDetailItem,
} from './staff-detail-utils'
import { TutorWorkingScheduleDialog } from './tutor-working-schedule-dialog'

const WEEKDAYS = [
  { key: 'monday', inKey: 'mondayIn', outKey: 'mondayOut', label: 'Monday' },
  { key: 'tuesday', inKey: 'tuesdayIn', outKey: 'tuesdayOut', label: 'Tuesday' },
  {
    key: 'wednesday',
    inKey: 'wednesdayIn',
    outKey: 'wednesdayOut',
    label: 'Wednesday',
  },
  {
    key: 'thursday',
    inKey: 'thursdayIn',
    outKey: 'thursdayOut',
    label: 'Thursday',
  },
  { key: 'friday', inKey: 'fridayIn', outKey: 'fridayOut', label: 'Friday' },
  {
    key: 'saturday',
    inKey: 'saturdayIn',
    outKey: 'saturdayOut',
    label: 'Saturday',
  },
  { key: 'sunday', inKey: 'sundayIn', outKey: 'sundayOut', label: 'Sunday' },
] as const

type StaffScheduleTabProps = {
  user: UserDetail
}

export function StaffScheduleTab({ user }: StaffScheduleTabProps) {
  const [dialogOpen, setDialogOpen] = useState(false)

  const scheduleQuery = useQuery({
    queryKey: ['tutor-working-schedules', 'by-tutor', user.id],
    queryFn: () => fetchTutorWorkingSchedule(user.id),
    enabled: user.isTutor,
  })

  if (!user.isTutor) {
    return (
      <EmptyScheduleState
        title="No working hours for this account"
        description="Working hours are only kept for tutors, and this person is not set up as a tutor."
      />
    )
  }

  if (scheduleQuery.isLoading) {
    return (
      <div className="grid gap-2 p-5 sm:grid-cols-7 sm:p-6" aria-busy="true">
        {WEEKDAYS.map((day) => (
          <div key={day.key} className="h-24 animate-pulse rounded-2xl bg-canvas" />
        ))}
      </div>
    )
  }

  if (scheduleQuery.isError) {
    return (
      <EmptyScheduleState
        title="Unable to load working hours"
        description="Something went wrong while loading this tutor's working hours. Please refresh the page to try again."
      />
    )
  }

  const schedule = scheduleQuery.data ?? null

  const workingDays = schedule
    ? WEEKDAYS.filter((day) => schedule[day.inKey] && schedule[day.outKey]).length
    : 0

  const isFreelance = user.employmentType === 'FL'

  return (
    <>
      <div className="space-y-4 p-5 sm:p-6">
        {isFreelance ? (
          <EmptyScheduleState
            title="Freelance: no working hours"
            description={
              schedule && schedule.salaryPerSession > 0
                ? `${user.fullName} can be booked for any session and is paid ${formatStaffCurrency(schedule.salaryPerSession)} per session. There's no base salary, overtime or paid leave.`
                : `${user.fullName} can be booked for any session and is paid per session only. Set their per-session rate.`
            }
            action={
              <Button
                variant={schedule ? 'soft' : 'primary'}
                onClick={() => setDialogOpen(true)}
              >
                <CalendarClock className="size-4" />
                {schedule ? 'Update per-session rate' : 'Set per-session rate'}
              </Button>
            }
          />
        ) : schedule ? (
          <>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-slate-600">
                Works{' '}
                <span className="font-semibold text-ink">
                  {workingDays} day{workingDays === 1 ? '' : 's'}
                </span>{' '}
                a week.
              </p>
              <Button variant="soft" size="sm" onClick={() => setDialogOpen(true)}>
                <CalendarClock className="size-3.5" />
                Edit working hours
              </Button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-7">
              {WEEKDAYS.map((day) => {
                const timeIn = schedule[day.inKey] || null
                const timeOut = schedule[day.outKey] || null
                const working = Boolean(timeIn && timeOut)
                return (
                  <div
                    key={day.key}
                    className={cn(
                      'rounded-2xl px-3.5 py-3',
                      working ? 'bg-brand-50' : 'bg-canvas',
                    )}
                  >
                    <p
                      className={cn(
                        'text-xs font-bold tracking-wide uppercase',
                        working ? 'text-brand-700' : 'text-slate-400',
                      )}
                    >
                      {day.label.slice(0, 3)}
                    </p>
                    {working ? (
                      <p className="mt-2 text-sm font-semibold text-ink tabular-nums">
                        {formatStaffTime(timeIn)}
                        <span className="text-slate-400"> – </span>
                        {formatStaffTime(timeOut)}
                      </p>
                    ) : (
                      <p className="mt-2 text-sm font-medium text-slate-400">
                        Day off
                      </p>
                    )}
                  </div>
                )
              })}
            </div>

            <dl className="grid gap-2 sm:grid-cols-3">
              <StaffDetailItem
                label="Main salary"
                value={formatStaffCurrency(schedule.mainSalary)}
              />
              <StaffDetailItem
                label="Pay per session"
                value={formatStaffCurrency(schedule.salaryPerSession)}
              />
              <StaffDetailItem
                label="Overtime multiplier"
                value={`${schedule.overtimeMultiplier}x`}
              />
            </dl>
          </>
        ) : (
          <EmptyScheduleState
            title="No working hours yet"
            description="Set the days and hours this tutor works so they can be booked on the schedule."
            action={
              <Button onClick={() => setDialogOpen(true)}>
                <CalendarClock className="size-4" />
                Set working hours
              </Button>
            }
          />
        )}
      </div>

      <TutorWorkingScheduleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tutorId={user.id}
        tutorName={user.fullName}
        schedule={schedule}
        mode="full"
        freelance={user.employmentType === 'FL'}
      />
    </>
  )
}

function EmptyScheduleState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center px-6 py-12 text-center">
      <span className="relative inline-flex size-16 items-center justify-center">
        <span aria-hidden className="absolute inset-0 rounded-full bg-brand-50" />
        <span aria-hidden className="absolute inset-2 rounded-full bg-brand-100" />
        <CalendarClock className="relative size-6 text-brand-600" strokeWidth={1.7} />
      </span>
      <h4 className="mt-4 text-base font-bold text-ink">{title}</h4>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
