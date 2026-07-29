import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { predictionTestQueryKeys } from '../../prediction-tests/api/prediction-test-query-keys'
import { usePredictionTestsStore } from '../../prediction-tests/store/prediction-tests-store'
import { newStudentQueryKeys } from '../api/new-student-query-keys'
import { emptyNewStudentFormValues } from '../data/new-students-placeholder'
import { newStudentFormSchema } from '../schema/new-student-form-schema'
import { useNewStudentsStore } from '../store/new-students-store'
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
  const addStudent = useNewStudentsStore((state) => state.add)
  const updateStudent = useNewStudentsStore((state) => state.update)
  const ensurePredictionTest = usePredictionTestsStore(
    (state) => state.ensureForStudent,
  )
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
      await new Promise((resolve) => window.setTimeout(resolve, 350))

      let savedId = studentId

      if (mode === 'create') {
        const created = addStudent(values)
        savedId = created.id
        notify('success', {
          title: 'New student created',
          description: `${created.fullName} has been added.`,
        })
      } else {
        if (!studentId) {
          return
        }

        const updated = updateStudent(studentId, values)

        if (!updated) {
          notify('error', {
            title: 'New student not found',
            description: 'This student could not be updated.',
          })
          return
        }

        notify('success', {
          title: 'New student updated',
          description: `${updated.fullName} has been saved.`,
        })
      }

      if (values.status === 'prediction_test' && savedId) {
        ensurePredictionTest(savedId)
        await queryClient.invalidateQueries({
          queryKey: predictionTestQueryKeys.all,
        })
        await queryClient.invalidateQueries({
          queryKey: newStudentQueryKeys.all,
        })
        void navigate({ to: '/prediction-tests' })
        return
      }

      await queryClient.invalidateQueries({
        queryKey: newStudentQueryKeys.all,
      })
      void navigate({ to: '/new-students' })
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
