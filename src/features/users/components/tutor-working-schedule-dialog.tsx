import { CalendarClock } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { notify } from '../../../shared/lib/notify'
import {
  createTutorWorkingSchedule,
  emptyScheduleFormValues,
  scheduleToFormValues,
  updateTutorWorkingSchedule,
  type TutorWorkingSchedule,
  type TutorWorkingScheduleFormValues,
} from '../api/compensation-api'

const WEEKDAY_FIELDS = [
  { inKey: 'mondayIn', outKey: 'mondayOut', label: 'Monday' },
  { inKey: 'tuesdayIn', outKey: 'tuesdayOut', label: 'Tuesday' },
  { inKey: 'wednesdayIn', outKey: 'wednesdayOut', label: 'Wednesday' },
  { inKey: 'thursdayIn', outKey: 'thursdayOut', label: 'Thursday' },
  { inKey: 'fridayIn', outKey: 'fridayOut', label: 'Friday' },
  { inKey: 'saturdayIn', outKey: 'saturdayOut', label: 'Saturday' },
  { inKey: 'sundayIn', outKey: 'sundayOut', label: 'Sunday' },
] as const

/** Half-hour slots from 06:00–22:00, matching schedule form Select styling. */
const TIME_OPTIONS = Array.from({ length: 17 * 2 }, (_, index) => {
  const hour = 6 + Math.floor(index / 2)
  const minute = index % 2 === 0 ? '00' : '30'
  return `${String(hour).padStart(2, '0')}:${minute}`
}).filter((value) => value <= '22:00')

function TimeSelect({
  id,
  value,
  onChange,
  'aria-label': ariaLabel,
}: {
  id: string
  value: string
  onChange: (value: string) => void
  'aria-label': string
}) {
  return (
    <Select
      id={id}
      aria-label={ariaLabel}
      containerClassName="w-full min-w-0 sm:w-full"
      className="h-12"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    >
      <option value="">—</option>
      {value && !TIME_OPTIONS.includes(value) ? (
        <option value={value}>{value}</option>
      ) : null}
      {TIME_OPTIONS.map((time) => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </Select>
  )
}

type TutorWorkingScheduleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  tutorId: string
  tutorName: string
  schedule: TutorWorkingSchedule | null
  mode?: 'full' | 'salary'
}

export function TutorWorkingScheduleDialog({
  open,
  onOpenChange,
  tutorId,
  tutorName,
  schedule,
  mode = 'full',
}: TutorWorkingScheduleDialogProps) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<TutorWorkingScheduleFormValues>(
    emptyScheduleFormValues,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isUpdate = Boolean(schedule)

  useEffect(() => {
    if (open) {
      setValues(scheduleToFormValues(schedule))
      setIsSubmitting(false)
    }
  }, [open, schedule])

  function updateField<K extends keyof TutorWorkingScheduleFormValues>(
    field: K,
    value: TutorWorkingScheduleFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) return

    setIsSubmitting(true)
    try {
      if (schedule) {
        await updateTutorWorkingSchedule(schedule.id, tutorId, values)
      } else {
        await createTutorWorkingSchedule(tutorId, values)
      }

      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ['tutor-working-schedules'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['tutor-salary-class-based'],
        }),
        queryClient.invalidateQueries({
          queryKey: ['tutors'],
        }),
      ])

      notify('success', {
        title: isUpdate ? 'Schedule updated' : 'Schedule recorded',
        description: `${tutorName}'s working schedule has been saved.`,
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', {
        title: isUpdate ? 'Unable to update schedule' : 'Unable to record schedule',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="max-h-[90vh] overflow-hidden p-0 sm:max-w-2xl"
      >
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex max-h-[90vh] flex-col"
        >
          <div className="shrink-0 bg-[linear-gradient(135deg,#EDF4FF_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9] ring-1 ring-[#BED2F2]">
              <CalendarClock className="size-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle>
                {mode === 'salary'
                  ? isUpdate
                    ? 'Update tutor salary'
                    : 'Record tutor salary'
                  : isUpdate
                    ? 'Update working schedule'
                    : 'Record working schedule'}
              </DialogTitle>
              <DialogDescription>
                {mode === 'salary'
                  ? `Set compensation rates for ${tutorName}.`
                  : `Set weekly hours and rates for ${tutorName}.`}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="mainSalary">Main salary</Label>
                <Input
                  id="mainSalary"
                  inputMode="numeric"
                  value={values.mainSalary}
                  onChange={(event) =>
                    updateField('mainSalary', event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salaryPerSession">Per session</Label>
                <Input
                  id="salaryPerSession"
                  inputMode="numeric"
                  value={values.salaryPerSession}
                  onChange={(event) =>
                    updateField('salaryPerSession', event.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="overtimeMultiplier">Overtime multiplier</Label>
                <Input
                  id="overtimeMultiplier"
                  inputMode="decimal"
                  value={values.overtimeMultiplier}
                  onChange={(event) =>
                    updateField('overtimeMultiplier', event.target.value)
                  }
                />
              </div>
            </div>

            {mode === 'full' ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-800">
                  Weekly hours
                </p>
                <div className="space-y-2.5">
                  <div className="grid grid-cols-[6.5rem_1fr_1fr] items-center gap-3 px-0.5">
                    <span className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                      Day
                    </span>
                    <span className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                      In
                    </span>
                    <span className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                      Out
                    </span>
                  </div>
                  {WEEKDAY_FIELDS.map((day) => (
                    <div
                      key={day.label}
                      className="grid grid-cols-[6.5rem_1fr_1fr] items-center gap-3"
                    >
                      <span className="text-sm font-medium text-slate-600">
                        {day.label}
                      </span>
                      <TimeSelect
                        id={`${day.inKey}`}
                        value={values[day.inKey]}
                        onChange={(value) => updateField(day.inKey, value)}
                        aria-label={`${day.label} in`}
                      />
                      <TimeSelect
                        id={`${day.outKey}`}
                        value={values[day.outKey]}
                        onChange={(value) => updateField(day.outKey, value)}
                        aria-label={`${day.label} out`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <DialogFooter className="mt-0 shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              <CalendarClock className="size-3.5" />
              {isSubmitting
                ? 'Saving...'
                : isUpdate
                  ? 'Update'
                  : 'Record'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
