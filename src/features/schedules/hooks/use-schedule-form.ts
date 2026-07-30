import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import {
  createClassSchedule,
  deleteClassSchedule,
  emptyScheduleFormValues,
  updateClassSchedule,
} from '../api/schedules-api'
import { scheduleQueryKeys } from '../api/schedule-query-keys'
import { scheduleFormSchema } from '../schema/schedule-form-schema'
import type {
  ScheduleFormErrors,
  ScheduleFormValues,
} from '../types/schedule'

type UseScheduleFormOptions = {
  mode: 'create' | 'edit'
  scheduleId?: string
  initialValues?: ScheduleFormValues
  onSuccess?: () => void
  onCancel?: () => void
}

export function useScheduleForm({
  mode,
  scheduleId,
  initialValues = emptyScheduleFormValues(),
  onSuccess,
  onCancel,
}: UseScheduleFormOptions) {
  const queryClient = useQueryClient()
  const [values, setValues] = useState<ScheduleFormValues>(initialValues)
  const [errors, setErrors] = useState<ScheduleFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof ScheduleFormValues>(
    field: K,
    value: ScheduleFormValues[K],
  ) {
    setValues((current) => {
      const next = { ...current, [field]: value }

      if (field === 'participantType') {
        if (value === 'student') {
          next.studentGroupId = ''
        } else {
          next.studentId = ''
        }
      }

      return next
    })
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: ScheduleFormValues) {
    const result = scheduleFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: ScheduleFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof ScheduleFormValues] = issue.message
      }
    }

    setErrors(nextErrors)
    return false
  }

  async function submit() {
    const isValid = validateForm(values)

    if (!isValid) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to create session'
            : 'Unable to update session',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        await createClassSchedule(values)
        await queryClient.invalidateQueries({
          queryKey: scheduleQueryKeys.days(),
        })
        notify('success', {
          title: 'Session created',
          description: 'The class session has been added to the timetable.',
        })
        onSuccess?.()
        return
      }

      if (!scheduleId) {
        return
      }

      await updateClassSchedule(scheduleId, values)
      await queryClient.invalidateQueries({
        queryKey: scheduleQueryKeys.days(),
      })
      notify('success', {
        title: 'Session updated',
        description: 'The class session has been saved.',
      })
      onSuccess?.()
    } catch (error) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to create session'
            : 'Unable to update session',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function remove() {
    if (!scheduleId) {
      return
    }

    requestDeleteConfirm({
      title: 'Delete class session?',
      description:
        'This will permanently remove the session from the timetable. This action cannot be undone.',
      onConfirm: () => {
        void (async () => {
          try {
            await deleteClassSchedule(scheduleId)
            await queryClient.invalidateQueries({
              queryKey: scheduleQueryKeys.days(),
            })
            notify('success', {
              title: 'Session deleted',
              description: 'The class session has been removed.',
            })
            onSuccess?.()
          } catch (error) {
            notify('error', {
              title: 'Unable to delete session',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  function cancel() {
    onCancel?.()
  }

  return {
    values,
    errors,
    isSubmitting,
    updateField,
    submit,
    remove,
    cancel,
  }
}
