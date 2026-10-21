import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import type { ApiErrorBody } from '../../../shared/api/types'
import { notify } from '../../../shared/lib/notify'
import { useResourceOptionsQuery } from '../../lookups/hooks/use-lookup-options'
import { predictionTestQueryKeys } from '../../prediction-tests/api/prediction-test-query-keys'
import {
  createProspectiveStudent,
  createStudentResponse,
  emptyProspectiveStudentFormValues,
  updateProspectiveStudent,
} from '../api/prospective-students-api'
import { emptyExtraStudent, validateExtraStudent } from '../lib/extra-students'
import { prospectiveStudentQueryKeys } from '../api/prospective-student-query-keys'
import { isReferralResource } from '../lib/referral'
import { prospectiveStudentFormSchema } from '../schema/prospective-student-form-schema'
import type {
  ExtraStudentErrors,
  ExtraStudentValues,
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
  resource: 'resourceId',
  referral_student: 'referralStudentId',
  referral_name: 'referralName',
  tele_marketing: 'teleMarketing',
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

/** Field messages from an API error body (or one student's part of it). */
function fieldErrors(details: unknown): ProspectiveStudentFormErrors {
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

function apiErrorDetails(error: unknown): unknown {
  if (!axios.isAxiosError(error)) return undefined
  return (error.response?.data as ApiErrorBody | undefined)?.details
}

function formErrorsFromApi(error: unknown): ProspectiveStudentFormErrors {
  return fieldErrors(apiErrorDetails(error))
}

/** Bulk-create errors are keyed by student index: 0 is the main form. */
function studentErrorsFromApi(error: unknown): Record<string, unknown> {
  const details = apiErrorDetails(error) as { students?: Record<string, unknown> } | undefined
  return details?.students && typeof details.students === 'object' ? details.students : {}
}

type UseProspectiveStudentFormOptions = {
  mode: 'create' | 'edit'
  prospectiveStudentId?: string
  initialValues?: ProspectiveStudentFormValues
}

export function useProspectiveStudentForm({
  mode,
  prospectiveStudentId,
  initialValues = emptyProspectiveStudentFormValues(),
}: UseProspectiveStudentFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const resourcesQuery = useResourceOptionsQuery()
  const [values, setValues] = useState<ProspectiveStudentFormValues>(initialValues)
  const [errors, setErrors] = useState<ProspectiveStudentFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Create only: more students in the same response, keyed by card.
  const [extraStudents, setExtraStudents] = useState<ExtraStudentValues[]>([])
  const [extraErrors, setExtraErrors] = useState<Record<string, ExtraStudentErrors>>({})

  function addExtraStudent() {
    setExtraStudents((current) => [
      ...current,
      emptyExtraStudent({ phone: values.phone, address: values.address }),
    ])
  }

  function removeExtraStudent(key: string) {
    setExtraStudents((current) => current.filter((student) => student.key !== key))
    setExtraErrors((current) => {
      const next = { ...current }
      delete next[key]
      return next
    })
  }

  function updateExtraStudent<K extends keyof ExtraStudentValues>(
    key: string,
    field: K,
    value: ExtraStudentValues[K],
  ) {
    setExtraStudents((current) =>
      current.map((student) => (student.key === key ? { ...student, [field]: value } : student)),
    )
    setExtraErrors((current) => ({
      ...current,
      [key]: { ...current[key], [field]: undefined },
    }))
  }

  /** Validates every extra card; true when all are complete. */
  function validateExtraStudents() {
    const next: Record<string, ExtraStudentErrors> = {}
    for (const student of extraStudents) {
      const studentErrors = validateExtraStudent(student)
      if (Object.keys(studentErrors).length > 0) next[student.key] = studentErrors
    }
    setExtraErrors(next)
    return Object.keys(next).length === 0
  }

  function updateField<K extends keyof ProspectiveStudentFormValues>(
    field: K,
    value: ProspectiveStudentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: ProspectiveStudentFormValues) {
    const result = prospectiveStudentFormSchema.safeParse({
      ...nextValues,
      isReferral: isReferralResource(
        nextValues.resourceId,
        resourcesQuery.data,
      ),
    })

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
    const extrasValid = mode === 'create' ? validateExtraStudents() : true

    if (!isValid || !extrasValid) {
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
      if (mode === 'create' && extraStudents.length > 0) {
        const created = await createStudentResponse(values, extraStudents)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: prospectiveStudentQueryKeys.all }),
          queryClient.invalidateQueries({ queryKey: predictionTestQueryKeys.all }),
        ])
        notify('success', {
          title: 'Student response created',
          description: `${created.map((student) => student.fullName).join(', ')} were added in one response.`,
        })
        void navigate({ to: '/prospective-students' })
        return
      }

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
      const perStudent = studentErrorsFromApi(error)
      if (Object.keys(perStudent).length > 0) {
        // Bulk create: index 0 is the main form, the rest are the extra cards.
        setErrors(fieldErrors(perStudent['0']))
        const next: Record<string, ExtraStudentErrors> = {}
        extraStudents.forEach((student, index) => {
          const studentErrors = fieldErrors(perStudent[String(index + 1)])
          if (Object.keys(studentErrors).length > 0) {
            next[student.key] = studentErrors as ExtraStudentErrors
          }
        })
        setExtraErrors(next)
      }
      const apiFieldErrors = formErrorsFromApi(error)
      if (Object.keys(apiFieldErrors).length > 0) {
        setErrors(apiFieldErrors)
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
    extraStudents,
    extraErrors,
    addExtraStudent,
    removeExtraStudent,
    updateExtraStudent,
  }
}
