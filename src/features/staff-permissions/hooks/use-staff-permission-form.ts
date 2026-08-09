import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import {
  createStaffPermission,
  emptyStaffPermissionFormValues,
  updateStaffPermission,
} from '../api/staff-permissions-api'
import { staffPermissionQueryKeys } from '../api/staff-permission-query-keys'
import { staffPermissionFormSchema } from '../schema/staff-permission-form-schema'
import type {
  StaffPermissionFormErrors,
  StaffPermissionFormValues,
} from '../types/staff-permission'

type UseStaffPermissionFormOptions = {
  mode: 'create' | 'edit'
  groupId?: string
  initialValues?: StaffPermissionFormValues
}

export function useStaffPermissionForm({
  mode,
  groupId,
  initialValues = emptyStaffPermissionFormValues,
}: UseStaffPermissionFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<StaffPermissionFormValues>(initialValues)
  const [errors, setErrors] = useState<StaffPermissionFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof StaffPermissionFormValues>(
    field: K,
    value: StaffPermissionFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function togglePermission(permissionId: string) {
    setValues((current) => {
      const selected = new Set(current.permissionIds)
      if (selected.has(permissionId)) {
        selected.delete(permissionId)
      } else {
        selected.add(permissionId)
      }
      return { ...current, permissionIds: Array.from(selected) }
    })
    setErrors((current) => ({ ...current, permissionIds: undefined }))
  }

  function setPermissionGroup(ids: string[], selected: boolean) {
    setValues((current) => {
      const next = new Set(current.permissionIds)
      for (const id of ids) {
        if (selected) {
          next.add(id)
        } else {
          next.delete(id)
        }
      }
      return { ...current, permissionIds: Array.from(next) }
    })
    setErrors((current) => ({ ...current, permissionIds: undefined }))
  }

  function validateForm(nextValues: StaffPermissionFormValues) {
    const result = staffPermissionFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: StaffPermissionFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof StaffPermissionFormValues] = issue.message
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
            ? 'Unable to create group'
            : 'Unable to update group',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const created = await createStaffPermission(values)
        await queryClient.invalidateQueries({
          queryKey: staffPermissionQueryKeys.all,
        })
        notify('success', {
          title: 'Group created',
          description: `${created.name} has been added.`,
        })
        void navigate({ to: '/staff-permissions' })
        return
      }

      if (!groupId) {
        return
      }

      const updated = await updateStaffPermission(groupId, values)
      await queryClient.invalidateQueries({
        queryKey: staffPermissionQueryKeys.all,
      })
      notify('success', {
        title: 'Group updated',
        description: `${updated.name} has been saved.`,
      })
      void navigate({ to: '/staff-permissions' })
    } catch (error) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to create group'
            : 'Unable to update group',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    void navigate({ to: '/staff-permissions' })
  }

  return {
    values,
    errors,
    isSubmitting,
    updateField,
    togglePermission,
    setPermissionGroup,
    submit,
    cancel,
  }
}
