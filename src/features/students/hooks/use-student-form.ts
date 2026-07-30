import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import {
  createStudent,
  emptyStudentFormValues,
  updateStudent,
} from '../api/students-api'
import { studentQueryKeys } from '../api/student-query-keys'
import { studentFormSchema } from '../schema/student-form-schema'
import type { StudentFormErrors, StudentFormValues } from '../types/student'

type UseStudentFormOptions = {
  mode: 'create' | 'edit'
  studentId?: string
  initialValues?: StudentFormValues
}

export function useStudentForm({
  mode,
  studentId,
  initialValues = emptyStudentFormValues,
}: UseStudentFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<StudentFormValues>(initialValues)
  const [errors, setErrors] = useState<StudentFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof StudentFormValues>(
    field: K,
    value: StudentFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: StudentFormValues) {
    const result = studentFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: StudentFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof StudentFormValues] = issue.message
      }
    }

    setErrors(nextErrors)
    return false
  }

  async function submit() {
    const isValid = validateForm(values)

    if (!isValid) {
      notify('error', {
        title: mode === 'create' ? 'Unable to add student' : 'Unable to update',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const created = await createStudent(values)
        await queryClient.invalidateQueries({ queryKey: studentQueryKeys.all })
        notify('success', {
          title: 'Student created',
          description: `${created.pin} | ${created.fullName} has been added.`,
        })
        void navigate({
          to: '/students/$studentId',
          params: { studentId: created.id },
        })
        return
      }

      if (!studentId) {
        return
      }

      const updated = await updateStudent(studentId, values)
      await queryClient.invalidateQueries({ queryKey: studentQueryKeys.all })
      notify('success', {
        title: 'Student updated',
        description: `${updated.pin} | ${updated.fullName} has been saved.`,
      })
      void navigate({
        to: '/students/$studentId',
        params: { studentId: updated.id },
      })
    } catch (error) {
      notify('error', {
        title: mode === 'create' ? 'Unable to add student' : 'Unable to update',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    if (mode === 'edit' && studentId) {
      void navigate({
        to: '/students/$studentId',
        params: { studentId },
      })
      return
    }

    void navigate({ to: '/students' })
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
