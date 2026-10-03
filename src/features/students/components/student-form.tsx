import { useQueryClient } from '@tanstack/react-query'
import { parseISO } from 'date-fns'
import { Plus } from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { StatusToggle } from '../../../shared/components/ui/status-toggle'
import { Textarea } from '../../../shared/components/ui/textarea'
import { notify } from '../../../shared/lib/notify'
import { toTitleCase } from '../../../shared/lib/to-title-case'
import { Can } from '../../auth/components/can'
import {
  useAuthUser,
  useIsRestrictedMarketing,
} from '../../auth/hooks/use-permissions'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import {
  createInstitution,
  createOccupation,
} from '../../lookups/api/lookups-api'
import {
  useInstitutionOptionsQuery,
  useOccupationOptionsQuery,
} from '../../lookups/hooks/use-lookup-options'
import { useMarketingOptionsQuery } from '../../users/hooks/use-user-options'
import type {
  StudentFormErrors,
  StudentFormValues,
} from '../types/student'

type QuickAddKind = 'occupation' | 'institution'

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

type StudentFormProps = {
  mode: 'create' | 'edit'
  values: StudentFormValues
  errors: StudentFormErrors
  isSubmitting: boolean
  onChange: <K extends keyof StudentFormValues>(
    field: K,
    value: StudentFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
}

export function StudentForm({
  mode,
  values,
  errors,
  isSubmitting,
  onChange,
  onSubmit,
  onCancel,
}: StudentFormProps) {
  const queryClient = useQueryClient()
  const branchesQuery = useBranchesQuery()
  const occupationsQuery = useOccupationOptionsQuery()
  const institutionsQuery = useInstitutionOptionsQuery()
  const counsellorsQuery = useMarketingOptionsQuery()
  const [quickAddKind, setQuickAddKind] = useState<QuickAddKind | null>(null)
  const [quickAddName, setQuickAddName] = useState('')
  const [isQuickAdding, setIsQuickAdding] = useState(false)
  const counsellorOptions = useMemo(
    () =>
      (counsellorsQuery.data ?? []).map((option) => ({
        value: option.id,
        label: `${option.pin} | ${option.fullName}`,
        keywords: `${option.pin} ${option.fullName} ${option.email}`,
      })),
    [counsellorsQuery.data],
  )
  const occupationOptions = useMemo(
    () =>
      (occupationsQuery.data ?? []).map((option) => ({
        value: option.id,
        label: option.name,
      })),
    [occupationsQuery.data],
  )
  const institutionOptions = useMemo(
    () =>
      (institutionsQuery.data ?? []).map((option) => ({
        value: option.id,
        label: option.name,
      })),
    [institutionsQuery.data],
  )
  const authUser = useAuthUser()
  const isRestrictedMarketing = useIsRestrictedMarketing()
  const lockCounsellor = isRestrictedMarketing
  const lockIdentityFields = mode === 'edit' && isRestrictedMarketing

  // Marketing counsellors are always attributed to themselves on create.
  useEffect(() => {
    if (!lockCounsellor || mode !== 'create' || !authUser?.id) {
      return
    }
    const selfId = String(authUser.id)
    if (values.counsellorId === selfId) {
      return
    }
    onChange('counsellorId', selfId)
    // Intentionally omit onChange: parent passes a fresh function each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- sync self attribution once
  }, [authUser?.id, lockCounsellor, mode, values.counsellorId])

  function openQuickAdd(kind: QuickAddKind) {
    setQuickAddKind(kind)
    setQuickAddName('')
  }

  function closeQuickAdd() {
    if (isQuickAdding) {
      return
    }
    setQuickAddKind(null)
    setQuickAddName('')
  }

  async function handleQuickAdd(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!quickAddKind) {
      return
    }

    const name = toTitleCase(quickAddName)
    if (!name) {
      notify('error', {
        title:
          quickAddKind === 'occupation'
            ? 'Occupation name required'
            : 'Institution name required',
        description: 'Please enter a name before adding.',
      })
      return
    }

    setIsQuickAdding(true)
    try {
      if (quickAddKind === 'occupation') {
        const created = await createOccupation({ name })
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['lookups', 'occupations'] }),
          queryClient.invalidateQueries({ queryKey: ['occupations', 'list'] }),
        ])
        onChange('occupationId', created.id)
        notify('success', {
          title: 'Occupation added',
          description: `${created.name} is ready to use.`,
        })
      } else {
        const created = await createInstitution({
          name,
          address: '',
          phone: '',
        })
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['lookups', 'institutions'],
          }),
          queryClient.invalidateQueries({ queryKey: ['institutions', 'list'] }),
        ])
        onChange('institutionId', created.id)
        notify('success', {
          title: 'Institution added',
          description: `${created.name} is ready to use.`,
        })
      }
      setQuickAddKind(null)
      setQuickAddName('')
    } catch (error) {
      notify('error', {
        title:
          quickAddKind === 'occupation'
            ? 'Unable to add occupation'
            : 'Unable to add institution',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsQuickAdding(false)
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <>
    <form className="space-y-8" onSubmit={handleSubmit} noValidate>
      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Personal Information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Core identity details used across schedules and reports.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Education Counsellor"
            htmlFor="counsellorId"
            error={errors.counsellorId}
            hint={
              lockCounsellor
                ? mode === 'create'
                  ? 'Assigned to you as the enrolling counsellor.'
                  : 'Marketing cannot change the education counsellor.'
                : 'Counsellor helps generate the student PIN.'
            }
          >
            <SearchableSelect
              id="counsellorId"
              value={values.counsellorId}
              options={counsellorOptions}
              onChange={(next) => onChange('counsellorId', next)}
              placeholder="Select counsellor"
              searchPlaceholder="Search counsellors..."
              emptyMessage="No marketing staff found"
              disabled={lockCounsellor || counsellorsQuery.isLoading}
            />
          </Field>

          <Field
            label="Referral"
            htmlFor="referralMarketing"
            error={errors.referralMarketing}
          >
            <Input
              id="referralMarketing"
              value={values.referralMarketing}
              onChange={(event) =>
                onChange('referralMarketing', event.target.value)
              }
              placeholder="Optional referral name"
            />
          </Field>

          <Field
            label="Guest Number (GRN)"
            htmlFor="grn"
            error={errors.grn}
            hint={
              lockIdentityFields
                ? 'Marketing cannot change the guest number.'
                : undefined
            }
          >
            <Input
              id="grn"
              value={values.grn}
              onChange={(event) => onChange('grn', event.target.value)}
              placeholder="GRN-1001"
              disabled={lockIdentityFields}
            />
          </Field>

          <Field
            label="Student PIN"
            htmlFor="pin"
            error={errors.pin}
            hint={
              lockIdentityFields
                ? 'Marketing cannot change the student PIN.'
                : 'PIN must be unique within the selected branch.'
            }
          >
            <Input
              id="pin"
              value={values.pin}
              onChange={(event) => onChange('pin', event.target.value)}
              placeholder="STU-1001"
              disabled={lockIdentityFields}
            />
          </Field>

          <Field label="Full Name" htmlFor="fullName" error={errors.fullName}>
            <Input
              id="fullName"
              value={values.fullName}
              onChange={(event) => onChange('fullName', event.target.value)}
              placeholder="Student full name"
            />
          </Field>

          <Field label="Email Address" htmlFor="email" error={errors.email}>
            <Input
              id="email"
              type="email"
              value={values.email}
              onChange={(event) => onChange('email', event.target.value)}
              placeholder="student@email.com"
            />
          </Field>

          <Field label="Gender" htmlFor="gender" error={errors.gender}>
            <Select
              id="gender"
              containerClassName="w-full sm:w-full"
              value={values.gender}
              onChange={(event) =>
                onChange('gender', event.target.value as 'M' | 'F')
              }
            >
              <option value="M">Male</option>
              <option value="F">Female</option>
            </Select>
          </Field>

          <Field
            label="Place of Birth"
            htmlFor="birthPlace"
            error={errors.birthPlace}
          >
            <Input
              id="birthPlace"
              value={values.birthPlace}
              onChange={(event) => onChange('birthPlace', event.target.value)}
              placeholder="Jakarta"
            />
          </Field>

          <Field
            label="Date of Birth"
            htmlFor="birthDate"
            error={errors.birthDate}
          >
            <DatePicker
              value={parseDateValue(values.birthDate)}
              onChange={(date) => onChange('birthDate', toDateString(date))}
              placeholder="Pick birth date"
              title="Birth date"
              captionLayout="dropdown"
              className="h-12 w-full min-w-0 justify-start rounded-full border-slate-200/80 bg-white px-4 font-medium shadow-sm"
              align="start"
            />
          </Field>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Contact Information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            How staff can reach the student and family.
          </p>
        </div>

        <Field label="Home Address" htmlFor="address" error={errors.address}>
          <Textarea
            id="address"
            value={values.address}
            onChange={(event) => onChange('address', event.target.value)}
            placeholder="Street, city, postal code"
          />
        </Field>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Phone (Mobile)"
            htmlFor="mobilePhone"
            error={errors.mobilePhone}
          >
            <Input
              id="mobilePhone"
              value={values.mobilePhone}
              onChange={(event) => onChange('mobilePhone', event.target.value)}
              placeholder="0812-3456-7890"
            />
          </Field>
          <Field
            label="Phone (Parents)"
            htmlFor="homePhone"
            error={errors.homePhone}
          >
            <Input
              id="homePhone"
              value={values.homePhone}
              onChange={(event) => onChange('homePhone', event.target.value)}
              placeholder="021-555-0101"
            />
          </Field>
          <Field
            label="Phone (Others)"
            htmlFor="othersPhone"
            error={errors.othersPhone}
          >
            <Input
              id="othersPhone"
              value={values.othersPhone}
              onChange={(event) => onChange('othersPhone', event.target.value)}
              placeholder="Optional"
            />
          </Field>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Current Education & Work
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Student's current occupation and institution at the time of
            enrollment.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Current Occupation"
            htmlFor="occupationId"
            error={errors.occupationId}
          >
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <SearchableSelect
                  id="occupationId"
                  value={values.occupationId}
                  options={occupationOptions}
                  onChange={(next) => onChange('occupationId', next)}
                  placeholder="Select occupation"
                  searchPlaceholder="Search occupations..."
                  emptyMessage="No occupations found"
                  disabled={occupationsQuery.isLoading}
                />
              </div>
              <Can module="occupations" action="add">
                <Button
                  type="button"
                  variant="secondary"
                  aria-label="Quick add occupation"
                  title="Quick add occupation"
                  className="size-12 shrink-0 px-0"
                  onClick={() => openQuickAdd('occupation')}
                  disabled={occupationsQuery.isLoading || isSubmitting}
                >
                  <Plus className="size-4" />
                </Button>
              </Can>
            </div>
          </Field>
          <Field
            label="Current Institution"
            htmlFor="institutionId"
            error={errors.institutionId}
          >
            <div className="flex items-center gap-2">
              <div className="min-w-0 flex-1">
                <SearchableSelect
                  id="institutionId"
                  value={values.institutionId}
                  options={institutionOptions}
                  onChange={(next) => onChange('institutionId', next)}
                  placeholder="Select institution"
                  searchPlaceholder="Search institutions..."
                  emptyMessage="No institutions found"
                  disabled={institutionsQuery.isLoading}
                  clearable
                />
              </div>
              <Can module="institutions" action="add">
                <Button
                  type="button"
                  variant="secondary"
                  aria-label="Quick add institution"
                  title="Quick add institution"
                  className="size-12 shrink-0 px-0"
                  onClick={() => openQuickAdd('institution')}
                  disabled={institutionsQuery.isLoading || isSubmitting}
                >
                  <Plus className="size-4" />
                </Button>
              </Can>
            </div>
          </Field>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Post-Program Destination
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Student goals after completing the program, including target
            country, university, and major.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Country" htmlFor="country" error={errors.country}>
            <Input
              id="country"
              value={values.country}
              onChange={(event) => onChange('country', event.target.value)}
              placeholder="e.g. Indonesia"
            />
          </Field>
          <Field
            label="University"
            htmlFor="university"
            error={errors.university}
          >
            <Input
              id="university"
              value={values.university}
              onChange={(event) => onChange('university', event.target.value)}
              placeholder="e.g. Universitas Indonesia"
            />
          </Field>
          <Field label="Major" htmlFor="major" error={errors.major}>
            <Input
              id="major"
              value={values.major}
              onChange={(event) => onChange('major', event.target.value)}
              placeholder="e.g. Computer Science"
            />
          </Field>
        </div>
      </section>

      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

      <section className="space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Other Information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Branch assignment and enrollment status.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field
            label="Enrollment Date"
            htmlFor="enrollmentDate"
            error={errors.enrollmentDate}
          >
            <DatePicker
              value={parseDateValue(values.enrollmentDate)}
              onChange={(date) =>
                onChange('enrollmentDate', toDateString(date))
              }
              placeholder="Pick enrollment date"
              title="Enrollment date"
              className="h-12 w-full min-w-0 justify-start rounded-full border-slate-200/80 bg-white px-4 font-medium shadow-sm"
              align="start"
            />
          </Field>

          <Field label="Branch" htmlFor="branchId" error={errors.branchId}>
            <Select
              id="branchId"
              containerClassName="w-full sm:w-full"
              value={values.branchId}
              onChange={(event) => onChange('branchId', event.target.value)}
            >
              <option value="">Select branch</option>
              {(branchesQuery.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </Field>

          <StatusToggle
            id="student-status"
            value={values.status === 'active'}
            onChange={(next) =>
              onChange('status', next ? 'active' : 'inactive')
            }
            disabled={mode === 'create'}
            description={
              mode === 'create'
                ? 'Starts inactive. Becomes active after an approved payment installment.'
                : values.status === 'active'
                  ? 'Student can be scheduled and added to groups.'
                  : 'Inactive until an approved payment activates them (or you turn Active on).'
            }
            error={errors.status}
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-6">
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
              : 'Update Student'}
        </Button>
      </div>
    </form>

      <Dialog
        open={quickAddKind !== null}
        onOpenChange={(open) => {
          if (!open) {
            closeQuickAdd()
          }
        }}
      >
        <DialogContent
          showClose
          className="overflow-hidden p-0 sm:max-w-lg"
        >
          <form
            onSubmit={handleQuickAdd}
            className="flex max-h-[90vh] flex-col"
          >
            <div className="shrink-0 bg-[linear-gradient(135deg,#E8EEFF_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1] ring-1 ring-[#C8D4F5]">
                <Plus className="size-5" />
              </div>
              <DialogHeader className="pr-0">
                <DialogTitle>
                  {quickAddKind === 'occupation'
                    ? 'Quick Add Occupation'
                    : 'Quick Add Institution'}
                </DialogTitle>
                <DialogDescription>
                  {quickAddKind === 'occupation'
                    ? 'Add a new occupation and select it for this student.'
                    : 'Add a new institution and select it for this student.'}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-6 py-5">
              <Label htmlFor="quick-add-name">
                {quickAddKind === 'occupation'
                  ? 'Occupation Name'
                  : 'Institution Name'}
              </Label>
              <Input
                id="quick-add-name"
                value={quickAddName}
                onChange={(event) => setQuickAddName(event.target.value)}
                placeholder={
                  quickAddKind === 'occupation'
                    ? 'e.g. university student'
                    : 'e.g. universitas indonesia'
                }
                autoFocus
              />
              <p className="text-xs text-slate-400">
                Saved as Title Case
                {quickAddName.trim()
                  ? `: ${toTitleCase(quickAddName)}`
                  : '.'}
              </p>
            </div>

            <DialogFooter className="mt-0 shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={closeQuickAdd}
                disabled={isQuickAdding}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isQuickAdding}>
                <Plus className="size-3.5" />
                {isQuickAdding ? 'Adding...' : 'Add & Select'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
