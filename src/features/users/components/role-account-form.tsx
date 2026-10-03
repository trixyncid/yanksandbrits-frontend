import { parseISO } from 'date-fns'
import {
  Building2,
  Check,
  Eye,
  EyeOff,
  KeyRound,
  Phone,
  ShieldCheck,
  UserRound,
} from 'lucide-react'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'

import { cn } from '../../../shared/lib/cn'
import {
  ChoiceTile,
  FormSectionCard,
} from '../../../shared/components/feature-page'
import { Button } from '../../../shared/components/ui/button'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { StatusToggle } from '../../../shared/components/ui/status-toggle'
import { Textarea } from '../../../shared/components/ui/textarea'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { useStaffPermissionsQuery } from '../../staff-permissions/hooks/use-staff-permissions-query'
import {
  EMPLOYMENT_TYPE_OPTIONS,
  STAFF_TYPE_OPTIONS,
  WORKING_DAYS_PER_WEEK_OPTIONS,
  employmentTypeLabel,
  getUserInitials,
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

function SegmentedChoice<T extends string>({
  id,
  label,
  value,
  options,
  onChange,
}: {
  id?: string
  label: string
  value: T | ''
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={label}
      className="grid h-12 grid-cols-2 gap-1 rounded-full border border-slate-200/80 bg-slate-50 p-1 shadow-sm"
    >
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(option.value)}
            className={cn(
              'truncate rounded-full px-2 text-sm font-semibold transition',
              selected
                ? 'bg-white text-[#253CA1] shadow-sm ring-1 ring-[#C8D4F5]'
                : 'text-slate-500 hover:bg-white/70 hover:text-slate-800',
            )}
          >
            {option.label}
          </button>
        )
      })}
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

type RoleAccountFormProps = {
  mode: 'create' | 'edit'
  kind: 'tutor' | 'marketing'
  defaultRoleCode?: string
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

export function RoleAccountForm({
  mode,
  kind,
  defaultRoleCode,
  values,
  errors,
  isSubmitting,
  entityLabel,
  onChange,
  onSubmit,
  onCancel,
}: RoleAccountFormProps) {
  const isTutor = kind === 'tutor'
  const branchesQuery = useBranchesQuery()
  const rolesQuery = useStaffPermissionsQuery()
  const [showPassword, setShowPassword] = useState(false)

  const branches = branchesQuery.data?.data ?? []
  const branchOptions = useMemo(
    () =>
      branches.map((branch) => ({
        value: branch.id,
        label: branch.name,
        keywords: branch.address,
      })),
    [branches],
  )
  const selectedBranch = branches.find((branch) => branch.id === values.branchId)

  const roleOptions = useMemo(() => {
    const roles = (rolesQuery.data?.data ?? []).filter(
      (role) => role.code !== 'student',
    )
    return [...roles].sort((left, right) => {
      if (left.code === defaultRoleCode) return -1
      if (right.code === defaultRoleCode) return 1
      return left.name.localeCompare(right.name)
    })
  }, [defaultRoleCode, rolesQuery.data?.data])

  const selectedRoles = roleOptions.filter((role) =>
    values.groupIds.includes(role.id),
  )

  const monogram = values.initial.trim()
    ? values.initial.trim().slice(0, 2).toUpperCase()
    : getUserInitials(values.fullName) || (isTutor ? 'TU' : 'EC')

  const displayName =
    values.fullName.trim() || (isTutor ? 'New tutor' : 'New counsellor')

  const steps = [
    { label: 'Full name', done: values.fullName.trim().length >= 2 },
    { label: 'PIN', done: /^\d{1,4}$/.test(values.pin.trim()) },
    {
      label: 'Email',
      done: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()),
    },
    ...(mode === 'create'
      ? [{ label: 'Password', done: values.password.trim().length >= 6 }]
      : []),
    { label: 'Branch', done: Boolean(values.branchId) },
    { label: 'Role', done: values.groupIds.length > 0 },
    ...(isTutor
      ? [{ label: 'Subject', done: values.staffTypes.length > 0 }]
      : []),
    ...(isTutor
      ? []
      : [
          {
            label: 'Initials',
            done: values.initial.trim().length > 0,
          },
        ]),
  ]
  const readyCount = steps.filter((step) => step.done).length
  const hasErrors = Object.values(errors).some(Boolean)

  const showsWorkingDays =
    values.employmentType === 'FT' || values.employmentType === 'PT'

  function toggleSubject(code: UserFormValues['staffTypes'][number]) {
    const selected = values.staffTypes.includes(code)
    onChange(
      'staffTypes',
      selected
        ? values.staffTypes.filter((item) => item !== code)
        : [...values.staffTypes, code],
    )
  }

  function selectEmployment(next: UserFormValues['employmentType']) {
    onChange('employmentType', next)
    if (next !== 'FT' && next !== 'PT' && values.workingDaysPerWeek) {
      onChange('workingDaysPerWeek', '')
    }
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  const submitLabel = isSubmitting
    ? mode === 'create'
      ? 'Saving...'
      : 'Updating...'
    : mode === 'create'
      ? `Add ${entityLabel}`
      : `Update ${entityLabel}`

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid items-start gap-3 xl:grid-cols-[minmax(0,1fr)_19.5rem]">
        <div className="space-y-3">
          <FormSectionCard
            icon={UserRound}
            title="The person"
            description={
              isTutor
                ? 'Start with who is joining the teaching team.'
                : 'Start with the counsellor students and families will meet.'
            }
          >
            <Field
              label="Full Name"
              htmlFor="fullName"
              error={errors.fullName}
              required
            >
              <Input
                id="fullName"
                value={values.fullName}
                onChange={(event) => onChange('fullName', event.target.value)}
                placeholder={isTutor ? 'Daniel Hartono' : 'Sari Wijaya'}
                autoComplete="name"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Gender" htmlFor="gender" error={errors.gender} required>
                <SegmentedChoice
                  id="gender"
                  label="Gender"
                  value={values.gender}
                  options={[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                  ]}
                  onChange={(next) => onChange('gender', next)}
                />
              </Field>

              <Field
                label="PIN"
                htmlFor="pin"
                error={errors.pin}
                required
                hint="1–4 digits. This is how the list finds them."
              >
                <Input
                  id="pin"
                  value={values.pin}
                  onChange={(event) =>
                    onChange(
                      'pin',
                      event.target.value.replace(/\D/g, '').slice(0, 4),
                    )
                  }
                  placeholder="1001"
                  inputMode="numeric"
                  autoComplete="off"
                />
              </Field>
            </div>

            <div className="grid gap-3 sm:grid-cols-[auto_minmax(0,1fr)] sm:items-start">
              <div className="flex flex-col gap-1.5">
                <span className="text-sm font-medium text-slate-700">
                  {isTutor ? 'Monogram' : 'Commission stamp'}
                </span>
                <div
                  aria-hidden
                  className="flex size-12 items-center justify-center rounded-2xl bg-[linear-gradient(160deg,#253CA1_0%,#1B2A5A_100%)] text-base font-bold tracking-wide text-white shadow-md shadow-[#253CA1]/25"
                >
                  {monogram}
                </div>
              </div>
              <Field
                label={isTutor ? 'Initials' : 'Initials'}
                htmlFor="initial"
                error={errors.initial}
                required={!isTutor}
                hint={
                  isTutor
                    ? 'Optional. Two letters, used when a short name is enough.'
                    : 'Two unique letters. Commission reports use this stamp.'
                }
              >
                <Input
                  id="initial"
                  value={values.initial}
                  onChange={(event) =>
                    onChange(
                      'initial',
                      event.target.value
                        .replace(/[^a-zA-Z]/g, '')
                        .slice(0, 2)
                        .toUpperCase(),
                    )
                  }
                  placeholder="SW"
                  maxLength={2}
                  className="uppercase tracking-[0.18em]"
                  autoComplete="off"
                />
              </Field>
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={KeyRound}
            title="Sign-in"
            description="The email and password they will use to open the admin."
            delayClassName="delay-75"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Email Address"
                htmlFor="email"
                error={errors.email}
                required
              >
                <Input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(event) => onChange('email', event.target.value)}
                  placeholder="name@yanksandbrits.com"
                  autoComplete="off"
                />
              </Field>

              <Field
                label={mode === 'edit' ? 'New Password' : 'Password'}
                htmlFor="password"
                error={errors.password}
                required={mode === 'create'}
                hint={
                  mode === 'edit'
                    ? 'Leave blank to keep the current password.'
                    : 'At least 6 characters.'
                }
              >
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={values.password}
                    onChange={(event) =>
                      onChange('password', event.target.value)
                    }
                    placeholder={mode === 'edit' ? '••••••••' : 'Create a password'}
                    autoComplete="new-password"
                    className="pr-12"
                  />
                  <button
                    type="button"
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                    onClick={() => setShowPassword((current) => !current)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </Field>
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={Building2}
            title={isTutor ? 'Teaching setup' : 'Where they work'}
            description={
              isTutor
                ? 'Subjects and contract decide who they can teach and how they are paid.'
                : 'Branch decides which leads and students they can see.'
            }
            delayClassName="delay-100"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Branch"
                htmlFor="branchId"
                error={errors.branchId}
                required
              >
                <SearchableSelect
                  id="branchId"
                  value={values.branchId}
                  options={branchOptions}
                  onChange={(next) => onChange('branchId', next)}
                  placeholder={
                    branchesQuery.isLoading
                      ? 'Loading branches...'
                      : 'Select branch'
                  }
                  searchPlaceholder="Search branches..."
                  emptyMessage="No branches found"
                  disabled={branchesQuery.isLoading}
                />
              </Field>

              <Field
                label="Paid leave"
                htmlFor="paidLeave"
                error={errors.paidLeave}
                required
                hint="Days available this year."
              >
                <Input
                  id="paidLeave"
                  value={values.paidLeave}
                  onChange={(event) =>
                    onChange('paidLeave', event.target.value.replace(/\D/g, ''))
                  }
                  inputMode="numeric"
                  placeholder="12"
                />
              </Field>
            </div>

            {isTutor ? (
              <Field
                label="Subjects"
                htmlFor="staffTypes"
                error={errors.staffTypes}
                required
                hint="Select every subject this tutor teaches. More than one is fine."
              >
                <div id="staffTypes" className="grid gap-2 sm:grid-cols-2">
                  {STAFF_TYPE_OPTIONS.map((option) => {
                    const selected = values.staffTypes.includes(option.value)
                    return (
                      <label
                        key={option.value}
                        htmlFor={`subject-${option.value}`}
                        className={cn(
                          'flex cursor-pointer items-start gap-2.5 rounded-xl border px-3 py-2.5 transition duration-200',
                          selected
                            ? 'border-[#253CA1] bg-[linear-gradient(135deg,#F5F8FF_0%,#E8EEFF_100%)] shadow-sm shadow-[#253CA1]/10 ring-1 ring-[#253CA1]/20'
                            : 'border-slate-200/90 bg-white hover:border-[#C8D4F5] hover:bg-[#F5F8FF]/80',
                        )}
                      >
                        <input
                          id={`subject-${option.value}`}
                          type="checkbox"
                          className="mt-0.5 size-4 rounded border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40"
                          checked={selected}
                          onChange={() => toggleSubject(option.value)}
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-semibold text-slate-800">
                            {option.label}
                          </span>
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {option.description}
                          </span>
                        </span>
                      </label>
                    )
                  })}
                </div>
              </Field>
            ) : null}

            {isTutor ? (
              <>
                <Field
                  label="Employment"
                  htmlFor="employmentType"
                  error={errors.employmentType}
                  hint="Bonus tiers match full-time and part-time tutors."
                >
                  <div id="employmentType" className="grid gap-2 sm:grid-cols-3">
                    {EMPLOYMENT_TYPE_OPTIONS.map((option) => (
                      <ChoiceTile
                        key={option.value}
                        name="employmentType"
                        title={option.label}
                        description={option.description}
                        selected={values.employmentType === option.value}
                        onSelect={() => selectEmployment(option.value)}
                      />
                    ))}
                  </div>
                </Field>

                {showsWorkingDays ? (
                  <Field
                    label="Working days"
                    htmlFor="workingDaysPerWeek"
                    error={errors.workingDaysPerWeek}
                    hint="Used with the bonus tier for this contract."
                  >
                    <div
                      id="workingDaysPerWeek"
                      className="grid gap-2 sm:grid-cols-2"
                    >
                      {WORKING_DAYS_PER_WEEK_OPTIONS.map((option) => (
                        <ChoiceTile
                          key={option.value}
                          name="workingDaysPerWeek"
                          title={option.label}
                          selected={values.workingDaysPerWeek === option.value}
                          onSelect={() =>
                            onChange('workingDaysPerWeek', option.value)
                          }
                        />
                      ))}
                    </div>
                  </Field>
                ) : null}
              </>
            ) : null}

            <div
              className={cn(
                'grid gap-3',
                mode === 'edit' && 'sm:grid-cols-2 sm:items-end',
              )}
            >
              <StatusToggle
                id="user-is-active"
                value={values.isActive}
                onChange={(next) => onChange('isActive', next)}
                description={
                  values.isActive
                    ? 'They can sign in as soon as the account is saved.'
                    : 'Saved, but blocked from signing in.'
                }
                error={errors.isActive}
              />

              {mode === 'edit' ? (
                <Field
                  label="Resign date"
                  htmlFor="resignDate"
                  error={errors.resignDate}
                  hint="Set this only if they have left the team."
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
              ) : null}
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={Phone}
            title="How to reach them"
            description="Kept on file for the branch. Mobile is the number the team actually calls."
            delayClassName="delay-150"
          >
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Mobile" htmlFor="mobilePhone" error={errors.mobilePhone}>
                <Input
                  id="mobilePhone"
                  value={values.mobilePhone}
                  onChange={(event) =>
                    onChange('mobilePhone', event.target.value)
                  }
                  placeholder="0812-3456-7890"
                  autoComplete="tel"
                />
              </Field>
              <Field label="Home phone" htmlFor="homePhone" error={errors.homePhone}>
                <Input
                  id="homePhone"
                  value={values.homePhone}
                  onChange={(event) => onChange('homePhone', event.target.value)}
                  placeholder="021-555-0101"
                />
              </Field>
              <Field label="Other phone" htmlFor="otherPhone" error={errors.otherPhone}>
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

            <div className="grid gap-3 sm:grid-cols-2">
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
            icon={ShieldCheck}
            title="Access"
            description={
              isTutor
                ? 'Tutor is selected for you. Add another role only if they also work in the office.'
                : 'Education Counsellor is selected for you. Add Branch Manager if they also run a branch.'
            }
            delayClassName="delay-200"
          >
            {rolesQuery.isLoading ? (
              <p className="text-sm text-slate-500">Loading roles…</p>
            ) : roleOptions.length === 0 ? (
              <p className="text-sm text-slate-500">
                No roles defined yet. Create them under Roles.
              </p>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {roleOptions.map((role) => {
                  const checked = values.groupIds.includes(role.id)
                  const recommended = role.code === defaultRoleCode
                  return (
                    <label
                      key={role.id}
                      htmlFor={`role-${role.id}`}
                      className={cn(
                        'flex cursor-pointer items-start gap-3 rounded-xl border px-3 py-2.5 transition duration-200',
                        checked
                          ? 'border-[#253CA1] bg-[linear-gradient(135deg,#F5F8FF_0%,#E8EEFF_100%)] shadow-sm shadow-[#253CA1]/10 ring-1 ring-[#253CA1]/20'
                          : 'border-slate-200/90 bg-white hover:border-[#C8D4F5] hover:bg-[#F5F8FF]/80',
                      )}
                    >
                      <input
                        id={`role-${role.id}`}
                        type="checkbox"
                        className="mt-0.5 size-4 rounded border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40"
                        checked={checked}
                        onChange={(event) =>
                          toggleGroup(role.id, event.target.checked)
                        }
                      />
                      <span className="min-w-0">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-sm font-semibold text-slate-800">
                            {role.name}
                          </span>
                          {recommended ? (
                            <span className="rounded-full bg-[#253CA1] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-white uppercase">
                              Primary
                            </span>
                          ) : null}
                        </span>
                        {role.description ? (
                          <span className="mt-0.5 block text-xs text-slate-500">
                            {role.description}
                          </span>
                        ) : role.code ? (
                          <span className="mt-0.5 block text-xs text-slate-400">
                            {role.code}
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

        <aside className="xl:sticky xl:top-4 xl:self-start">
          <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:rounded-3xl">
            <div className="relative overflow-hidden bg-[linear-gradient(160deg,#1B2A5A_0%,#253CA1_55%,#3A56B8_100%)] px-5 py-5 text-white">
              <div
                aria-hidden
                className="pointer-events-none absolute -top-8 -right-6 size-28 rounded-full bg-white/10"
              />
              <p className="text-[10px] font-semibold tracking-[0.14em] text-white/70 uppercase">
                {isTutor ? 'Tutor list preview' : 'Counsellor list preview'}
              </p>
              <div className="mt-3 flex items-center gap-3">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold tracking-wide ring-1 ring-white/25">
                  {monogram}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-lg font-bold tracking-tight">
                    {displayName}
                  </p>
                  <p className="truncate text-sm text-white/75">
                    {values.pin.trim() ? `PIN ${values.pin.trim()}` : 'PIN not set'}
                    {isTutor
                      ? ` · ${
                          values.staffTypes.length > 0
                            ? values.staffTypes.join(', ')
                            : 'Subjects'
                        }`
                      : ''}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 p-4">
              <dl className="space-y-2 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-400">Branch</dt>
                  <dd className="text-right font-medium text-slate-800">
                    {selectedBranch?.name ?? 'Not chosen'}
                  </dd>
                </div>
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-400">Role</dt>
                  <dd className="text-right font-medium text-slate-800">
                    {selectedRoles.length > 0
                      ? selectedRoles.map((role) => role.name).join(', ')
                      : 'None yet'}
                  </dd>
                </div>
                {isTutor ? (
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-slate-400">Contract</dt>
                    <dd className="text-right font-medium text-slate-800">
                      {values.employmentType
                        ? employmentTypeLabel(values.employmentType)
                        : 'Not set'}
                      {showsWorkingDays && values.workingDaysPerWeek
                        ? ` · ${values.workingDaysPerWeek} days`
                        : ''}
                    </dd>
                  </div>
                ) : (
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-slate-400">Initials</dt>
                    <dd className="text-right font-medium text-slate-800">
                      {values.initial.trim() || 'Needed for commission'}
                    </dd>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3">
                  <dt className="text-slate-400">Sign-in</dt>
                  <dd className="text-right font-medium text-slate-800">
                    {values.isActive ? 'Active' : 'Blocked'}
                  </dd>
                </div>
              </dl>

              <div className="rounded-xl border border-slate-200/80 bg-slate-50/80 p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                    Ready to save
                  </p>
                  <p className="text-xs font-semibold text-[#253CA1] tabular-nums">
                    {readyCount}/{steps.length}
                  </p>
                </div>
                <ul className="mt-2 space-y-1.5">
                  {steps.map((step) => (
                    <li
                      key={step.label}
                      className="flex items-center gap-2 text-sm text-slate-600"
                    >
                      <span
                        className={cn(
                          'inline-flex size-4 items-center justify-center rounded-full',
                          step.done
                            ? 'bg-[#253CA1] text-white'
                            : 'border border-slate-300 bg-white',
                        )}
                      >
                        {step.done ? <Check className="size-2.5" /> : null}
                      </span>
                      {step.label}
                    </li>
                  ))}
                </ul>
                {hasErrors ? (
                  <p className="mt-2 text-xs text-rose-500">
                    A few fields need a quick fix before this can be saved.
                  </p>
                ) : null}
                {!isTutor && !values.initial.trim() ? (
                  <p className="mt-2 text-xs text-slate-500">
                    Add initials so commission can be attributed to them.
                  </p>
                ) : null}
              </div>

              <div className="hidden flex-col gap-2 xl:flex">
                <Button type="submit" disabled={isSubmitting}>
                  {submitLabel}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onCancel}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </aside>
      </div>

      <div className="sticky bottom-3 z-10 flex gap-2 rounded-2xl border border-slate-200/80 bg-white/95 p-3 shadow-lg backdrop-blur xl:hidden">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="flex-1">
          {submitLabel}
        </Button>
      </div>
    </form>
  )
}
