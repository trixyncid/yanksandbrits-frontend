import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import {
  createBookkeeping,
  emptyBookkeepingFormValues,
  updateBookkeeping,
} from '../api/bookkeeping-api'
import { bookkeepingQueryKeys } from '../api/bookkeeping-query-keys'
import { bookkeepingFormSchema } from '../schema/bookkeeping-form-schema'
import type {
  BookkeepingFormErrors,
  BookkeepingFormValues,
} from '../types/bookkeeping'

type UseBookkeepingFormOptions = {
  mode: 'create' | 'edit'
  bookkeepingId?: string
  initialValues?: BookkeepingFormValues
}

export function useBookkeepingForm({
  mode,
  bookkeepingId,
  initialValues = emptyBookkeepingFormValues,
}: UseBookkeepingFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<BookkeepingFormValues>(initialValues)
  const [errors, setErrors] = useState<BookkeepingFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof BookkeepingFormValues>(
    field: K,
    value: BookkeepingFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: BookkeepingFormValues) {
    const result = bookkeepingFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: BookkeepingFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof BookkeepingFormValues] = issue.message
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
            ? 'Unable to create bookkeeping'
            : 'Unable to update bookkeeping',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const created = await createBookkeeping(values)
        await queryClient.invalidateQueries({
          queryKey: bookkeepingQueryKeys.all,
        })
        notify('success', {
          title: 'Bookkeeping created',
          description: 'The payroll period has been added.',
        })
        void navigate({
          to: '/bookkeeping/$bookkeepingId',
          params: { bookkeepingId: created.id },
        })
        return
      }

      if (!bookkeepingId) {
        return
      }

      const updated = await updateBookkeeping(bookkeepingId, values)
      await queryClient.invalidateQueries({
        queryKey: bookkeepingQueryKeys.all,
      })
      notify('success', {
        title: 'Bookkeeping updated',
        description: 'Changes to this payroll period have been saved.',
      })
      void navigate({
        to: '/bookkeeping/$bookkeepingId',
        params: { bookkeepingId: updated.id },
      })
    } catch (error) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to create bookkeeping'
            : 'Unable to update bookkeeping',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    if (mode === 'edit' && bookkeepingId) {
      void navigate({
        to: '/bookkeeping/$bookkeepingId',
        params: { bookkeepingId },
      })
      return
    }
    void navigate({ to: '/bookkeeping' })
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
