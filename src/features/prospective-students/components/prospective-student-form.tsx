import { parseISO } from 'date-fns'
import { useMemo, type FormEvent, type ReactNode } from 'react'

import {
  COURSE_OPTIONS,
  LANGUAGE_TEST_OPTIONS,
  PROSPECT_RESOURCE_OPTIONS,
} from '../../../shared/api/choices'
import { Button } from '../../../shared/components/ui/button'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

type ProspectiveStudentFormProps = {
  mode: 'create' | 'edit'
  values: ProspectiveStudentFormValues
  errors: ProspectiveStudentFormErrors
  isSubmitting: boolean
  meta?: Pick<ProspectiveStudentListItem, 'createdAt' | 'updatedAt'>
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
  const branchesQuery = useBranchesQuery()

  const counsellorOptions = useMemo(
    () =>
      (marketingsQuery.data ?? []).map((option) => ({
        value: option.id,
        label: `${option.pin} | ${option.fullName}`,
        keywords: `${option.pin} ${option.fullName} ${option.email}`,
      })),
    [marketingsQuery.data],
  )

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

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Lead Details</h3>
          <p className="mt-1 text-sm text-slate-500">
            Capture a prospective student inquiry and assign a counsellor.
          </p>
        </div>

        <Field
          label="Education Counsellor"
          htmlFor="marketingId"
          error={errors.marketingId}
          hint="Select the marketing counsellor for this lead."
        >
          <SearchableSelect
            id="marketingId"
            value={values.marketingId}
            options={counsellorOptions}
            onChange={(next) => onChange('marketingId', next)}
            placeholder="Select counsellor..."
            searchPlaceholder="Search counsellors..."
            disabled={marketingsQuery.isLoading}
            emptyMessage="No marketing staff found"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="SR Number" htmlFor="srNumber" error={errors.srNumber}>
            <Input
              id="srNumber"
              value={values.srNumber}
              onChange={(event) => onChange('srNumber', event.target.value)}
              placeholder="SR-001"
            />
          </Field>

          <Field label="Date" htmlFor="date" error={errors.date}>
            <DatePicker
              value={parseDateValue(values.date)}
              onChange={(date) => onChange('date', toDateString(date))}
              placeholder="Pick a date"
              title="Date"
              className="h-12 w-full min-w-0 justify-start rounded-xl border-slate-200 bg-[#F4F6FA] px-4 font-medium"
              align="start"
            />
          </Field>

          <Field label="Full Name" htmlFor="fullName" error={errors.fullName}>
            <Input
              id="fullName"
              value={values.fullName}
              onChange={(event) => onChange('fullName', event.target.value)}
              placeholder="Andrea Putri"
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

          <Field label="Gender" htmlFor="gender" error={errors.gender}>
            <Select
              id="gender"
              containerClassName="w-full sm:w-full"
              value={values.gender}
              onChange={(event) =>
                onChange(
                  'gender',
                  event.target.value as ProspectiveStudentFormValues['gender'],
                )
              }
            >
              <option value="">Select gender...</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Select>
          </Field>

          <Field label="Phone" htmlFor="phone" error={errors.phone}>
            <Input
              id="phone"
              value={values.phone}
              onChange={(event) => onChange('phone', event.target.value)}
              placeholder="081211122233"
            />
          </Field>

          <Field label="Age" htmlFor="age" error={errors.age}>
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

          <Field label="Resource" htmlFor="resource" error={errors.resource}>
            <Select
              id="resource"
              containerClassName="w-full sm:w-full"
              value={values.resource}
              onChange={(event) =>
                onChange(
                  'resource',
                  event.target
                    .value as ProspectiveStudentFormValues['resource'],
                )
              }
            >
              <option value="">Select resource...</option>
              {PROSPECT_RESOURCE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Address" htmlFor="address" error={errors.address}>
          <Textarea
            id="address"
            value={values.address}
            onChange={(event) => onChange('address', event.target.value)}
            placeholder="Home address"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Course" htmlFor="course" error={errors.course}>
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
              <option value="">Select course...</option>
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
              <option value="waiting">Waiting</option>
              <option value="follow_up">Follow Up</option>
              <option value="consult">Consult</option>
              <option value="prediction_test">Pre-Test</option>
              {values.status === 'enrolled' ? (
                <option value="enrolled">Enrolled</option>
              ) : null}
              <option value="cancelled">Cancelled</option>
            </Select>
          </Field>

          <Field label="Branch" htmlFor="branchId" error={errors.branchId}>
            <Select
              id="branchId"
              containerClassName="w-full sm:w-full"
              value={values.branchId}
              onChange={(event) => onChange('branchId', event.target.value)}
            >
              <option value="">Select branch...</option>
              {(branchesQuery.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Language Test</h3>
          <p className="mt-1 text-sm text-slate-500">
            Record prior IELTS, TOEFL, or SAT scores when available.
          </p>
        </div>

        <div className="space-y-2">
          <Label>Have you ever taken IELTS/TOEFL/SAT before?</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-[#F4F6FA] px-4 text-sm text-slate-600">
              <input
                type="radio"
                name="hasTakenLanguageTest"
                className="size-4 border-slate-300 text-[#4274B9] focus:ring-[#4274B9]/40"
                checked={values.hasTakenLanguageTest}
                onChange={() => setHasTakenLanguageTest(true)}
              />
              <span>Yes</span>
            </label>
            <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-[#F4F6FA] px-4 text-sm text-slate-600">
              <input
                type="radio"
                name="hasTakenLanguageTest"
                className="size-4 border-slate-300 text-[#4274B9] focus:ring-[#4274B9]/40"
                checked={!values.hasTakenLanguageTest}
                onChange={() => setHasTakenLanguageTest(false)}
              />
              <span>No</span>
            </label>
          </div>
        </div>

        {values.hasTakenLanguageTest ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              label="Language Test"
              htmlFor="languageTest"
              error={errors.languageTest}
            >
              <Select
                id="languageTest"
                containerClassName="w-full sm:w-full"
                value={values.languageTest}
                onChange={(event) =>
                  onChange(
                    'languageTest',
                    event.target
                      .value as ProspectiveStudentFormValues['languageTest'],
                  )
                }
              >
                <option value="">Select test...</option>
                {LANGUAGE_TEST_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Listening" htmlFor="listening" error={errors.listening}>
              <Input
                id="listening"
                type="number"
                step="0.5"
                value={values.listening}
                onChange={(event) => onChange('listening', event.target.value)}
                placeholder="Optional"
              />
            </Field>

            <Field label="Speaking" htmlFor="speaking" error={errors.speaking}>
              <Input
                id="speaking"
                type="number"
                step="0.5"
                value={values.speaking}
                onChange={(event) => onChange('speaking', event.target.value)}
                placeholder="Optional"
              />
            </Field>

            <Field label="Reading" htmlFor="reading" error={errors.reading}>
              <Input
                id="reading"
                type="number"
                step="0.5"
                value={values.reading}
                onChange={(event) => onChange('reading', event.target.value)}
                placeholder="Optional"
              />
            </Field>

            <Field label="Writing" htmlFor="writing" error={errors.writing}>
              <Input
                id="writing"
                type="number"
                step="0.5"
                value={values.writing}
                onChange={(event) => onChange('writing', event.target.value)}
                placeholder="Optional"
              />
            </Field>
          </div>
        ) : null}
      </section>

      {mode === 'edit' && meta ? (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <section className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <h3 className="text-sm font-bold text-slate-900">Record Info</h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-400">Date created</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {formatDateTime(meta.createdAt)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Date updated</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {formatDateTime(meta.updatedAt)}
                </dd>
              </div>
            </dl>
          </section>
        </>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-6">
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
          ) : null}
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
    </form>
  )
}
