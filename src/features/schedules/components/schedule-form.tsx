import { parseISO } from 'date-fns'
import { useQuery } from '@tanstack/react-query'
import { CalendarPlus, Pencil, Trash2 } from 'lucide-react'
import { useMemo, type FormEvent, type ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import { DialogFooter } from '../../../shared/components/ui/dialog'
import { Label } from '../../../shared/components/ui/label'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { cn } from '../../../shared/lib/cn'
import { useClassroomsQuery } from '../../classrooms/hooks/use-classrooms-query'
import { fetchProgram } from '../../programs/api/programs-api'
import { programQueryKeys } from '../../programs/api/program-query-keys'
import { useFilteredProgramsQuery } from '../../programs/hooks/use-filtered-programs-query'
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

  const selectedStudentId =
    values.participantType === 'student' ? values.studentId : undefined
  const selectedGroupId =
    values.participantType === 'group' ? values.studentGroupId : undefined
  const hasParticipant = Boolean(selectedStudentId || selectedGroupId)

  const filteredProgramsQuery = useFilteredProgramsQuery({
    studentId: selectedStudentId,
    studentGroupId: selectedGroupId,
  })

  const filteredPrograms = filteredProgramsQuery.data ?? []
  const selectedProgramMissing =
    Boolean(values.programId) &&
    filteredProgramsQuery.isSuccess &&
    !filteredPrograms.some((program) => program.id === values.programId)

  const currentProgramQuery = useQuery({
    queryKey: programQueryKeys.detail(values.programId),
    queryFn: () => fetchProgram(values.programId),
    enabled: selectedProgramMissing,
  })

  const programOptions = useMemo(() => {
    const options = filteredPrograms.map((program) => ({
      value: program.id,
      label: program.code ? `${program.code} · ${program.title}` : program.title,
      keywords: `${program.code} ${program.title}`,
    }))

    if (
      selectedProgramMissing &&
      currentProgramQuery.data &&
      currentProgramQuery.data.id === values.programId
    ) {
      const program = currentProgramQuery.data
      options.unshift({
        value: program.id,
        label: program.code
          ? `${program.code} · ${program.title}`
          : program.title,
        keywords: `${program.code} ${program.title}`,
      })
    }

    return options
  }, [
    currentProgramQuery.data,
    filteredPrograms,
    selectedProgramMissing,
    values.programId,
  ])

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

  const programHint = !hasParticipant
    ? values.participantType === 'student'
      ? 'Select a student first to see their enrolled programs.'
      : 'Select a student group first to see shared enrolled programs.'
    : filteredProgramsQuery.isFetched && programOptions.length === 0
      ? values.participantType === 'student'
        ? 'This student has no open program enrollments.'
        : 'This group has no programs shared by every participant.'
      : undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={handleSubmit}
      noValidate
    >
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
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

          <Field
            label="Status"
            htmlFor="schedule-status"
            error={errors.status}
          >
            <div
              id="schedule-status"
              role="radiogroup"
              aria-label="Session status"
              className="grid grid-cols-3 gap-2"
            >
              {SCHEDULE_STATUS_OPTIONS.map((option) => {
                const selected = values.status === option.value
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    disabled={isSubmitting}
                    onClick={() => onChange('status', option.value)}
                    className={cn(
                      'h-12 rounded-full border text-sm font-semibold transition',
                      selected
                        ? 'border-[#253CA1] bg-[#E8EEFF] text-[#253CA1] shadow-sm shadow-[#253CA1]/15'
                        : 'border-slate-200/80 bg-white text-slate-600 shadow-sm hover:border-slate-300',
                      'disabled:cursor-not-allowed disabled:opacity-60',
                    )}
                  >
                    {option.label}
                  </button>
                )
              })}
            </div>
          </Field>
        </div>

        <div className="space-y-2">
          <Label>Participant</Label>
          <div className="grid gap-3 sm:grid-cols-2">
            <label
              className={cn(
                'flex h-12 cursor-pointer items-center gap-3 rounded-full border px-4 text-sm shadow-sm transition',
                values.participantType === 'student'
                  ? 'border-[#253CA1] bg-[#E8EEFF] text-[#253CA1] shadow-[#253CA1]/10'
                  : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300',
              )}
            >
              <input
                type="radio"
                name="participantType"
                className="size-4 border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40"
                checked={values.participantType === 'student'}
                onChange={() => onChange('participantType', 'student')}
              />
              <span className="font-medium">Individual student</span>
            </label>
            <label
              className={cn(
                'flex h-12 cursor-pointer items-center gap-3 rounded-full border px-4 text-sm shadow-sm transition',
                values.participantType === 'group'
                  ? 'border-[#253CA1] bg-[#E8EEFF] text-[#253CA1] shadow-[#253CA1]/10'
                  : 'border-slate-200/80 bg-white text-slate-600 hover:border-slate-300',
              )}
            >
              <input
                type="radio"
                name="participantType"
                className="size-4 border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40"
                checked={values.participantType === 'group'}
                onChange={() => onChange('participantType', 'group')}
              />
              <span className="font-medium">Student group</span>
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

        <Field
          label="Program"
          htmlFor="programId"
          error={errors.programId}
          hint={programHint}
        >
          <SearchableSelect
            id="programId"
            value={values.programId}
            options={programOptions}
            onChange={(next) => onChange('programId', next)}
            placeholder={
              !hasParticipant
                ? values.participantType === 'student'
                  ? 'Select a student first'
                  : 'Select a group first'
                : 'Select program'
            }
            searchPlaceholder="Search enrolled programs..."
            disabled={!hasParticipant || filteredProgramsQuery.isLoading}
            emptyMessage={
              values.participantType === 'student'
                ? 'No open enrollments for this student'
                : 'No shared open enrollments for this group'
            }
          />
        </Field>

        <div className="grid items-start gap-4 sm:grid-cols-3">
          <Field label="Date" htmlFor="date" error={errors.date}>
            <DatePicker
              value={parseDateValue(values.date)}
              onChange={(date) => onChange('date', toDateString(date))}
              placeholder="Pick date"
              title="Session date"
              className="h-11 w-full min-w-0 justify-start rounded-full border-slate-200/80 bg-white px-4 font-medium shadow-sm"
              align="start"
            />
          </Field>

          <Field label="Start Time" htmlFor="startTime" error={errors.startTime}>
            <Select
              id="startTime"
              containerClassName="w-full sm:w-full"
              className="h-11"
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

          <Field label="End Time" htmlFor="endTime" error={errors.endTime}>
            <Select
              id="endTime"
              containerClassName="w-full sm:w-full"
              className="h-11"
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
      </div>

      <DialogFooter className="mt-0 shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4 sm:justify-between">
        {mode === 'edit' && onDelete ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
            onClick={onDelete}
            disabled={isSubmitting}
          >
            <Trash2 className="size-3.5" />
            Delete
          </Button>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={isSubmitting}
            className="border-transparent bg-[#253CA1] bg-none text-white shadow-lg shadow-[#253CA1]/20 hover:bg-[#1f3190] hover:brightness-100"
          >
            {mode === 'create' ? (
              <CalendarPlus className="size-3.5" />
            ) : (
              <Pencil className="size-3.5" />
            )}
            {isSubmitting
              ? mode === 'create'
                ? 'Saving...'
                : 'Updating...'
              : mode === 'create'
                ? 'Create Session'
                : 'Update Session'}
          </Button>
        </div>
      </DialogFooter>
    </form>
  )
}
