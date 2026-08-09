import { useQuery } from '@tanstack/react-query'
import { CalendarClock } from 'lucide-react'
import { useState, type ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
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
        title="No working schedule"
        description="Working schedules are available for tutor accounts. This profile is not marked as a tutor."
      />
    )
  }

  if (scheduleQuery.isLoading) {
    return (
      <p className="px-6 py-12 text-center text-sm text-slate-500">
        Loading working schedule...
      </p>
    )
  }

  if (scheduleQuery.isError) {
    return (
      <EmptyScheduleState
        title="Unable to load schedule"
        description="Something went wrong while fetching this tutor's working schedule."
      />
    )
  }

  const schedule = scheduleQuery.data ?? null

  return (
    <>
      <div className="space-y-6 p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-slate-900">
              Tutor schedule
            </h4>
            <p className="mt-1 text-sm text-slate-500">
              Weekly hours and schedule-linked rates.
            </p>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDialogOpen(true)}
          >
            <CalendarClock className="size-3.5" />
            {schedule ? 'Update schedule' : 'Record schedule'}
          </Button>
        </div>

        {schedule ? (
          <>
            <div className="grid gap-4 sm:grid-cols-3">
              <StaffDetailItem
                label="Main salary"
                value={formatStaffCurrency(schedule.mainSalary)}
              />
              <StaffDetailItem
                label="Per session"
                value={formatStaffCurrency(schedule.salaryPerSession)}
              />
              <StaffDetailItem
                label="Overtime multiplier"
                value={`${schedule.overtimeMultiplier}x`}
              />
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-100">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                  <tr>
                    <th className="px-4 py-3">Day</th>
                    <th className="px-4 py-3">In</th>
                    <th className="px-4 py-3">Out</th>
                  </tr>
                </thead>
                <tbody>
                  {WEEKDAYS.map((day) => (
                    <tr key={day.key} className="border-t border-slate-100">
                      <td className="px-4 py-3 font-semibold text-slate-800">
                        {day.label}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatStaffTime(schedule[day.inKey] || null)}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {formatStaffTime(schedule[day.outKey] || null)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyScheduleState
            title="No schedule on file"
            description="This tutor does not have a working schedule configured yet."
            action={
              <Button size="sm" onClick={() => setDialogOpen(true)}>
                <CalendarClock className="size-3.5" />
                Record schedule
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
    <div className="flex flex-col items-center px-6 py-16 text-center">
      <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9]">
        <CalendarClock className="size-5" />
      </div>
      <h4 className="mt-4 text-base font-bold text-slate-900">{title}</h4>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  )
}
