import { useQuery } from '@tanstack/react-query'
import { CalendarClock, CalendarPlus, Loader2 } from 'lucide-react'
import { useMemo, useState, type ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import type { TimetableColumn, TimetableEvent } from '../../../shared/components/timetable'
import { useClassroomsQuery } from '../../classrooms/hooks/use-classrooms-query'
import {
  emptyScheduleFormValues,
  fetchClassSchedule,
  hourToTimeString,
  scheduleToFormValues,
} from '../api/schedules-api'
import { scheduleQueryKeys } from '../api/schedule-query-keys'
import { useScheduleForm } from '../hooks/use-schedule-form'
import type { ScheduleFormValues } from '../types/schedule'
import { ScheduleForm } from './schedule-form'

export type ScheduleDialogCreateContext = {
  mode: 'create'
  date: string
  branchId: string
  column: TimetableColumn
  startHour: number
  endHour: number
}

export type ScheduleDialogEditContext = {
  mode: 'edit'
  scheduleId: string
  branchId: string
  event: TimetableEvent
}

export type ScheduleDialogContext =
  | ScheduleDialogCreateContext
  | ScheduleDialogEditContext
  | null

type ScheduleFormDialogProps = {
  context: ScheduleDialogContext
  onOpenChange: (open: boolean) => void
}

function buildCreateValues(context: ScheduleDialogCreateContext): ScheduleFormValues {
  return emptyScheduleFormValues({
    classroomId: context.column.id,
    date: context.date,
    startTime: hourToTimeString(context.startHour),
    endTime: hourToTimeString(context.endHour),
    status: 'ongoing',
  })
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number)
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return 0
  return hours * 60 + minutes
}

function formatDurationLabel(startTime: string, endTime: string) {
  const minutes = Math.max(timeToMinutes(endTime) - timeToMinutes(startTime), 0)
  const hours = minutes / 60

  if (hours <= 0) return 'a session'
  if (hours === 1) return '1 hour'
  if (Number.isInteger(hours)) return `${hours} hours`

  const whole = Math.floor(hours)
  const fraction = hours - whole
  if (fraction === 0.5) {
    return whole === 0 ? '30 minutes' : `${whole}.5 hours`
  }

  return `${hours.toFixed(1).replace(/\.0$/, '')} hours`
}

function buildCreateDescription(
  values: ScheduleFormValues,
  classroomLabel?: string,
) {
  const duration = formatDurationLabel(values.startTime, values.endTime)
  const window = `${values.startTime} – ${values.endTime}`

  if (classroomLabel) {
    return `Schedule ${duration} in ${classroomLabel} (${window}).`
  }

  if (values.classroomId) {
    return `Schedule ${duration} (${window}).`
  }

  if (values.date) {
    return `Schedule ${duration} on ${values.date} (${window}). Pick a classroom in the form.`
  }

  return `Schedule ${duration} (${window}). Pick a classroom in the form.`
}

function ScheduleDialogChrome({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="flex max-h-[90vh] flex-col">
      <div className="shrink-0 bg-[linear-gradient(135deg,#E8EEFF_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
        <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1] ring-1 ring-[#C8D4F5]">
          {icon}
        </div>
        <DialogHeader className="pr-0">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
      </div>
      {children}
    </div>
  )
}

export function ScheduleFormDialog({
  context,
  onOpenChange,
}: ScheduleFormDialogProps) {
  const open = context != null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="max-h-[90vh] overflow-hidden p-0 sm:max-w-2xl"
      >
        {context ? (
          <ScheduleFormDialogBody
            key={
              context.mode === 'create'
                ? `create-${context.column.id}-${context.startHour}-${context.endHour}-${context.date}`
                : `edit-${context.scheduleId}`
            }
            context={context}
            onClose={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

function ScheduleFormDialogBody({
  context,
  onClose,
}: {
  context: NonNullable<ScheduleDialogContext>
  onClose: () => void
}) {
  if (context.mode === 'create') {
    return (
      <ScheduleFormDialogEditor
        mode="create"
        branchId={context.branchId}
        initialValues={buildCreateValues(context)}
        initialClassroomLabel={
          context.column.id ? context.column.label : undefined
        }
        title="New class session"
        onClose={onClose}
      />
    )
  }

  return (
    <ScheduleFormDialogEditLoader
      scheduleId={context.scheduleId}
      branchId={context.branchId}
      eventTitle={context.event.title}
      onClose={onClose}
    />
  )
}

function ScheduleFormDialogEditLoader({
  scheduleId,
  branchId,
  eventTitle,
  onClose,
}: {
  scheduleId: string
  branchId: string
  eventTitle: string
  onClose: () => void
}) {
  const detailQuery = useQuery({
    queryKey: scheduleQueryKeys.detail(scheduleId),
    queryFn: () => fetchClassSchedule(scheduleId),
  })

  if (detailQuery.isLoading) {
    return (
      <ScheduleDialogChrome
        icon={<Loader2 className="size-5 animate-spin" />}
        title="Edit class session"
        description={`Loading ${eventTitle}…`}
      >
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <p className="text-sm text-slate-500">Loading session details…</p>
        </div>
      </ScheduleDialogChrome>
    )
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <ScheduleDialogChrome
        icon={<CalendarClock className="size-5" />}
        title="Session not found"
        description="This class session may have been removed."
      >
        <DialogFooter className="mt-0 shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </ScheduleDialogChrome>
    )
  }

  return (
    <ScheduleFormDialogEditor
      mode="edit"
      scheduleId={scheduleId}
      branchId={branchId}
      initialValues={scheduleToFormValues(detailQuery.data)}
      title="Edit class session"
      eventTitle={eventTitle}
      onClose={onClose}
    />
  )
}

function ScheduleFormDialogEditor({
  mode,
  scheduleId,
  branchId,
  initialValues,
  initialClassroomLabel,
  title,
  eventTitle,
  onClose,
}: {
  mode: 'create' | 'edit'
  scheduleId?: string
  branchId: string
  initialValues: ScheduleFormValues
  initialClassroomLabel?: string
  title: string
  eventTitle?: string
  onClose: () => void
}) {
  const form = useScheduleForm({
    mode,
    scheduleId,
    initialValues,
    onSuccess: onClose,
    onCancel: onClose,
  })

  const classroomsQuery = useClassroomsQuery({
    branchId,
    isActive: 'active',
  })

  const classroomLabel = useMemo(() => {
    if (!form.values.classroomId) return undefined

    const classroom = (classroomsQuery.data?.data ?? []).find(
      (item) => item.id === form.values.classroomId,
    )
    if (classroom) {
      return classroom.className || classroom.code
    }

    if (
      initialClassroomLabel &&
      form.values.classroomId === initialValues.classroomId
    ) {
      return initialClassroomLabel
    }

    return undefined
  }, [
    classroomsQuery.data?.data,
    form.values.classroomId,
    initialClassroomLabel,
    initialValues.classroomId,
  ])

  const description =
    mode === 'create'
      ? buildCreateDescription(form.values, classroomLabel)
      : `Update details for ${eventTitle ?? 'this session'}.`

  return (
    <ScheduleDialogChrome
      icon={
        mode === 'create' ? (
          <CalendarPlus className="size-5" />
        ) : (
          <CalendarClock className="size-5" />
        )
      }
      title={title}
      description={description}
    >
      <ScheduleForm
        mode={mode}
        values={form.values}
        errors={form.errors}
        isSubmitting={form.isSubmitting}
        branchId={branchId}
        onChange={form.updateField}
        onSubmit={form.submit}
        onCancel={form.cancel}
        onDelete={mode === 'edit' ? form.remove : undefined}
      />
    </ScheduleDialogChrome>
  )
}

export function useScheduleDialogState() {
  const [context, setContext] = useState<ScheduleDialogContext>(null)

  return {
    context,
    openCreate: (next: Omit<ScheduleDialogCreateContext, 'mode'>) =>
      setContext({ mode: 'create', ...next }),
    openEdit: (next: Omit<ScheduleDialogEditContext, 'mode'>) =>
      setContext({ mode: 'edit', ...next }),
    setOpen: (open: boolean) => {
      if (!open) setContext(null)
    },
  }
}
