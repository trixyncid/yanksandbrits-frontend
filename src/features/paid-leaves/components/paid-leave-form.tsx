import { parseISO } from 'date-fns'
import {
  CalendarDays,
  ClipboardCheck,
  FilePlus,
  FileText,
  UserRound,
} from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'

import { FormSectionCard } from '../../../shared/components/feature-page'
import { FormSaveBar } from '../../../shared/components/page'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { cn } from '../../../shared/lib/cn'
import { PersonAvatar } from '../../users/components/people-ui'
import { useCounsellorOptionsQuery } from '../../users/hooks/use-user-options'
import type {
  PaidLeaveFormErrors,
  PaidLeaveFormValues,
  PaidLeaveListItem,
} from '../types/paid-leave'

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs text-rose-500">{message}</p>
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

const STATUS_CHOICES: {
  value: PaidLeaveFormValues['status']
  label: string
  hint: string
  dot: string
}[] = [
  {
    value: 'pending',
    label: 'Pending',
    hint: 'Waiting for a decision',
    dot: 'bg-amber-500',
  },
  {
    value: 'approved',
    label: 'Approved',
    hint: 'Counts against their balance',
    dot: 'bg-emerald-500',
  },
  {
    value: 'void',
    label: 'Void',
    hint: 'Cancelled or turned down',
    dot: 'bg-slate-400',
  },
]

type PaidLeaveFormProps = {
  mode: 'create' | 'edit'
  values: PaidLeaveFormValues
  errors: PaidLeaveFormErrors
  isSubmitting: boolean
  meta?: Pick<PaidLeaveListItem, 'staffName' | 'branch' | 'totalDays' | 'fileUrl'>
  onChange: <K extends keyof PaidLeaveFormValues>(
    field: K,
    value: PaidLeaveFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

function formatDate(value: string) {
  if (!value) {
    return '—'
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value))
}

export function PaidLeaveForm({
  mode,
  values,
  errors,
  isSubmitting,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: PaidLeaveFormProps) {
  const staffQuery = useCounsellorOptionsQuery()
  // Freelancers have no paid leave, so they can't be picked (an existing
  // record keeps showing its saved name).
  const staff = (staffQuery.data ?? []).filter(
    (option) => option.employmentType !== 'FL' || option.id === values.userId,
  )

  const fileLabel = values.filesFile
    ? values.filesFile.name
    : meta?.fileUrl
      ? 'PDF on file — choose a file to replace'
      : 'Choose a PDF to attach (optional)'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  const selectedStaff = staff.find((option) => option.id === values.userId)
  const staffName = selectedStaff?.fullName ?? meta?.staffName ?? ''

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <FormSectionCard
            icon={UserRound}
            title="Who"
            description="The staff member or tutor taking the leave."
          >
            <Field
              label="Person"
              htmlFor="userId"
              error={errors.userId}
              required
            >
              <Select
                id="userId"
                containerClassName="w-full sm:w-full"
                value={values.userId}
                onChange={(event) => onChange('userId', event.target.value)}
                disabled={staffQuery.isLoading}
              >
                <option value="">
                  {staffQuery.isLoading ? 'Loading people...' : 'Select a person...'}
                </option>
                {staff.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.pin} | {option.fullName}
                  </option>
                ))}
              </Select>
            </Field>
          </FormSectionCard>

          <FormSectionCard
            icon={CalendarDays}
            title="When"
            description="The first and last day they are away. Use the same date for a single day."
            delayClassName="delay-75"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="First day"
                htmlFor="startDate"
                error={errors.startDate}
                required
              >
                <DatePicker
                  value={parseDateValue(values.startDate)}
                  onChange={(date) => onChange('startDate', toDateString(date))}
                  placeholder="Pick start date"
                  title="Start date"
                  className="h-12 w-full min-w-0 justify-start rounded-full border-slate-200/80 bg-white px-4 font-medium shadow-sm"
                  align="start"
                />
              </Field>

              <Field
                label="Last day"
                htmlFor="endDate"
                error={errors.endDate}
                required
              >
                <DatePicker
                  value={parseDateValue(values.endDate)}
                  onChange={(date) => onChange('endDate', toDateString(date))}
                  placeholder="Pick end date"
                  title="End date"
                  className="h-12 w-full min-w-0 justify-start rounded-full border-slate-200/80 bg-white px-4 font-medium shadow-sm"
                  align="start"
                />
              </Field>
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={FileText}
            title="Notes and document"
            description="Anything worth remembering, plus a signed form or doctor's note if you have one."
            delayClassName="delay-100"
          >
            <Field label="Notes" htmlFor="notes" error={errors.notes}>
              <Textarea
                id="notes"
                value={values.notes}
                onChange={(event) => onChange('notes', event.target.value)}
                placeholder="Optional, e.g. family event, medical leave"
              />
            </Field>

            <div className="space-y-1.5">
              <Label htmlFor="filesFile">Supporting PDF</Label>
              <label
                htmlFor="filesFile"
                className="flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border border-dashed border-slate-300 bg-canvas/60 px-4 py-3 text-sm text-slate-600 transition hover:border-brand-300 hover:bg-brand-50"
              >
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-brand-600">
                  <FilePlus className="size-4" />
                </span>
                <span className="flex-1 truncate">{fileLabel}</span>
                <input
                  id="filesFile"
                  type="file"
                  accept="application/pdf,.pdf"
                  className="sr-only"
                  onChange={(event) =>
                    onChange('filesFile', event.target.files?.[0] ?? null)
                  }
                />
              </label>
              {meta?.fileUrl && !values.filesFile ? (
                <a
                  href={meta.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex text-xs font-semibold text-brand-600 hover:underline"
                >
                  Open current PDF
                </a>
              ) : null}
              <FieldError message={errors.filesFile} />
            </div>
          </FormSectionCard>
        </div>

        <div className="space-y-3 lg:sticky lg:top-4">
          <FormSectionCard
            icon={ClipboardCheck}
            title="Decision"
            description="Only approved leave counts against their balance."
            delayClassName="delay-75"
          >
            <div
              id="status"
              role="radiogroup"
              aria-label="Approval status"
              className="grid gap-1.5"
            >
              {STATUS_CHOICES.map((choice) => {
                const selected = values.status === choice.value
                return (
                  <button
                    key={choice.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onChange('status', choice.value)}
                    className={cn(
                      'flex items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left transition',
                      selected
                        ? 'bg-ink text-white'
                        : 'bg-canvas text-slate-600 hover:bg-canvas-deep',
                    )}
                  >
                    <span
                      aria-hidden
                      className={cn('size-2 shrink-0 rounded-full', choice.dot)}
                    />
                    <span className="min-w-0">
                      <span
                        className={cn(
                          'block text-sm font-semibold',
                          selected ? 'text-white' : 'text-ink',
                        )}
                      >
                        {choice.label}
                      </span>
                      <span
                        className={cn(
                          'block text-xs',
                          selected ? 'text-white/70' : 'text-slate-500',
                        )}
                      >
                        {choice.hint}
                      </span>
                    </span>
                  </button>
                )
              })}
            </div>
            <FieldError message={errors.status} />
          </FormSectionCard>

          <FormSectionCard
            icon={CalendarDays}
            title="Summary"
            description="Updates as you fill in the form."
            delayClassName="delay-100"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-canvas px-3.5 py-3">
              {staffName ? (
                <PersonAvatar name={staffName} seed={values.userId} />
              ) : (
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-white text-slate-400">
                  <UserRound className="size-4" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {staffName || 'No one picked yet'}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {values.startDate
                    ? values.endDate && values.endDate !== values.startDate
                      ? `${formatDate(values.startDate)} – ${formatDate(values.endDate)}`
                      : formatDate(values.startDate)
                    : 'Dates not set'}
                </p>
              </div>
            </div>
            {mode === 'edit' && meta ? (
              <dl className="grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                  <dt className="text-xs text-slate-500">Branch</dt>
                  <dd className="mt-0.5 truncate text-sm font-semibold text-ink">
                    {meta.branch}
                  </dd>
                </div>
                <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                  <dt className="text-xs text-slate-500">Saved length</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-ink tabular-nums">
                    {meta.totalDays} {meta.totalDays === 1 ? 'day' : 'days'}
                  </dd>
                </div>
              </dl>
            ) : null}
          </FormSectionCard>
        </div>
      </div>

      <FormSaveBar
        mode={mode}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onDelete={onDelete}
        deleteLabel="Delete leave"
        submitLabel={mode === 'create' ? 'Record leave' : 'Save changes'}
        hint="Fields marked * are required."
      />
    </form>
  )
}
