import { parseISO } from 'date-fns'
import { CalendarRange, Clock3, ShieldCheck } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'

import { FormSectionCard } from '../../../shared/components/feature-page'
import { FormSaveBar } from '../../../shared/components/page'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { cn } from '../../../shared/lib/cn'
import { DuskPanel } from '../../student-payments/components/payment-ui'
import type { BranchListItem } from '../../branches/types/branch'
import {
  formatPeriodDate,
  formatPeriodDateTime,
  periodLengthDays,
} from '../lib/bookkeeping-status'
import type {
  BookkeepingDetail,
  BookkeepingFormErrors,
  BookkeepingFormValues,
} from '../types/bookkeeping'

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
      {hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  )
}

const STATUS_CHOICES: {
  value: BookkeepingFormValues['status']
  label: string
  description: string
  selectedClass: string
}[] = [
  {
    value: 'pending',
    label: 'Pending',
    description: 'Still being checked.',
    selectedClass: 'bg-brand-500 text-white',
  },
  {
    value: 'approved',
    label: 'Approved',
    description: 'Builds salary calculations.',
    selectedClass: 'bg-emerald-600 text-white',
  },
  {
    value: 'void',
    label: 'Void',
    description: 'Cancelled, kept for records.',
    selectedClass: 'bg-rose-600 text-white',
  },
]

type BookkeepingFormProps = {
  mode: 'create' | 'edit'
  values: BookkeepingFormValues
  errors: BookkeepingFormErrors
  isSubmitting: boolean
  branchOptions: BranchListItem[]
  branchesLoading?: boolean
  meta?: Pick<BookkeepingDetail, 'createdAt' | 'updatedAt' | 'createdBy'>
  onChange: <K extends keyof BookkeepingFormValues>(
    field: K,
    value: BookkeepingFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function BookkeepingForm({
  mode,
  values,
  errors,
  isSubmitting,
  branchOptions,
  branchesLoading = false,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: BookkeepingFormProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  const days = periodLengthDays(values.startDate, values.endDate)
  const validRange =
    Boolean(values.startDate && values.endDate) &&
    values.startDate <= values.endDate
  const branchLabel =
    branchOptions.find((branch) => branch.id === values.branchId)?.name ??
    'All branches'
  const statusChoice =
    STATUS_CHOICES.find((choice) => choice.value === values.status) ??
    STATUS_CHOICES[0]

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <FormSectionCard
            icon={CalendarRange}
            title="Period"
            description="The payroll dates this period covers."
          >
            <div className="grid gap-3 sm:grid-cols-2">
              <Field
                label="Start date"
                htmlFor="startDate"
                error={errors.startDate}
                required
              >
                <DatePicker
                  value={parseDateValue(values.startDate)}
                  onChange={(date) => onChange('startDate', toDateString(date))}
                  placeholder="Select start date"
                  className="w-full"
                />
              </Field>

              <Field
                label="End date"
                htmlFor="endDate"
                error={errors.endDate}
                required
                hint="Must be on or after the start date."
              >
                <DatePicker
                  value={parseDateValue(values.endDate)}
                  onChange={(date) => onChange('endDate', toDateString(date))}
                  placeholder="Select end date"
                  className="w-full"
                />
              </Field>
            </div>

            <Field
              label="Title"
              htmlFor="title"
              error={errors.title}
              hint="Optional. Defaults to the date range if left blank."
            >
              <Input
                id="title"
                value={values.title}
                onChange={(event) => onChange('title', event.target.value)}
                placeholder="July 2026 payroll"
              />
            </Field>
          </FormSectionCard>

          <FormSectionCard
            icon={ShieldCheck}
            title="Status & branch"
            description="Approving a period generates tutor and education counsellor salary calculations."
            delayClassName="delay-75"
          >
            <Field label="Status" htmlFor="status" error={errors.status} required>
              <div
                id="status"
                role="radiogroup"
                aria-label="Status"
                className="grid gap-2 sm:grid-cols-3"
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
                        'rounded-2xl px-4 py-3 text-left transition',
                        selected
                          ? choice.selectedClass
                          : 'bg-canvas text-ink hover:bg-canvas-deep',
                      )}
                    >
                      <span className="block text-sm font-semibold">
                        {choice.label}
                      </span>
                      <span
                        className={cn(
                          'mt-0.5 block text-[11px]',
                          selected ? 'text-white/80' : 'text-slate-500',
                        )}
                      >
                        {choice.description}
                      </span>
                    </button>
                  )
                })}
              </div>
            </Field>

            <Field
              label="Branch"
              htmlFor="branchId"
              error={errors.branchId}
              hint="Optional. Leave on All branches to include everyone."
            >
              <Select
                id="branchId"
                value={values.branchId}
                containerClassName="w-full sm:w-full"
                disabled={branchesLoading}
                onChange={(event) => onChange('branchId', event.target.value)}
              >
                <option value="">All branches</option>
                {branchOptions.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </Select>
            </Field>
          </FormSectionCard>
        </div>

        <aside className="space-y-3 lg:sticky lg:top-4">
          <DuskPanel
            pattern="waves"
            className="animate-in fade-in slide-in-from-bottom-2 delay-75"
          >
            <p className="text-[11px] font-bold tracking-[0.14em] text-white/70 uppercase">
              Summary
            </p>
            <p className="mt-1 text-xl font-bold tracking-tight">
              {values.title.trim() ||
                (validRange
                  ? `${formatPeriodDate(values.startDate)} – ${formatPeriodDate(values.endDate)}`
                  : 'New payroll period')}
            </p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-2xl bg-white/10 px-3 py-2.5">
                <p className="text-[11px] text-white/70">Length</p>
                <p className="mt-0.5 text-lg font-bold tabular-nums">
                  {validRange && days ? `${days} day${days === 1 ? '' : 's'}` : '—'}
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 px-3 py-2.5">
                <p className="text-[11px] text-white/70">Status</p>
                <p className="mt-0.5 text-lg font-bold">{statusChoice.label}</p>
              </div>
            </div>
            <p className="mt-3 text-xs text-white/75">
              {branchLabel} ·{' '}
              {values.status === 'approved'
                ? 'Salaries are calculated when you save.'
                : 'No salaries are calculated until it is approved.'}
            </p>
          </DuskPanel>

          {mode === 'edit' && meta ? (
            <FormSectionCard
              icon={Clock3}
              title="Record info"
              description="Who set up this period and when."
              delayClassName="delay-100"
            >
              <dl className="grid gap-2">
                <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                  <dt className="text-xs text-slate-500">Created by</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                    {meta.createdBy || '—'}
                  </dd>
                </div>
                <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                  <dt className="text-xs text-slate-500">Created</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                    {formatPeriodDateTime(meta.createdAt)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                  <dt className="text-xs text-slate-500">Last updated</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                    {formatPeriodDateTime(meta.updatedAt)}
                  </dd>
                </div>
              </dl>
            </FormSectionCard>
          ) : null}
        </aside>
      </div>

      <FormSaveBar
        mode={mode}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onDelete={onDelete}
        deleteLabel="Delete period"
        submitLabel={mode === 'create' ? 'Create period' : undefined}
        hint="Approving a period calculates everyone's salary."
      />
    </form>
  )
}
