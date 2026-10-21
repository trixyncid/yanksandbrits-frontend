import { CalendarClock } from 'lucide-react'
import { useState, type FormEvent } from 'react'
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
  /** Freelancers only have a per-session rate: no hours, base salary or overtime. */
  freelance?: boolean
}

export function TutorWorkingScheduleDialog({
  open,
  onOpenChange,
  tutorId,
  tutorName,
  schedule,
  mode = 'full',
  freelance = false,
}: TutorWorkingScheduleDialogProps) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<TutorWorkingScheduleFormValues>(
    emptyScheduleFormValues,
  )
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isUpdate = Boolean(schedule)

  // Reset the form whenever the dialog opens or switches to another schedule.
  const [synced, setSynced] = useState<{
    open: boolean
    schedule: TutorWorkingSchedule | null
  }>({ open: false, schedule: null })
  if (synced.open !== open || synced.schedule !== schedule) {
    setSynced({ open, schedule })
    if (open) {
      setValues(scheduleToFormValues(schedule))
      setIsSubmitting(false)
    }
  }

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
          <div className="shrink-0 bg-gradient-to-br from-brand-50 via-white to-white px-6 pt-6 pb-2">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-brand-500 text-white shadow-sm">
              <CalendarClock className="size-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle>
                {freelance
                  ? 'Set per-session rate'
                  : mode === 'salary'
                  ? isUpdate
                    ? 'Update tutor pay'
                    : 'Record tutor pay'
                  : isUpdate
                    ? 'Update working hours'
                    : 'Set working hours'}
              </DialogTitle>
              <DialogDescription>
                {freelance
                  ? `${tutorName} is freelance: paid per session only, with no working hours, base salary or overtime.`
                  : mode === 'salary'
                  ? `The base rates ${tutorName} is paid for every program.`
                  : `The days and hours ${tutorName} works, plus their base pay. Leave a day empty for a day off.`}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
            <div className={freelance ? 'grid gap-4' : 'grid gap-4 sm:grid-cols-3'}>
              {freelance ? null : (
              <div className="space-y-2">
                <Label htmlFor="mainSalary">Main salary (IDR)</Label>
                <Input
                  id="mainSalary"
                  inputMode="numeric"
                  value={values.mainSalary}
                  onChange={(event) =>
                    updateField('mainSalary', event.target.value)
                  }
                />
              </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="salaryPerSession">Per session (IDR)</Label>
                <Input
                  id="salaryPerSession"
                  inputMode="numeric"
                  value={values.salaryPerSession}
                  onChange={(event) =>
                    updateField('salaryPerSession', event.target.value)
                  }
                />
              </div>
              {freelance ? null : (
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
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trainerFee">Trainer fee per session (IDR)</Label>
              <Input
                id="trainerFee"
                inputMode="numeric"
                value={values.trainerFee}
                onChange={(event) => updateField('trainerFee', event.target.value)}
                placeholder="0"
              />
              <p className="text-xs text-slate-500">
                Paid for each finished tutor-training session this person teaches, instead of
                their class rates. Leave 0 if they don&apos;t run training.
              </p>
            </div>

            {mode === 'full' && !freelance ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-ink">
                  Weekly hours
                </p>
                <div className="space-y-2.5">
                  <div className="grid grid-cols-[4.5rem_1fr_1fr] sm:grid-cols-[6.5rem_1fr_1fr] items-center gap-3 px-0.5">
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
                      className="grid grid-cols-[4.5rem_1fr_1fr] sm:grid-cols-[6.5rem_1fr_1fr] items-center gap-3"
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

          <DialogFooter className="mt-0 shrink-0 bg-canvas/70 px-6 py-4">
            <Button
              type="button"
              variant="soft"
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
                : freelance
                  ? 'Save rate'
                  : mode === 'salary'
                  ? 'Save pay'
                  : 'Save working hours'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
