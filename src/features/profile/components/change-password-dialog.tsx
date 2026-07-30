import { KeyRound } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import { Label } from '../../../shared/components/ui/label'
import { PasswordInput } from '../../../shared/components/ui/password-input'
import { notify } from '../../../shared/lib/notify'
import { changePassword } from '../../auth/api/auth-api'

type ChangePasswordDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type FormValues = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

const emptyValues: FormValues = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-rose-500">{message}</p>
}

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: ChangePasswordDialogProps) {
  const [values, setValues] = useState<FormValues>(emptyValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!open) {
      setValues(emptyValues)
      setErrors({})
      setIsSubmitting(false)
    }
  }, [open])

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {}

    if (!values.currentPassword.trim()) {
      nextErrors.currentPassword = 'Current password is required.'
    }

    if (!values.newPassword.trim()) {
      nextErrors.newPassword = 'New password is required.'
    } else if (values.newPassword.length < 8) {
      nextErrors.newPassword = 'New password must be at least 8 characters.'
    }

    if (!values.confirmPassword.trim()) {
      nextErrors.confirmPassword = 'Please confirm your new password.'
    } else if (values.newPassword !== values.confirmPassword) {
      nextErrors.confirmPassword = 'Passwords do not match.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || !validate()) return

    setIsSubmitting(true)

    try {
      await changePassword({
        current_password: values.currentPassword,
        new_password: values.newPassword,
      })

      notify('success', {
        title: 'Password updated',
        description: 'Your password has been changed successfully.',
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', {
        title: 'Unable to change password',
        description: getApiErrorMessage(
          error,
          'Please check your current password and try again.',
        ),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose className="overflow-hidden p-0 sm:max-w-md">
        <form onSubmit={handleSubmit} noValidate>
          <div className="bg-[linear-gradient(135deg,#EDF4FF_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9] ring-1 ring-[#BED2F2]">
              <KeyRound className="size-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle>Change password</DialogTitle>
              <DialogDescription>
                Enter your current password and choose a new one. New passwords
                must be at least 8 characters.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-4 px-6 py-5">
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <PasswordInput
                id="current-password"
                autoComplete="current-password"
                value={values.currentPassword}
                onChange={(event) =>
                  updateField('currentPassword', event.target.value)
                }
              />
              <FieldError message={errors.currentPassword} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <PasswordInput
                id="new-password"
                autoComplete="new-password"
                value={values.newPassword}
                onChange={(event) =>
                  updateField('newPassword', event.target.value)
                }
              />
              <FieldError message={errors.newPassword} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <PasswordInput
                id="confirm-password"
                autoComplete="new-password"
                value={values.confirmPassword}
                onChange={(event) =>
                  updateField('confirmPassword', event.target.value)
                }
              />
              <FieldError message={errors.confirmPassword} />
            </div>
          </div>

          <DialogFooter className="mt-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" size="sm" disabled={isSubmitting}>
              <KeyRound className="size-3.5" />
              {isSubmitting ? 'Saving...' : 'Update password'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
