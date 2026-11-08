import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'
import { CalendarDays, ClipboardCheck, Lock, Plus, Users, X } from 'lucide-react'

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
import { FormSaveBar } from '../../../shared/components/page'
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
import {
  createStudentGroup,
  updateStudentGroup,
} from '../../student-groups/api/student-groups-api'
import { studentGroupQueryKeys } from '../../student-groups/api/student-group-query-keys'
import { useProgramsQuery } from '../../programs/hooks/use-programs-query'
import { useEligibleStudentsQuery } from '../hooks/use-tutor-allocations-query'
import { useTutorOptionsQuery } from '../../users/hooks/use-user-options'
import { skillSessionSlots } from '../lib/session-layout'
import {
  courseForProgram,
  isAdditionalProgram,
  TUTOR_ALLOCATION_PROGRAM_OPTIONS,
  usesProgramLines,
} from '../lib/programs'
import { seatCount } from '../schema/tutor-allocation-form-schema'
import type {
  EligibleAllocationStudent,
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
  /** The class being edited; keeps its current students in the list. */
  allocationId?: string
  tutorNames?: TutorAllocationListItem
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

function scoreFromEligible(student: EligibleAllocationStudent): SeatScore {
  return {
    course: student.course,
    listening: student.listening,
    reading: student.reading,
    writing: student.writing,
    speaking: student.speaking,
    math: student.math,
    writtenTestScore: student.writtenTestScore,
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

function predictionTestFamilyLabel(programCourse: string | null) {
  if (programCourse === 'IEL') return 'IELTS'
  if (programCourse === 'TOE') return 'TOEFL'
  if (programCourse === 'HSK') return 'HSK'
  if (programCourse === 'GEN') return 'General English'
  if (programCourse === 'SAT') return 'SAT'
  return 'matching'
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
  required,
}: {
  htmlFor: string
  children: string
  required?: boolean
}) {
  return (
    <Label htmlFor={htmlFor} className="text-sm font-medium text-slate-700">
      {children}
      {required ? <span className="text-rose-500"> *</span> : null}
    </Label>
  )
}

export function TutorAllocationForm({
  mode,
  values,
  errors,
  isSubmitting,
  savedMembers = [],
  allocationId,
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
  // Section notes are for managers, academic leaders, and system admins only.
  const canSeeSectionNotes = isSystemAdmin || isManager || isAcademicLeader
  const noteHint = canSeeSectionNotes ? ', and a note' : ''
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

  const eligibleQuery = useEligibleStudentsQuery(
    values.program,
    values.classType,
    allocationId,
  )
  const students = useMemo(
    () => eligibleQuery.data ?? [],
    [eligibleQuery.data],
  )
  const selectedProgramCourse = courseForProgram(values.program)

  useEffect(() => {
    if (!values.program || !eligibleQuery.isSuccess) return
    const allowed = new Set(students.map((student) => student.id))
    const nextIds = values.studentIds.map((id) =>
      id && allowed.has(id) ? id : '',
    ) as TutorAllocationFormValues['studentIds']
    if (nextIds.some((id, index) => id !== values.studentIds[index])) {
      onChange('studentIds', nextIds)
    }
  }, [
    eligibleQuery.isSuccess,
    onChange,
    students,
    values.program,
    values.studentIds,
  ])

  const seatViews = useMemo(() => {
    return values.studentIds.slice(0, seats).map((studentId) => {
      const student = students.find((item) => item.id === studentId) ?? null
      const saved = savedMembers.find((member) => member.studentId === studentId)
      if (!studentId) {
        return { studentId, student, saved, score: null as SeatScore | null, found: false }
      }
      if (student?.predictionTestId) {
        return {
          studentId,
          student,
          saved,
          score: scoreFromEligible(student),
          found: true,
        }
      }
      if (saved?.predictionTestId) {
        return { studentId, student, saved, score: scoreFromMember(saved), found: true }
      }
      if (!eligibleQuery.isSuccess) {
        return { studentId, student, saved, score: null, found: false }
      }
      return { studentId, student, saved, score: null, found: false }
    })
  }, [
    eligibleQuery.isSuccess,
    savedMembers,
    seats,
    students,
    values.studentIds,
  ])

  const selectedSeats = seatViews.filter((seat) => seat.studentId)
  const scoresPending = selectedSeats.some(
    (seat) =>
      seat.studentId &&
      !seat.found &&
      !eligibleQuery.isSuccess &&
      !seat.saved?.predictionTestId,
  )
  const showAdditional = isAdditionalProgram(values.program)
  // Additional Program picks tutors per line, by that line's subject.
  const tutorStaffType = showAdditional
    ? null
    : predictionTestStaffType(selectedProgramCourse)
  const allTutorsQuery = useTutorOptionsQuery({
    staffType: null,
    enabled: canEditTutors && showAdditional,
  })
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
  const showComputerScience = usesProgramLines(values.program)
  const programsQuery = useProgramsQuery({
    isActive: 'active',
  })
  const programSubjectById = useMemo(
    () =>
      new Map(
        (programsQuery.data?.data ?? []).map((program) => [
          program.id,
          program.subject,
        ]),
      ),
    [programsQuery.data?.data],
  )
  const catalogProgramOptions = useMemo(() => {
    const options = (programsQuery.data?.data ?? []).map((program) => ({
      value: program.id,
      label: `${program.code} · ${program.title}`,
      keywords: `${program.code} ${program.title} ${program.description}`,
    }))
    const saved = [
      ...(tutorNames?.computerSciencePrograms ?? []).map((line) => ({
        id: line.programId,
        code: line.programCode,
        title: line.programTitle,
      })),
      {
        id: tutorNames?.listeningProgramId ?? '',
        code: tutorNames?.listeningProgramCode ?? '',
        title: tutorNames?.listeningProgramTitle ?? '',
      },
      {
        id: tutorNames?.readingProgramId ?? '',
        code: tutorNames?.readingProgramCode ?? '',
        title: tutorNames?.readingProgramTitle ?? '',
      },
      {
        id: tutorNames?.writingProgramId ?? '',
        code: tutorNames?.writingProgramCode ?? '',
        title: tutorNames?.writingProgramTitle ?? '',
      },
      {
        id: tutorNames?.speakingProgramId ?? '',
        code: tutorNames?.speakingProgramCode ?? '',
        title: tutorNames?.speakingProgramTitle ?? '',
      },
      {
        id: tutorNames?.mathProgramId ?? '',
        code: tutorNames?.mathProgramCode ?? '',
        title: tutorNames?.mathProgramTitle ?? '',
      },
      {
        id: tutorNames?.generalEnglishUnit1ProgramId ?? '',
        code: tutorNames?.generalEnglishUnit1ProgramCode ?? '',
        title: tutorNames?.generalEnglishUnit1ProgramTitle ?? '',
      },
      {
        id: tutorNames?.generalEnglishUnit2ProgramId ?? '',
        code: tutorNames?.generalEnglishUnit2ProgramCode ?? '',
        title: tutorNames?.generalEnglishUnit2ProgramTitle ?? '',
      },
      {
        id: tutorNames?.generalEnglishGrammarProgramId ?? '',
        code: tutorNames?.generalEnglishGrammarProgramCode ?? '',
        title: tutorNames?.generalEnglishGrammarProgramTitle ?? '',
      },
    ]
    for (const line of saved) {
      if (!line.id || options.some((option) => option.value === line.id)) continue
      const label = [line.code, line.title].filter(Boolean).join(' · ')
      options.unshift({
        value: line.id,
        label: label || 'Selected program',
        keywords: label,
      })
    }
    return options
  }, [programsQuery.data?.data, tutorNames])

  const studentOptions = useMemo(
    () =>
      students.map((student) => ({
        value: student.id,
        label: student.pin
          ? `${student.pin} | ${student.fullName}`
          : student.fullName,
        keywords: `${student.pin} ${student.fullName} ${student.mobilePhone}`,
      })),
    [students],
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
    if (!nextProgram) {
      onChange('studentIds', ['', '', '', ''])
    }
  }

  function updateProgramLine(
    index: number,
    patch: Partial<(typeof values.computerSciencePrograms)[number]>,
  ) {
    onChange(
      'computerSciencePrograms',
      values.computerSciencePrograms.map((line, lineIndex) =>
        lineIndex === index ? { ...line, ...patch } : line,
      ),
    )
  }

  function addProgramLine() {
    onChange('computerSciencePrograms', [
      ...values.computerSciencePrograms,
      { programId: '', sessions: '', tutorId: '', note: '' },
    ])
  }

  function removeProgramLine(index: number) {
    const next = values.computerSciencePrograms.filter(
      (_, lineIndex) => lineIndex !== index,
    )
    onChange(
      'computerSciencePrograms',
      next.length > 0
        ? next
        : [{ programId: '', sessions: '', tutorId: '', note: '' }],
    )
  }

  function programOptionsForLine(index: number) {
    const taken = new Set(
      values.computerSciencePrograms
        .filter((_, lineIndex) => lineIndex !== index)
        .map((line) => line.programId)
        .filter(Boolean),
    )
    const current = values.computerSciencePrograms[index]?.programId
    return catalogProgramOptions.filter(
      (option) => !taken.has(option.value) || option.value === current,
    )
  }

  function lineSubject(programId: string) {
    return (
      programSubjectById.get(programId) ||
      tutorNames?.computerSciencePrograms?.find(
        (line) => line.programId === programId,
      )?.programSubject ||
      ''
    )
  }

  function tutorOptionsForLine(programId: string) {
    if (!showAdditional) return tutorOptions
    if (!programId) return []
    // A program without a subject can be taught by any tutor.
    const subject = lineSubject(programId)
    return (allTutorsQuery.data ?? [])
      .filter(
        (tutor) =>
          !subject ||
          (tutor.staffType ?? '')
            .split(',')
            .map((item) => item.trim())
            .includes(subject),
      )
      .map((tutor) => ({
        value: tutor.id,
        label: `${tutor.pin} | ${tutor.fullName}`,
        keywords: `${tutor.pin} ${tutor.fullName} ${tutor.email}`,
      }))
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
    const next: [string, string, string, string] = [
      values.studentIds[0],
      values.studentIds[1],
      values.studentIds[2],
      values.studentIds[3],
    ]
    next[index] = studentId
    onChange('studentIds', next)
    setLayoutError('')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (
      selectedSeats.length === seats &&
      !scoresPending &&
      !usesProgramLines(values.program)
    ) {
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
        title="Who is in this class"
        description={
          showComputerScience
            ? 'Pick the program first, then one student for a private class, or two to four students who share the same tutors and schedule.'
            : 'Pick the program first, then one student for a private class, or two to four students who share the same tutors and schedule. Only enrolled students with a prediction test for this program are listed.'
        }
      >
        <div className="space-y-1.5">
          <FieldLabel htmlFor="program" required>
            Program
          </FieldLabel>
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
        <div className="grid gap-2 sm:grid-cols-2">
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
              description="Two, three, or four students."
              selected={values.classType === 'group'}
              onSelect={() => onChange('classType', 'group')}
            />
          </div>
        </div>
        {isCounsellor && canEditMembers ? (
          <p className="text-xs text-slate-500">
            {values.classType === 'private'
              ? 'A private class lists only your own students. Choose Group to add students from other counsellors.'
              : 'A group class can include students from any counsellor in your branch.'}
          </p>
        ) : null}
        {values.classType === 'group' ? (
          <div className="grid gap-2 sm:grid-cols-3">
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
            <div className={cn(!canEditMembers && 'pointer-events-none opacity-70')}>
              <ChoiceTile
                name="groupSize"
                title="4 people"
                selected={values.groupSize === '4'}
                onSelect={() => onChange('groupSize', '4')}
              />
            </div>
          </div>
        ) : null}
        <div className="space-y-4">
          {seatViews.map((seat, index) => (
            <div key={index} className="space-y-3">
              <FieldLabel htmlFor={`student-${index}`} required>
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
                  eligibleQuery.isLoading
                }
                clearable
                emptyMessage={
                  values.program
                    ? showComputerScience
                      ? 'No enrolled students'
                      : `No enrolled students with a ${predictionTestFamilyLabel(selectedProgramCourse)} prediction test`
                    : 'Select a program first'
                }
              />
              {seat.studentId && !showComputerScience ? (
                <StudentScorePanel
                  name={seat.student?.fullName ?? seat.saved?.studentName ?? 'Student'}
                  grn={seat.student?.grn ?? seat.saved?.grn ?? ''}
                  loading={Boolean(seat.studentId) && !seat.found && !eligibleQuery.isSuccess}
                  found={seat.found}
                  score={seat.score}
                />
              ) : null}
            </div>
          ))}
        </div>
        {values.classType === 'group' && canManageStudentGroups ? (
          <div className="rounded-3xl bg-canvas px-4 py-4">
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
                  variant="ink"
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
          title="Programs & tutors"
          description={
            canEditSessions && !canEditTutors
              ? showComputerScience
                ? `Add a line for each program${canSeeSectionNotes ? ', and a note under it' : ''}. An academic leader assigns the tutor.`
                : `Choose the program for each section${canSeeSectionNotes ? ', enter the sessions, and add a note' : ' and enter the sessions'}. An academic leader assigns the tutor.`
              : showComputerScience
                ? `Each program, how many sessions it needs, which tutor will take it${noteHint}.`
                : showGeneralEnglish
                  ? `Unit names, the program, how many sessions each needs, which tutor will take it${noteHint}.`
                  : `The program, how many sessions each section needs, which ${tutorStaffType?.toLowerCase() ?? ''} tutor will take it${noteHint}.`
          }
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
              {TUTOR_ALLOCATION_PROGRAM_OPTIONS.find(
                (option) => option.value === values.program,
              )?.label ?? values.program}
            </span>
            {!canEditTutors ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-canvas px-3 py-1 text-xs font-medium text-slate-500">
                <Lock className="size-3" />
                {mode === 'edit' && approved
                  ? 'Tutors are chosen by an academic leader'
                  : 'Tutors are chosen after approval'}
              </span>
            ) : null}
          </div>
          {showComputerScience ? (
            <>
              <AllocationTable sectionLabel="Program" wideLabel>
                {values.computerSciencePrograms.map((line, index) => {
                  const saved = tutorNames?.computerSciencePrograms?.find(
                    (item) => item.programId === line.programId,
                  )
                  const programLabelText =
                    catalogProgramOptions.find((option) => option.value === line.programId)
                      ?.label ?? ''
                  return (
                    <AllocationRow
                      key={index}
                      wideLabel
                      label={
                        <CompactProgramField
                          id={`computerScienceProgram-${index}`}
                          value={line.programId}
                          displayName={programLabelText}
                          readOnly={!canEditSessions}
                          options={programOptionsForLine(index)}
                          loading={programsQuery.isLoading}
                          onChange={(next) =>
                            updateProgramLine(index, { programId: next })
                          }
                        />
                      }
                      sessions={
                        <CompactCountField
                          id={`computerScienceSessions-${index}`}
                          value={line.sessions}
                          readOnly={!canEditSessions}
                          onChange={(next) =>
                            updateProgramLine(index, { sessions: next })
                          }
                        />
                      }
                      tutor={
                        <div className="flex items-start gap-2">
                          <div className="min-w-0 flex-1">
                            <CompactTutorField
                              id={`computerScienceTutor-${index}`}
                              value={line.tutorId}
                              displayName={saved?.tutorName ?? ''}
                              readOnly={!canEditTutors}
                              options={tutorOptionsForLine(line.programId)}
                              loading={
                                showAdditional
                                  ? allTutorsQuery.isLoading
                                  : !tutorStaffType || tutorsQuery.isLoading
                              }
                              placeholder={
                                !showAdditional
                                  ? 'Select IT tutor...'
                                  : !line.programId
                                    ? 'Choose a program first'
                                    : lineSubject(line.programId)
                                      ? `Select ${lineSubject(line.programId)} tutor...`
                                      : 'Select tutor...'
                              }
                              emptyMessage={
                                !showAdditional
                                  ? 'No IT tutors found'
                                  : !line.programId
                                    ? 'Choose a program first'
                                    : lineSubject(line.programId)
                                      ? `No ${lineSubject(line.programId)} tutors found`
                                      : 'No tutors found'
                              }
                              onChange={(next) =>
                                updateProgramLine(index, { tutorId: next })
                              }
                            />
                          </div>
                          {canEditSessions &&
                          values.computerSciencePrograms.length > 1 ? (
                            <button
                              type="button"
                              aria-label={`Remove program ${index + 1}`}
                              title="Remove this program"
                              className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-canvas text-rose-500 transition hover:bg-rose-500 hover:text-white"
                              onClick={() => removeProgramLine(index)}
                            >
                              <X className="size-4" />
                            </button>
                          ) : null}
                        </div>
                      }
                      note={
                        <SectionNoteField
                          hidden={!canSeeSectionNotes}
                          id={`computerScienceNote-${index}`}
                          value={line.note}
                          readOnly={!canEditSessions}
                          onChange={(next) => updateProgramLine(index, { note: next })}
                        />
                      }
                    />
                  )
                })}
              </AllocationTable>
              {canEditSessions ? (
                <Button
                  type="button"
                  variant="soft"
                  onClick={addProgramLine}
                >
                  <Plus className="size-4" />
                  Add another program
                </Button>
              ) : null}
              {errors.computerSciencePrograms ? (
                <p className="mt-2 text-xs text-rose-500">
                  {errors.computerSciencePrograms}
                </p>
              ) : null}
            </>
          ) : showGeneralEnglish ? (
            <AllocationTable sectionLabel="Unit" showProgram>
              <AllocationRow
                showProgram
                label={
                  <CompactTextField
                    id="generalEnglishUnit1"
                    label="Unit"
                    value={values.generalEnglishUnit1}
                    readOnly={!canEditSessions}
                    onChange={(next) => onChange('generalEnglishUnit1', next)}
                  />
                }
                program={
                  <CompactProgramField
                    id="generalEnglishUnit1ProgramId"
                    value={values.generalEnglishUnit1ProgramId}
                    displayName={
                      catalogProgramOptions.find(
                        (option) =>
                          option.value === values.generalEnglishUnit1ProgramId,
                      )?.label ?? ''
                    }
                    readOnly={!canEditSessions}
                    options={catalogProgramOptions}
                    loading={programsQuery.isLoading}
                    onChange={(next) =>
                      onChange('generalEnglishUnit1ProgramId', next)
                    }
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
                note={
                  <SectionNoteField
                    hidden={!canSeeSectionNotes}
                    id="generalEnglishUnit1Note"
                    value={values.generalEnglishUnit1Note}
                    readOnly={!canEditSessions}
                    onChange={(next) => onChange('generalEnglishUnit1Note', next)}
                  />
                }
              />
              <AllocationRow
                showProgram
                label={
                  <CompactTextField
                    id="generalEnglishUnit2"
                    label="Unit"
                    value={values.generalEnglishUnit2}
                    readOnly={!canEditSessions}
                    onChange={(next) => onChange('generalEnglishUnit2', next)}
                  />
                }
                program={
                  <CompactProgramField
                    id="generalEnglishUnit2ProgramId"
                    value={values.generalEnglishUnit2ProgramId}
                    displayName={
                      catalogProgramOptions.find(
                        (option) =>
                          option.value === values.generalEnglishUnit2ProgramId,
                      )?.label ?? ''
                    }
                    readOnly={!canEditSessions}
                    options={catalogProgramOptions}
                    loading={programsQuery.isLoading}
                    onChange={(next) =>
                      onChange('generalEnglishUnit2ProgramId', next)
                    }
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
                note={
                  <SectionNoteField
                    hidden={!canSeeSectionNotes}
                    id="generalEnglishUnit2Note"
                    value={values.generalEnglishUnit2Note}
                    readOnly={!canEditSessions}
                    onChange={(next) => onChange('generalEnglishUnit2Note', next)}
                  />
                }
              />
              <AllocationRow
                showProgram
                label={
                  <p className="text-sm font-semibold text-slate-800">Grammar</p>
                }
                program={
                  <CompactProgramField
                    id="generalEnglishGrammarProgramId"
                    value={values.generalEnglishGrammarProgramId}
                    displayName={
                      catalogProgramOptions.find(
                        (option) =>
                          option.value === values.generalEnglishGrammarProgramId,
                      )?.label ?? ''
                    }
                    readOnly={!canEditSessions}
                    options={catalogProgramOptions}
                    loading={programsQuery.isLoading}
                    onChange={(next) =>
                      onChange('generalEnglishGrammarProgramId', next)
                    }
                  />
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
                note={
                  <SectionNoteField
                    hidden={!canSeeSectionNotes}
                    id="generalEnglishGrammarNote"
                    value={values.generalEnglishGrammarNote}
                    readOnly={!canEditSessions}
                    onChange={(next) => onChange('generalEnglishGrammarNote', next)}
                  />
                }
              />
            </AllocationTable>
          ) : (
            <AllocationTable sectionLabel="Section" showProgram>
              {slots.map((slot) => (
                <AllocationRow
                  key={slot.tutorKey}
                  showProgram
                  label={
                    <p className="text-sm font-semibold text-slate-800">
                      {slot.label}
                    </p>
                  }
                  program={
                    <CompactProgramField
                      id={slot.programKey}
                      value={values[slot.programKey]}
                      displayName={
                        catalogProgramOptions.find(
                          (option) => option.value === values[slot.programKey],
                        )?.label ??
                        [tutorNames?.[slot.programCodeKey], tutorNames?.[slot.programTitleKey]]
                          .filter(Boolean)
                          .join(' · ')
                      }
                      readOnly={!canEditSessions}
                      options={catalogProgramOptions}
                      loading={programsQuery.isLoading}
                      onChange={(next) => onChange(slot.programKey, next)}
                    />
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
                  note={
                    <SectionNoteField
                      hidden={!canSeeSectionNotes}
                      id={slot.noteKey}
                      value={values[slot.noteKey]}
                      readOnly={!canEditSessions}
                      onChange={(next) => onChange(slot.noteKey, next)}
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
        title="Weekly schedule"
        description="How often the class meets, the times that work for the students, and anything the tutor should know."
      >
        {canEditSchedule ? (
          <div className="space-y-4">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-slate-700">
                How many times a week should the class meet?
              </legend>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {SESSIONS_PER_WEEK_OPTIONS.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex h-10 cursor-pointer items-center justify-center rounded-full px-3 text-sm font-semibold transition focus-within:ring-2 focus-within:ring-brand-500/40',
                      values.sessionsPerWeek === option.value
                        ? 'bg-ink text-white'
                        : 'bg-canvas text-slate-600 hover:bg-canvas-deep hover:text-ink',
                    )}
                  >
                    <input
                      type="radio"
                      name="sessionsPerWeek"
                      className="sr-only"
                      checked={values.sessionsPerWeek === option.value}
                      onChange={() => onChange('sessionsPerWeek', option.value)}
                    />
                    {option.label}
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="text-sm font-medium text-slate-700">
              Which times work for the students?
            </p>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {SCHEDULE_DAYS.map((day) => (
                <fieldset
                  key={day}
                  className={cn(
                    'rounded-3xl p-3.5 transition',
                    values.availability[day].length > 0
                      ? 'bg-brand-50'
                      : 'bg-canvas',
                  )}
                >
                  <legend className="sr-only">{scheduleDayLabel(day)}</legend>
                  <div className="flex items-center justify-between gap-2">
                    <p aria-hidden className="text-sm font-bold text-ink">
                      {scheduleDayLabel(day)}
                    </p>
                    {values.availability[day].length > 0 ? (
                      <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-brand-700">
                        {values.availability[day].length} picked
                      </span>
                    ) : null}
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {slotsForDay(day).map((slot) => {
                      const checked = values.availability[day].includes(slot.code)
                      return (
                        <label
                          key={slot.code}
                          className={cn(
                            'inline-flex h-8 cursor-pointer items-center rounded-full px-3 text-xs font-semibold transition focus-within:ring-2 focus-within:ring-brand-500/40',
                            checked
                              ? 'bg-brand-500 text-white'
                              : 'bg-white text-slate-600 hover:text-ink',
                          )}
                        >
                          <input
                            type="checkbox"
                            className="sr-only"
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
                placeholder="Anything the tutor should know, e.g. exam date or learning goals (optional)"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-3 text-sm text-slate-700">
            <p className="inline-flex rounded-full bg-ink px-3 py-1 text-xs font-semibold text-white">
              {values.sessionsPerWeek
                ? sessionsPerWeekLabel(values.sessionsPerWeek)
                : 'No weekly frequency yet.'}
            </p>
            {scheduleHasSlots(values.availability) ? (
              <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {SCHEDULE_DAYS.map((day) =>
                  values.availability[day].length === 0 ? null : (
                    <li key={day} className="rounded-3xl bg-brand-50 p-3.5">
                      <p className="text-sm font-bold text-ink">
                        {scheduleDayLabel(day)}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {values.availability[day].map((code) => (
                          <span
                            key={code}
                            className="inline-flex h-7 items-center rounded-full bg-white px-2.5 text-xs font-semibold text-brand-700"
                          >
                            {scheduleSlotLabel(day, code)}
                          </span>
                        ))}
                      </div>
                    </li>
                  ),
                )}
              </ul>
            ) : (
              <p className="text-slate-500">No time slots selected.</p>
            )}
            {values.scheduleNote.trim() ? (
              <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                <p className="text-xs text-slate-500">Note</p>
                <p className="mt-0.5 whitespace-pre-wrap">{values.scheduleNote}</p>
              </div>
            ) : null}
          </div>
        )}
      </FormSectionCard>

      {canSave ? (
        <FormSaveBar
          mode={mode}
          isSubmitting={isSubmitting}
          onCancel={onCancel}
          onDelete={onDelete}
          deleteLabel="Delete class"
          submitLabel={mode === 'create' ? 'Create class' : undefined}
          hint={
            mode === 'create'
              ? 'A branch manager approves the class before tutors are assigned.'
              : 'Changes apply to every student in this class.'
          }
        />
      ) : (
        <div className="sticky bottom-3 z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-[1.75rem] bg-white/95 py-2 pr-2 pl-4 shadow-lg shadow-ink/10 ring-1 ring-slate-200/60 backdrop-blur-md">
            {mode === 'edit' && onDelete ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={onDelete}
                disabled={isSubmitting}
              >
                Delete class
              </Button>
            ) : (
              <p className="hidden items-center gap-1.5 text-xs text-slate-500 sm:inline-flex">
                <Lock className="size-3.5" />
                You can view this class but not change it.
              </p>
            )}
            <Button
              type="button"
              variant="soft"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
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
    <div className="rounded-3xl bg-brand-50 px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-bold text-ink">{name}</p>
        {grn ? (
          <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-brand-700">
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
            <div key={item.label} className="rounded-2xl bg-white px-3 py-2">
              <dt className="text-[10px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
                {item.label}
              </dt>
              <dd className="mt-1 text-lg font-bold text-ink tabular-nums">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : (
        <p className="mt-2 text-sm text-amber-700">
          No prediction test for this program is linked to this student's guest
          number yet.
        </p>
      )}
    </div>
  )
}

const compactFieldClassName = 'h-9 rounded-full px-3 shadow-none'

function allocationColumns(wideLabel: boolean, showProgram: boolean) {
  if (showProgram) {
    return 'sm:grid-cols-[minmax(7rem,0.7fr)_minmax(11rem,1.2fr)_5.5rem_minmax(9rem,1fr)]'
  }
  if (wideLabel) {
    return 'sm:grid-cols-[minmax(12rem,1.4fr)_5.5rem_minmax(10rem,1.1fr)]'
  }
  return 'sm:grid-cols-[minmax(8rem,0.95fr)_5.5rem_minmax(0,1.45fr)]'
}

function AllocationTable({
  sectionLabel,
  wideLabel = false,
  showProgram = false,
  children,
}: {
  sectionLabel: string
  wideLabel?: boolean
  showProgram?: boolean
  children: ReactNode
}) {
  return (
    <div className="overflow-hidden rounded-3xl bg-canvas">
      <div
        className={cn(
          'hidden gap-3 px-4 pt-3 pb-1 text-[11px] font-semibold tracking-[0.08em] text-slate-400 uppercase sm:grid',
          allocationColumns(wideLabel, showProgram),
        )}
      >
        <span>{sectionLabel}</span>
        {showProgram ? <span>Program</span> : null}
        <span>Sessions</span>
        <span>Tutor</span>
      </div>
      <div className="space-y-1.5 p-1.5">{children}</div>
    </div>
  )
}

function AllocationRow({
  label,
  program,
  sessions,
  tutor,
  note,
  wideLabel = false,
  showProgram = false,
}: {
  label: ReactNode
  program?: ReactNode
  sessions: ReactNode
  tutor: ReactNode
  note?: ReactNode
  wideLabel?: boolean
  showProgram?: boolean
}) {
  return (
    <div className="rounded-2xl bg-white px-3 py-2.5">
      <div
        className={cn(
          'grid gap-2 sm:items-center sm:gap-3',
          allocationColumns(wideLabel, showProgram),
        )}
      >
        <div className="min-w-0">{label}</div>
        {showProgram ? <div className="min-w-0">{program}</div> : null}
        <div className="grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-2 sm:contents">
          {sessions}
          {tutor}
        </div>
      </div>
      {note ? <div className="mt-2">{note}</div> : null}
    </div>
  )
}

function SectionNoteField({
  hidden = false,
  id,
  value,
  readOnly,
  onChange,
}: {
  hidden?: boolean
  id: string
  value: string
  readOnly: boolean
  onChange: (value: string) => void
}) {
  if (hidden || (readOnly && !value.trim())) return null
  return (
    <div>
      <p className="mb-1 text-[11px] font-medium text-slate-400">Note</p>
      {readOnly ? (
        <p className="text-sm whitespace-pre-wrap text-slate-700">{value}</p>
      ) : (
        <Textarea
          id={id}
          value={value}
          rows={2}
          placeholder="Optional note for this section"
          onChange={(event) => onChange(event.target.value)}
        />
      )}
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

function CompactProgramField({
  id,
  value,
  displayName,
  readOnly,
  options,
  loading,
  onChange,
}: {
  id: string
  value: string
  displayName: string
  readOnly: boolean
  options: { value: string; label: string; keywords: string }[]
  loading: boolean
  onChange: (value: string) => void
}) {
  return (
    <div className="min-w-0">
      <p className="mb-1 text-[11px] font-medium text-slate-400 sm:hidden">
        Program
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
          placeholder="Select program..."
          searchPlaceholder="Search programs..."
          disabled={loading}
          clearable
          emptyMessage="No programs found"
          className={compactFieldClassName}
        />
      )}
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
