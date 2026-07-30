import { parseISO } from 'date-fns'
import { FilePlus } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
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
  const staff = staffQuery.data ?? []

  const fileLabel = values.filesFile
    ? values.filesFile.name
    : meta?.fileUrl
      ? 'PDF on file — choose a file to replace'
      : 'Upload supporting PDF (optional)'

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Leave Details</h3>
          <p className="mt-1 text-sm text-slate-500">
            Record a staff paid leave request with dates, status, and optional
            PDF.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Staff Member" htmlFor="userId" error={errors.userId}>
            <Select
              id="userId"
              containerClassName="w-full sm:w-full"
              value={values.userId}
              onChange={(event) => onChange('userId', event.target.value)}
              disabled={staffQuery.isLoading}
            >
              <option value="">Select staff...</option>
              {staff.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.pin} | {option.fullName}
                </option>
              ))}
            </Select>
          </Field>

          <Field
            label="Approval Status"
            htmlFor="status"
            error={errors.status}
          >
            <Select
              id="status"
              containerClassName="w-full sm:w-full"
              value={values.status}
              onChange={(event) =>
                onChange(
                  'status',
                  event.target.value as PaidLeaveFormValues['status'],
                )
              }
            >
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="void">Void</option>
            </Select>
          </Field>

          <Field
            label="Start Date"
            htmlFor="startDate"
            error={errors.startDate}
          >
            <DatePicker
              value={parseDateValue(values.startDate)}
              onChange={(date) => onChange('startDate', toDateString(date))}
              placeholder="Pick start date"
              title="Start date"
              className="h-12 w-full min-w-0 justify-start rounded-xl border-slate-200 bg-[#F4F6FA] px-4 font-medium"
              align="start"
            />
          </Field>

          <Field label="End Date" htmlFor="endDate" error={errors.endDate}>
            <DatePicker
              value={parseDateValue(values.endDate)}
              onChange={(date) => onChange('endDate', toDateString(date))}
              placeholder="Pick end date"
              title="End date"
              className="h-12 w-full min-w-0 justify-start rounded-xl border-slate-200 bg-[#F4F6FA] px-4 font-medium"
              align="start"
            />
          </Field>
        </div>

        <Field label="Notes" htmlFor="notes" error={errors.notes}>
          <Textarea
            id="notes"
            value={values.notes}
            onChange={(event) => onChange('notes', event.target.value)}
            placeholder="Optional notes about this leave request"
          />
        </Field>

        <div className="space-y-2">
          <Label htmlFor="filesFile">Supporting Document</Label>
          <label
            htmlFor="filesFile"
            className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-dashed border-slate-300 bg-[#F4F6FA] px-4 text-sm text-slate-600 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF]"
          >
            <FilePlus className="size-4 shrink-0 text-[#4274B9]" />
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
              className="text-xs font-medium text-[#4274B9] hover:underline"
            >
              View current PDF
            </a>
          ) : null}
          <FieldError message={errors.filesFile} />
        </div>
      </section>

      {mode === 'edit' && meta ? (
        <>
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <section className="space-y-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
            <h3 className="text-sm font-bold text-slate-900">Record Info</h3>
            <dl className="grid gap-3 sm:grid-cols-2">
              <div>
                <dt className="text-xs text-slate-400">Staff</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {meta.staffName}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Branch</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {meta.branch}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Total days</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {meta.totalDays}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Period</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {formatDate(values.startDate)} – {formatDate(values.endDate)}
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
