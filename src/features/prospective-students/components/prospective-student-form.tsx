import { parseISO } from 'date-fns'
import {
  BookOpenCheck,
  ClipboardList,
  Clock3,
  Eye,
  Lock,
  Mail,
  Megaphone,
  Phone,
  UserRound,
} from 'lucide-react'
import { useEffect, useMemo, type FormEvent, type ReactNode } from 'react'

import {
  COURSE_OPTIONS,
  LANGUAGE_TEST_OPTIONS,
  TELE_MARKETING_OPTIONS,
} from '../../../shared/api/choices'
import {
  FormSectionCard,
  ScoreTile,
} from '../../../shared/components/feature-page'
import { FormSaveBar } from '../../../shared/components/page'
import { cn } from '../../../shared/lib/cn'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import {
  useAuthUser,
  useIsRestrictedMarketing,
} from '../../auth/hooks/use-permissions'
import { useResourceOptionsQuery } from '../../lookups/hooks/use-lookup-options'
import { useMarketingOptionsQuery } from '../../users/hooks/use-user-options'
import { courseLabel } from '../api/prospective-students-api'
import { getInitials } from '../lib/lead-status'
import type {
  ProspectiveStudentFormErrors,
  ProspectiveStudentFormValues,
  ProspectiveStudentListItem,
} from '../types/prospective-student'
import { LeadStatusPill } from './lead-status-pill'

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
  /** Shows a lock next to the label; the hint explains why. */
  locked?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="inline-flex items-center gap-1.5">
        <span>
          {label}
          {required ? <span className="text-rose-500"> *</span> : null}
        </span>
        {locked ? (
          <Lock aria-hidden className="size-3 text-slate-400" />
        ) : null}
      </Label>
      {children}
      {hint ? (
        <p
          className={cn(
            'text-xs',
            locked ? 'text-amber-700' : 'text-slate-400',
          )}
        >
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
  columns = 2,
}: {
  id?: string
  label: string
  value: T | ''
  options: { value: T; label: string }[]
  onChange: (value: T) => void
  disabled?: boolean
  columns?: 2 | 3
}) {
  return (
    <div
      id={id}
      role="radiogroup"
      aria-label={label}
      className={cn(
        'grid h-12 gap-1 rounded-full bg-canvas p-1',
        columns === 3 ? 'grid-cols-3' : 'grid-cols-2',
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

const SCORE_ACCENTS = {
  listening: '#253CA1',
  speaking: '#15225A',
  reading: '#8C9DDD',
  writing: '#5A6FC6',
} as const

type ProspectiveStudentFormProps = {
  mode: 'create' | 'edit'
  values: ProspectiveStudentFormValues
  errors: ProspectiveStudentFormErrors
  isSubmitting: boolean
  meta?: Pick<ProspectiveStudentListItem, 'createdAt' | 'updatedAt' | 'branch'>
  onChange: <K extends keyof ProspectiveStudentFormValues>(
    field: K,
    value: ProspectiveStudentFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function ProspectiveStudentForm({
  mode,
  values,
  errors,
  isSubmitting,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: ProspectiveStudentFormProps) {
  const marketingsQuery = useMarketingOptionsQuery()
  const resourcesQuery = useResourceOptionsQuery()
  const authUser = useAuthUser()
  const lockCounsellor = useIsRestrictedMarketing()
  const lockConsultFields = lockCounsellor && mode === 'edit'

  const counsellorOptions = useMemo(
    () =>
      (marketingsQuery.data ?? []).map((option) => ({
        value: option.id,
        label: `${option.pin} | ${option.fullName}`,
        keywords: `${option.pin} ${option.fullName} ${option.email}`,
      })),
    [marketingsQuery.data],
  )

  const resourceOptions = useMemo(
    () =>
      (resourcesQuery.data ?? []).map((option) => ({
        value: option.id,
        label: option.name,
      })),
    [resourcesQuery.data],
  )

  const selectedCounsellor = useMemo(
    () =>
      (marketingsQuery.data ?? []).find(
        (option) => option.id === values.marketingId,
      ),
    [marketingsQuery.data, values.marketingId],
  )

  // Marketing counsellors are always attributed to themselves on create.
  useEffect(() => {
    if (!lockCounsellor || mode !== 'create' || !authUser?.id) {
      return
    }
    const selfId = String(authUser.id)
    if (values.marketingId === selfId) {
      return
    }
    onChange('marketingId', selfId)
    // Intentionally omit onChange: parent passes a fresh function each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync self attribution once
  }, [authUser?.id, lockCounsellor, mode, values.marketingId])

  // Branch always follows the assigned education counsellor's home branch.
  useEffect(() => {
    if (!values.marketingId) {
      if (values.branchId) {
        onChange('branchId', '')
      }
      return
    }

    if (selectedCounsellor) {
      const nextBranchId = selectedCounsellor.branchId ?? ''
      if (values.branchId !== nextBranchId) {
        onChange('branchId', nextBranchId)
      }
      return
    }

    const fromAuth =
      lockCounsellor &&
      authUser?.branch_id != null &&
      values.marketingId === String(authUser.id)
        ? String(authUser.branch_id)
        : null

    if (fromAuth && values.branchId !== fromAuth) {
      onChange('branchId', fromAuth)
    }
    // Intentionally omit onChange: parent passes a fresh function each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keep branch synced to counsellor
  }, [
    authUser?.branch_id,
    authUser?.id,
    lockCounsellor,
    selectedCounsellor,
    values.branchId,
    values.marketingId,
  ])

  function setHasTakenLanguageTest(next: boolean) {
    onChange('hasTakenLanguageTest', next)
    if (!next) {
      onChange('languageTest', '')
      onChange('listening', '')
      onChange('speaking', '')
      onChange('reading', '')
      onChange('writing', '')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  const branchLabel =
    selectedCounsellor?.branchName ||
    (meta?.branch && meta.branch !== '—' ? meta.branch : null) ||
    (values.branchId ? 'Assigned' : 'Unassigned')

  const previewName = values.fullName.trim()
  const counsellorName = selectedCounsellor?.fullName ?? ''
  const course = values.course ? courseLabel(values.course) : ''
  const sourceLabel =
    TELE_MARKETING_OPTIONS.find((option) => option.value === values.teleMarketing)
      ?.label ?? ''
  const resourceLabel =
    resourceOptions.find((option) => option.value === values.resourceId)
      ?.label ?? ''

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <FormSectionCard
            icon={UserRound}
            title="Student"
            description="Start with the person: their name and how to reach them."
          >
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
                placeholder="Andrea Putri"
              />
            </Field>

            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Phone" htmlFor="phone" error={errors.phone} required>
                <Input
                  id="phone"
                  value={values.phone}
                  onChange={(event) => onChange('phone', event.target.value)}
                  placeholder="081211122233"
                />
              </Field>

              <Field label="Email" htmlFor="email" error={errors.email}>
                <Input
                  id="email"
                  type="email"
                  value={values.email}
                  onChange={(event) => onChange('email', event.target.value)}
                  placeholder="andrea.putri@email.com"
                />
              </Field>

              <Field
                label="Gender"
                htmlFor="gender"
                error={errors.gender}
                required
              >
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

              <Field label="Age" htmlFor="age" error={errors.age} required>
                <Input
                  id="age"
                  type="number"
                  min={1}
                  max={119}
                  value={values.age}
                  onChange={(event) => onChange('age', event.target.value)}
                  placeholder="18"
                />
              </Field>
            </div>

            <Field
              label="Address"
              htmlFor="address"
              error={errors.address}
              required
            >
              <Textarea
                id="address"
                value={values.address}
                onChange={(event) => onChange('address', event.target.value)}
                placeholder="Home address"
              />
            </Field>
          </FormSectionCard>

          <FormSectionCard
            icon={Megaphone}
            title="Consult & Source"
            description="Who is following up, when you first spoke, and how they found us."
            delayClassName="delay-75"
          >
            {lockCounsellor ? (
              <div className="flex items-start gap-2 rounded-2xl bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
                <Lock className="mt-0.5 size-3.5 shrink-0" />
                <p>
                  {lockConsultFields
                    ? 'As an education counsellor, you can’t change the counsellor, consult date, SR number, resource, or tele marketing on an existing lead.'
                    : 'As an education counsellor, new leads are assigned to you automatically.'}
                </p>
              </div>
            ) : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Education counsellor"
                htmlFor="marketingId"
                error={errors.marketingId}
                required
                locked={lockCounsellor}
                hint={
                  lockCounsellor
                    ? 'Education counsellors cannot change this assignment.'
                    : undefined
                }
              >
                <SearchableSelect
                  id="marketingId"
                  value={values.marketingId}
                  options={counsellorOptions}
                  onChange={(next) => onChange('marketingId', next)}
                  placeholder="Select counsellor..."
                  searchPlaceholder="Search counsellors..."
                  disabled={lockCounsellor || marketingsQuery.isLoading}
                  emptyMessage="No education counsellors found"
                />
              </Field>

              <Field
                label="Branch"
                htmlFor="branchId"
                error={errors.branchId}
                required
                hint="Set automatically from the counsellor’s branch."
              >
                <div
                  id="branchId"
                  className={cn(
                    'flex min-h-12 items-center rounded-full bg-canvas px-4 text-sm leading-snug font-semibold',
                    values.branchId ? 'text-ink' : 'text-slate-400',
                  )}
                >
                  {branchLabel}
                </div>
              </Field>

              <Field
                label="Date consulted"
                htmlFor="date"
                error={errors.date}
                required
                locked={lockConsultFields}
                hint={
                  lockConsultFields
                    ? 'Education counsellors cannot change the consult date.'
                    : undefined
                }
              >
                <DatePicker
                  value={parseDateValue(values.date)}
                  onChange={(date) => onChange('date', toDateString(date))}
                  placeholder="Pick a date"
                  title="Date Consulted"
                  disabled={lockConsultFields}
                  className="h-12 w-full min-w-0 justify-start rounded-full px-4 font-medium"
                  align="start"
                />
              </Field>

              <Field
                label="SR number"
                htmlFor="srNumber"
                error={errors.srNumber}
                required
                locked={lockConsultFields}
                hint={
                  lockConsultFields
                    ? 'Education counsellors cannot change the SR number.'
                    : undefined
                }
              >
                <Input
                  id="srNumber"
                  value={values.srNumber}
                  onChange={(event) => onChange('srNumber', event.target.value)}
                  placeholder="SR-001"
                  disabled={lockConsultFields}
                />
              </Field>

              <div className="sm:col-span-2">
                <Field
                  label="Resource"
                  htmlFor="resourceId"
                  error={errors.resourceId}
                  required
                  locked={lockConsultFields}
                  hint={
                    lockConsultFields
                      ? 'Education counsellors cannot change the resource.'
                      : 'Where this inquiry came from.'
                  }
                >
                  <Select
                    id="resourceId"
                    containerClassName="w-full sm:w-full"
                    value={values.resourceId}
                    onChange={(event) =>
                      onChange('resourceId', event.target.value)
                    }
                    disabled={lockConsultFields || resourcesQuery.isLoading}
                  >
                    <option value="">Select resource...</option>
                    {resourceOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              <div className="sm:col-span-2">
                <Field
                  label="Tele marketing"
                  htmlFor="teleMarketing"
                  error={errors.teleMarketing}
                  required
                  locked={lockConsultFields}
                  hint={
                    lockConsultFields
                      ? 'Education counsellors cannot change tele marketing.'
                      : 'Walk-in at the branch, or reached by phone.'
                  }
                >
                  <SegmentedChoice
                    id="teleMarketing"
                    label="Tele Marketing"
                    value={values.teleMarketing}
                    disabled={lockConsultFields}
                    options={TELE_MARKETING_OPTIONS}
                    onChange={(next) => onChange('teleMarketing', next)}
                  />
                </Field>
              </div>
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={ClipboardList}
            title="Interest & Stage"
            description="Which prediction test they want and where the lead stands now."
            delayClassName="delay-100"
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Prediction test"
                htmlFor="course"
                error={errors.course}
                required
              >
                <Select
                  id="course"
                  containerClassName="w-full sm:w-full"
                  value={values.course}
                  onChange={(event) =>
                    onChange(
                      'course',
                      event.target
                        .value as ProspectiveStudentFormValues['course'],
                    )
                  }
                >
                  <option value="">Select prediction test...</option>
                  {COURSE_OPTIONS.map((course) => (
                    <option key={course.value} value={course.value}>
                      {course.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <Field
                label="Status"
                htmlFor="status"
                error={errors.status}
                required
                locked={values.status === 'enrolled'}
                hint={
                  values.status === 'enrolled'
                    ? 'Enrolled status is locked. Ask a manager if it needs to change.'
                    : undefined
                }
              >
                <Select
                  id="status"
                  containerClassName="w-full sm:w-full"
                  value={values.status}
                  disabled={values.status === 'enrolled'}
                  onChange={(event) =>
                    onChange(
                      'status',
                      event.target
                        .value as ProspectiveStudentFormValues['status'],
                    )
                  }
                >
                  <option value="consult">Consult</option>
                  <option value="prediction_test">Pre-Test</option>
                  {values.status === 'enrolled' ? (
                    <option value="enrolled">Enrolled</option>
                  ) : null}
                  <option value="cancelled">Cancelled</option>
                </Select>
              </Field>
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={BookOpenCheck}
            title="Language Test"
            description="Earlier official results, only if the student already has them."
            delayClassName="delay-100"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Label id="hasTakenLanguageTest-label">
                  Has this student taken IELTS, TOEFL, or SAT before?
                </Label>
                <p className="mt-0.5 text-xs text-slate-400">
                  Choose No when there is no official result yet.
                </p>
              </div>
              <div className="sm:w-56 sm:shrink-0">
                <SegmentedChoice
                  label="Has this student taken IELTS, TOEFL, or SAT before?"
                  value={values.hasTakenLanguageTest ? 'yes' : 'no'}
                  options={[
                    { value: 'no', label: 'No' },
                    { value: 'yes', label: 'Yes' },
                  ]}
                  onChange={(next) => setHasTakenLanguageTest(next === 'yes')}
                />
              </div>
            </div>

            {values.hasTakenLanguageTest ? (
              <div className="space-y-3 rounded-3xl bg-canvas p-3.5 sm:p-4">
                <Field
                  label="Which test?"
                  htmlFor="languageTest"
                  error={errors.languageTest}
                  required
                >
                  <SegmentedChoice
                    id="languageTest"
                    label="Language Test"
                    columns={3}
                    value={values.languageTest}
                    options={LANGUAGE_TEST_OPTIONS.map((option) => ({
                      value: option.value,
                      label: option.label,
                    }))}
                    onChange={(next) => onChange('languageTest', next)}
                  />
                </Field>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {(
                    [
                      { key: 'listening', label: 'Listening' },
                      { key: 'speaking', label: 'Speaking' },
                      { key: 'reading', label: 'Reading' },
                      { key: 'writing', label: 'Writing' },
                    ] as const
                  ).map((skill) => (
                    <ScoreTile
                      key={skill.key}
                      label={skill.label}
                      htmlFor={skill.key}
                      error={errors[skill.key]}
                      accent={SCORE_ACCENTS[skill.key]}
                    >
                      <Input
                        id={skill.key}
                        type="number"
                        step="0.5"
                        value={values[skill.key]}
                        onChange={(event) =>
                          onChange(skill.key, event.target.value)
                        }
                        placeholder="Optional"
                        className="border-transparent bg-transparent pr-1 pl-2.5 text-lg font-semibold tabular-nums shadow-none focus-visible:ring-0"
                      />
                    </ScoreTile>
                  ))}
                </div>
              </div>
            ) : null}
          </FormSectionCard>
        </div>

        <div className="space-y-3 lg:sticky lg:top-4">
          <FormSectionCard
            icon={Eye}
            title="Lead Summary"
            description="Updates as you type."
            delayClassName="delay-75"
          >
            <div className="rounded-3xl bg-canvas p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                  {previewName ? getInitials(previewName) : '?'}
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'truncate text-sm font-bold',
                      previewName ? 'text-ink' : 'text-slate-400',
                    )}
                  >
                    {previewName || 'Student name'}
                  </p>
                  <div className="mt-1">
                    <LeadStatusPill
                      status={values.status}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1 text-xs text-slate-600">
                <p className="flex items-center gap-1.5 truncate">
                  <Phone aria-hidden className="size-3 shrink-0 text-slate-400" />
                  {values.phone || <span className="text-slate-400">No phone yet</span>}
                </p>
                {values.email ? (
                  <p className="flex items-center gap-1.5 truncate">
                    <Mail aria-hidden className="size-3 shrink-0 text-slate-400" />
                    <span className="truncate">{values.email}</span>
                  </p>
                ) : null}
              </div>
            </div>

            <dl className="grid gap-2">
              {[
                { label: 'Prediction test', value: course },
                { label: 'Counsellor', value: counsellorName },
                { label: 'Branch', value: values.branchId ? branchLabel : '' },
                {
                  label: 'Came from',
                  value: [resourceLabel, sourceLabel].filter(Boolean).join(' · '),
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-start justify-between gap-3 rounded-2xl bg-canvas px-3.5 py-2.5"
                >
                  <dt className="shrink-0 text-xs text-slate-500">
                    {item.label}
                  </dt>
                  <dd
                    className={cn(
                      'min-w-0 text-right text-xs font-semibold',
                      item.value ? 'text-ink' : 'text-slate-400',
                    )}
                  >
                    {item.value || 'Not set'}
                  </dd>
                </div>
              ))}
            </dl>
          </FormSectionCard>

          {mode === 'edit' && meta ? (
            <FormSectionCard
              icon={Clock3}
              title="Record Info"
              description="System details for this lead."
              delayClassName="delay-100"
            >
              <dl className="grid gap-2">
                <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                  <dt className="text-xs text-slate-500">Date created</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                    {formatDateTime(meta.createdAt)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                  <dt className="text-xs text-slate-500">Date updated</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                    {formatDateTime(meta.updatedAt)}
                  </dd>
                </div>
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
        deleteLabel="Delete lead"
        submitLabel={mode === 'create' ? 'Create lead' : undefined}
        hint="Review the summary before saving this lead."
      />
    </form>
  )
}
