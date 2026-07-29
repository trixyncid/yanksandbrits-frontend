import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { studentResponseQueryKeys } from '../api/student-response-query-keys'
import { emptyStudentResponseFormValues } from '../data/student-responses-placeholder'
import { studentResponseFormSchema } from '../schema/student-response-form-schema'
import { useStudentResponsesStore } from '../store/student-responses-store'
import type {
  StudentResponseFormErrors,
  StudentResponseFormValues,
} from '../types/student-response'

type UseStudentResponseFormOptions = {
  mode: 'create' | 'edit'
  responseId?: string
  initialValues?: StudentResponseFormValues
}

export function useStudentResponseForm({
  mode,
  responseId,
  initialValues = emptyStudentResponseFormValues,
}: UseStudentResponseFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addResponse = useStudentResponsesStore((state) => state.add)
  const updateResponse = useStudentResponsesStore((state) => state.update)
  const [values, setValues] = useState<StudentResponseFormValues>(initialValues)
  const [errors, setErrors] = useState<StudentResponseFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof StudentResponseFormValues>(
    field: K,
    value: StudentResponseFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: StudentResponseFormValues) {
    const result = studentResponseFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: StudentResponseFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof StudentResponseFormValues] = issue.message
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
            ? 'Unable to add response'
            : 'Unable to update response',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350))

      if (mode === 'create') {
        const created = addResponse(values)
        await queryClient.invalidateQueries({
          queryKey: studentResponseQueryKeys.all,
        })
        notify('success', {
          title: 'Response created',
          description: `${created.title} has been added.`,
        })
        void navigate({ to: '/student-responses' })
        return
      }

      if (!responseId) {
        return
      }

      const updated = updateResponse(responseId, values)

      if (!updated) {
        notify('error', {
          title: 'Response not found',
          description: 'This response could not be updated.',
        })
        return
      }

      await queryClient.invalidateQueries({
        queryKey: studentResponseQueryKeys.all,
      })
      notify('success', {
        title: 'Response updated',
        description: `${updated.title} has been saved.`,
      })
      void navigate({ to: '/student-responses' })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    void navigate({ to: '/student-responses' })
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
