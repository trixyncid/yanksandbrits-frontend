import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { predictionTestQueryKeys } from '../api/prediction-test-query-keys'
import { emptyPredictionTestFormValues } from '../data/prediction-tests-placeholder'
import { predictionTestFormSchema } from '../schema/prediction-test-form-schema'
import { usePredictionTestsStore } from '../store/prediction-tests-store'
import type {
  PredictionTestFormErrors,
  PredictionTestFormValues,
} from '../types/prediction-test'

type UsePredictionTestFormOptions = {
  mode: 'create' | 'edit'
  testId?: string
  initialValues?: PredictionTestFormValues
}

export function usePredictionTestForm({
  mode,
  testId,
  initialValues = emptyPredictionTestFormValues,
}: UsePredictionTestFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addTest = usePredictionTestsStore((state) => state.add)
  const updateTest = usePredictionTestsStore((state) => state.update)
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
    const result = predictionTestFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: PredictionTestFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof PredictionTestFormValues] = issue.message
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
            ? 'Unable to add prediction test'
            : 'Unable to update prediction test',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350))

      if (mode === 'create') {
        const created = addTest(values)
        await queryClient.invalidateQueries({
          queryKey: predictionTestQueryKeys.all,
        })
        notify('success', {
          title: 'Prediction test created',
          description: `${created.studentName} has been added.`,
        })
        void navigate({ to: '/prediction-tests' })
        return
      }

      if (!testId) {
        return
      }

      const updated = updateTest(testId, values)

      if (!updated) {
        notify('error', {
          title: 'Prediction test not found',
          description: 'This prediction test could not be updated.',
        })
        return
      }

      await queryClient.invalidateQueries({
        queryKey: predictionTestQueryKeys.all,
      })
      notify('success', {
        title: 'Prediction test updated',
        description: `${updated.studentName} has been saved.`,
      })
      void navigate({ to: '/prediction-tests' })
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
