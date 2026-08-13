import { parseISO } from 'date-fns'
import type { FormEvent, ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import type { BranchListItem } from '../../branches/types/branch'
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

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Period</h3>
          <p className="mt-1 text-sm text-slate-500">
            Set the payroll date range and optional title for this period.
          </p>
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

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Start date" htmlFor="startDate" error={errors.startDate}>
            <DatePicker
              value={parseDateValue(values.startDate)}
              onChange={(date) => onChange('startDate', toDateString(date))}
              placeholder="Select start date"
              className="w-full"
            />
          </Field>

          <Field label="End date" htmlFor="endDate" error={errors.endDate}>
            <DatePicker
              value={parseDateValue(values.endDate)}
              onChange={(date) => onChange('endDate', toDateString(date))}
              placeholder="Select end date"
              className="w-full"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Scope & status</h3>
          <p className="mt-1 text-sm text-slate-500">
            Approving a period generates tutor and marketing salary calculations.
          </p>
        </div>

        <Field label="Status" htmlFor="status" error={errors.status}>
          <Select
            id="status"
            value={values.status}
            containerClassName="w-full sm:w-full"
            onChange={(event) =>
              onChange(
                'status',
                event.target.value as BookkeepingFormValues['status'],
              )
            }
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="void">Void</option>
          </Select>
        </Field>

        <Field
          label="Branch"
          htmlFor="branchId"
          error={errors.branchId}
          hint="Optional."
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
      </section>

      {mode === 'edit' && meta ? (
        <section className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-5 py-4">
          <p className="text-xs font-semibold tracking-[0.12em] text-slate-400 uppercase">
            Record info
          </p>
          <dl className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <dt className="text-xs text-slate-500">Created by</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                {meta.createdBy}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Created at</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                {formatDateTime(meta.createdAt)}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-slate-500">Updated at</dt>
              <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                {formatDateTime(meta.updatedAt)}
              </dd>
            </div>
          </dl>
        </section>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-6">
        <div>
          {mode === 'edit' && onDelete ? (
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              onClick={onDelete}
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            >
              Delete period
            </Button>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            disabled={isSubmitting}
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? mode === 'create'
                ? 'Creating…'
                : 'Saving…'
              : mode === 'create'
                ? 'Create period'
                : 'Save changes'}
          </Button>
        </div>
      </div>
    </form>
  )
}
