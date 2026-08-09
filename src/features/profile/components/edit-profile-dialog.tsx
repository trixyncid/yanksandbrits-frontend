import { parseISO } from 'date-fns'
import { Pencil } from 'lucide-react'
import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { useQueryClient } from '@tanstack/react-query'

import { mapGenderToApi } from '../../../shared/api/choices'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { notify } from '../../../shared/lib/notify'
import { updateMe } from '../../auth/api/auth-api'
import { useAuthStore } from '../../auth/store/auth-store'
import type { UserDetail } from '../../users/api/users-api'
import type { CurrentUserProfile } from '../types/profile'

type EditProfileDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  profile: CurrentUserProfile
  detail?: UserDetail | null
}

type FormValues = {
  fullName: string
  gender: 'male' | 'female'
  birthPlace: string
  birthDate: string
  address: string
  mobilePhone: string
  homePhone: string
  otherPhone: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="text-xs text-rose-500">{message}</p>
}

function Field({
  label,
  htmlFor,
  error,
  children,
  className,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  className?: string
}) {
  return (
    <div className={className ?? 'space-y-2'}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      <FieldError message={error} />
    </div>
  )
}

function displayValue(value: string | null | undefined) {
  if (!value || value === '—') return ''
  return value
}

function parseDateValue(value: string) {
  if (!value) return undefined
  try {
    return parseISO(value)
  } catch {
    return undefined
  }
}

function toDateString(date: Date | undefined) {
  if (!date) return ''
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

function buildInitialValues(
  profile: CurrentUserProfile,
  detail?: UserDetail | null,
): FormValues {
  return {
    fullName: detail?.fullName?.trim() || displayValue(profile.fullName),
    gender: detail?.gender ?? profile.gender ?? 'male',
    birthPlace: detail?.birthPlace?.trim() || displayValue(profile.birthPlace),
    birthDate: (detail?.birthDate ?? profile.birthDate ?? '').slice(0, 10),
    address: detail?.address?.trim() || displayValue(profile.address),
    mobilePhone: detail?.phone?.trim() || displayValue(profile.mobilePhone),
    homePhone: detail?.homePhone?.trim() || displayValue(profile.homePhone),
    otherPhone: detail?.otherPhone?.trim() || displayValue(profile.othersPhone),
  }
}

export function EditProfileDialog({
  open,
  onOpenChange,
  profile,
  detail,
}: EditProfileDialogProps) {
  const queryClient = useQueryClient()
  const setSession = useAuthStore((state) => state.setSession)
  const rememberMe = useAuthStore((state) => state.rememberMe)
  const [values, setValues] = useState<FormValues>(() =>
    buildInitialValues(profile, detail),
  )
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (open) {
      setValues(buildInitialValues(profile, detail))
      setErrors({})
      setIsSubmitting(false)
    }
  }, [open, profile, detail])

  function updateField<K extends keyof FormValues>(field: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  function validate(): boolean {
    const nextErrors: FormErrors = {}

    if (!values.fullName.trim()) {
      nextErrors.fullName = 'Full name is required.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting || !validate()) return

    setIsSubmitting(true)

    try {
      const user = await updateMe({
        full_name: values.fullName.trim(),
        gender: mapGenderToApi(values.gender),
        birth_place: values.birthPlace.trim() || null,
        birth_date: values.birthDate || null,
        address: values.address.trim() || null,
        mobile_phone: values.mobilePhone.trim() || null,
        home_phone: values.homePhone.trim() || null,
        other_phone: values.otherPhone.trim() || null,
      })

      setSession({ user, rememberMe })
      await queryClient.invalidateQueries({
        queryKey: ['users', 'detail', profile.id],
      })

      notify('success', {
        title: 'Profile updated',
        description: 'Your profile details have been saved.',
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', {
        title: 'Unable to update profile',
        description: getApiErrorMessage(
          error,
          'Please check the highlighted fields and try again.',
        ),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showClose
        className="max-h-[90vh] overflow-hidden p-0 sm:max-w-2xl"
      >
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex max-h-[90vh] flex-col"
        >
          <div className="shrink-0 bg-[linear-gradient(135deg,#EDF4FF_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
            <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9] ring-1 ring-[#BED2F2]">
              <Pencil className="size-5" />
            </div>
            <DialogHeader className="pr-0">
              <DialogTitle>Edit profile</DialogTitle>
              <DialogDescription>
                Update your personal and contact details. Branch, PIN, email,
                and roles stay managed by administrators.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Personal</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  Identity details shown on your staff profile.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Full name"
                  htmlFor="profile-full-name"
                  error={errors.fullName}
                  className="space-y-2 sm:col-span-2"
                >
                  <Input
                    id="profile-full-name"
                    value={values.fullName}
                    onChange={(event) =>
                      updateField('fullName', event.target.value)
                    }
                    placeholder="Your full name"
                  />
                </Field>

                <Field
                  label="Gender"
                  htmlFor="profile-gender"
                  error={errors.gender}
                >
                  <Select
                    id="profile-gender"
                    containerClassName="w-full sm:w-full"
                    value={values.gender}
                    onChange={(event) =>
                      updateField(
                        'gender',
                        event.target.value as FormValues['gender'],
                      )
                    }
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Select>
                </Field>

                <Field
                  label="Date of birth"
                  htmlFor="profile-birth-date"
                  error={errors.birthDate}
                >
                  <DatePicker
                    value={parseDateValue(values.birthDate)}
                    onChange={(date) =>
                      updateField('birthDate', toDateString(date))
                    }
                    placeholder="Pick birth date"
                    title="Birth date"
                    captionLayout="dropdown"
                    className="h-12 w-full min-w-0 justify-start rounded-xl border-slate-200 bg-[#F4F6FA] px-4 font-medium"
                    align="start"
                  />
                </Field>

                <Field
                  label="Place of birth"
                  htmlFor="profile-birth-place"
                  error={errors.birthPlace}
                  className="space-y-2 sm:col-span-2"
                >
                  <Input
                    id="profile-birth-place"
                    value={values.birthPlace}
                    onChange={(event) =>
                      updateField('birthPlace', event.target.value)
                    }
                    placeholder="Jakarta"
                  />
                </Field>

                <Field
                  label="Home address"
                  htmlFor="profile-address"
                  error={errors.address}
                  className="space-y-2 sm:col-span-2"
                >
                  <Textarea
                    id="profile-address"
                    value={values.address}
                    onChange={(event) =>
                      updateField('address', event.target.value)
                    }
                    placeholder="Street, city, postal code"
                  />
                </Field>
              </div>
            </section>

            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <section className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Contact</h3>
                <p className="mt-0.5 text-xs text-slate-500">
                  How the team can reach you. Email stays read-only.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Email"
                  htmlFor="profile-email"
                  className="space-y-2 sm:col-span-2"
                >
                  <Input
                    id="profile-email"
                    value={profile.email}
                    disabled
                    readOnly
                  />
                </Field>

                <Field
                  label="Mobile phone"
                  htmlFor="profile-mobile"
                  error={errors.mobilePhone}
                >
                  <Input
                    id="profile-mobile"
                    value={values.mobilePhone}
                    onChange={(event) =>
                      updateField('mobilePhone', event.target.value)
                    }
                    placeholder="+62812..."
                  />
                </Field>

                <Field
                  label="Home phone"
                  htmlFor="profile-home"
                  error={errors.homePhone}
                >
                  <Input
                    id="profile-home"
                    value={values.homePhone}
                    onChange={(event) =>
                      updateField('homePhone', event.target.value)
                    }
                    placeholder="+6221..."
                  />
                </Field>

                <Field
                  label="Other phone"
                  htmlFor="profile-other"
                  error={errors.otherPhone}
                  className="space-y-2 sm:col-span-2"
                >
                  <Input
                    id="profile-other"
                    value={values.otherPhone}
                    onChange={(event) =>
                      updateField('otherPhone', event.target.value)
                    }
                    placeholder="Optional"
                  />
                </Field>
              </div>
            </section>
          </div>

          <DialogFooter className="mt-0 shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
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
              <Pencil className="size-3.5" />
              {isSubmitting ? 'Saving...' : 'Save changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
