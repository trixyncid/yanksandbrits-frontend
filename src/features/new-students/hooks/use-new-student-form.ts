import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { predictionTestQueryKeys } from '../../prediction-tests/api/prediction-test-query-keys'
import {
  createNewStudent,
  emptyNewStudentFormValues,
  updateNewStudent,
} from '../api/new-students-api'
import { newStudentQueryKeys } from '../api/new-student-query-keys'
import { newStudentFormSchema } from '../schema/new-student-form-schema'
import type {
  NewStudentFormErrors,
  NewStudentFormValues,
} from '../types/new-student'

type UseNewStudentFormOptions = {
  mode: 'create' | 'edit'
  studentId?: string
  initialValues?: NewStudentFormValues
}

export function useNewStudentForm({
  mode,
  studentId,
  initialValues = emptyNewStudentFormValues,
}: UseNewStudentFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<NewStudentFormValues>(initialValues)
  const [errors, setErrors] = useState<NewStudentFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof NewStudentFormValues>(
    field: K,
    value: NewStudentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: NewStudentFormValues) {
    const result = newStudentFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: NewStudentFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof NewStudentFormValues] = issue.message
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
            ? 'Unable to add new student'
            : 'Unable to update new student',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const created = await createNewStudent(values)
        await queryClient.invalidateQueries({
          queryKey: newStudentQueryKeys.all,
        })

        if (values.status === 'prediction_test') {
          await queryClient.invalidateQueries({
            queryKey: predictionTestQueryKeys.all,
          })
          notify('success', {
            title: 'New student created',
            description: `${created.fullName} moved to prediction tests.`,
          })
          void navigate({ to: '/prediction-tests' })
          return
        }

        notify('success', {
          title: 'New student created',
          description: `${created.fullName} has been added.`,
        })
        void navigate({ to: '/new-students' })
        return
      }

      if (!studentId) {
        return
      }

      const updated = await updateNewStudent(studentId, values)
      await queryClient.invalidateQueries({
        queryKey: newStudentQueryKeys.all,
      })

      if (values.status === 'prediction_test') {
        await queryClient.invalidateQueries({
          queryKey: predictionTestQueryKeys.all,
        })
        notify('success', {
          title: 'New student updated',
          description: `${updated.fullName} moved to prediction tests.`,
        })
        void navigate({ to: '/prediction-tests' })
        return
      }

      notify('success', {
        title: 'New student updated',
        description: `${updated.fullName} has been saved.`,
      })
      void navigate({ to: '/new-students' })
    } catch (error) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to add new student'
            : 'Unable to update new student',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    void navigate({ to: '/new-students' })
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
