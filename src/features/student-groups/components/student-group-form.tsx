import { Search, X } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { cn } from '../../../shared/lib/cn'
import { studentGroupMemberOptions } from '../data/student-groups-placeholder'
import type {
  StudentGroupFormErrors,
  StudentGroupFormValues,
  StudentGroupListItem,
} from '../types/student-group'

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

type StudentGroupFormProps = {
  mode: 'create' | 'edit'
  values: StudentGroupFormValues
  errors: StudentGroupFormErrors
  isSubmitting: boolean
  meta?: Pick<
    StudentGroupListItem,
    'createdAt' | 'updatedAt' | 'createdBy' | 'branch'
  >
  onChange: <K extends keyof StudentGroupFormValues>(
    field: K,
    value: StudentGroupFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function StudentGroupForm({
  mode,
  values,
  errors,
  isSubmitting,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: StudentGroupFormProps) {
  const [memberSearch, setMemberSearch] = useState('')

  const selectedMembers = useMemo(
    () =>
      studentGroupMemberOptions.filter((option) =>
        values.memberPins.includes(option.pin),
      ),
    [values.memberPins],
  )

  const visibleOptions = useMemo(() => {
    const query = memberSearch.trim().toLowerCase()
    if (!query) {
      return studentGroupMemberOptions
    }

    return studentGroupMemberOptions.filter((option) =>
      `${option.fullName} ${option.pin} ${option.branch}`
        .toLowerCase()
        .includes(query),
    )
  }, [memberSearch])

  function toggleMember(pin: string) {
    if (values.memberPins.includes(pin)) {
      onChange(
        'memberPins',
        values.memberPins.filter((value) => value !== pin),
      )
      return
    }

    onChange('memberPins', [...values.memberPins, pin])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Group Details</h3>
          <p className="mt-1 text-sm text-slate-500">
            Name the group and choose which students belong to it.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Group Name"
            htmlFor="groupName"
            error={errors.groupName}
          >
            <Input
              id="groupName"
              value={values.groupName}
              onChange={(event) => onChange('groupName', event.target.value)}
              placeholder="SAT Intensive A"
            />
          </Field>

          <Field label="Active Status" htmlFor="status" error={errors.status}>
            <Select
              id="status"
              containerClassName="w-full sm:w-full"
              value={values.status}
              onChange={(event) =>
                onChange(
                  'status',
                  event.target.value as StudentGroupFormValues['status'],
                )
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">Participants</h3>
          <p className="mt-1 text-sm text-slate-500">
            Select one or more active students for this group.
          </p>
        </div>

        {selectedMembers.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {selectedMembers.map((member) => (
              <button
                key={member.pin}
                type="button"
                onClick={() => toggleMember(member.pin)}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#EDF4FF] px-3 py-1.5 text-xs font-semibold text-[#2F5A94] ring-1 ring-[#BED2F2] transition hover:bg-[#DCE9FB]"
              >
                {member.fullName}
                <X className="size-3" />
              </button>
            ))}
          </div>
        ) : null}

        <Field
          label="Students"
          htmlFor="memberSearch"
          error={errors.memberPins}
          hint={`${values.memberPins.length} selected`}
        >
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-[#F8FAFC]">
            <div className="relative border-b border-slate-200 bg-white px-3 py-2">
              <Search className="pointer-events-none absolute top-1/2 left-6 size-4 -translate-y-1/2 text-slate-400" />
              <Input
                id="memberSearch"
                value={memberSearch}
                onChange={(event) => setMemberSearch(event.target.value)}
                placeholder="Search by name, PIN, or branch..."
                className="h-10 border-0 bg-transparent pl-9 shadow-none focus:ring-0"
              />
            </div>

            <div className="max-h-72 space-y-1 overflow-y-auto p-2">
              {visibleOptions.length === 0 ? (
                <p className="px-3 py-8 text-center text-sm text-slate-500">
                  No students match your search.
                </p>
              ) : (
                visibleOptions.map((option) => {
                  const selected = values.memberPins.includes(option.pin)

                  return (
                    <label
                      key={option.pin}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition',
                        selected
                          ? 'bg-[#EDF4FF] ring-1 ring-[#BED2F2]'
                          : 'hover:bg-white',
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleMember(option.pin)}
                        className="size-4 rounded border-slate-300 text-[#4274B9] focus:ring-[#4274B9]/40"
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-semibold text-slate-900">
                          {option.fullName}
                        </span>
                        <span className="block text-xs text-slate-500">
                          {option.pin} · {option.branch}
                        </span>
                      </span>
                    </label>
                  )
                })
              )}
            </div>
          </div>
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
                  {meta.createdBy}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-400">Branch</dt>
                <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                  {meta.branch}
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
