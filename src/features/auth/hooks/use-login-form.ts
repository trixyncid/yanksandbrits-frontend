import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { loginPlaceholder } from '../api/login-placeholder'
import { loginFormSchema } from '../schema/login-form-schema'
import type {
  LoginFormErrors,
  LoginFormValues,
} from '../types/login-form-values'

const defaultValues: LoginFormValues = {
  email: '',
  password: '',
  rememberMe: true,
}

export function useLoginForm() {
  const navigate = useNavigate()
  const [values, setValues] = useState<LoginFormValues>(defaultValues)
  const [errors, setErrors] = useState<LoginFormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function updateField<K extends keyof LoginFormValues>(
    field: K,
    value: LoginFormValues[K],
  ) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validateForm(nextValues: LoginFormValues) {
    const result = loginFormSchema.safeParse(nextValues)

    if (result.success) {
      setErrors({})
      return true
    }

    const nextErrors: LoginFormErrors = {}

    for (const issue of result.error.issues) {
      const field = issue.path[0]

      if (typeof field === 'string' && !(field in nextErrors)) {
        nextErrors[field as keyof LoginFormValues] = issue.message
      }
    }

    setErrors(nextErrors)
    return false
  }

  async function submit() {
    const isValid = validateForm(values)

    if (!isValid) {
      notify('error', {
        title: 'Unable to sign in',
        description: 'Please check the highlighted fields and try again.',
      })
      return
    }

    setIsSubmitting(true)

    try {
      const result = await loginPlaceholder(values)
      notify(result.type, {
        title: result.ok ? 'Sign in placeholder submitted' : 'Sign in failed',
        description: result.message,
      })

      if (result.ok) {
        await navigate({ to: '/dashboard' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return {
    values,
    errors,
    isSubmitting,
    updateField,
    submit,
  }
}
