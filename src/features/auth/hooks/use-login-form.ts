import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

import { notify } from '../../../shared/lib/notify'
import { getApiErrorMessage, login, logout } from '../api/auth-api'
import { getDefaultStaffPath } from '../lib/route-access'
import { loginFormSchema } from '../schema/login-form-schema'
import { useAuthStore } from '../store/auth-store'
import { hasAuthRole } from '../types/auth'
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
  const setSession = useAuthStore((state) => state.setSession)
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
      const result = await login({
        email: values.email,
        password: values.password,
        remember_me: values.rememberMe,
      })

      const isStudent =
        hasAuthRole(result.user, 'student') || Boolean(result.user.is_student)

      if (isStudent) {
        try {
          await logout()
        } catch {
          // Best-effort cookie clear
        }
        useAuthStore.getState().clearSession()
        notify('error', {
          title: 'Staff accounts only',
          description:
            'Student accounts cannot sign in to the admin panel. Use the student portal instead.',
        })
        return
      }

      setSession({
        user: {
          ...result.user,
          roles: result.user.roles ?? [],
          permissions: result.user.permissions ?? [],
        },
        rememberMe: values.rememberMe,
      })

      notify('success', {
        title: 'Signed in',
        description: `Welcome back, ${result.user.full_name || result.user.email}.`,
      })

      await navigate({ to: getDefaultStaffPath(result.user) })
    } catch (error) {
      notify('error', {
        title: 'Sign in failed',
        description: getApiErrorMessage(
          error,
          'Invalid email or password. Please try again.',
        ),
      })
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
