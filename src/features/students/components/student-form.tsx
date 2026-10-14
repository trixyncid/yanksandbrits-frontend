import { useQueryClient } from '@tanstack/react-query'
import { parseISO } from 'date-fns'
import {
  Briefcase,
  CircleCheck,
  CircleDashed,
  Clock3,
  Compass,
  GraduationCap,
  IdCard,
  Lock,
  Phone,
  Plus,
  Power,
  UserRound,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { FormSectionCard } from '../../../shared/components/feature-page'
import { FormSaveBar } from '../../../shared/components/page'
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
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { StatusToggle } from '../../../shared/components/ui/status-toggle'
import { Textarea } from '../../../shared/components/ui/textarea'
import { cn } from '../../../shared/lib/cn'
import { notify } from '../../../shared/lib/notify'
import { toTitleCase } from '../../../shared/lib/to-title-case'
import { Can } from '../../auth/components/can'
import { useIsRestrictedMarketing } from '../../auth/hooks/use-permissions'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import {
  createInstitution,
  createOccupation,
} from '../../lookups/api/lookups-api'
import {
  useInstitutionOptionsQuery,
  useOccupationOptionsQuery,
} from '../../lookups/hooks/use-lookup-options'
import { useMarketingOptionsQuery } from '../../users/hooks/use-user-options'
import { getStudentInitials } from '../lib/student-display'
import type {
  StudentFormErrors,
  StudentFormValues,
} from '../types/student'
import { StudentStatusPill } from './student-status-pill'

type QuickAddKind = 'occupation' | 'institution'

const REQUIRED_FIELDS: {
  key: keyof StudentFormValues
  label: string
}[] = [
  { key: 'fullName', label: 'name' },
  { key: 'pin', label: 'PIN' },
  { key: 'counsellorId', label: 'counsellor' },
  { key: 'branchId', label: 'branch' },
  { key: 'enrollmentDate', label: 'enrollment date' },
  { key: 'mobilePhone', label: 'mobile' },
  { key: 'occupationId', label: 'occupation' },
  { key: 'institutionId', label: 'institution' },
]

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
  locked,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  hint?: string
  required?: boolean
  /** Shows a lock next to the hint when the field can't be edited here. */
  locked?: boolean
}) {
  return (
    <div className="space-y-1.5" data-field={htmlFor}>
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </Label>
      {children}
      {hint ? (
        <p
          className={cn(
            'flex items-start gap-1 text-xs',
            locked ? 'text-slate-500' : 'text-slate-400',
          )}
        >
          {locked ? <Lock className="mt-0.5 size-3 shrink-0" /> : null}
          {hint}
        </p>
      ) : null}
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
  disabled,
}: {
  id?: string
  label: string
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  disabled?: boolean
}) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={label}
      className={cn(
        'grid h-11 grid-cols-2 gap-1 rounded-full bg-canvas p-1',
        disabled && 'opacity-60',
      )}
    >
      {options.map((option) => {
        const selected = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            disabled={disabled}
            onClick={() => onChange(option.value)}
            className={cn(
              'truncate rounded-full px-2 text-sm font-semibold transition',
              selected
                ? 'bg-ink text-white shadow-sm'
                : 'text-slate-500 hover:bg-white/70 hover:text-ink',
              disabled && 'cursor-not-allowed',
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

function formatDateTime(value: string) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatDate(value: string) {
  const date = parseDateValue(value)
  if (!date || Number.isNaN(date.getTime())) {
    return ''
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

function missingRequired(values: StudentFormValues) {
  return REQUIRED_FIELDS.filter((field) => !String(values[field.key]).trim()).map(
    (field) => field.label,
  )
}

type StudentFormProps = {
  mode: 'create' | 'edit'
  values: StudentFormValues
  errors: StudentFormErrors
  isSubmitting: boolean
  meta?: {
    createdAt: string
    updatedAt: string
    createdBy: string
    updatedBy: string
  }
  onChange: <K extends keyof StudentFormValues>(
    field: K,
    value: StudentFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  /** Edit mode: shown on the save bar when the user may delete. */
  onDelete?: () => void
  /** Create mode: the student is chosen from prospects who have paid. */
  prospectPicker?: {
    value: string
    options: { value: string; label: string; keywords?: string }[]
    loading: boolean
    onChange: (prospectiveStudentId: string) => void
  }
}

export function StudentForm({
  mode,
  values,
  errors,
  isSubmitting,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
  prospectPicker,
}: StudentFormProps) {
  const queryClient = useQueryClient()
  const branchesQuery = useBranchesQuery()
  const occupationsQuery = useOccupationOptionsQuery()
  const institutionsQuery = useInstitutionOptionsQuery()
  const counsellorsQuery = useMarketingOptionsQuery()
  const [quickAddKind, setQuickAddKind] = useState<QuickAddKind | null>(null)
  const [quickAddName, setQuickAddName] = useState('')
  const [isQuickAdding, setIsQuickAdding] = useState(false)
  const counsellorOptions = useMemo(
    () =>
      (counsellorsQuery.data ?? []).map((option) => ({
        value: option.id,
        label: `${option.pin} | ${option.fullName}`,
        keywords: `${option.pin} ${option.fullName} ${option.email}`,
      })),
    [counsellorsQuery.data],
  )
  const occupationOptions = useMemo(
    () =>
      (occupationsQuery.data ?? []).map((option) => ({
        value: option.id,
        label: option.name,
      })),
    [occupationsQuery.data],
  )
  const institutionOptions = useMemo(
    () =>
      (institutionsQuery.data ?? []).map((option) => ({
        value: option.id,
        label: option.name,
      })),
    [institutionsQuery.data],
  )
  const isRestrictedMarketing = useIsRestrictedMarketing()
  // New students take name, GRN, counsellor, and branch from the prospect.
  const lockFromProspect = mode === 'create'
  const lockCounsellor = isRestrictedMarketing || lockFromProspect
  const lockIdentityFields = mode === 'edit' && isRestrictedMarketing
  const stillNeeded = missingRequired(values)
  const errorSignature = Object.entries(errors)
    .filter((entry) => Boolean(entry[1]))
    .map(([key, message]) => `${key}:${message}`)
    .join('|')

  useEffect(() => {
    if (!errorSignature) {
      return
    }

    const firstId = errorSignature.split('|')[0]?.split(':')[0]
    if (!firstId) {
      return
    }

    document
      .querySelector(`[data-field="${firstId}"]`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  }, [errorSignature])

  function openQuickAdd(kind: QuickAddKind) {
    setQuickAddKind(kind)
    setQuickAddName('')
  }

  function closeQuickAdd() {
    if (isQuickAdding) {
      return
    }
    setQuickAddKind(null)
    setQuickAddName('')
  }

  async function handleQuickAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!quickAddKind) {
      return
    }

    const name = toTitleCase(quickAddName)
    if (!name) {
      notify('error', {
        title:
          quickAddKind === 'occupation'
            ? 'Occupation name required'
            : 'Institution name required',
        description: 'Please enter a name before adding.',
      })
      return
    }

    setIsQuickAdding(true)
    try {
      if (quickAddKind === 'occupation') {
        const created = await createOccupation({ name })
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['lookups', 'occupations'] }),
          queryClient.invalidateQueries({ queryKey: ['occupations', 'list'] }),
        ])
        onChange('occupationId', created.id)
        notify('success', {
          title: 'Occupation added',
          description: `${created.name} is ready to use.`,
        })
      } else {
        const created = await createInstitution({
          name,
          address: '',
          phone: '',
        })
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['lookups', 'institutions'],
          }),
          queryClient.invalidateQueries({ queryKey: ['institutions', 'list'] }),
        ])
        onChange('institutionId', created.id)
        notify('success', {
          title: 'Institution added',
          description: `${created.name} is ready to use.`,
        })
      }
      setQuickAddKind(null)
      setQuickAddName('')
    } catch (error) {
      notify('error', {
        title:
          quickAddKind === 'occupation'
            ? 'Unable to add occupation'
            : 'Unable to add institution',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsQuickAdding(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  const datePickerClassName = 'w-full'
  const progressHint =
    stillNeeded.length === 0
      ? mode === 'create'
        ? 'Required fields are filled. Optional details can wait.'
        : 'Required fields are filled. Save when the profile looks right.'
      : `Still needed: ${stillNeeded.join(', ')}.`
  const branchName =
    (branchesQuery.data?.data ?? []).find(
      (branch) => branch.id === values.branchId,
    )?.name ?? ''
  const counsellorName =
    (counsellorsQuery.data ?? []).find(
      (option) => option.id === values.counsellorId,
    )?.fullName ?? ''
  const filledCount = REQUIRED_FIELDS.length - stillNeeded.length

  return (
    <>
      <form className="space-y-3" onSubmit={handleSubmit} noValidate>
        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="space-y-3">
            <FormSectionCard
              icon={UserRound}
              title="Who they are"
              description={
                prospectPicker
                  ? 'Pick the prospective student first. Their details fill in the rest of the form.'
                  : 'Name and personal details.'
              }
            >
              {prospectPicker ? (
                <Field
                  label="Prospective student"
                  htmlFor="fullName"
                  error={errors.fullName}
                  required
                  hint="Only prospective students who have made a payment are listed. A pending payment counts."
                >
                  <SearchableSelect
                    id="fullName"
                    value={prospectPicker.value}
                    options={prospectPicker.options}
                    onChange={prospectPicker.onChange}
                    placeholder="Select prospective student..."
                    searchPlaceholder="Search by name or SR number..."
                    emptyMessage="No prospective students with a payment yet"
                    disabled={prospectPicker.loading || isSubmitting}
                  />
                </Field>
              ) : (
                <Field
                  label="Full name"
                  htmlFor="fullName"
                  error={errors.fullName}
                  required
                >
                  <Input
                    id="fullName"
                    value={values.fullName}
                    onChange={(event) =>
                      onChange('fullName', event.target.value)
                    }
                    placeholder="Student full name"
                    autoComplete="name"
                  />
                </Field>
              )}

              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Gender" htmlFor="gender" error={errors.gender}>
                  <SegmentedChoice
                    id="gender"
                    label="Gender"
                    value={values.gender}
                    options={[
                      { value: 'M', label: 'Male' },
                      { value: 'F', label: 'Female' },
                    ]}
                    onChange={(next) => onChange('gender', next)}
                  />
                </Field>

                <Field label="Email" htmlFor="email" error={errors.email}>
                  <Input
                    id="email"
                    type="email"
                    value={values.email}
                    onChange={(event) => onChange('email', event.target.value)}
                    placeholder="student@email.com"
                    autoComplete="email"
                  />
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
                    onChange={(date) =>
                      onChange('birthDate', toDateString(date))
                    }
                    placeholder="Pick birth date"
                    title="Birth date"
                    captionLayout="dropdown"
                    className={datePickerClassName}
                    align="start"
                  />
                </Field>
              </div>
            </FormSectionCard>

            <FormSectionCard
              icon={GraduationCap}
              title="Enrollment"
              description="Branch, counsellor, and the codes staff use to find this student."
              delayClassName="delay-75"
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <Field
                  label="Education counsellor"
                  htmlFor="counsellorId"
                  error={errors.counsellorId}
                  required
                  locked={lockCounsellor}
                  hint={
                    lockFromProspect
                      ? 'Comes from the prospective student.'
                      : lockCounsellor
                        ? 'Marketing staff can’t change the education counsellor.'
                        : 'Used when the student PIN is generated.'
                  }
                >
                  <SearchableSelect
                    id="counsellorId"
                    value={values.counsellorId}
                    options={counsellorOptions}
                    onChange={(next) => onChange('counsellorId', next)}
                    placeholder="Select counsellor"
                    searchPlaceholder="Search counsellors..."
                    emptyMessage="No marketing staff found"
                    disabled={lockCounsellor || counsellorsQuery.isLoading}
                  />
                </Field>

                <Field
                  label="Branch"
                  htmlFor="branchId"
                  error={errors.branchId}
                  required
                  locked={lockFromProspect}
                  hint={
                    lockFromProspect
                      ? 'Comes from the prospective student.'
                      : undefined
                  }
                >
                  <Select
                    id="branchId"
                    containerClassName="w-full sm:w-full"
                    value={values.branchId}
                    onChange={(event) =>
                      onChange('branchId', event.target.value)
                    }
                    disabled={lockFromProspect}
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
                  label="Enrollment date"
                  htmlFor="enrollmentDate"
                  error={errors.enrollmentDate}
                  required
                >
                  <DatePicker
                    value={parseDateValue(values.enrollmentDate)}
                    onChange={(date) =>
                      onChange('enrollmentDate', toDateString(date))
                    }
                    placeholder="Pick enrollment date"
                    title="Enrollment date"
                    className={datePickerClassName}
                    align="start"
                  />
                </Field>

                <Field
                  label="Student PIN"
                  htmlFor="pin"
                  error={errors.pin}
                  required
                  locked={lockIdentityFields}
                  hint={
                    lockIdentityFields
                      ? 'Marketing staff can’t change the student PIN.'
                      : 'Must be unique within the selected branch.'
                  }
                >
                  <Input
                    id="pin"
                    value={values.pin}
                    onChange={(event) => onChange('pin', event.target.value)}
                    placeholder="STU-1001"
                    className="font-mono"
                    disabled={lockIdentityFields}
                  />
                </Field>

                <Field
                  label="Guest number"
                  htmlFor="grn"
                  error={errors.grn}
                  locked={lockIdentityFields || lockFromProspect}
                  hint={
                    lockFromProspect
                      ? 'The SR number from the prospective student.'
                      : lockIdentityFields
                        ? 'Marketing staff can’t change the guest number.'
                        : 'Optional. Often the SR number from the lead.'
                  }
                >
                  <Input
                    id="grn"
                    value={values.grn}
                    onChange={(event) => onChange('grn', event.target.value)}
                    placeholder="GRN-1001"
                    className="font-mono"
                    disabled={lockIdentityFields || lockFromProspect}
                  />
                </Field>

                <Field
                  label="Referral"
                  htmlFor="referralMarketing"
                  error={errors.referralMarketing}
                  hint="Optional. Name of whoever referred them."
                >
                  <Input
                    id="referralMarketing"
                    value={values.referralMarketing}
                    onChange={(event) =>
                      onChange('referralMarketing', event.target.value)
                    }
                    placeholder="Referral name"
                  />
                </Field>
              </div>
            </FormSectionCard>

            <FormSectionCard
              icon={Phone}
              title="How to reach them"
              description="Mobile is required. Parent and other numbers are for when the student doesn’t pick up."
              delayClassName="delay-75"
            >
              <div className="grid gap-3 sm:grid-cols-3">
                <Field
                  label="Mobile"
                  htmlFor="mobilePhone"
                  error={errors.mobilePhone}
                  required
                >
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
                <Field
                  label="Parents"
                  htmlFor="homePhone"
                  error={errors.homePhone}
                >
                  <Input
                    id="homePhone"
                    value={values.homePhone}
                    onChange={(event) =>
                      onChange('homePhone', event.target.value)
                    }
                    placeholder="021-555-0101"
                  />
                </Field>
                <Field
                  label="Other"
                  htmlFor="othersPhone"
                  error={errors.othersPhone}
                >
                  <Input
                    id="othersPhone"
                    value={values.othersPhone}
                    onChange={(event) =>
                      onChange('othersPhone', event.target.value)
                    }
                    placeholder="Optional"
                  />
                </Field>
              </div>

              <Field
                label="Home address"
                htmlFor="address"
                error={errors.address}
              >
                <Textarea
                  id="address"
                  value={values.address}
                  onChange={(event) => onChange('address', event.target.value)}
                  placeholder="Street, city, postal code"
                />
              </Field>
            </FormSectionCard>

            <div className="grid items-start gap-3 xl:grid-cols-2">
              <FormSectionCard
                className="h-full"
                icon={Briefcase}
                title="School and work"
                description="What they do today. Missing an option? Add it here without leaving the page."
                delayClassName="delay-100"
              >
                <Field
                  label="Current occupation"
                  htmlFor="occupationId"
                  error={errors.occupationId}
                  required
                >
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <SearchableSelect
                        id="occupationId"
                        value={values.occupationId}
                        options={occupationOptions}
                        onChange={(next) => onChange('occupationId', next)}
                        placeholder="Select occupation"
                        searchPlaceholder="Search occupations..."
                        emptyMessage="No occupations found"
                        disabled={occupationsQuery.isLoading}
                      />
                    </div>
                    <Can module="occupations" action="add">
                      <button
                        type="button"
                        aria-label="Quick add occupation"
                        title="Quick add occupation"
                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-60"
                        onClick={() => openQuickAdd('occupation')}
                        disabled={occupationsQuery.isLoading || isSubmitting}
                      >
                        <Plus className="size-4" />
                      </button>
                    </Can>
                  </div>
                </Field>

                <Field
                  label="Current institution"
                  htmlFor="institutionId"
                  error={errors.institutionId}
                  required
                >
                  <div className="flex items-center gap-2">
                    <div className="min-w-0 flex-1">
                      <SearchableSelect
                        id="institutionId"
                        value={values.institutionId}
                        options={institutionOptions}
                        onChange={(next) => onChange('institutionId', next)}
                        placeholder="Select institution"
                        searchPlaceholder="Search institutions..."
                        emptyMessage="No institutions found"
                        disabled={institutionsQuery.isLoading}
                      />
                    </div>
                    <Can module="institutions" action="add">
                      <button
                        type="button"
                        aria-label="Quick add institution"
                        title="Quick add institution"
                        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white disabled:pointer-events-none disabled:opacity-60"
                        onClick={() => openQuickAdd('institution')}
                        disabled={institutionsQuery.isLoading || isSubmitting}
                      >
                        <Plus className="size-4" />
                      </button>
                    </Can>
                  </div>
                </Field>
              </FormSectionCard>

              <FormSectionCard
                className="h-full"
                icon={Compass}
                title="After the program"
                description="Optional. Where they hope to go once the program is finished."
                delayClassName="delay-150"
              >
                <Field label="Country" htmlFor="country" error={errors.country}>
                  <Input
                    id="country"
                    value={values.country}
                    onChange={(event) => onChange('country', event.target.value)}
                    placeholder="United Kingdom"
                  />
                </Field>
                <Field
                  label="University"
                  htmlFor="university"
                  error={errors.university}
                >
                  <Input
                    id="university"
                    value={values.university}
                    onChange={(event) =>
                      onChange('university', event.target.value)
                    }
                    placeholder="Target university"
                  />
                </Field>
                <Field label="Major" htmlFor="major" error={errors.major}>
                  <Input
                    id="major"
                    value={values.major}
                    onChange={(event) => onChange('major', event.target.value)}
                    placeholder="Computer Science"
                  />
                </Field>
              </FormSectionCard>
            </div>
          </div>

          <div className="space-y-3 lg:sticky lg:top-4">
            <FormSectionCard
              icon={IdCard}
              title="Summary"
              description="Updates as you fill in the form."
              delayClassName="delay-75"
            >
              <div className="flex items-center gap-3 rounded-3xl bg-canvas p-3">
                <span
                  className={cn(
                    'inline-flex size-12 shrink-0 items-center justify-center rounded-full text-sm font-bold',
                    values.status === 'active'
                      ? 'bg-brand-500 text-white'
                      : 'bg-white text-slate-500',
                  )}
                >
                  {values.fullName.trim()
                    ? getStudentInitials(values.fullName)
                    : '?'}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-ink">
                    {values.fullName.trim() || 'New student'}
                  </p>
                  <p className="truncate font-mono text-xs text-slate-500">
                    {values.pin.trim() || 'No PIN yet'}
                  </p>
                  <StudentStatusPill
                    status={values.status}
                    className="mt-1.5 px-2 py-0.5 text-[11px]"
                  />
                </div>
              </div>
              <dl className="grid gap-2 text-sm">
                <SummaryRow label="Branch" value={branchName} />
                <SummaryRow label="Counsellor" value={counsellorName} />
                <SummaryRow
                  label="Enrolled"
                  value={
                    values.enrollmentDate
                      ? formatDate(values.enrollmentDate)
                      : ''
                  }
                />
                <SummaryRow label="Mobile" value={values.mobilePhone.trim()} />
              </dl>
              <div>
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-500">Required fields</span>
                  <span className="text-ink tabular-nums">
                    {filledCount}/{REQUIRED_FIELDS.length}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-canvas">
                  <div
                    className="h-full rounded-full bg-brand-500 transition-all"
                    style={{
                      width: `${(filledCount / REQUIRED_FIELDS.length) * 100}%`,
                    }}
                  />
                </div>
                <ul className="mt-2.5 flex flex-wrap gap-1.5">
                  {REQUIRED_FIELDS.map((field) => {
                    const done = !stillNeeded.includes(field.label)
                    return (
                      <li
                        key={field.key}
                        className={cn(
                          'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize',
                          done
                            ? 'bg-brand-50 text-brand-700'
                            : 'bg-canvas text-slate-500',
                        )}
                      >
                        {done ? (
                          <CircleCheck className="size-3" />
                        ) : (
                          <CircleDashed className="size-3" />
                        )}
                        {field.label}
                      </li>
                    )
                  })}
                </ul>
              </div>
            </FormSectionCard>

            <FormSectionCard
              icon={Power}
              title="Status"
              description="Active students can be scheduled and added to groups."
              delayClassName="delay-100"
            >
              {mode === 'create' ? (
                <div className="rounded-2xl bg-canvas px-3.5 py-3">
                  <p className="text-sm font-semibold text-ink">
                    Starts inactive
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Becomes active once a payment installment is approved. You
                    can change it later from their profile.
                  </p>
                </div>
              ) : (
                <StatusToggle
                  id="student-status"
                  value={values.status === 'active'}
                  onChange={(next) =>
                    onChange('status', next ? 'active' : 'inactive')
                  }
                  description={
                    values.status === 'active'
                      ? 'Student can be scheduled and added to groups.'
                      : 'Inactive until an approved payment activates them, or you turn Active on.'
                  }
                  error={errors.status}
                />
              )}
            </FormSectionCard>

            {mode === 'edit' && meta ? (
              <FormSectionCard
                icon={Clock3}
                title="Record info"
                description="Who created this profile and when it last changed."
                delayClassName="delay-150"
              >
                <dl className="grid gap-2">
                  <RecordFact
                    label="Created"
                    value={formatDateTime(meta.createdAt)}
                  />
                  <RecordFact label="Created by" value={meta.createdBy || '—'} />
                  <RecordFact
                    label="Updated"
                    value={formatDateTime(meta.updatedAt)}
                  />
                  <RecordFact label="Updated by" value={meta.updatedBy || '—'} />
                </dl>
              </FormSectionCard>
            ) : null}
          </div>
        </div>

        <FormSaveBar
          mode={mode}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onDelete={onDelete}
          deleteLabel="Delete student"
          submitLabel={mode === 'create' ? 'Create student' : 'Save changes'}
          hint={progressHint}
        />
      </form>

      <Dialog
        open={quickAddKind !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeQuickAdd()
          }
        }}
      >
        <DialogContent showClose className="overflow-hidden p-0 sm:max-w-lg">
          <form onSubmit={handleQuickAdd} className="flex max-h-[90vh] flex-col">
            <div className="shrink-0 bg-canvas px-6 pt-6 pb-4">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-full bg-brand-500 text-white">
                <Plus className="size-5" />
              </div>
              <DialogHeader className="pr-0">
                <DialogTitle>
                  {quickAddKind === 'occupation'
                    ? 'Quick Add Occupation'
                    : 'Quick Add Institution'}
                </DialogTitle>
                <DialogDescription>
                  {quickAddKind === 'occupation'
                    ? 'Add a new occupation and select it for this student.'
                    : 'Add a new institution and select it for this student.'}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-6 py-5">
              <Label htmlFor="quick-add-name">
                {quickAddKind === 'occupation'
                  ? 'Occupation Name'
                  : 'Institution Name'}
              </Label>
              <Input
                id="quick-add-name"
                value={quickAddName}
                onChange={(event) => setQuickAddName(event.target.value)}
                placeholder={
                  quickAddKind === 'occupation'
                    ? 'e.g. university student'
                    : 'e.g. universitas indonesia'
                }
                autoFocus
              />
              <p className="text-xs text-slate-400">
                Saved as Title Case
                {quickAddName.trim()
                  ? `: ${toTitleCase(quickAddName)}`
                  : '.'}
              </p>
            </div>

            <DialogFooter className="mt-0 shrink-0 px-6 pt-0 pb-6">
              <Button
                type="button"
                variant="soft"
                size="sm"
                onClick={closeQuickAdd}
                disabled={isQuickAdding}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isQuickAdding}>
                <Plus className="size-3.5" />
                {isQuickAdding ? 'Adding...' : 'Add & Select'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}

function RecordFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-0.5 text-sm font-semibold text-slate-800">{value}</dd>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 text-xs text-slate-500">{label}</dt>
      <dd
        className={cn(
          'truncate text-right text-sm font-semibold',
          value ? 'text-ink' : 'text-slate-300',
        )}
      >
        {value || 'Not set'}
      </dd>
    </div>
  )
}
