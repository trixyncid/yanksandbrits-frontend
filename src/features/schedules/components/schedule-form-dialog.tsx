import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'

import { Button } from '../../../shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import type { TimetableColumn, TimetableEvent } from '../../../shared/components/timetable'
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

export function ScheduleFormDialog({
  context,
  onOpenChange,
}: ScheduleFormDialogProps) {
  const open = context != null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
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
    const durationHours = Math.max(context.endHour - context.startHour, 1)
    return (
      <ScheduleFormDialogEditor
        mode="create"
        branchId={context.branchId}
        initialValues={buildCreateValues(context)}
        title="New class session"
        description={`Schedule ${durationHours} hour${durationHours === 1 ? '' : 's'} in ${context.column.label} (${hourToTimeString(context.startHour)} – ${hourToTimeString(context.endHour)}).`}
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
      <>
        <DialogHeader>
          <DialogTitle>Edit class session</DialogTitle>
          <DialogDescription>Loading {eventTitle}…</DialogDescription>
        </DialogHeader>
        <p className="py-10 text-center text-sm text-slate-500">
          Loading session details…
        </p>
      </>
    )
  }

  if (detailQuery.isError || !detailQuery.data) {
    return (
      <>
        <DialogHeader>
          <DialogTitle>Session not found</DialogTitle>
          <DialogDescription>
            This class session may have been removed.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </>
    )
  }

  return (
    <ScheduleFormDialogEditor
      mode="edit"
      scheduleId={scheduleId}
      branchId={branchId}
      initialValues={scheduleToFormValues(detailQuery.data)}
      title="Edit class session"
      description={`Update details for ${eventTitle}.`}
      onClose={onClose}
    />
  )
}

function ScheduleFormDialogEditor({
  mode,
  scheduleId,
  branchId,
  initialValues,
  title,
  description,
  onClose,
}: {
  mode: 'create' | 'edit'
  scheduleId?: string
  branchId: string
  initialValues: ScheduleFormValues
  title: string
  description: string
  onClose: () => void
}) {
  const form = useScheduleForm({
    mode,
    scheduleId,
    initialValues,
    onSuccess: onClose,
    onCancel: onClose,
  })

  return (
    <>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>{description}</DialogDescription>
      </DialogHeader>
      <div className="mt-4">
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
      </div>
    </>
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
