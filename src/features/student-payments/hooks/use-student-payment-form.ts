import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { useIsRestrictedMarketing } from '../../auth/hooks/use-permissions'
import {
  createStudentPayment,
  emptyStudentPaymentFormValues,
  updateStudentPayment,
} from '../api/student-payments-api'
import { studentPaymentQueryKeys } from '../api/student-payment-query-keys'
import { studentPaymentFormSchema } from '../schema/student-payment-form-schema'
import type {
  StudentPaymentFormErrors,
  StudentPaymentFormValues,
} from '../types/student-payment'

type UseStudentPaymentFormOptions = {
  mode: 'create' | 'edit'
  paymentId?: string
  initialValues?: StudentPaymentFormValues
  /** After create, return to this student's detail page instead of the payments list. */
  returnToStudentId?: string
}

export function useStudentPaymentForm({
  mode,
  paymentId,
  initialValues = emptyStudentPaymentFormValues,
  returnToStudentId,
}: UseStudentPaymentFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const lockTransactionStatus = useIsRestrictedMarketing()
  const [values, setValues] = useState<StudentPaymentFormValues>(initialValues)
  const [errors, setErrors] = useState<StudentPaymentFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof StudentPaymentFormValues>(
    field: K,
    value: StudentPaymentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: StudentPaymentFormValues) {
    const result = studentPaymentFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: StudentPaymentFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof StudentPaymentFormValues] = issue.message
      }
    }

    setErrors(nextErrors)
    return false
  }

  function navigateAfterSave() {
    if (returnToStudentId) {
      void navigate({
        to: '/students/$studentId',
        params: { studentId: returnToStudentId },
      })
      return
    }
    void navigate({ to: '/student-payments' })
  }

  async function submit() {
    const isValid = validateForm(values)

    if (!isValid) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to record payment'
            : 'Unable to update payment',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const created = await createStudentPayment(values, {
          omitStatus: lockTransactionStatus,
        })
        await queryClient.invalidateQueries({
          queryKey: studentPaymentQueryKeys.all,
        })
        notify('success', {
          title: 'Payment recorded',
          description: `${created.title} for ${created.studentName} has been added.`,
        })
        navigateAfterSave()
        return
      }

      if (!paymentId) {
        return
      }

      const updated = await updateStudentPayment(paymentId, values, {
        omitStatus: lockTransactionStatus,
      })
      await queryClient.invalidateQueries({
        queryKey: studentPaymentQueryKeys.all,
      })
      notify('success', {
        title: 'Payment updated',
        description: `${updated.title} has been saved.`,
      })
      navigateAfterSave()
    } catch (error) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to record payment'
            : 'Unable to update payment',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    navigateAfterSave()
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
