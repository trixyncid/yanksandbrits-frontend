import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import {
  createBranch,
  emptyBranchFormValues,
  updateBranch,
} from '../api/branches-api'
import { branchQueryKeys } from '../api/branch-query-keys'
import { branchFormSchema } from '../schema/branch-form-schema'
import type {
  BranchFormErrors,
  BranchFormValues,
} from '../types/branch'

type UseBranchFormOptions = {
  mode: 'create' | 'edit'
  branchId?: string
  initialValues?: BranchFormValues
}

export function useBranchForm({
  mode,
  branchId,
  initialValues = emptyBranchFormValues,
}: UseBranchFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [values, setValues] = useState<BranchFormValues>(initialValues)
  const [errors, setErrors] = useState<BranchFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof BranchFormValues>(
    field: K,
    value: BranchFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: BranchFormValues) {
    const result = branchFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: BranchFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof BranchFormValues] = issue.message
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
            ? 'Unable to add branch'
            : 'Unable to update branch',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      if (mode === 'create') {
        const created = await createBranch(values)
        await queryClient.invalidateQueries({
          queryKey: branchQueryKeys.all,
        })
        notify('success', {
          title: 'Branch created',
          description: `${created.name} has been added.`,
        })
        void navigate({ to: '/branches' })
        return
      }

      if (!branchId) {
        return
      }

      const updated = await updateBranch(branchId, values)
      await queryClient.invalidateQueries({
        queryKey: branchQueryKeys.all,
      })
      notify('success', {
        title: 'Branch updated',
        description: `${updated.name} has been saved.`,
      })
      void navigate({ to: '/branches' })
    } catch (error) {
      notify('error', {
        title:
          mode === 'create'
            ? 'Unable to add branch'
            : 'Unable to update branch',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    void navigate({ to: '/branches' })
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
