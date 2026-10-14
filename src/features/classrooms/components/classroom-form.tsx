import { Building2, Clock3, DoorOpen, Eye, Power } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'

import {
  ChoiceTile,
  FormSectionCard,
} from '../../../shared/components/feature-page'
import { FormSaveBar } from '../../../shared/components/page'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { StatusToggle } from '../../../shared/components/ui/status-toggle'
import type {
  ClassroomBranchOption,
  ClassroomFormErrors,
  ClassroomFormValues,
  ClassroomListItem,
} from '../types/classroom'

/** Above this many branches, a dropdown is easier to scan than tiles. */
const MAX_BRANCH_TILES = 6

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

type ClassroomFormProps = {
  mode: 'create' | 'edit'
  values: ClassroomFormValues
  errors: ClassroomFormErrors
  isSubmitting: boolean
  branchOptions: ClassroomBranchOption[]
  branchesLoading?: boolean
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
  branchOptions,
  branchesLoading = false,
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

  const branchName =
    branchOptions.find((branch) => branch.id === values.branchId)?.name ?? ''
  const useBranchTiles =
    !branchesLoading && branchOptions.length <= MAX_BRANCH_TILES

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <FormSectionCard
            icon={DoorOpen}
            title="Room"
            description="How staff will recognise this room on the schedule."
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
              <Field
                label="Code"
                htmlFor="code"
                error={errors.code}
                required
                hint="Short label, e.g. the room number."
              >
                <Input
                  id="code"
                  value={values.code}
                  onChange={(event) => onChange('code', event.target.value)}
                  placeholder="RM-101"
                  className="font-mono"
                />
              </Field>
              <Field
                label="Name"
                htmlFor="className"
                error={errors.className}
                required
              >
                <Input
                  id="className"
                  value={values.className}
                  onChange={(event) =>
                    onChange('className', event.target.value)
                  }
                  placeholder="Blue Room"
                />
              </Field>
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={Building2}
            title="Location"
            description="The branch this room belongs to. Only that branch's classes can use it."
            delayClassName="delay-75"
          >
            <Field
              label="Branch"
              htmlFor="branchId"
              error={errors.branchId}
              required
            >
              {useBranchTiles ? (
                <div
                  id="branchId"
                  className="grid gap-2 sm:grid-cols-2"
                  role="radiogroup"
                  aria-label="Branch"
                >
                  {branchOptions.map((branch) => (
                    <ChoiceTile
                      key={branch.id}
                      name="classroom-branch"
                      title={branch.name}
                      selected={values.branchId === branch.id}
                      onSelect={() => onChange('branchId', branch.id)}
                    />
                  ))}
                </div>
              ) : (
                <Select
                  id="branchId"
                  containerClassName="w-full sm:w-full"
                  value={values.branchId}
                  disabled={branchesLoading}
                  onChange={(event) => onChange('branchId', event.target.value)}
                >
                  <option value="">
                    {branchesLoading ? 'Loading branches...' : 'Select a branch'}
                  </option>
                  {branchOptions.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </Select>
              )}
            </Field>
          </FormSectionCard>
        </div>

        <div className="space-y-3 lg:sticky lg:top-4">
          <FormSectionCard
            icon={Eye}
            title="Preview"
            description="How this room appears on schedules. Updates as you type."
            delayClassName="delay-75"
          >
            <div className="flex items-center gap-3 rounded-2xl bg-canvas px-3.5 py-3">
              <div
                className={
                  values.isActive
                    ? 'inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white'
                    : 'inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-white text-slate-400'
                }
              >
                <DoorOpen className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-ink">
                  {values.className.trim() || 'Room name'}
                </p>
                <p className="truncate text-xs text-slate-500">
                  <span className="font-mono">
                    {values.code.trim() || 'CODE'}
                  </span>
                  {' · '}
                  {branchName || 'No branch yet'}
                </p>
              </div>
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={Power}
            title="Availability"
            description="Inactive rooms stay on past sessions but can't be booked."
            delayClassName="delay-100"
          >
            <StatusToggle
              id="classroom-is-active"
              label=""
              value={values.isActive}
              onChange={(next) => onChange('isActive', next)}
              error={errors.isActive}
            />
          </FormSectionCard>

          {mode === 'edit' && meta ? (
            <FormSectionCard
              icon={Clock3}
              title="Record Info"
              description="System details for this room."
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
        deleteLabel="Delete classroom"
        submitLabel={mode === 'create' ? 'Create classroom' : undefined}
        hint="Check the summary before saving."
      />
    </form>
  )
}
