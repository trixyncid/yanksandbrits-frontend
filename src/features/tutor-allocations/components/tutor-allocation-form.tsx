import { useQueryClient } from '@tanstack/react-query'
import { useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { CalendarDays, ClipboardCheck, Plus, Users } from 'lucide-react'

import {
  courseLabel,
  isGeneralEnglishCourse,
  isHskCourse,
  isIeltsCourse,
  isSatCourse,
  isToeflCourse,
  predictionTestStaffType,
} from '../../../shared/api/choices'
import { getApiErrorMessage } from '../../../shared/api/errors'
import {
  ChoiceTile,
  FormSectionCard,
} from '../../../shared/components/feature-page'
import { Button } from '../../../shared/components/ui/button'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { cn } from '../../../shared/lib/cn'
import { notify } from '../../../shared/lib/notify'
import { hasAuthRole } from '../../auth/types/auth'
import {
  useAuthUser,
  useIsAcademicLeader,
  useIsManager,
  useIsRestrictedMarketing,
  useModulePermissions,
} from '../../auth/hooks/use-permissions'
import { usePredictionTestsQuery } from '../../prediction-tests/hooks/use-prediction-tests-query'
import {
  SCHEDULE_DAYS,
  SESSIONS_PER_WEEK_OPTIONS,
  scheduleDayLabel,
  scheduleHasSlots,
  scheduleSlotLabel,
  sessionsPerWeekLabel,
  setScheduleSlot,
  slotsForDay,
  type ScheduleSlotCode,
} from '../../prediction-tests/lib/schedule'
import type { PredictionTestListItem } from '../../prediction-tests/types/prediction-test'
import {
  createStudentGroup,
  updateStudentGroup,
} from '../../student-groups/api/student-groups-api'
import { studentGroupQueryKeys } from '../../student-groups/api/student-group-query-keys'
import { useStudentsQuery } from '../../students/hooks/use-students-query'
import type { StudentListItem } from '../../students/types/student'
import { useTutorOptionsQuery } from '../../users/hooks/use-user-options'
import { skillSessionSlots } from '../lib/session-layout'
import {
  courseForProgram,
  TUTOR_ALLOCATION_PROGRAM_OPTIONS,
} from '../lib/programs'
import { seatCount } from '../schema/tutor-allocation-form-schema'
import type {
  TutorAllocationFormErrors,
  TutorAllocationFormValues,
  TutorAllocationListItem,
  TutorAllocationScore,
} from '../types/tutor-allocation'

type TutorAllocationFormProps = {
  mode: 'create' | 'edit'
  values: TutorAllocationFormValues
  errors: TutorAllocationFormErrors
  isSubmitting: boolean
  savedMembers?: TutorAllocationScore[]
  tutorNames?: Pick<
    TutorAllocationListItem,
    | 'listeningTutorName'
    | 'readingTutorName'
    | 'writingTutorName'
    | 'speakingTutorName'
    | 'mathTutorName'
    | 'generalEnglishUnit1TutorName'
    | 'generalEnglishUnit2TutorName'
    | 'generalEnglishGrammarTutorName'
  >
  onChange: <K extends keyof TutorAllocationFormValues>(
    field: K,
    value: TutorAllocationFormValues[K],
  ) => void
  approved?: boolean
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

type SeatScore = {
  course: string | null
  listening: string | null
  reading: string | null
  writing: string | null
  speaking: string | null
  math: string | null
  writtenTestScore: string | null
}

function scoreFromTest(test: PredictionTestListItem): SeatScore {
  return {
    course: test.studentCourse,
    listening: test.listening == null ? null : String(test.listening),
    reading: test.reading == null ? null : String(test.reading),
    writing: test.writing == null ? null : String(test.writing),
    speaking: test.speaking == null ? null : String(test.speaking),
    math: test.math == null ? null : String(test.math),
    writtenTestScore:
      test.writtenTestScore == null ? null : String(test.writtenTestScore),
  }
}

function scoreFromMember(member: TutorAllocationScore): SeatScore {
  return {
    course: member.course,
    listening: member.listening,
    reading: member.reading,
    writing: member.writing,
    speaking: member.speaking,
    math: member.math,
    writtenTestScore: member.writtenTestScore,
  }
}

function courseMatchesProgram(
  testCourse: string | null,
  programCourse: string | null,
) {
  if (!programCourse || !testCourse) return false
  if (programCourse === 'IEL') return isIeltsCourse(testCourse)
  if (programCourse === 'TOE') return isToeflCourse(testCourse)
  if (programCourse === 'HSK') return isHskCourse(testCourse)
  if (programCourse === 'GEN') return isGeneralEnglishCourse(testCourse)
  if (programCourse === 'SAT') return isSatCourse(testCourse)
  return testCourse === programCourse
}

function predictionTestFamilyLabel(programCourse: string | null) {
  if (programCourse === 'IEL') return 'IELTS'
  if (programCourse === 'TOE') return 'TOEFL'
  if (programCourse === 'HSK') return 'HSK'
  if (programCourse === 'GEN') return 'General English'
  if (programCourse === 'SAT') return 'SAT'
  return 'matching'
}

function enrolledStudentIdsForCourse(
  programCourse: string | null,
  enrolledStudents: StudentListItem[],
  tests: PredictionTestListItem[],
) {
  if (!programCourse) return new Set<string>()
  const matchingTests = tests.filter((test) =>
    courseMatchesProgram(test.studentCourse, programCourse),
  )
  const srNumbers = new Set(
    matchingTests
      .map((test) => test.studentSrNumber.trim())
      .filter(Boolean),
  )
  const prospectIds = new Set(
    matchingTests.map((test) => test.studentId).filter(Boolean),
  )
  return new Set(
    enrolledStudents
      .filter((student) => {
        const grn = student.grn.trim()
        if (grn && srNumbers.has(grn)) return true
        return (
          student.prospectiveStudentId != null &&
          prospectIds.has(student.prospectiveStudentId)
        )
      })
      .map((student) => student.id),
  )
}

function testBelongsToStudent(
  student: StudentListItem,
  test: PredictionTestListItem,
) {
  const grn = student.grn.trim()
  if (grn && test.studentSrNumber.trim() === grn) return true
  return (
    student.prospectiveStudentId != null &&
    test.studentId === student.prospectiveStudentId
  )
}

function latestTestForStudent(
  student: StudentListItem,
  tests: PredictionTestListItem[],
  programCourse: string | null,
) {
  if (!programCourse) return null
  return (
    tests
      .filter(
        (test) =>
          testBelongsToStudent(student, test) &&
          courseMatchesProgram(test.studentCourse, programCourse),
      )
      .sort((left, right) => {
        const byDate = right.createdAt.localeCompare(left.createdAt)
        if (byDate !== 0) return byDate
        return Number(right.id) - Number(left.id)
      })[0] ?? null
  )
}

function scoreLabels(course: string | null, score: SeatScore) {
  const show = (value: string | null) => (value == null || value === '' ? '—' : value)
  if (isGeneralEnglishCourse(course)) {
    return [{ label: 'Written test', value: show(score.writtenTestScore) }]
  }
  if (isSatCourse(course)) {
    return [
      { label: 'Reading and Writing', value: show(score.reading) },
      { label: 'Math', value: show(score.math) },
    ]
  }
  if (isToeflCourse(course)) {
    return [
      { label: 'Listening', value: show(score.listening) },
      { label: 'Reading', value: show(score.reading) },
      { label: 'Writing', value: show(score.writing) },
    ]
  }
  if (isIeltsCourse(course) || isHskCourse(course) || !course) {
    return [
      { label: 'Listening', value: show(score.listening) },
      { label: 'Reading', value: show(score.reading) },
      { label: 'Writing', value: show(score.writing) },
      { label: 'Speaking', value: show(score.speaking) },
    ]
  }
  return [
    { label: 'Listening', value: show(score.listening) },
    { label: 'Reading', value: show(score.reading) },
    { label: 'Writing', value: show(score.writing) },
    { label: 'Speaking', value: show(score.speaking) },
  ]
}

function FieldLabel({
  htmlFor,
  children,
}: {
  htmlFor: string
  children: string
}) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
      {children}
    </Label>
  )
}

export function TutorAllocationForm({
  mode,
  values,
  errors,
  isSubmitting,
  savedMembers = [],
  tutorNames,
  onChange,
  approved = false,
  onSubmit,
  onCancel,
  onDelete,
}: TutorAllocationFormProps) {
  const authUser = useAuthUser()
  const isManager = useIsManager()
  const isCounsellor = useIsRestrictedMarketing()
  const isAcademicLeader = useIsAcademicLeader()
  const isSystemAdmin =
    Boolean(authUser?.is_superuser) || hasAuthRole(authUser, 'systemadmin')
  const canEditSchedule = isSystemAdmin || isManager || isCounsellor
  const canEditSessions =
    canEditSchedule || (isAcademicLeader && mode === 'edit' && approved)
  const canEditTutors =
    isSystemAdmin || (isAcademicLeader && mode === 'edit' && approved)
  const canEditMembers = canEditSchedule || isSystemAdmin || isAcademicLeader
  const studentGroupPermissions = useModulePermissions('studentGroups')
  const canManageStudentGroups = !isAcademicLeader || isSystemAdmin || isManager
  const canSave =
    canEditMembers || canEditSchedule || canEditSessions || canEditTutors
  const seats = seatCount(values)
  const queryClient = useQueryClient()
  const [layoutError, setLayoutError] = useState('')
  const [groupName, setGroupName] = useState('')
  const [groupNameError, setGroupNameError] = useState('')
  const [savedGroupId, setSavedGroupId] = useState<string | null>(null)
  const [isSavingGroup, setIsSavingGroup] = useState(false)
  const canSaveStudentGroup =
    canManageStudentGroups &&
    (isCounsellor ||
      (savedGroupId
        ? studentGroupPermissions.canChange
        : studentGroupPermissions.canAdd))

  const studentsQuery = useStudentsQuery()
  const testsQuery = usePredictionTestsQuery()
  const students = useMemo(
    () => studentsQuery.data?.data ?? [],
    [studentsQuery.data],
  )
  const tests = useMemo(() => testsQuery.data?.data ?? [], [testsQuery.data])
  const selectedProgramCourse = courseForProgram(values.program)
  const eligibleStudentIds = useMemo(
    () => enrolledStudentIdsForCourse(selectedProgramCourse, students, tests),
    [selectedProgramCourse, students, tests],
  )

  const seatViews = useMemo(() => {
    return values.studentIds.slice(0, seats).map((studentId) => {
      const student = students.find((item) => item.id === studentId) ?? null
      const saved = savedMembers.find((member) => member.studentId === studentId)
      if (!studentId) {
        return { studentId, student, saved, score: null as SeatScore | null, found: false }
      }
      if (saved?.predictionTestId) {
        return { studentId, student, saved, score: scoreFromMember(saved), found: true }
      }
      if (student && !testsQuery.isSuccess) {
        return { studentId, student, saved, score: null, found: false }
      }
      const test = student
        ? latestTestForStudent(student, tests, selectedProgramCourse)
        : null
      return {
        studentId,
        student,
        saved,
        score: test ? scoreFromTest(test) : null,
        found: Boolean(test),
      }
    })
  }, [
    savedMembers,
    seats,
    selectedProgramCourse,
    students,
    tests,
    testsQuery.isSuccess,
    values.studentIds,
  ])

  const selectedSeats = seatViews.filter((seat) => seat.studentId)
  const scoresPending = selectedSeats.some(
    (seat) => seat.studentId && !seat.found && !testsQuery.isSuccess && !seat.saved?.predictionTestId,
  )
  const tutorStaffType = predictionTestStaffType(selectedProgramCourse)
  const tutorsQuery = useTutorOptionsQuery({
    staffType: tutorStaffType,
    enabled:
      canEditTutors &&
      Boolean(tutorStaffType) &&
      !isGeneralEnglishCourse(selectedProgramCourse),
  })
  const generalEnglishTutorsQuery = useTutorOptionsQuery({
    staffType: 'English',
    enabled: canEditTutors && isGeneralEnglishCourse(selectedProgramCourse),
  })
  const tutorOptions = useMemo(
    () =>
      (tutorsQuery.data ?? []).map((tutor) => ({
        value: tutor.id,
        label: `${tutor.pin} | ${tutor.fullName}`,
        keywords: `${tutor.pin} ${tutor.fullName} ${tutor.email}`,
      })),
    [tutorsQuery.data],
  )
  const generalEnglishTutorOptions = useMemo(
    () =>
      (generalEnglishTutorsQuery.data ?? []).map((tutor) => ({
        value: tutor.id,
        label: `${tutor.pin} | ${tutor.fullName}`,
        keywords: `${tutor.pin} ${tutor.fullName} ${tutor.email}`,
      })),
    [generalEnglishTutorsQuery.data],
  )

  const studentOptions = useMemo(
    () =>
      students
        .filter((student) => eligibleStudentIds.has(student.id))
        .map((student) => ({
          value: student.id,
          label: student.pin
            ? `${student.pin} | ${student.fullName}`
            : student.fullName,
          keywords: `${student.pin} ${student.fullName} ${student.mobilePhone}`,
        })),
    [eligibleStudentIds, students],
  )

  function optionsForSeat(index: number) {
    const taken = new Set(
      values.studentIds.filter((id, seatIndex) => seatIndex !== index && id),
    )
    return studentOptions.filter(
      (option) => !taken.has(option.value) || option.value === values.studentIds[index],
    )
  }

  function setProgram(nextProgram: TutorAllocationFormValues['program']) {
    onChange('program', nextProgram)
    const allowed = enrolledStudentIdsForCourse(
      courseForProgram(nextProgram),
      students,
      tests,
    )
    const nextIds: [string, string, string] = [
      values.studentIds[0] && allowed.has(values.studentIds[0])
        ? values.studentIds[0]
        : '',
      values.studentIds[1] && allowed.has(values.studentIds[1])
        ? values.studentIds[1]
        : '',
      values.studentIds[2] && allowed.has(values.studentIds[2])
        ? values.studentIds[2]
        : '',
    ]
    if (nextIds.some((id, index) => id !== values.studentIds[index])) {
      onChange('studentIds', nextIds)
    }
  }

  const groupMemberIds = values.studentIds.slice(0, seats).filter(Boolean)
  const groupMembersReady = groupMemberIds.length === seats

  async function saveStudentGroup() {
    const name = groupName.trim()
    if (name.length < 2) {
      setGroupNameError('Group name is required.')
      return
    }
    if (!groupMembersReady) {
      setGroupNameError('Select every student in this group first.')
      return
    }

    setGroupNameError('')
    setIsSavingGroup(true)
    try {
      const payload = {
        groupName: name,
        memberIds: groupMemberIds,
        status: 'active' as const,
      }
      const saved = savedGroupId
        ? await updateStudentGroup(savedGroupId, payload)
        : await createStudentGroup(payload)
      setSavedGroupId(saved.id)
      await queryClient.invalidateQueries({
        queryKey: studentGroupQueryKeys.all,
      })
      notify('success', {
        title: savedGroupId ? 'Student group updated' : 'Student group added',
        description: `${saved.groupName} is ready in Student Groups.`,
      })
    } catch (error) {
      notify('error', {
        title: savedGroupId
          ? 'Unable to update student group'
          : 'Unable to add student group',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSavingGroup(false)
    }
  }

  function setStudent(index: number, studentId: string) {
    const next: [string, string, string] = [
      values.studentIds[0],
      values.studentIds[1],
      values.studentIds[2],
    ]
    next[index] = studentId
    onChange('studentIds', next)
    setLayoutError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (selectedSeats.length === seats && !scoresPending) {
      if (selectedSeats.some((seat) => !seat.found)) {
        setLayoutError(
          'Every student needs a prediction test for this program, matched by guest number.',
        )
        return
      }
    }
    setLayoutError('')
    await onSubmit()
  }

  const slots = skillSessionSlots(selectedProgramCourse, values.program)
  const showGeneralEnglish = isGeneralEnglishCourse(selectedProgramCourse)

  return (
    <form className="space-y-4" onSubmit={(event) => void handleSubmit(event)}>
      <FormSectionCard
        icon={Users}
        title="Student Record"
        description="Private is one enrolled student. A group is two or three students who share one tutor assignment and one schedule. The student list is enrolled students who already have a prediction test for the selected program."
      >
        <div className="space-y-1.5">
          <FieldLabel htmlFor="program">Program</FieldLabel>
          <Select
            id="program"
            value={values.program}
            disabled={!canEditMembers}
            containerClassName="w-full sm:w-full"
            onChange={(event) =>
              setProgram(
                event.target.value as TutorAllocationFormValues['program'],
              )
            }
          >
            <option value="">Select a program...</option>
            {TUTOR_ALLOCATION_PROGRAM_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          {errors.program ? (
            <p className="text-xs text-rose-500">{errors.program}</p>
          ) : null}
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <div className={cn(!canEditMembers && 'pointer-events-none opacity-70')}>
            <ChoiceTile
              name="classType"
              title="Private"
              description="One student."
              selected={values.classType === 'private'}
              onSelect={() => onChange('classType', 'private')}
            />
          </div>
          <div className={cn(!canEditMembers && 'pointer-events-none opacity-70')}>
            <ChoiceTile
              name="classType"
              title="Group"
              description="Two or three students."
              selected={values.classType === 'group'}
              onSelect={() => onChange('classType', 'group')}
            />
          </div>
        </div>
        {values.classType === 'group' ? (
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            <div className={cn(!canEditMembers && 'pointer-events-none opacity-70')}>
              <ChoiceTile
                name="groupSize"
                title="2 people"
                selected={values.groupSize === '2'}
                onSelect={() => onChange('groupSize', '2')}
              />
            </div>
            <div className={cn(!canEditMembers && 'pointer-events-none opacity-70')}>
              <ChoiceTile
                name="groupSize"
                title="3 people"
                selected={values.groupSize === '3'}
                onSelect={() => onChange('groupSize', '3')}
              />
            </div>
          </div>
        ) : null}
        <div className="mt-4 space-y-4">
          {seatViews.map((seat, index) => (
            <div key={index} className="space-y-3">
              <FieldLabel htmlFor={`student-${index}`}>
                {seats === 1 ? 'Student' : `Student ${index + 1}`}
              </FieldLabel>
              <SearchableSelect
                id={`student-${index}`}
                value={seat.studentId}
                options={optionsForSeat(index)}
                onChange={(next) => setStudent(index, next)}
                placeholder={
                  values.program
                    ? 'Select enrolled student...'
                    : 'Select a program first'
                }
                searchPlaceholder="Search by name or PIN..."
                disabled={
                  !canEditMembers ||
                  !values.program ||
                  studentsQuery.isLoading ||
                  testsQuery.isLoading
                }
                clearable
                emptyMessage={
                  values.program
                    ? `No enrolled students with a ${predictionTestFamilyLabel(selectedProgramCourse)} prediction test`
                    : 'Select a program first'
                }
              />
              {seat.studentId ? (
                <StudentScorePanel
                  name={seat.student?.fullName ?? seat.saved?.studentName ?? 'Student'}
                  grn={seat.student?.grn ?? seat.saved?.grn ?? ''}
                  loading={Boolean(seat.studentId) && !seat.found && !testsQuery.isSuccess}
                  found={seat.found}
                  score={seat.score}
                />
              ) : null}
            </div>
          ))}
        </div>
        {values.classType === 'group' && canManageStudentGroups ? (
          <div className="mt-4 rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-3">
            <FieldLabel htmlFor="student-group-name">
              Student group name
            </FieldLabel>
            <div className="mt-1.5 flex flex-col gap-2 sm:flex-row sm:items-start">
              <div className="min-w-0 flex-1 space-y-1">
                <Input
                  id="student-group-name"
                  value={groupName}
                  onChange={(event) => {
                    setGroupName(event.target.value)
                    setGroupNameError('')
                  }}
                  placeholder="IELTS A morning"
                  disabled={!canEditMembers || isSavingGroup}
                />
                <p
                  className={
                    groupNameError
                      ? 'text-xs text-rose-500'
                      : 'text-xs text-slate-400'
                  }
                >
                  {groupNameError ||
                    (savedGroupId
                      ? 'Saved in Student Groups. Update it if the name or students change.'
                      : groupMembersReady
                        ? 'Adds this group with the students selected above.'
                        : `Select all ${seats} students before adding the group.`)}
                </p>
              </div>
              {canSaveStudentGroup ? (
                <Button
                  type="button"
                  variant="secondary"
                  className="shrink-0"
                  disabled={
                    !canEditMembers || isSavingGroup || !groupMembersReady
                  }
                  onClick={() => void saveStudentGroup()}
                >
                  <Plus className="size-4" />
                  {isSavingGroup
                    ? 'Saving...'
                    : savedGroupId
                      ? 'Update student group'
                      : 'Add student group'}
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        {errors.studentIds ? (
          <p className="mt-2 text-xs text-rose-500">{errors.studentIds}</p>
        ) : null}
        {layoutError ? (
          <p className="mt-2 text-xs text-rose-500">{layoutError}</p>
        ) : null}
      </FormSectionCard>

      {values.program ? (
        <FormSectionCard
          icon={ClipboardCheck}
          title="Tutor Allocation"
          description={
            canEditSessions && !canEditTutors
              ? 'Enter how many sessions each section needs. An academic leader assigns the tutor.'
              : showGeneralEnglish
                ? 'Unit names, how many sessions each needs, and which tutor will take it.'
                : `How many sessions each section needs, and which ${tutorStaffType?.toLowerCase() ?? ''} tutor will take it.`
          }
        >
          <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
            {TUTOR_ALLOCATION_PROGRAM_OPTIONS.find(
              (option) => option.value === values.program,
            )?.label ?? values.program}
          </p>
          {showGeneralEnglish ? (
            <AllocationTable sectionLabel="Unit">
              <AllocationRow
                label={
                  <CompactTextField
                    id="generalEnglishUnit1"
                    label="Unit"
                    value={values.generalEnglishUnit1}
                    readOnly={!canEditSessions}
                    onChange={(next) => onChange('generalEnglishUnit1', next)}
                  />
                }
                sessions={
                  <CompactCountField
                    id="generalEnglishUnit1Sessions"
                    value={values.generalEnglishUnit1Sessions}
                    error={errors.generalEnglishUnit1Sessions}
                    readOnly={!canEditSessions}
                    onChange={(next) =>
                      onChange('generalEnglishUnit1Sessions', next)
                    }
                  />
                }
                tutor={
                  <CompactTutorField
                    id="generalEnglishUnit1TutorId"
                    value={values.generalEnglishUnit1TutorId}
                    displayName={tutorNames?.generalEnglishUnit1TutorName ?? ''}
                    readOnly={!canEditTutors}
                    options={generalEnglishTutorOptions}
                    loading={generalEnglishTutorsQuery.isLoading}
                    emptyMessage="No English tutors found"
                    onChange={(next) =>
                      onChange('generalEnglishUnit1TutorId', next)
                    }
                  />
                }
              />
              <AllocationRow
                label={
                  <CompactTextField
                    id="generalEnglishUnit2"
                    label="Unit"
                    value={values.generalEnglishUnit2}
                    readOnly={!canEditSessions}
                    onChange={(next) => onChange('generalEnglishUnit2', next)}
                  />
                }
                sessions={
                  <CompactCountField
                    id="generalEnglishUnit2Sessions"
                    value={values.generalEnglishUnit2Sessions}
                    error={errors.generalEnglishUnit2Sessions}
                    readOnly={!canEditSessions}
                    onChange={(next) =>
                      onChange('generalEnglishUnit2Sessions', next)
                    }
                  />
                }
                tutor={
                  <CompactTutorField
                    id="generalEnglishUnit2TutorId"
                    value={values.generalEnglishUnit2TutorId}
                    displayName={tutorNames?.generalEnglishUnit2TutorName ?? ''}
                    readOnly={!canEditTutors}
                    options={generalEnglishTutorOptions}
                    loading={generalEnglishTutorsQuery.isLoading}
                    emptyMessage="No English tutors found"
                    onChange={(next) =>
                      onChange('generalEnglishUnit2TutorId', next)
                    }
                  />
                }
              />
              <AllocationRow
                label={
                  <p className="text-sm font-semibold text-slate-800">Grammar</p>
                }
                sessions={
                  <CompactCountField
                    id="generalEnglishGrammarSessions"
                    value={values.generalEnglishGrammarSessions}
                    error={errors.generalEnglishGrammarSessions}
                    readOnly={!canEditSessions}
                    onChange={(next) =>
                      onChange('generalEnglishGrammarSessions', next)
                    }
                  />
                }
                tutor={
                  <CompactTutorField
                    id="generalEnglishGrammarTutorId"
                    value={values.generalEnglishGrammarTutorId}
                    displayName={tutorNames?.generalEnglishGrammarTutorName ?? ''}
                    readOnly={!canEditTutors}
                    options={generalEnglishTutorOptions}
                    loading={generalEnglishTutorsQuery.isLoading}
                    emptyMessage="No English tutors found"
                    onChange={(next) =>
                      onChange('generalEnglishGrammarTutorId', next)
                    }
                  />
                }
              />
            </AllocationTable>
          ) : (
            <AllocationTable sectionLabel="Section">
              {slots.map((slot) => (
                <AllocationRow
                  key={slot.tutorKey}
                  label={
                    <p className="text-sm font-semibold text-slate-800">
                      {slot.label}
                    </p>
                  }
                  sessions={
                    <CompactCountField
                      id={slot.sessionsKey}
                      value={values[slot.sessionsKey]}
                      error={errors[slot.sessionsKey]}
                      readOnly={!canEditSessions}
                      onChange={(next) => onChange(slot.sessionsKey, next)}
                    />
                  }
                  tutor={
                    <CompactTutorField
                      id={slot.tutorKey}
                      value={values[slot.tutorKey]}
                      displayName={tutorNames?.[slot.tutorNameKey] ?? ''}
                      readOnly={!canEditTutors}
                      options={tutorOptions}
                      loading={!tutorStaffType || tutorsQuery.isLoading}
                      placeholder={
                        tutorStaffType
                          ? `Select ${tutorStaffType.toLowerCase()} tutor...`
                          : 'Select tutor...'
                      }
                      emptyMessage={
                        tutorStaffType
                          ? `No ${tutorStaffType.toLowerCase()} tutors found`
                          : 'Select students first'
                      }
                      onChange={(next) => onChange(slot.tutorKey, next)}
                    />
                  }
                />
              ))}
            </AllocationTable>
          )}
        </FormSectionCard>
      ) : null}

      <FormSectionCard
        icon={CalendarDays}
        title="Schedule & Note"
        description="When these sessions can run, and anything the tutor should know."
      >
        {canEditSchedule ? (
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-700">
                How many times per week do you want to have the course?
              </legend>
              <div className="grid gap-2 sm:grid-cols-4">
                {SESSIONS_PER_WEEK_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 text-sm',
                      values.sessionsPerWeek === option.value
                        ? 'border-[#253CA1] bg-[#F5F8FF] text-[#1B2A5A]'
                        : 'border-slate-200 bg-white text-slate-700',
                    )}
                  >
                    <input
                      type="radio"
                      name="sessionsPerWeek"
                      className="size-4 border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40"
                      checked={values.sessionsPerWeek === option.value}
                      onChange={() => onChange('sessionsPerWeek', option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {SCHEDULE_DAYS.map((day) => (
                <fieldset key={day} className="rounded-xl border border-slate-200 p-3">
                  <legend className="px-1 text-sm font-semibold text-slate-800">
                    {scheduleDayLabel(day)}
                  </legend>
                  <div className="mt-2 space-y-1.5">
                    {slotsForDay(day).map((slot) => {
                      const checked = values.availability[day].includes(slot.code)
                      return (
                        <label key={slot.code} className="flex items-center gap-2 text-sm text-slate-700">
                          <input
                            type="checkbox"
                            className="size-4 rounded border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40"
                            checked={checked}
                            onChange={(event) =>
                              onChange(
                                'availability',
                                setScheduleSlot(
                                  values.availability,
                                  day,
                                  slot.code as ScheduleSlotCode,
                                  event.target.checked,
                                ),
                              )
                            }
                          />
                          {slot.label}
                        </label>
                      )
                    })}
                  </div>
                </fieldset>
              ))}
            </div>
            <div className="space-y-1.5">
              <FieldLabel htmlFor="scheduleNote">Note</FieldLabel>
              <Textarea
                id="scheduleNote"
                value={values.scheduleNote}
                onChange={(event) => onChange('scheduleNote', event.target.value)}
                placeholder="Optional note for this class"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-700">
            <p>
              {values.sessionsPerWeek
                ? sessionsPerWeekLabel(values.sessionsPerWeek)
                : 'No weekly frequency yet.'}
            </p>
            {scheduleHasSlots(values.availability) ? (
              <ul className="space-y-1">
                {SCHEDULE_DAYS.map((day) =>
                  values.availability[day].length === 0 ? null : (
                    <li key={day}>
                      <span className="font-semibold">{scheduleDayLabel(day)}:</span>{' '}
                      {values.availability[day]
                        .map((code) => scheduleSlotLabel(day, code))
                        .join(', ')}
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="text-slate-500">No time slots selected.</p>
            )}
            {values.scheduleNote.trim() ? (
              <p className="whitespace-pre-wrap">{values.scheduleNote}</p>
            ) : null}
          </div>
        )}
      </FormSectionCard>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
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
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          {canSave ? (
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create class'
                  : 'Save changes'}
            </Button>
          ) : null}
        </div>
      </div>
    </form>
  )
}

function StudentScorePanel({
  name,
  grn,
  loading,
  found,
  score,
}: {
  name: string
  grn: string
  loading: boolean
  found: boolean
  score: SeatScore | null
}) {
  return (
    <div className="rounded-xl border border-[#C8D4F5]/90 bg-[#F5F8FF] px-3 py-3">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-slate-900">{name}</p>
        {grn ? (
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#253CA1] ring-1 ring-[#C8D4F5]">
            {grn}
          </span>
        ) : null}
        {score?.course ? (
          <span className="text-xs text-slate-500">{courseLabel(score.course)}</span>
        ) : null}
      </div>
      {loading ? (
        <p className="mt-2 text-xs text-slate-500">Looking up the prediction test...</p>
      ) : found && score ? (
        <dl className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {scoreLabels(score.course, score).map((item) => (
            <div key={item.label} className="rounded-lg bg-white px-3 py-2 ring-1 ring-[#C8D4F5]">
              <dt className="text-[10px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                {item.label}
              </dt>
              <dd className="mt-1 text-lg font-semibold text-slate-900 tabular-nums">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-2 text-sm text-slate-600">
          No matching prediction test is linked to this student's guest number.
        </p>
      )}
    </div>
  )
}

const compactFieldClassName = 'h-9 rounded-lg px-3 shadow-none'

function AllocationTable({
  sectionLabel,
  children,
}: {
  sectionLabel: string
  children: ReactNode
}) {
  return (
    <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/80">
      <div className="hidden grid-cols-[minmax(8rem,0.95fr)_5.5rem_minmax(0,1.45fr)] gap-3 border-b border-slate-100 bg-slate-50/90 px-3 py-1.5 text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase sm:grid">
        <span>{sectionLabel}</span>
        <span>Sessions</span>
        <span>Tutor</span>
      </div>
      <div className="divide-y divide-slate-100">{children}</div>
    </div>
  )
}

function AllocationRow({
  label,
  sessions,
  tutor,
}: {
  label: ReactNode
  sessions: ReactNode
  tutor: ReactNode
}) {
  return (
    <div className="grid gap-2 px-3 py-2 sm:grid-cols-[minmax(8rem,0.95fr)_5.5rem_minmax(0,1.45fr)] sm:items-center sm:gap-3">
      <div className="min-w-0">{label}</div>
      <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-2 sm:contents">
        {sessions}
        {tutor}
      </div>
    </div>
  )
}

function CompactTextField({
  id,
  label,
  value,
  readOnly,
  onChange,
}: {
  id: string
  label: string
  value: string
  readOnly: boolean
  onChange: (value: string) => void
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium text-slate-400 sm:hidden">
        {label}
      </p>
      {readOnly ? (
        <p className="flex h-9 items-center text-sm font-medium text-slate-900">
          {value.trim() || '—'}
        </p>
      ) : (
        <Input
          id={id}
          value={value}
          placeholder={label}
          className={compactFieldClassName}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
    </div>
  )
}

function CompactCountField({
  id,
  value,
  error,
  readOnly,
  onChange,
}: {
  id: string
  value: string
  error?: string
  readOnly: boolean
  onChange: (value: string) => void
}) {
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium text-slate-400 sm:hidden">
        Sessions
      </p>
      {readOnly ? (
        <p className="flex h-9 items-center text-sm font-semibold text-slate-900 tabular-nums">
          {value || '—'}
        </p>
      ) : (
        <Input
          id={id}
          inputMode="numeric"
          value={value}
          aria-label="Sessions"
          className={cn(compactFieldClassName, 'text-center tabular-nums')}
          onChange={(event) => onChange(event.target.value)}
        />
      )}
      {error ? <p className="mt-1 text-xs text-rose-500">{error}</p> : null}
    </div>
  )
}

function CompactTutorField({
  id,
  value,
  displayName,
  readOnly,
  options,
  loading,
  placeholder = 'Select tutor...',
  emptyMessage,
  onChange,
}: {
  id: string
  value: string
  displayName: string
  readOnly: boolean
  options: { value: string; label: string; keywords: string }[]
  loading: boolean
  placeholder?: string
  emptyMessage: string
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-medium text-slate-400 sm:hidden">
        Tutor
      </p>
      {readOnly ? (
        <p className="flex h-9 items-center truncate text-sm font-medium text-slate-900">
          {displayName || '—'}
        </p>
      ) : (
        <SearchableSelect
          id={id}
          value={value}
          options={options}
          onChange={onChange}
          placeholder={placeholder}
          searchPlaceholder="Search tutors..."
          disabled={loading}
          clearable
          emptyMessage={emptyMessage}
          className={compactFieldClassName}
        />
      )}
    </div>
  )
}
