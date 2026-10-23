import { parseISO } from 'date-fns'
import {
  Briefcase,
  IdCard,
  KeyRound,
  Phone,
  Power,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'

import type { StaffEntityKind } from '../lib/staff-entity-config'
import { PersonAvatar, SoftPill } from './people-ui'
import { RoleAccountForm } from './role-account-form'

import { FormSectionCard } from '../../../shared/components/feature-page'
import { FormSaveBar } from '../../../shared/components/page'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { StatusToggle } from '../../../shared/components/ui/status-toggle'
import { Textarea } from '../../../shared/components/ui/textarea'
import { cn } from '../../../shared/lib/cn'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { useStaffPermissionsQuery } from '../../staff-permissions/hooks/use-staff-permissions-query'
import {
  EMPLOYMENT_TYPE_OPTIONS,
  WORKING_DAYS_PER_WEEK_OPTIONS,
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
  required,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  hint?: string
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </Label>
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
  entityKind?: StaffEntityKind
  defaultRoleCode?: string
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
  entityKind = 'staff',
  defaultRoleCode,
  onChange,
  onSubmit,
  onCancel,
}: UserFormProps) {
  if (entityKind === 'tutor' || entityKind === 'marketing') {
    return (
      <RoleAccountForm
        mode={mode}
        kind={entityKind}
        defaultRoleCode={defaultRoleCode}
        values={values}
        errors={errors}
        isSubmitting={isSubmitting}
        entityLabel={entityLabel}
        onChange={onChange}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    )
  }

  return (
    <StaffAccountForm
      mode={mode}
      values={values}
      errors={errors}
      isSubmitting={isSubmitting}
      entityLabel={entityLabel}
      onChange={onChange}
      onSubmit={onSubmit}
      onCancel={onCancel}
    />
  )
}

function StaffAccountForm({
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
  const showTutorEmployment = entityLabel === 'Tutor'

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

  const selectedRoles = roleOptions.filter((role) =>
    values.groupIds.includes(role.id),
  )
  const branchName =
    (branchesQuery.data?.data ?? []).find(
      (branch) => branch.id === values.branchId,
    )?.name ?? ''

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <FormSectionCard
            icon={KeyRound}
            title="Sign-in"
            description="What they use to log in to the admin."
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="PIN"
                htmlFor="pin"
                error={errors.pin}
                hint="A 1–4 digit number, unique to this person."
                required
              >
                <Input
                  id="pin"
                  value={values.pin}
                  onChange={(event) => onChange('pin', event.target.value)}
                  placeholder="1001"
                  inputMode="numeric"
                  className="font-mono"
                />
              </Field>

              <Field
                label="Email address"
                htmlFor="email"
                error={errors.email}
                required
              >
                <Input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(event) => onChange('email', event.target.value)}
                  placeholder="name@email.com"
                />
              </Field>

              <Field
                label={mode === 'edit' ? 'New password' : 'Password'}
                htmlFor="password"
                error={errors.password}
                required={mode === 'create'}
                hint={
                  mode === 'edit'
                    ? 'Leave blank to keep the current password.'
                    : 'At least 6 characters.'
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
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={UserRound}
            title="About them"
            description="Name, initials and personal details on file."
            delayClassName="delay-75"
          >
            <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_9rem]">
              <Field
                label="Full name"
                htmlFor="fullName"
                error={errors.fullName}
                required
              >
                <Input
                  id="fullName"
                  value={values.fullName}
                  onChange={(event) => onChange('fullName', event.target.value)}
                  placeholder="Full name"
                />
              </Field>

              <Field
                label="Initials"
                htmlFor="initial"
                error={errors.initial}
                hint={
                  entityLabel === 'Marketing'
                    ? 'Used to credit commission. Max 2 letters.'
                    : 'Optional. Max 2 letters.'
                }
              >
                <Input
                  id="initial"
                  value={values.initial}
                  onChange={(event) => onChange('initial', event.target.value)}
                  placeholder="AB"
                  maxLength={2}
                  className="uppercase"
                />
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
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

              <Field
                label="Place of birth"
                htmlFor="birthPlace"
                error={errors.birthPlace}
              >
                <Input
                  id="birthPlace"
                  value={values.birthPlace}
                  onChange={(event) =>
                    onChange('birthPlace', event.target.value)
                  }
                  placeholder="Jakarta"
                />
              </Field>

              <Field
                label="Date of birth"
                htmlFor="birthDate"
                error={errors.birthDate}
              >
                <DatePicker
                  value={parseDateValue(values.birthDate)}
                  onChange={(date) => onChange('birthDate', toDateString(date))}
                  placeholder="Pick birth date"
                  title="Birth date"
                  captionLayout="dropdown"
                  className="h-12 w-full min-w-0 justify-start rounded-full border-slate-200/80 bg-white px-4 font-medium shadow-sm"
                  align="start"
                />
              </Field>
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={Phone}
            title="Contact"
            description="How the team can reach this person."
            delayClassName="delay-100"
          >
            <div className="grid gap-4 sm:grid-cols-3">
              <Field
                label="Mobile phone"
                htmlFor="mobilePhone"
                error={errors.mobilePhone}
              >
                <Input
                  id="mobilePhone"
                  value={values.mobilePhone}
                  onChange={(event) =>
                    onChange('mobilePhone', event.target.value)
                  }
                  placeholder="0812-3456-7890"
                />
              </Field>
              <Field
                label="Parents' phone"
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
                label="Other phone"
                htmlFor="otherPhone"
                error={errors.otherPhone}
              >
                <Input
                  id="otherPhone"
                  value={values.otherPhone}
                  onChange={(event) =>
                    onChange('otherPhone', event.target.value)
                  }
                  placeholder="Optional"
                />
              </Field>
            </div>

            <Field label="Home address" htmlFor="address" error={errors.address}>
              <Textarea
                id="address"
                value={values.address}
                onChange={(event) => onChange('address', event.target.value)}
                placeholder="Street, city, postal code"
              />
            </Field>
          </FormSectionCard>

          <FormSectionCard
            icon={Briefcase}
            title="Work"
            description="Where they work, their type of work, and leave allowance."
            delayClassName="delay-150"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Branch"
                htmlFor="branchId"
                error={errors.branchId}
                required
              >
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

              {showTutorEmployment ? (
                <>
                  <Field
                    label="Employment type"
                    htmlFor="employmentType"
                    error={errors.employmentType}
                    hint="Used to match tutor salary bonus tiers."
                  >
                    <Select
                      id="employmentType"
                      containerClassName="w-full sm:w-full"
                      value={values.employmentType}
                      onChange={(event) => {
                        const next = event.target
                          .value as UserFormValues['employmentType']
                        onChange('employmentType', next)
                        if (next !== 'FT' && next !== 'PT') {
                          onChange('workingDaysPerWeek', '')
                        }
                        // Freelancers have no paid leave.
                        if (next === 'FL') {
                          onChange('paidLeave', '0')
                        }
                      }}
                    >
                      <option value="">Select employment type</option>
                      {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                  </Field>

                  {values.employmentType === 'FT' ||
                  values.employmentType === 'PT' ? (
                    <Field
                      label="Working days per week"
                      htmlFor="workingDaysPerWeek"
                      error={errors.workingDaysPerWeek}
                      hint="5 or 6 days — used with bonus tiers."
                    >
                      <Select
                        id="workingDaysPerWeek"
                        containerClassName="w-full sm:w-full"
                        value={values.workingDaysPerWeek}
                        onChange={(event) =>
                          onChange(
                            'workingDaysPerWeek',
                            event.target
                              .value as UserFormValues['workingDaysPerWeek'],
                          )
                        }
                      >
                        <option value="">Select working days</option>
                        {WORKING_DAYS_PER_WEEK_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  ) : null}
                </>
              ) : null}

              {values.employmentType === 'FL' ? (
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-slate-700">Paid leave</p>
                  <p className="rounded-2xl bg-canvas px-4 py-3 text-sm text-slate-500">
                    Freelancers don't have paid leave.
                  </p>
                </div>
              ) : (
              <Field
                label="Paid leave (days per year)"
                htmlFor="paidLeave"
                error={errors.paidLeave}
                required
              >
                <Input
                  id="paidLeave"
                  value={values.paidLeave}
                  onChange={(event) => onChange('paidLeave', event.target.value)}
                  inputMode="numeric"
                  placeholder="12"
                />
              </Field>
              )}

              <Field
                label="Resign date"
                htmlFor="resignDate"
                error={errors.resignDate}
                hint="Only fill this in when they are leaving."
              >
                <DatePicker
                  value={parseDateValue(values.resignDate)}
                  onChange={(date) =>
                    onChange('resignDate', toDateString(date))
                  }
                  placeholder="Optional resign date"
                  title="Resign date"
                  className="h-12 w-full min-w-0 justify-start rounded-full border-slate-200/80 bg-white px-4 font-medium shadow-sm"
                  align="start"
                />
              </Field>
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={ShieldCheck}
            title="Roles"
            description="Roles decide what this person can see and change. Built-in roles (Manager, Tutor, Marketing) also decide which lists and portals they use."
            delayClassName="delay-200"
          >
            {rolesQuery.isLoading ? (
              <div className="grid gap-2 sm:grid-cols-2" aria-busy="true">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className="h-14 animate-pulse rounded-2xl bg-canvas"
                  />
                ))}
              </div>
            ) : roleOptions.length === 0 ? (
              <p className="rounded-2xl bg-canvas px-4 py-4 text-sm text-slate-500">
                No roles have been set up yet. Create them under Roles first.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {roleOptions.map((role) => {
                  const checked = values.groupIds.includes(role.id)
                  return (
                    <label
                      key={role.id}
                      htmlFor={`role-${role.id}`}
                      className={cn(
                        'flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl px-4 py-3 text-sm transition',
                        checked
                          ? 'bg-ink text-white'
                          : 'bg-canvas text-slate-600 hover:bg-canvas-deep',
                      )}
                    >
                      <input
                        id={`role-${role.id}`}
                        type="checkbox"
                        className="size-4 rounded border-slate-300 text-brand-500 focus:ring-brand-500/40"
                        checked={checked}
                        onChange={(event) =>
                          toggleGroup(role.id, event.target.checked)
                        }
                      />
                      <span className="min-w-0">
                        <span
                          className={cn(
                            'block font-semibold',
                            checked ? 'text-white' : 'text-ink',
                          )}
                        >
                          {role.name}
                        </span>
                        {role.isSystem ? (
                          <span
                            className={cn(
                              'block text-xs',
                              checked ? 'text-white/70' : 'text-slate-400',
                            )}
                          >
                            Built-in role
                          </span>
                        ) : null}
                      </span>
                    </label>
                  )
                })}
              </div>
            )}
            <FieldError message={errors.groupIds} />
          </FormSectionCard>
        </div>

        <div className="space-y-3 lg:sticky lg:top-4">
          <FormSectionCard
            icon={IdCard}
            title="Preview"
            description="How they will appear in lists."
            delayClassName="delay-75"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-canvas px-3.5 py-3">
              <PersonAvatar
                name={values.fullName.trim() || 'New person'}
                muted={!values.isActive}
                size="lg"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {values.fullName.trim() || 'Full name'}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {values.email.trim() || 'name@email.com'}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1">
                  {values.pin ? (
                    <span className="rounded-full bg-white px-2 py-0.5 font-mono text-[10px] font-semibold text-slate-500">
                      {values.pin}
                    </span>
                  ) : null}
                  {branchName ? (
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                      {branchName}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
            <div>
              <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                Roles
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {selectedRoles.length ? (
                  selectedRoles.map((role) => (
                    <SoftPill key={role.id} tone="brand" dot={false}>
                      {role.name}
                    </SoftPill>
                  ))
                ) : (
                  <span className="text-xs text-slate-400">
                    No roles picked yet
                  </span>
                )}
              </div>
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={Power}
            title="Account status"
            description="Inactive accounts can't sign in but keep their history."
            delayClassName="delay-100"
          >
            <StatusToggle
              id="user-is-active"
              value={values.isActive}
              onChange={(next) => onChange('isActive', next)}
              description={
                values.isActive
                  ? 'Can sign in and appears in staff lists.'
                  : 'Blocked from signing in.'
              }
              error={errors.isActive}
            />
          </FormSectionCard>
        </div>
      </div>

      <FormSaveBar
        mode={mode}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        submitLabel={
          mode === 'create' ? `Create ${entityLabel.toLowerCase()} account` : 'Save changes'
        }
        hint="Fields marked * are required."
      />
    </form>
  )
}
