import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import type { ApiErrorBody } from '../../../shared/api/types'
import { notify } from '../../../shared/lib/notify'
import { predictionTestQueryKeys } from '../../prediction-tests/api/prediction-test-query-keys'
import {
  createProspectiveStudent,
  emptyProspectiveStudentFormValues,
  updateProspectiveStudent,
} from '../api/prospective-students-api'
import { prospectiveStudentQueryKeys } from '../api/prospective-student-query-keys'
import { prospectiveStudentFormSchema } from '../schema/prospective-student-form-schema'
import type {
  ProspectiveStudentFormErrors,
  ProspectiveStudentFormValues,
} from '../types/prospective-student'

const apiFieldToFormField: Record<string, keyof ProspectiveStudentFormValues> = {
  full_name: 'fullName',
  email: 'email',
  phone: 'phone',
  gender: 'gender',
  course: 'course',
  status: 'status',
  sr_number: 'srNumber',
  date: 'date',
  resource: 'resource',
  age: 'age',
  address: 'address',
  language_test: 'languageTest',
  listening: 'listening',
  speaking: 'speaking',
  reading: 'reading',
  writing: 'writing',
  marketing: 'marketingId',
  branch: 'branchId',
}

function formErrorsFromApi(error: unknown): ProspectiveStudentFormErrors {
  if (!axios.isAxiosError(error)) {
    return {}
  }

  const details = (error.response?.data as ApiErrorBody | undefined)?.details
  if (!details || typeof details !== 'object') {
    return {}
  }

  const next: ProspectiveStudentFormErrors = {}
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

type UseProspectiveStudentFormOptions = {
  mode: 'create' | 'edit'
  prospectiveStudentId?: string
  initialValues?: ProspectiveStudentFormValues
}

export function useProspectiveStudentForm({
  mode,
  prospectiveStudentId,
  initialValues = emptyProspectiveStudentFormValues,
}: UseProspectiveStudentFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<ProspectiveStudentFormValues>(initialValues)
  const [errors, setErrors] = useState<ProspectiveStudentFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof ProspectiveStudentFormValues>(
    field: K,
    value: ProspectiveStudentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: ProspectiveStudentFormValues) {
    const result = prospectiveStudentFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: ProspectiveStudentFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof ProspectiveStudentFormValues] = issue.message
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
            ? 'Unable to add prospective student'
            : 'Unable to update prospective student',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const created = await createProspectiveStudent(values)
        await queryClient.invalidateQueries({
          queryKey: prospectiveStudentQueryKeys.all,
        })

        if (values.status === 'prediction_test') {
          await queryClient.invalidateQueries({
            queryKey: predictionTestQueryKeys.all,
          })
          notify('success', {
            title: 'Prospective student created',
            description: `${created.fullName} was saved and a prediction test record was created.`,
          })
          void navigate({ to: '/prospective-students' })
          return
        }

        notify('success', {
          title: 'Prospective student created',
          description: `${created.fullName} has been added.`,
        })
        void navigate({ to: '/prospective-students' })
        return
      }

      if (!prospectiveStudentId) {
        return
      }

      const updated = await updateProspectiveStudent(prospectiveStudentId, values)
      await queryClient.invalidateQueries({
        queryKey: prospectiveStudentQueryKeys.all,
      })

      if (values.status === 'prediction_test') {
        await queryClient.invalidateQueries({
          queryKey: predictionTestQueryKeys.all,
        })
        notify('success', {
          title: 'Prospective student updated',
          description: `${updated.fullName} was saved and a prediction test record was created.`,
        })
        void navigate({ to: '/prospective-students' })
        return
      }

      notify('success', {
        title: 'Prospective student updated',
        description: `${updated.fullName} has been saved.`,
      })
      void navigate({ to: '/prospective-students' })
    } catch (error) {
      const fieldErrors = formErrorsFromApi(error)
      if (Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors)
      }
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to add prospective student'
            : 'Unable to update prospective student',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    void navigate({ to: '/prospective-students' })
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
