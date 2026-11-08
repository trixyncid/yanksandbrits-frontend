import { useQuery } from '@tanstack/react-query'
import { CalendarClock, CalendarPlus, Loader2 } from 'lucide-react'
import { useMemo, type ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import type {
  TimetableColumn,
  TimetableEvent,
} from '../../../shared/components/timetable'
import { useModulePermissions } from '../../auth/hooks/use-permissions'
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
    return `Book ${duration} in ${classroomLabel}, ${window}.`
  }

  if (values.classroomId) {
    return `Book ${duration}, ${window}.`
  }

  if (values.date) {
    return `Book ${duration} on ${values.date}, ${window}. Pick a classroom below.`
  }

  return `Book ${duration}, ${window}. Pick a classroom below.`
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
      <div className="shrink-0 bg-brand-50 px-6 pt-6 pb-5">
        <div className="flex items-start gap-3.5 pr-8">
          <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white">
            {icon}
          </div>
          <DialogHeader className="min-w-0 pr-0 text-left">
            <DialogTitle className="text-ink">{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>
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
        title="Book a class session"
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
        <div className="space-y-3 px-6 py-6" aria-busy="true">
          <div className="h-24 animate-pulse rounded-3xl bg-canvas" />
          <div className="h-11 animate-pulse rounded-full bg-canvas" />
          <div className="h-11 animate-pulse rounded-full bg-canvas/70" />
          <p className="pt-1 text-center text-sm text-slate-500">
            Loading session details…
          </p>
        </div>
      </ScheduleDialogChrome>
    )
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <ScheduleDialogChrome
        icon={<CalendarClock className="size-5" />}
        title="Session not found"
        description="This class session may have been removed or moved. Close this and refresh the schedule."
      >
        <DialogFooter className="mt-0 shrink-0 px-6 py-4">
          <Button variant="soft" onClick={onClose}>
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
    recordLabel: eventTitle,
  })
  const { canDelete } = useModulePermissions('schedules')

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
      : `Change the time, room, tutor or status of ${eventTitle ?? 'this session'}.`

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
        onDelete={mode === 'edit' && canDelete ? form.remove : undefined}
      />
    </ScheduleDialogChrome>
  )
}
