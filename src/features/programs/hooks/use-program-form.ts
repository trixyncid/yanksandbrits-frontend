import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { programQueryKeys } from '../api/program-query-keys'
import { emptyProgramFormValues } from '../data/programs-placeholder'
import { programFormSchema } from '../schema/program-form-schema'
import { useProgramsStore } from '../store/programs-store'
import type {
  ProgramFormErrors,
  ProgramFormValues,
} from '../types/program'

type UseProgramFormOptions = {
  mode: 'create' | 'edit'
  programId?: string
  initialValues?: ProgramFormValues
}

export function useProgramForm({
  mode,
  programId,
  initialValues = emptyProgramFormValues,
}: UseProgramFormOptions) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const addProgram = useProgramsStore((state) => state.add)
  const updateProgram = useProgramsStore((state) => state.update)
  const [values, setValues] = useState<ProgramFormValues>(initialValues)
  const [errors, setErrors] = useState<ProgramFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof ProgramFormValues>(
    field: K,
    value: ProgramFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: ProgramFormValues) {
    const result = programFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: ProgramFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof ProgramFormValues] = issue.message
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
            ? 'Unable to add program'
            : 'Unable to update program',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      await new Promise((resolve) => window.setTimeout(resolve, 350))

      if (mode === 'create') {
        const created = addProgram(values)
        await queryClient.invalidateQueries({
          queryKey: programQueryKeys.all,
        })
        notify('success', {
          title: 'Program created',
          description: `${created.title} has been added.`,
        })
        void navigate({ to: '/programs' })
        return
      }

      if (!programId) {
        return
      }

      const updated = updateProgram(programId, values)

      if (!updated) {
        notify('error', {
          title: 'Program not found',
          description: 'This program could not be updated.',
        })
        return
      }

      await queryClient.invalidateQueries({
        queryKey: programQueryKeys.all,
      })
      notify('success', {
        title: 'Program updated',
        description: `${updated.title} has been saved.`,
      })
      void navigate({ to: '/programs' })
    } finally {
      setIsSubmitting(false)
    }
  }

  function cancel() {
    void navigate({ to: '/programs' })
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
