import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { studentGroupQueryKeys } from '../api/student-group-query-keys'
import { emptyStudentGroupFormValues } from '../data/student-groups-placeholder'
import { studentGroupFormSchema } from '../schema/student-group-form-schema'
import { useStudentGroupsStore } from '../store/student-groups-store'
import type {
  StudentGroupFormErrors,
  StudentGroupFormValues,
} from '../types/student-group'

type UseStudentGroupFormOptions = {
  mode: 'create' | 'edit'
  groupId?: string
  initialValues?: StudentGroupFormValues
}

export function useStudentGroupForm({
  mode,
  groupId,
  initialValues = emptyStudentGroupFormValues,
}: UseStudentGroupFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addGroup = useStudentGroupsStore((state) => state.add)
  const updateGroup = useStudentGroupsStore((state) => state.update)
  const [values, setValues] = useState<StudentGroupFormValues>(initialValues)
  const [errors, setErrors] = useState<StudentGroupFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof StudentGroupFormValues>(
    field: K,
    value: StudentGroupFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: StudentGroupFormValues) {
    const result = studentGroupFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: StudentGroupFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof StudentGroupFormErrors] = issue.message
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
            ? 'Unable to add group'
            : 'Unable to update group',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350))

      if (mode === 'create') {
        const created = addGroup(values)
        await queryClient.invalidateQueries({
          queryKey: studentGroupQueryKeys.all,
        })
        notify('success', {
          title: 'Student group created',
          description: `${created.groupName} has been added.`,
        })
        void navigate({ to: '/student-groups' })
        return
      }

      if (!groupId) {
        return
      }

      const updated = updateGroup(groupId, values)

      if (!updated) {
        notify('error', {
          title: 'Group not found',
          description: 'This student group could not be updated.',
        })
        return
      }

      await queryClient.invalidateQueries({
        queryKey: studentGroupQueryKeys.all,
      })
      notify('success', {
        title: 'Student group updated',
        description: `${updated.groupName} has been saved.`,
      })
      void navigate({ to: '/student-groups' })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    void navigate({ to: '/student-groups' })
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
