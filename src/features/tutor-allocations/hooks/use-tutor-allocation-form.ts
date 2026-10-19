import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { useInvalidateNavBadges } from '../../admin/hooks/use-nav-badges-query'
import {
  createTutorAllocation,
  emptyTutorAllocationFormValues,
  updateTutorAllocation,
} from '../api/tutor-allocations-api'
import { tutorAllocationQueryKeys } from '../api/tutor-allocation-query-keys'
import { tutorAllocationFormSchema } from '../schema/tutor-allocation-form-schema'
import type {
  TutorAllocationFormErrors,
  TutorAllocationFormValues,
  TutorAllocationListItem,
} from '../types/tutor-allocation'

type UseTutorAllocationFormOptions = {
  mode: 'create' | 'edit'
  allocationId?: string
  initialValues?: TutorAllocationFormValues
  /**
   * After an edit saves. `stay` keeps the page open instead of going back to
   * the list; `notified` means the caller already showed a success message.
   */
  onUpdated?: (
    updated: TutorAllocationListItem,
  ) => { stay?: boolean; notified?: boolean } | void
}

export function useTutorAllocationForm({
  mode,
  allocationId,
  initialValues = emptyTutorAllocationFormValues,
  onUpdated,
}: UseTutorAllocationFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const invalidateNavBadges = useInvalidateNavBadges()
  const [values, setValues] = useState<TutorAllocationFormValues>(initialValues)
  const [errors, setErrors] = useState<TutorAllocationFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof TutorAllocationFormValues>(
    field: K,
    value: TutorAllocationFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: TutorAllocationFormValues) {
    const result = tutorAllocationFormSchema.safeParse(nextValues)
    if (result.success) {
      setErrors({})
      return true
    }
    const nextErrors: TutorAllocationFormErrors = {}
    for (const issue of result.error.issues) {
      const field = issue.path[0]
      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof TutorAllocationFormValues] = issue.message
      }
    }
    setErrors(nextErrors)
    return false
  }

  async function submit() {
    if (!validateForm(values)) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to add tutor allocation'
            : 'Unable to update tutor allocation',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      let outcome: { stay?: boolean; notified?: boolean } | void = undefined
      if (mode === 'create') {
        await createTutorAllocation(values)
      } else {
        const updated = await updateTutorAllocation(allocationId ?? '', values)
        outcome = onUpdated?.(updated)
      }
      await queryClient.invalidateQueries({
        queryKey: tutorAllocationQueryKeys.all,
      })
      invalidateNavBadges()
      if (!outcome?.notified) {
        notify('success', {
          title:
            mode === 'create'
              ? 'Tutor allocation created'
              : 'Tutor allocation updated',
          description:
            mode === 'create'
              ? 'The class will be reviewed and approved before tutors are assigned.'
              : 'The class has been saved.',
        })
      }
      if (outcome?.stay) return
      void navigate({ to: '/tutor-allocations' })
    } catch (error) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to add tutor allocation'
            : 'Unable to update tutor allocation',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    void navigate({ to: '/tutor-allocations' })
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
