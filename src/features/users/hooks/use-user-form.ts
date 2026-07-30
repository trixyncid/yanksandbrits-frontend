import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { userQueryKeys } from '../api/user-query-keys'
import {
  createUser,
  emptyUserFormValues,
  updateUser,
  type UserFormErrors,
  type UserFormValues,
} from '../api/users-api'
import type { StaffEntityConfig } from '../lib/staff-entity-config'
import {
  userFormSchema,
  validateUserPassword,
} from '../schema/user-form-schema'

type UseUserFormOptions = {
  mode: 'create' | 'edit'
  userId?: string
  entity: StaffEntityConfig
  initialValues?: UserFormValues
}

export function useUserForm({
  mode,
  userId,
  entity,
  initialValues = emptyUserFormValues,
}: UseUserFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<UserFormValues>(initialValues)
  const [errors, setErrors] = useState<UserFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof UserFormValues>(
    field: K,
    value: UserFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: UserFormValues) {
    const result = userFormSchema.safeParse(nextValues)
    const nextErrors: UserFormErrors = {}

    if (!result.success) {
      for (const issue of result.error.issues) {
        const field = issue.path[0]

        if (typeof field === 'string' && !(field in nextErrors)) {
          nextErrors[field as keyof UserFormValues] = issue.message
        }
      }
    }

    const passwordError = validateUserPassword(nextValues.password, mode)
    if (passwordError) {
      nextErrors.password = passwordError
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function detailPath(id: string) {
    if (entity.kind === 'staff') {
      return { to: '/staff/$staffId' as const, params: { staffId: id } }
    }
    if (entity.kind === 'tutor') {
      return { to: '/tutors/$tutorId' as const, params: { tutorId: id } }
    }
    return {
      to: '/marketings/$marketingId' as const,
      params: { marketingId: id },
    }
  }

  async function submit() {
    const isValid = validateForm(values)

    if (!isValid) {
      notify('error', {
        title:
          mode === 'create'
            ? `Unable to add ${entity.singular.toLowerCase()}`
            : 'Unable to update',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const created = await createUser(values)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: userQueryKeys.all }),
          queryClient.invalidateQueries({ queryKey: entity.listQueryKey }),
        ])
        notify('success', {
          title: `${entity.singular} created`,
          description: `${created.pin} | ${created.fullName} has been added.`,
        })
        void navigate(detailPath(created.id))
        return
      }

      if (!userId) {
        return
      }

      const updated = await updateUser(userId, values)
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userQueryKeys.all }),
        queryClient.invalidateQueries({ queryKey: entity.listQueryKey }),
      ])
      notify('success', {
        title: `${entity.singular} updated`,
        description: `${updated.pin} | ${updated.fullName} has been saved.`,
      })
      void navigate(detailPath(updated.id))
    } catch (error) {
      notify('error', {
        title:
          mode === 'create'
            ? `Unable to add ${entity.singular.toLowerCase()}`
            : 'Unable to update',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    if (mode === 'edit' && userId) {
      void navigate(detailPath(userId))
      return
    }

    void navigate({ to: entity.listPath })
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
