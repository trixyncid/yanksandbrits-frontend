import { parseISO } from 'date-fns'
import type { FormEvent, ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { useStaffPermissionsQuery } from '../../staff-permissions/hooks/use-staff-permissions-query'
import {
  STAFF_TYPE_OPTIONS,
  type UserFormErrors,
  type UserFormValues,
} from '../api/users-api'

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs text-rose-500">{message}</p>
}

function Field({
  label,
  htmlFor,
  error,
  children,
  hint,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  hint?: string
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  )
}

function parseDateValue(value: string) {
  if (!value) {
    return undefined
  }

  try {
    return parseISO(value)
  } catch {
    return undefined
  }
}

function toDateString(date: Date | undefined) {
  if (!date) {
    return ''
  }

  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type UserFormProps = {
  mode: 'create' | 'edit'
  values: UserFormValues
  errors: UserFormErrors
  isSubmitting: boolean
  entityLabel: string
  onChange: <K extends keyof UserFormValues>(
    field: K,
    value: UserFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
}

export function UserForm({
  mode,
  values,
  errors,
  isSubmitting,
  entityLabel,
  onChange,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const branchesQuery = useBranchesQuery()
  const rolesQuery = useStaffPermissionsQuery()

  const roleOptions = (rolesQuery.data?.data ?? []).filter(
    (role) => role.code !== 'student',
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  function toggleGroup(id: string, checked: boolean) {
    if (checked) {
      onChange('groupIds', [...new Set([...values.groupIds, id])])
      return
    }
    onChange(
      'groupIds',
      values.groupIds.filter((groupId) => groupId !== id),
    )
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Account Information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Login credentials and identity used across the admin system.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="PIN"
            htmlFor="pin"
            error={errors.pin}
            hint="1–4 digit numeric PIN."
          >
            <Input
              id="pin"
              value={values.pin}
              onChange={(event) => onChange('pin', event.target.value)}
              placeholder="1001"
              inputMode="numeric"
            />
          </Field>

          <Field
            label="Initial"
            htmlFor="initial"
            error={errors.initial}
            hint="Optional unique initials (max 2 characters)."
          >
            <Input
              id="initial"
              value={values.initial}
              onChange={(event) => onChange('initial', event.target.value)}
              placeholder="AB"
              maxLength={2}
            />
          </Field>

          <Field label="Full Name" htmlFor="fullName" error={errors.fullName}>
            <Input
              id="fullName"
              value={values.fullName}
              onChange={(event) => onChange('fullName', event.target.value)}
              placeholder="Full name"
            />
          </Field>

          <Field label="Email Address" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(event) => onChange('email', event.target.value)}
              placeholder="name@email.com"
            />
          </Field>

          <Field
            label={mode === 'edit' ? 'New Password' : 'Password'}
            htmlFor="password"
            error={errors.password}
            hint={
              mode === 'edit'
                ? 'Leave blank to keep the current password.'
                : undefined
            }
          >
            <Input
              id="password"
              type="password"
              value={values.password}
              onChange={(event) => onChange('password', event.target.value)}
              placeholder={
                mode === 'edit' ? '••••••••' : 'Create a password'
              }
              autoComplete="new-password"
            />
          </Field>

          <Field label="Gender" htmlFor="gender" error={errors.gender}>
            <Select
              id="gender"
              containerClassName="w-full sm:w-full"
              value={values.gender}
              onChange={(event) =>
                onChange(
                  'gender',
                  event.target.value as UserFormValues['gender'],
                )
              }
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </Field>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Personal Information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Birth details and home address on file.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Place of Birth"
            htmlFor="birthPlace"
            error={errors.birthPlace}
          >
            <Input
              id="birthPlace"
              value={values.birthPlace}
              onChange={(event) => onChange('birthPlace', event.target.value)}
              placeholder="Jakarta"
            />
          </Field>

          <Field
            label="Date of Birth"
            htmlFor="birthDate"
            error={errors.birthDate}
          >
            <DatePicker
              value={parseDateValue(values.birthDate)}
              onChange={(date) => onChange('birthDate', toDateString(date))}
              placeholder="Pick birth date"
              title="Birth date"
              captionLayout="dropdown"
              className="h-12 w-full min-w-0 justify-start rounded-xl border-slate-200 bg-[#F4F6FA] px-4 font-medium"
              align="start"
            />
          </Field>
        </div>

        <Field label="Home Address" htmlFor="address" error={errors.address}>
          <Textarea
            id="address"
            value={values.address}
            onChange={(event) => onChange('address', event.target.value)}
            placeholder="Street, city, postal code"
          />
        </Field>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Contact Information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            How the team can reach this person.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Phone (Mobile)"
            htmlFor="mobilePhone"
            error={errors.mobilePhone}
          >
            <Input
              id="mobilePhone"
              value={values.mobilePhone}
              onChange={(event) => onChange('mobilePhone', event.target.value)}
              placeholder="0812-3456-7890"
            />
          </Field>
          <Field
            label="Phone (Home)"
            htmlFor="homePhone"
            error={errors.homePhone}
          >
            <Input
              id="homePhone"
              value={values.homePhone}
              onChange={(event) => onChange('homePhone', event.target.value)}
              placeholder="021-555-0101"
            />
          </Field>
          <Field
            label="Phone (Others)"
            htmlFor="otherPhone"
            error={errors.otherPhone}
          >
            <Input
              id="otherPhone"
              value={values.otherPhone}
              onChange={(event) => onChange('otherPhone', event.target.value)}
              placeholder="Optional"
            />
          </Field>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Workplace & Roles
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Branch assignment and permission groups (Django roles).
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Branch" htmlFor="branchId" error={errors.branchId}>
            <Select
              id="branchId"
              containerClassName="w-full sm:w-full"
              value={values.branchId}
              onChange={(event) => onChange('branchId', event.target.value)}
            >
              <option value="">Select branch</option>
              {(branchesQuery.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Staff Type"
            htmlFor="staffType"
            error={errors.staffType}
          >
            <Select
              id="staffType"
              containerClassName="w-full sm:w-full"
              value={values.staffType}
              onChange={(event) => onChange('staffType', event.target.value)}
            >
              {STAFF_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Paid Leave"
            htmlFor="paidLeave"
            error={errors.paidLeave}
          >
            <Input
              id="paidLeave"
              value={values.paidLeave}
              onChange={(event) => onChange('paidLeave', event.target.value)}
              inputMode="numeric"
              placeholder="12"
            />
          </Field>

          <Field
            label="Resign Date"
            htmlFor="resignDate"
            error={errors.resignDate}
          >
            <DatePicker
              value={parseDateValue(values.resignDate)}
              onChange={(date) => onChange('resignDate', toDateString(date))}
              placeholder="Optional resign date"
              title="Resign date"
              className="h-12 w-full min-w-0 justify-start rounded-xl border-slate-200 bg-[#F4F6FA] px-4 font-medium"
              align="start"
            />
          </Field>
        </div>

        <div className="space-y-2">
          <Label>Permission groups</Label>
          <p className="text-xs text-slate-400">
            Assign one or more roles. System roles (manager, tutor, marketing)
            also drive domain lists and portals.
          </p>
          {rolesQuery.isLoading ? (
            <p className="text-sm text-slate-500">Loading roles…</p>
          ) : roleOptions.length === 0 ? (
            <p className="text-sm text-slate-500">
              No roles defined yet. Create them under Roles.
            </p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {roleOptions.map((role) => (
                <label
                  key={role.id}
                  htmlFor={`role-${role.id}`}
                  className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-[#F4F6FA] px-4 py-3 text-sm text-slate-600"
                >
                  <input
                    id={`role-${role.id}`}
                    type="checkbox"
                    className="size-4 rounded border-slate-300 text-[#4274B9] focus:ring-[#4274B9]/40"
                    checked={values.groupIds.includes(role.id)}
                    onChange={(event) =>
                      toggleGroup(role.id, event.target.checked)
                    }
                  />
                  <span className="min-w-0">
                    <span className="block font-medium text-slate-800">
                      {role.name}
                    </span>
                    {role.code ? (
                      <span className="block text-xs text-slate-400">
                        {role.code}
                        {role.isSystem ? ' · system' : ''}
                      </span>
                    ) : null}
                  </span>
                </label>
              ))}
            </div>
          )}
          <FieldError message={errors.groupIds} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="isActive">Active Status</Label>
          <label
            htmlFor="isActive"
            className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-[#F4F6FA] px-4 text-sm text-slate-600"
          >
            <input
              id="isActive"
              type="checkbox"
              className="size-4 rounded border-slate-300 text-[#4274B9] focus:ring-[#4274B9]/40"
              checked={values.isActive}
              onChange={(event) => onChange('isActive', event.target.checked)}
            />
            <span>
              {values.isActive
                ? 'Account is active'
                : 'Account is inactive'}
            </span>
          </label>
          <FieldError message={errors.isActive} />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-6">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting
            ? mode === 'create'
              ? 'Saving...'
              : 'Updating...'
            : mode === 'create'
              ? `Add ${entityLabel}`
              : `Update ${entityLabel}`}
        </Button>
      </div>
    </form>
  )
}
