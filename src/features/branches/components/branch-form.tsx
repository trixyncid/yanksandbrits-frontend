import type { FormEvent, ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import type {
  BranchFormErrors,
  BranchFormValues,
  BranchListItem,
  BrandOption,
} from '../types/branch'

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

type BranchFormProps = {
  mode: 'create' | 'edit'
  values: BranchFormValues
  errors: BranchFormErrors
  isSubmitting: boolean
  brandOptions: BrandOption[]
  brandsLoading?: boolean
  meta?: Pick<
    BranchListItem,
    'createdAt' | 'updatedAt' | 'createdBy' | 'totalStudent'
  >
  onChange: <K extends keyof BranchFormValues>(
    field: K,
    value: BranchFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function BranchForm({
  mode,
  values,
  errors,
  isSubmitting,
  brandOptions,
  brandsLoading = false,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: BranchFormProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Branch Details</h3>
          <p className="mt-1 text-sm text-slate-500">
            Set the branch name, contact info, and brand.
          </p>
        </div>

        <Field label="Branch Name" htmlFor="name" error={errors.name}>
          <Input
            id="name"
            value={values.name}
            onChange={(event) => onChange('name', event.target.value)}
            placeholder="Main Branch"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Phone Number"
            htmlFor="phone"
            error={errors.phone}
            hint="Optional. Use international format when possible (e.g. +6281234567890)."
          >
            <Input
              id="phone"
              value={values.phone}
              onChange={(event) => onChange('phone', event.target.value)}
              placeholder="+6281234567890"
            />
          </Field>

          <Field
            label="Brand"
            htmlFor="brandId"
            error={errors.brandId}
            hint="Optional. Link this branch to a brand."
          >
            <Select
              id="brandId"
              containerClassName="w-full sm:w-full"
              value={values.brandId}
              disabled={brandsLoading}
              onChange={(event) => onChange('brandId', event.target.value)}
            >
              <option value="">No brand</option>
              {brandOptions.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
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
            placeholder="Street address, city"
            rows={3}
          />
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
              <div>
                <dt className="text-xs text-slate-400">Created by</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {meta.createdBy || '-'}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Total students</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800 tabular-nums">
                  {meta.totalStudent}
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
