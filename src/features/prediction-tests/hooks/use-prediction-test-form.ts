import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import type { ApiErrorBody } from '../../../shared/api/types'
import { notify } from '../../../shared/lib/notify'
import { useInvalidateNavBadges } from '../../admin/hooks/use-nav-badges-query'
import {
  useCanAssignGeneralEnglishTutor,
  useIsAcademicLeader,
  useIsProgramReviewer,
  useLocksPaymentStatus,
} from '../../auth/hooks/use-permissions'
import {
  createPredictionTest,
  emptyPredictionTestFormValues,
  updatePredictionTest,
} from '../api/prediction-tests-api'
import { predictionTestQueryKeys } from '../api/prediction-test-query-keys'
import {
  academicLeaderPredictionTestFormSchema,
  predictionTestFormSchema,
} from '../schema/prediction-test-form-schema'
import type {
  PredictionTestFormErrors,
  PredictionTestFormValues,
} from '../types/prediction-test'

type UsePredictionTestFormOptions = {
  mode: 'create' | 'edit'
  testId?: string
  initialValues?: PredictionTestFormValues
}

const apiFieldToFormField: Record<string, keyof PredictionTestFormValues> = {
  student: 'studentId',
  branch: 'branchId',
  listening: 'listening',
  reading: 'reading',
  writing: 'writing',
  speaking: 'speaking',
  math: 'math',
  description: 'description',
  amount: 'amount',
  status: 'status',
  general_english_tutor: 'generalEnglishTutorId',
}

function formErrorsFromApi(error: unknown): PredictionTestFormErrors {
  if (!axios.isAxiosError(error)) {
    return {}
  }

  const details = (error.response?.data as ApiErrorBody | undefined)?.details
  if (!details || typeof details !== 'object' || Array.isArray(details)) {
    return {}
  }

  const next: PredictionTestFormErrors = {}
  for (const [apiField, value] of Object.entries(
    details as Record<string, unknown>,
  )) {
    const formField = apiFieldToFormField[apiField]
    if (!formField) continue
    const message = Array.isArray(value) ? value[0] : value
    if (typeof message === 'string' && message.trim()) {
      next[formField] = message
    }
  }
  return next
}

export function usePredictionTestForm({
  mode,
  testId,
  initialValues = emptyPredictionTestFormValues,
}: UsePredictionTestFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const invalidateNavBadges = useInvalidateNavBadges()
  const isAcademicLeader = useIsAcademicLeader()
  const locksPaymentStatus = useLocksPaymentStatus()
  const isProgramReviewer = useIsProgramReviewer()
  const canAssignGeneralEnglishTutor = useCanAssignGeneralEnglishTutor()
  const [values, setValues] = useState<PredictionTestFormValues>(initialValues)
  const [errors, setErrors] = useState<PredictionTestFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof PredictionTestFormValues>(
    field: K,
    value: PredictionTestFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: PredictionTestFormValues) {
    const schema = isAcademicLeader
      ? academicLeaderPredictionTestFormSchema
      : predictionTestFormSchema
    const result = schema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return null
    }

    const nextErrors: PredictionTestFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof PredictionTestFormValues] = issue.message
      }
    }

    setErrors(nextErrors)
    return (
      Object.values(nextErrors).find((message) => Boolean(message)) ??
      'Please check the highlighted fields and try again.'
    )
  }

  async function submit(course: string | null = null) {
    const payload: PredictionTestFormValues =
      locksPaymentStatus && mode === 'create'
        ? { ...values, status: 'pending' }
        : values
    const validationMessage = validateForm(payload)

    if (validationMessage) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to add prediction test'
            : 'Unable to update prediction test',
        description: validationMessage,
      })
      return
    }

    setIsSubmitting(true)

    try {
      const apiOptions = {
        omitPayment: isProgramReviewer,
        includeGeneralEnglishTutor: canAssignGeneralEnglishTutor,
        course,
      }

      if (mode === 'create') {
        const created = await createPredictionTest(payload, apiOptions)
        await queryClient.invalidateQueries({
          queryKey: predictionTestQueryKeys.all,
        })
        invalidateNavBadges()
        notify('success', {
          title: 'Prediction test created',
          description: `Prediction test for ${created.studentName} has been added.`,
        })
        void navigate({ to: '/prediction-tests' })
        return
      }

      if (!testId) {
        return
      }

      const updated = await updatePredictionTest(testId, payload, apiOptions)
      await queryClient.invalidateQueries({
        queryKey: predictionTestQueryKeys.all,
      })
      invalidateNavBadges()
      notify('success', {
        title: 'Prediction test updated',
        description: `Prediction test for ${updated.studentName} has been saved.`,
      })
      void navigate({ to: '/prediction-tests' })
    } catch (error) {
      const fieldErrors = formErrorsFromApi(error)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors((current) => ({ ...current, ...fieldErrors }))
      }
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to add prediction test'
            : 'Unable to update prediction test',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    void navigate({ to: '/prediction-tests' })
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
