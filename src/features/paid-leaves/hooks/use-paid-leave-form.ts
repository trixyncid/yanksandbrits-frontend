import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import {
  createPaidLeave,
  emptyPaidLeaveFormValues,
  updatePaidLeave,
} from '../api/paid-leaves-api'
import { paidLeaveQueryKeys } from '../api/paid-leave-query-keys'
import { paidLeaveFormSchema } from '../schema/paid-leave-form-schema'
import type {
  PaidLeaveFormErrors,
  PaidLeaveFormValues,
} from '../types/paid-leave'

type UsePaidLeaveFormOptions = {
  mode: 'create' | 'edit'
  leaveId?: string
  initialValues?: PaidLeaveFormValues
}

export function usePaidLeaveForm({
  mode,
  leaveId,
  initialValues = emptyPaidLeaveFormValues,
}: UsePaidLeaveFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<PaidLeaveFormValues>(initialValues)
  const [errors, setErrors] = useState<PaidLeaveFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof PaidLeaveFormValues>(
    field: K,
    value: PaidLeaveFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: PaidLeaveFormValues) {
    const result = paidLeaveFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: PaidLeaveFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof PaidLeaveFormValues] = issue.message
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
            ? 'Unable to record paid leave'
            : 'Unable to update paid leave',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const created = await createPaidLeave(values)
        await queryClient.invalidateQueries({
          queryKey: paidLeaveQueryKeys.all,
        })
        notify('success', {
          title: 'Paid leave recorded',
          description: `Leave for ${created.staffName} has been added.`,
        })
        void navigate({ to: '/paid-leaves' })
        return
      }

      if (!leaveId) {
        return
      }

      const updated = await updatePaidLeave(leaveId, values)
      await queryClient.invalidateQueries({
        queryKey: paidLeaveQueryKeys.all,
      })
      notify('success', {
        title: 'Paid leave updated',
        description: `Leave for ${updated.staffName} has been saved.`,
      })
      void navigate({ to: '/paid-leaves' })
    } catch (error) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to record paid leave'
            : 'Unable to update paid leave',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    void navigate({ to: '/paid-leaves' })
  }

  return {
    values,
    errors,
    isSubmitting,
    updateField,
    submit,
    cancel,
  }
}
