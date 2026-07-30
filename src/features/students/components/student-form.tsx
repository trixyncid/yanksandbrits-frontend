import { parseISO } from 'date-fns'
import type { FormEvent, ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import {
  useInstitutionOptionsQuery,
  useOccupationOptionsQuery,
} from '../../lookups/hooks/use-lookup-options'
import { useCounsellorOptionsQuery } from '../../users/hooks/use-user-options'
import type {
  StudentFormErrors,
  StudentFormValues,
} from '../types/student'

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
  const branchesQuery = useBranchesQuery()
  const occupationsQuery = useOccupationOptionsQuery()
  const institutionsQuery = useInstitutionOptionsQuery()
  const counsellorsQuery = useCounsellorOptionsQuery()

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
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
            hint="Counsellor helps generate the student PIN."
          >
            <Select
              id="counsellorId"
              containerClassName="w-full sm:w-full"
              value={values.counsellorId}
              onChange={(event) => onChange('counsellorId', event.target.value)}
            >
              <option value="">Select counsellor</option>
              {(counsellorsQuery.data ?? []).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.pin} | {option.fullName}
                </option>
              ))}
            </Select>
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

          <Field label="Guest Number (GRN)" htmlFor="grn" error={errors.grn}>
            <Input
              id="grn"
              value={values.grn}
              onChange={(event) => onChange('grn', event.target.value)}
              placeholder="GRN-1001"
            />
          </Field>

          <Field
            label="Student PIN"
            htmlFor="pin"
            error={errors.pin}
            hint="PIN must be unique within the selected branch."
          >
            <Input
              id="pin"
              value={values.pin}
              onChange={(event) => onChange('pin', event.target.value)}
              placeholder="STU-1001"
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
              className="h-12 w-full min-w-0 justify-start rounded-xl border-slate-200 bg-[#F4F6FA] px-4 font-medium"
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
            label="Phone (Home)"
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
            Education Information
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Occupation and school or workplace context.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field
            label="Occupation"
            htmlFor="occupationId"
            error={errors.occupationId}
          >
            <Select
              id="occupationId"
              containerClassName="w-full sm:w-full"
              value={values.occupationId}
              onChange={(event) => onChange('occupationId', event.target.value)}
            >
              <option value="">Select occupation</option>
              {(occupationsQuery.data ?? []).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field
            label="Institution"
            htmlFor="institutionId"
            error={errors.institutionId}
          >
            <Select
              id="institutionId"
              containerClassName="w-full sm:w-full"
              value={values.institutionId}
              onChange={(event) =>
                onChange('institutionId', event.target.value)
              }
            >
              <option value="">Select institution</option>
              {(institutionsQuery.data ?? []).map((option) => (
                <option key={option.id} value={option.id}>
                  {option.name}
                </option>
              ))}
            </Select>
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
              className="h-12 w-full min-w-0 justify-start rounded-xl border-slate-200 bg-[#F4F6FA] px-4 font-medium"
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

          <Field label="Active Status" htmlFor="status" error={errors.status}>
            <Select
              id="status"
              containerClassName="w-full sm:w-full"
              value={values.status}
              onChange={(event) =>
                onChange(
                  'status',
                  event.target.value as StudentFormValues['status'],
                )
              }
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </Select>
          </Field>
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
  )
}
