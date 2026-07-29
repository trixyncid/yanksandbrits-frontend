import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { classroomQueryKeys } from '../api/classroom-query-keys'
import { emptyClassroomFormValues } from '../data/classrooms-placeholder'
import { classroomFormSchema } from '../schema/classroom-form-schema'
import { useClassroomsStore } from '../store/classrooms-store'
import type {
  ClassroomFormErrors,
  ClassroomFormValues,
} from '../types/classroom'

type UseClassroomFormOptions = {
  mode: 'create' | 'edit'
  classroomId?: string
  initialValues?: ClassroomFormValues
}

export function useClassroomForm({
  mode,
  classroomId,
  initialValues = emptyClassroomFormValues,
}: UseClassroomFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addClassroom = useClassroomsStore((state) => state.add)
  const updateClassroom = useClassroomsStore((state) => state.update)
  const [values, setValues] = useState<ClassroomFormValues>(initialValues)
  const [errors, setErrors] = useState<ClassroomFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof ClassroomFormValues>(
    field: K,
    value: ClassroomFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: ClassroomFormValues) {
    const result = classroomFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: ClassroomFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof ClassroomFormValues] = issue.message
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
            ? 'Unable to add classroom'
            : 'Unable to update classroom',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350))

      if (mode === 'create') {
        const created = addClassroom(values)
        await queryClient.invalidateQueries({
          queryKey: classroomQueryKeys.all,
        })
        notify('success', {
          title: 'Classroom created',
          description: `${created.className} has been added.`,
        })
        void navigate({ to: '/classrooms' })
        return
      }

      if (!classroomId) {
        return
      }

      const updated = updateClassroom(classroomId, values)

      if (!updated) {
        notify('error', {
          title: 'Classroom not found',
          description: 'This classroom could not be updated.',
        })
        return
      }

      await queryClient.invalidateQueries({
        queryKey: classroomQueryKeys.all,
      })
      notify('success', {
        title: 'Classroom updated',
        description: `${updated.className} has been saved.`,
      })
      void navigate({ to: '/classrooms' })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    void navigate({ to: '/classrooms' })
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
