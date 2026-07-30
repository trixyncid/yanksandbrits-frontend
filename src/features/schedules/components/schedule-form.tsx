import { parseISO } from 'date-fns'
import { useMemo, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { Label } from '../../../shared/components/ui/label'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { useClassroomsQuery } from '../../classrooms/hooks/use-classrooms-query'
import { useProgramsQuery } from '../../programs/hooks/use-programs-query'
import { useStudentGroupsQuery } from '../../student-groups/hooks/use-student-groups-query'
import { useStudentsQuery } from '../../students/hooks/use-students-query'
import { useTutorOptionsQuery } from '../../users/hooks/use-user-options'
import {
  SCHEDULE_STATUS_OPTIONS,
  type ScheduleFormErrors,
  type ScheduleFormValues,
} from '../types/schedule'

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

const TIME_OPTIONS = Array.from({ length: 14 * 2 }, (_, index) => {
  const hour = 8 + Math.floor(index / 2)
  const minute = index % 2 === 0 ? '00' : '30'
  const value = `${String(hour).padStart(2, '0')}:${minute}`
  return value
}).filter((value) => value <= '21:00')

type ScheduleFormProps = {
  mode: 'create' | 'edit'
  values: ScheduleFormValues
  errors: ScheduleFormErrors
  isSubmitting: boolean
  branchId?: string
  onChange: <K extends keyof ScheduleFormValues>(
    field: K,
    value: ScheduleFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function ScheduleForm({
  mode,
  values,
  errors,
  isSubmitting,
  branchId,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: ScheduleFormProps) {
  const programsQuery = useProgramsQuery({ isActive: 'active' })
  const classroomsQuery = useClassroomsQuery({
    branchId,
    isActive: 'active',
  })
  const tutorsQuery = useTutorOptionsQuery()
  const studentsQuery = useStudentsQuery({
    status: 'active',
    branchId,
  })
  const groupsQuery = useStudentGroupsQuery({ status: 'active' })

  const programOptions = useMemo(
    () =>
      (programsQuery.data?.data ?? []).map((program) => ({
        value: program.id,
        label: program.title,
      })),
    [programsQuery.data?.data],
  )

  const tutorOptions = useMemo(
    () =>
      (tutorsQuery.data ?? []).map((tutor) => ({
        value: tutor.id,
        label: `${tutor.pin} | ${tutor.fullName}`,
        keywords: `${tutor.pin} ${tutor.fullName} ${tutor.email}`,
      })),
    [tutorsQuery.data],
  )

  const studentOptions = useMemo(
    () =>
      (studentsQuery.data?.data ?? []).map((student) => ({
        value: student.id,
        label: `${student.pin} | ${student.fullName}`,
        keywords: `${student.pin} ${student.fullName} ${student.email}`,
      })),
    [studentsQuery.data?.data],
  )

  const groupOptions = useMemo(
    () =>
      (groupsQuery.data?.data ?? []).map((group) => ({
        value: group.id,
        label: group.groupName,
      })),
    [groupsQuery.data?.data],
  )

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit} noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="Classroom"
          htmlFor="classroomId"
          error={errors.classroomId}
        >
          <Select
            id="classroomId"
            containerClassName="w-full sm:w-full"
            value={values.classroomId}
            onChange={(event) => onChange('classroomId', event.target.value)}
          >
            <option value="">Select classroom</option>
            {(classroomsQuery.data?.data ?? []).map((classroom) => (
              <option key={classroom.id} value={classroom.id}>
                {classroom.className || classroom.code}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Program" htmlFor="programId" error={errors.programId}>
          <SearchableSelect
            id="programId"
            value={values.programId}
            options={programOptions}
            onChange={(next) => onChange('programId', next)}
            placeholder="Select program"
            searchPlaceholder="Search programs..."
            disabled={programsQuery.isLoading}
          />
        </Field>

        <Field label="Tutor" htmlFor="tutorId" error={errors.tutorId}>
          <SearchableSelect
            id="tutorId"
            value={values.tutorId}
            options={tutorOptions}
            onChange={(next) => onChange('tutorId', next)}
            placeholder="Optional tutor"
            searchPlaceholder="Search tutors..."
            disabled={tutorsQuery.isLoading}
            clearable
          />
        </Field>

        <Field label="Status" htmlFor="status" error={errors.status}>
          <Select
            id="status"
            containerClassName="w-full sm:w-full"
            value={values.status}
            onChange={(event) =>
              onChange(
                'status',
                event.target.value as ScheduleFormValues['status'],
              )
            }
          >
            {SCHEDULE_STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <div className="space-y-2">
        <Label>Participant</Label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-[#F4F6FA] px-4 text-sm text-slate-600">
            <input
              type="radio"
              name="participantType"
              className="size-4 border-slate-300 text-[#4274B9] focus:ring-[#4274B9]/40"
              checked={values.participantType === 'student'}
              onChange={() => onChange('participantType', 'student')}
            />
            <span>Individual student</span>
          </label>
          <label className="flex h-12 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-[#F4F6FA] px-4 text-sm text-slate-600">
            <input
              type="radio"
              name="participantType"
              className="size-4 border-slate-300 text-[#4274B9] focus:ring-[#4274B9]/40"
              checked={values.participantType === 'group'}
              onChange={() => onChange('participantType', 'group')}
            />
            <span>Student group</span>
          </label>
        </div>
      </div>

      {values.participantType === 'student' ? (
        <Field label="Student" htmlFor="studentId" error={errors.studentId}>
          <SearchableSelect
            id="studentId"
            value={values.studentId}
            options={studentOptions}
            onChange={(next) => onChange('studentId', next)}
            placeholder="Select student"
            searchPlaceholder="Search students..."
            disabled={studentsQuery.isLoading}
          />
        </Field>
      ) : (
        <Field
          label="Student group"
          htmlFor="studentGroupId"
          error={errors.studentGroupId}
        >
          <SearchableSelect
            id="studentGroupId"
            value={values.studentGroupId}
            options={groupOptions}
            onChange={(next) => onChange('studentGroupId', next)}
            placeholder="Select group"
            searchPlaceholder="Search groups..."
            disabled={groupsQuery.isLoading}
          />
        </Field>
      )}

      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Date" htmlFor="date" error={errors.date}>
          <DatePicker
            value={parseDateValue(values.date)}
            onChange={(date) => onChange('date', toDateString(date))}
            placeholder="Pick date"
            title="Session date"
            className="h-12 w-full min-w-0 justify-start rounded-xl border-slate-200 bg-[#F4F6FA] px-4 font-medium"
            align="start"
          />
        </Field>

        <Field label="Start" htmlFor="startTime" error={errors.startTime}>
          <Select
            id="startTime"
            containerClassName="w-full sm:w-full"
            value={values.startTime}
            onChange={(event) => onChange('startTime', event.target.value)}
          >
            {TIME_OPTIONS.includes(values.startTime) ? null : (
              <option value={values.startTime}>{values.startTime}</option>
            )}
            {TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="End" htmlFor="endTime" error={errors.endTime}>
          <Select
            id="endTime"
            containerClassName="w-full sm:w-full"
            value={values.endTime}
            onChange={(event) => onChange('endTime', event.target.value)}
          >
            {TIME_OPTIONS.includes(values.endTime) ? null : (
              <option value={values.endTime}>{values.endTime}</option>
            )}
            {TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field
        label="Description"
        htmlFor="description"
        error={errors.description}
      >
        <Textarea
          id="description"
          value={values.description}
          onChange={(event) => onChange('description', event.target.value)}
          placeholder="Optional notes for this session"
        />
      </Field>

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-5">
        {mode === 'edit' && onDelete ? (
          <Button
            type="button"
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={onDelete}
            disabled={isSubmitting}
          >
            Delete
          </Button>
        ) : (
          <span />
        )}
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
                ? 'Create Session'
                : 'Update Session'}
          </Button>
        </div>
      </div>
    </form>
  )
}
