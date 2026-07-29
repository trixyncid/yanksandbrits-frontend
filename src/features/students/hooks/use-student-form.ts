import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { studentQueryKeys } from '../api/student-query-keys'
import { emptyStudentFormValues } from '../data/students-placeholder'
import { studentFormSchema } from '../schema/student-form-schema'
import { useStudentsStore } from '../store/students-store'
import type {
  StudentFormErrors,
  StudentFormValues,
} from '../types/student'

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
  const addStudent = useStudentsStore((state) => state.add)
  const updateStudent = useStudentsStore((state) => state.update)
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
      await new Promise((resolve) => window.setTimeout(resolve, 350))

      if (mode === 'create') {
        const created = addStudent(values)
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

      const updated = updateStudent(studentId, values)

      if (!updated) {
        notify('error', {
          title: 'Student not found',
          description: 'This student could not be updated.',
        })
        return
      }

      await queryClient.invalidateQueries({ queryKey: studentQueryKeys.all })
      notify('success', {
        title: 'Student updated',
        description: `${updated.pin} | ${updated.fullName} has been saved.`,
      })
      void navigate({
        to: '/students/$studentId',
        params: { studentId: updated.id },
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
