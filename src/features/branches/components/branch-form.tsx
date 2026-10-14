import {
  Building2,
  Clock3,
  Eye,
  MapPin,
  Phone,
  Star,
  Users,
} from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'

import { FormSectionCard } from '../../../shared/components/feature-page'
import { FormSaveBar } from '../../../shared/components/page'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { StatusToggle } from '../../../shared/components/ui/status-toggle'
import { Textarea } from '../../../shared/components/ui/textarea'
import { cn } from '../../../shared/lib/cn'
import type {
  BranchFormErrors,
  BranchFormValues,
  BranchListItem,
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

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function BranchPreview({ values }: { values: BranchFormValues }) {
  const name = values.name.trim() || 'Branch name'
  const address = values.address.trim()
  const phone = values.phone.trim()

  return (
    <div className="rounded-3xl bg-canvas p-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'inline-flex size-11 shrink-0 items-center justify-center rounded-2xl',
            values.isMain ? 'bg-ink text-white' : 'bg-white text-brand-600',
          )}
        >
          <Building2 className="size-5" strokeWidth={1.9} />
        </span>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <p className="truncate text-sm font-bold text-ink">{name}</p>
            {values.isMain ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-brand-500 px-2 py-0.5 text-[11px] font-semibold text-white">
                <Star className="size-3 fill-current" />
                Main
              </span>
            ) : null}
          </div>
          <p className="mt-1 flex items-start gap-1.5 text-xs text-slate-500">
            <MapPin className="mt-0.5 size-3 shrink-0" />
            <span className="line-clamp-2">{address || 'No address yet'}</span>
          </p>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
            <Phone className="size-3 shrink-0" />
            {phone || 'No phone yet'}
          </p>
        </div>
      </div>
    </div>
  )
}

type BranchFormProps = {
  mode: 'create' | 'edit'
  values: BranchFormValues
  errors: BranchFormErrors
  isSubmitting: boolean
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
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <FormSectionCard
            icon={Building2}
            title="Branch"
            description="The name staff see when picking a branch, and how to reach it."
          >
            <Field
              label="Branch name"
              htmlFor="name"
              error={errors.name}
              required
            >
              <Input
                id="name"
                value={values.name}
                onChange={(event) => onChange('name', event.target.value)}
                placeholder="Main Branch"
              />
            </Field>

            <Field
              label="Phone number"
              htmlFor="phone"
              error={errors.phone}
              hint="Optional. Include the country code if you can, e.g. +6281234567890."
            >
              <Input
                id="phone"
                value={values.phone}
                onChange={(event) => onChange('phone', event.target.value)}
                placeholder="+6281234567890"
              />
            </Field>
          </FormSectionCard>

          <FormSectionCard
            icon={MapPin}
            title="Location"
            description="Where students and parents can find this branch."
            delayClassName="delay-75"
          >
            <Field
              label="Address"
              htmlFor="address"
              error={errors.address}
              hint="Optional."
            >
              <Textarea
                id="address"
                value={values.address}
                onChange={(event) => onChange('address', event.target.value)}
                placeholder="Street address, city"
                rows={3}
              />
            </Field>
          </FormSectionCard>

          <FormSectionCard
            icon={Star}
            title="Main branch"
            description="The main branch opens first on the schedule and admin screens."
            delayClassName="delay-100"
          >
            <StatusToggle
              id="isMain"
              label=""
              value={values.isMain}
              onChange={(next) => onChange('isMain', next)}
              activeLabel="Main branch"
              inactiveLabel="Regular branch"
              error={errors.isMain}
            />
            <p className="text-xs text-slate-500">
              Only one branch can be the main one. Choosing this branch moves
              the main label away from any other branch.
            </p>
          </FormSectionCard>
        </div>

        <div className="space-y-3 lg:sticky lg:top-4">
          <FormSectionCard
            icon={Eye}
            title="Preview"
            description="How this branch shows up in lists."
            delayClassName="delay-75"
          >
            <BranchPreview values={values} />
          </FormSectionCard>

          {mode === 'edit' && meta ? (
            <FormSectionCard
              icon={Clock3}
              title="Record Info"
              description="Details about this branch record."
              delayClassName="delay-100"
            >
              <div className="flex items-center gap-3 rounded-3xl bg-ink px-4 py-3.5 text-white">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-white/15">
                  <Users className="size-4" />
                </span>
                <div>
                  <p className="text-2xl font-bold tabular-nums">
                    {meta.totalStudent}
                  </p>
                  <p className="text-xs text-white/70">
                    {meta.totalStudent === 1 ? 'student' : 'students'} at this
                    branch
                  </p>
                </div>
              </div>
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
                <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                  <dt className="text-xs text-slate-500">Created by</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                    {meta.createdBy || '-'}
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
        deleteLabel="Delete branch"
        submitLabel={mode === 'create' ? 'Create branch' : undefined}
        hint="Only the branch name is required."
      />
    </form>
  )
}
