import type { FormEvent, ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { classroomBranchOptions } from '../data/classrooms-placeholder'
import type {
  ClassroomFormErrors,
  ClassroomFormValues,
  ClassroomListItem,
} from '../types/classroom'

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

type ClassroomFormProps = {
  mode: 'create' | 'edit'
  values: ClassroomFormValues
  errors: ClassroomFormErrors
  isSubmitting: boolean
  meta?: Pick<ClassroomListItem, 'createdAt' | 'updatedAt' | 'createdBy'>
  onChange: <K extends keyof ClassroomFormValues>(
    field: K,
    value: ClassroomFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function ClassroomForm({
  mode,
  values,
  errors,
  isSubmitting,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: ClassroomFormProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Classroom Details
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Set the room code, name, branch, and availability.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Code" htmlFor="code" error={errors.code}>
            <Input
              id="code"
              value={values.code}
              onChange={(event) => onChange('code', event.target.value)}
              placeholder="RM-101"
            />
          </Field>

          <Field label="Class Name" htmlFor="className" error={errors.className}>
            <Input
              id="className"
              value={values.className}
              onChange={(event) => onChange('className', event.target.value)}
              placeholder="Blue Room"
            />
          </Field>
        </div>

        <div className="space-y-2">
          <Label htmlFor="isActive">Active Status</Label>
          <label
            htmlFor="isActive"
            className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-[#F4F6FA] px-4 text-sm text-slate-600"
          >
            <input
              id="isActive"
              type="checkbox"
              className="size-4 rounded border-slate-300 text-[#4274B9] focus:ring-[#4274B9]/40"
              checked={values.isActive}
              onChange={(event) => onChange('isActive', event.target.checked)}
            />
            <span>
              {values.isActive
                ? 'Classroom is active and available for scheduling'
                : 'Classroom is inactive'}
            </span>
          </label>
          <FieldError message={errors.isActive} />
        </div>

        <Field
          label="Branch"
          htmlFor="branch"
          error={errors.branch}
          hint="Select the branch where this classroom is located."
        >
          <Select
            id="branch"
            containerClassName="w-full sm:w-full"
            value={values.branch}
            onChange={(event) => onChange('branch', event.target.value)}
          >
            {classroomBranchOptions.map((branch) => (
              <option key={branch.id} value={branch.name}>
                {branch.name}
              </option>
            ))}
          </Select>
        </Field>
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
              <div className="sm:col-span-2">
                <dt className="text-xs text-slate-400">Created by</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {meta.createdBy || '-'}
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
