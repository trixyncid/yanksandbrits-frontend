import { Check, Clock3, Eye, Power, Search, Users, X } from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'
import { useMemo, useState } from 'react'

import { FormSectionCard } from '../../../shared/components/feature-page'
import { FormSaveBar } from '../../../shared/components/page'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { StatusToggle } from '../../../shared/components/ui/status-toggle'
import { cn } from '../../../shared/lib/cn'
import { useStudentsQuery } from '../../students/hooks/use-students-query'
import { initials } from '../lib/initials'
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
  required,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  hint?: ReactNode
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
  const studentsQuery = useStudentsQuery({ status: 'active' })
  const studentOptions = useMemo(
    () => studentsQuery.data?.data ?? [],
    [studentsQuery.data?.data],
  )

  const selectedMembers = useMemo(
    () =>
      studentOptions.filter((option) => values.memberIds.includes(option.id)),
    [studentOptions, values.memberIds],
  )

  const visibleOptions = useMemo(() => {
    const query = memberSearch.trim().toLowerCase()
    if (!query) {
      return studentOptions
    }

    return studentOptions.filter((option) =>
      `${option.fullName} ${option.pin} ${option.branch}`
        .toLowerCase()
        .includes(query),
    )
  }, [memberSearch, studentOptions])

  function toggleMember(id: string) {
    if (values.memberIds.includes(id)) {
      onChange(
        'memberIds',
        values.memberIds.filter((value) => value !== id),
      )
      return
    }

    onChange('memberIds', [...values.memberIds, id])
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  const memberCount = values.memberIds.length
  const isActive = values.status === 'active'
  const previewName = values.groupName.trim() || 'Group name'

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <FormSectionCard
            icon={Users}
            title="Group"
            description="A short name your team will recognise on the schedule."
          >
            <Field
              label="Group name"
              htmlFor="groupName"
              error={errors.groupName}
              required
            >
              <Input
                id="groupName"
                value={values.groupName}
                onChange={(event) => onChange('groupName', event.target.value)}
                placeholder="SAT Intensive A"
              />
            </Field>
          </FormSectionCard>

          <FormSectionCard
            icon={Check}
            title="Students"
            description="Tick every active student who belongs to this group."
            delayClassName="delay-75"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-medium text-slate-700">
                Selected <span className="text-rose-500">*</span>
              </p>
              <span
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums',
                  memberCount > 0
                    ? 'bg-brand-50 text-brand-700'
                    : 'bg-canvas text-slate-500',
                )}
              >
                {memberCount} selected
              </span>
            </div>

            {selectedMembers.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {selectedMembers.map((member) => (
                  <button
                    key={member.id}
                    type="button"
                    onClick={() => toggleMember(member.id)}
                    aria-label={`Remove ${member.fullName} from the group`}
                    title="Remove from group"
                    className="group inline-flex items-center gap-1.5 rounded-full bg-brand-50 py-1 pr-2 pl-1 text-xs font-semibold text-brand-800 transition hover:bg-rose-50 hover:text-rose-700"
                  >
                    <span className="inline-flex size-6 items-center justify-center rounded-full bg-white text-[10px] font-bold text-brand-700">
                      {initials(member.fullName)}
                    </span>
                    {member.fullName}
                    <X className="size-3 opacity-60 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="rounded-2xl bg-canvas px-4 py-3 text-xs text-slate-500">
                No students picked yet. Use the list below to add at least one.
              </p>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="memberSearch" className="sr-only">
                Find students
              </Label>
              <div className="overflow-hidden rounded-3xl bg-canvas">
                <div className="relative p-2">
                  <Search className="pointer-events-none absolute top-1/2 left-6 size-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="memberSearch"
                    value={memberSearch}
                    onChange={(event) => setMemberSearch(event.target.value)}
                    placeholder="Search by name, PIN, or branch..."
                    className="h-10 rounded-full bg-white pl-10"
                  />
                </div>

                <div className="max-h-80 space-y-1 overflow-y-auto px-2 pb-2">
                  {studentsQuery.isLoading ? (
                    <div className="space-y-1" aria-busy="true">
                      {Array.from({ length: 4 }).map((_, index) => (
                        <div
                          key={index}
                          className="h-14 animate-pulse rounded-2xl bg-white/70"
                        />
                      ))}
                    </div>
                  ) : visibleOptions.length === 0 ? (
                    <p className="px-3 py-8 text-center text-sm text-slate-500">
                      {memberSearch.trim()
                        ? 'No students match your search.'
                        : 'There are no active students to choose from.'}
                    </p>
                  ) : (
                    visibleOptions.map((option) => {
                      const selected = values.memberIds.includes(option.id)

                      return (
                        <label
                          key={option.id}
                          className={cn(
                            'flex cursor-pointer items-center gap-3 rounded-2xl px-3 py-2.5 transition focus-within:ring-2 focus-within:ring-brand-500/35',
                            selected
                              ? 'bg-white shadow-sm ring-1 ring-brand-200'
                              : 'hover:bg-white/70',
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={selected}
                            onChange={() => toggleMember(option.id)}
                            className="sr-only"
                          />
                          <span
                            aria-hidden
                            className={cn(
                              'inline-flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold transition',
                              selected
                                ? 'bg-brand-500 text-white'
                                : 'bg-white text-brand-700',
                            )}
                          >
                            {selected ? (
                              <Check className="size-4" />
                            ) : (
                              initials(option.fullName)
                            )}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-semibold text-slate-900">
                              {option.fullName}
                            </span>
                            <span className="block truncate text-xs text-slate-500">
                              <span className="font-mono">{option.pin}</span>
                              {option.branch ? ` · ${option.branch}` : ''}
                            </span>
                          </span>
                          {selected ? (
                            <span className="hidden rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-700 sm:inline-flex">
                              In group
                            </span>
                          ) : null}
                        </label>
                      )
                    })
                  )}
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Only active students are listed.
              </p>
              <FieldError message={errors.memberIds} />
            </div>
          </FormSectionCard>
        </div>

        <div className="space-y-3 lg:sticky lg:top-4">
          <FormSectionCard
            icon={Eye}
            title="At a glance"
            description="Updates as you make changes."
            delayClassName="delay-75"
          >
            <div className="rounded-3xl bg-canvas p-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-500 text-white">
                  <Users className="size-5" strokeWidth={1.9} />
                </span>
                <div className="min-w-0">
                  <p
                    className={cn(
                      'truncate text-sm font-bold',
                      values.groupName.trim() ? 'text-ink' : 'text-slate-400',
                    )}
                  >
                    {previewName}
                  </p>
                  <p className="text-xs text-slate-500">
                    {memberCount} {memberCount === 1 ? 'student' : 'students'}
                  </p>
                </div>
              </div>
              {selectedMembers.length > 0 ? (
                <div className="mt-3 flex -space-x-2">
                  {selectedMembers.slice(0, 6).map((member) => (
                    <span
                      key={member.id}
                      title={member.fullName}
                      className="inline-flex size-8 items-center justify-center rounded-full bg-brand-100 text-[10px] font-bold text-brand-700 ring-2 ring-canvas"
                    >
                      {initials(member.fullName)}
                    </span>
                  ))}
                  {selectedMembers.length > 6 ? (
                    <span className="inline-flex size-8 items-center justify-center rounded-full bg-white text-[10px] font-bold text-slate-600 ring-2 ring-canvas">
                      +{selectedMembers.length - 6}
                    </span>
                  ) : null}
                </div>
              ) : null}
              <span
                className={cn(
                  'mt-3 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                  isActive ? 'bg-white text-brand-700' : 'bg-white text-slate-500',
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    'size-1.5 rounded-full',
                    isActive ? 'bg-brand-500' : 'bg-slate-400',
                  )}
                />
                {isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </FormSectionCard>

          <FormSectionCard
            icon={Power}
            title="Availability"
            description={
              isActive
                ? 'Group is available for scheduling.'
                : 'Group is inactive and hidden from active lists.'
            }
            delayClassName="delay-100"
          >
            <StatusToggle
              id="student-group-status"
              label=""
              value={isActive}
              onChange={(next) =>
                onChange('status', next ? 'active' : 'inactive')
              }
              error={errors.status}
            />
          </FormSectionCard>

          {mode === 'edit' && meta ? (
            <FormSectionCard
              icon={Clock3}
              title="Record Info"
              description="System details for this group."
              delayClassName="delay-100"
            >
              <dl className="grid gap-2">
                {[
                  { label: 'Branch', value: meta.branch },
                  { label: 'Date created', value: formatDateTime(meta.createdAt) },
                  { label: 'Date updated', value: formatDateTime(meta.updatedAt) },
                  { label: 'Created by', value: meta.createdBy },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl bg-canvas px-3.5 py-2.5"
                  >
                    <dt className="text-xs text-slate-500">{item.label}</dt>
                    <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                      {item.value || '-'}
                    </dd>
                  </div>
                ))}
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
        deleteLabel="Delete group"
        submitLabel={mode === 'create' ? 'Create group' : undefined}
        hint="A group needs a name and at least one student."
      />
    </form>
  )
}
