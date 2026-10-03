import { parseISO } from 'date-fns'
import {
  BookOpenCheck,
  ClipboardList,
  Clock3,
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
import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/components/ui/button'
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
import type {
  ProspectiveStudentFormErrors,
  ProspectiveStudentFormValues,
  ProspectiveStudentListItem,
} from '../types/prospective-student'

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
        'grid h-12 gap-1 rounded-full border border-slate-200/80 bg-slate-50 p-1 shadow-sm',
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
                ? 'bg-white text-[#253CA1] shadow-sm ring-1 ring-[#C8D4F5]'
                : 'text-slate-500 hover:bg-white/70 hover:text-slate-800',
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
  speaking: '#1B2A5A',
  reading: '#7B93E8',
  writing: '#3A56B8',
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

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid items-start gap-3 xl:grid-cols-2">
        <FormSectionCard
          className="h-full"
          icon={UserRound}
          title="Student"
          description="Start with the person. Name and how to reach them."
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
          className="h-full"
          icon={ClipboardList}
          title="Lead Details"
          description="Who owns this lead, where it came from, and what they want."
          delayClassName="delay-75"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Education Counsellor"
              htmlFor="marketingId"
              error={errors.marketingId}
              required
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
              hint="Follows the counsellor."
            >
              <div
                id="branchId"
                className="flex min-h-12 items-center rounded-full border border-dashed border-slate-200 bg-slate-50 px-4 text-sm font-medium leading-snug text-slate-700"
              >
                {branchLabel}
              </div>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Date Consulted"
              htmlFor="date"
              error={errors.date}
              required
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
                className="h-12 w-full min-w-0 justify-start rounded-full border-slate-200/80 bg-white px-4 font-medium shadow-sm"
                align="start"
              />
            </Field>

            <Field
              label="SR Number"
              htmlFor="srNumber"
              error={errors.srNumber}
              required
              hint={
                lockConsultFields
                  ? 'Education counsellors cannot change SR number.'
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
                hint={
                  lockConsultFields
                    ? 'Education counsellors cannot change resource.'
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
                label="Tele Marketing"
                htmlFor="teleMarketing"
                error={errors.teleMarketing}
                required
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

            <Field
              label="Prediction Test"
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
                    event.target.value as ProspectiveStudentFormValues['course'],
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
              hint={
                values.status === 'enrolled'
                  ? 'Enrolled status is locked. Contact a manager if this needs to be changed.'
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
      </div>

      <FormSectionCard
        icon={BookOpenCheck}
        title="Language Test"
        description="Prior official results, only when the student already has them."
        delayClassName="delay-100"
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <Label id="hasTakenLanguageTest-label">
              Has this student taken IELTS, TOEFL, or SAT before?
            </Label>
            <p className="mt-0.5 text-xs text-slate-400">
              Leave this off when there is no official result yet.
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
          <div className="space-y-3 border-t border-slate-100 pt-3.5">
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
                    className="border-transparent bg-transparent pl-2.5 pr-1 text-lg font-semibold tabular-nums shadow-none focus-visible:ring-0"
                  />
                </ScoreTile>
              ))}
            </div>
          </div>
        ) : null}
      </FormSectionCard>

      {mode === 'edit' && meta ? (
        <FormSectionCard
          icon={Clock3}
          title="Record Info"
          description="System timestamps for this lead."
          delayClassName="delay-100"
        >
          <dl className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2.5">
              <dt className="text-xs text-slate-400">Date created</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                {formatDateTime(meta.createdAt)}
              </dd>
            </div>
            <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2.5">
              <dt className="text-xs text-slate-400">Date updated</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                {formatDateTime(meta.updatedAt)}
              </dd>
            </div>
          </dl>
        </FormSectionCard>
      ) : null}

      <div className="sticky bottom-2 z-10 animate-in fade-in slide-in-from-bottom-2 delay-150">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:px-4">
          <div>
            {mode === 'edit' && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                Delete Data
              </Button>
            ) : (
              <p className="hidden text-xs text-slate-400 sm:block">
                Review details before saving this lead.
              </p>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
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
                  ? 'Submit Data'
                  : 'Update Data'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
