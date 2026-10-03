import {
  BadgeCheck,
  CalendarDays,
  CircleDollarSign,
  ClipboardCheck,
  FileText,
  ImagePlus,
  ShieldCheck,
  Users,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'

import {
  ChoiceTile,
  FormSectionCard,
  ScoreTile,
} from '../../../shared/components/feature-page'
import { cn } from '../../../shared/lib/cn'
import { Button } from '../../../shared/components/ui/button'
import { CurrencyInput } from '../../../shared/components/ui/currency-input'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import {
  courseLabel,
  ieltsProgramLabel,
  isCombinedIeltsProgram,
  isHskCourse,
  isIeltsCourse,
  isSatCourse,
  isToeflCourse,
  predictionTestStaffType,
  programOptionsForCourse,
  type PredictionProgramCode,
} from '../../../shared/api/choices'
import {
  useIsAcademicLeader,
  useIsManager,
  useIsMarketing,
  useIsProgramReviewer,
  useIsRestrictedMarketing,
  useLocksPaymentStatus,
  useAuthUser,
} from '../../auth/hooks/use-permissions'
import { hasAuthRole } from '../../auth/types/auth'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { useTutorOptionsQuery } from '../../users/hooks/use-user-options'
import { useProspectiveStudentOptionsQuery } from '../hooks/use-prospective-student-options-query'
import type {
  AcademicLeaderDecision,
  PredictionTestAttachment,
  PredictionTestFormErrors,
  PredictionTestFormValues,
  PredictionTestListItem,
} from '../types/prediction-test'

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

function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function useObjectUrls(files: File[]) {
  const [urls, setUrls] = useState<string[]>([])

  useEffect(() => {
    const next = files.map((file) => URL.createObjectURL(file))
    setUrls(next)
    return () => {
      for (const url of next) {
        URL.revokeObjectURL(url)
      }
    }
  }, [files])

  return urls
}

const TOEFL_SKILL_FIELDS = [
  {
    key: 'listening' as const,
    label: 'Listening',
    hint: 'Listening Comprehension',
    accent: '#253CA1',
  },
  {
    key: 'writing' as const,
    label: 'Writing',
    hint: 'Structure and Written Expression',
    accent: '#3A56B8',
  },
  {
    key: 'reading' as const,
    label: 'Reading',
    hint: 'Reading Comprehension',
    accent: '#7B93E8',
  },
]

const IELTS_SKILL_FIELDS = [
  { key: 'listening' as const, label: 'Listening', hint: '', accent: '#253CA1' },
  { key: 'writing' as const, label: 'Writing', hint: '', accent: '#3A56B8' },
  { key: 'reading' as const, label: 'Reading', hint: '', accent: '#7B93E8' },
  { key: 'speaking' as const, label: 'Speaking', hint: '', accent: '#1B2A5A' },
]

const SAT_SKILL_FIELDS = [
  {
    key: 'reading' as const,
    label: 'Reading and Writing',
    hint: '',
    accent: '#253CA1',
  },
  { key: 'math' as const, label: 'Math', hint: '', accent: '#3A56B8' },
]

const IELTS_SESSION_FIELDS = [
  {
    skillKey: 'listening' as const,
    tutorKey: 'listeningTutorId' as const,
    sessionsKey: 'listeningSessions' as const,
    label: 'Listening',
  },
  {
    skillKey: 'writing' as const,
    tutorKey: 'writingTutorId' as const,
    sessionsKey: 'writingSessions' as const,
    label: 'Writing',
  },
  {
    skillKey: 'reading' as const,
    tutorKey: 'readingTutorId' as const,
    sessionsKey: 'readingSessions' as const,
    label: 'Reading',
  },
  {
    skillKey: 'speaking' as const,
    tutorKey: 'speakingTutorId' as const,
    sessionsKey: 'speakingSessions' as const,
    label: 'Speaking',
  },
]

const IELTS_COMBINED_SESSION_FIELDS = [
  {
    skillKey: 'listening' as const,
    tutorKey: 'listeningTutorId' as const,
    sessionsKey: 'listeningSessions' as const,
    label: 'Listening & Speaking',
  },
  {
    skillKey: 'reading' as const,
    tutorKey: 'readingTutorId' as const,
    sessionsKey: 'readingSessions' as const,
    label: 'Reading & Writing',
  },
]

const SAT_SESSION_FIELDS = [
  {
    skillKey: 'reading' as const,
    tutorKey: 'readingTutorId' as const,
    sessionsKey: 'readingSessions' as const,
    label: 'Reading & Writing',
  },
  {
    skillKey: 'math' as const,
    tutorKey: 'mathTutorId' as const,
    sessionsKey: 'mathSessions' as const,
    label: 'Mathematics',
  },
]

const TOEFL_SESSION_FIELDS = [
  {
    skillKey: 'listening' as const,
    tutorKey: 'listeningTutorId' as const,
    sessionsKey: 'listeningSessions' as const,
    label: 'Listening',
  },
  {
    skillKey: 'writing' as const,
    tutorKey: 'writingTutorId' as const,
    sessionsKey: 'writingSessions' as const,
    label: 'Writing',
  },
  {
    skillKey: 'reading' as const,
    tutorKey: 'readingTutorId' as const,
    sessionsKey: 'readingSessions' as const,
    label: 'Reading',
  },
]

function skillFieldsForCourse(course: string | null | undefined) {
  if (isSatCourse(course)) {
    return SAT_SKILL_FIELDS
  }
  if (isToeflCourse(course)) {
    return TOEFL_SKILL_FIELDS
  }
  return IELTS_SKILL_FIELDS
}

function formatAssignedSessions(value: number | null | undefined) {
  if (value == null || value === 0) {
    return '—'
  }
  return String(value)
}

function sessionFieldsForCourse(
  course: string | null | undefined,
  program: string | null | undefined,
) {
  if (isSatCourse(course)) {
    return SAT_SESSION_FIELDS
  }
  if (isToeflCourse(course)) {
    return TOEFL_SESSION_FIELDS
  }
  if (isIeltsCourse(course) && isCombinedIeltsProgram(program)) {
    return IELTS_COMBINED_SESSION_FIELDS
  }
  if (isIeltsCourse(course) || isHskCourse(course)) {
    return IELTS_SESSION_FIELDS
  }
  return null
}

const SCHEDULE_OPTIONS = [
  {
    key: 'scheduleMorning' as const,
    label: 'Morning',
  },
  {
    key: 'scheduleAfternoon' as const,
    label: 'Afternoon',
  },
  {
    key: 'scheduleEvening' as const,
    label: 'Evening',
  },
]

type PredictionTestFormProps = {
  mode: 'create' | 'edit'
  values: PredictionTestFormValues
  errors: PredictionTestFormErrors
  isSubmitting: boolean
  meta?: Pick<
    PredictionTestListItem,
    | 'attachments'
    | 'studentCourse'
    | 'managerApproved'
    | 'listeningTutorName'
    | 'readingTutorName'
    | 'writingTutorName'
    | 'speakingTutorName'
    | 'mathTutorName'
    | 'ieltsProgram'
    | 'listeningSessions'
    | 'readingSessions'
    | 'writingSessions'
    | 'speakingSessions'
    | 'mathSessions'
  >
  onChange: <K extends keyof PredictionTestFormValues>(
    field: K,
    value: PredictionTestFormValues[K],
  ) => void
  onSubmit: (course: string | null) => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function PredictionTestForm({
  mode,
  values,
  errors,
  isSubmitting,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: PredictionTestFormProps) {
  const studentsQuery = useProspectiveStudentOptionsQuery()
  const branchesQuery = useBranchesQuery()
  const lockPaymentStatus = useLocksPaymentStatus()
  const isAcademicLeader = useIsAcademicLeader()
  const isMarketing = useIsMarketing()
  const isManager = useIsManager()
  const isEducationCounsellor = useIsRestrictedMarketing()
  const isProgramReviewer = useIsProgramReviewer()
  const authUser = useAuthUser()
  const canViewProgramReviewOutcome =
    isEducationCounsellor ||
    isManager ||
    hasAuthRole(authUser, 'finance') ||
    hasAuthRole(authUser, 'systemadmin')
  const canSetManagerApproval =
    !isProgramReviewer &&
    (isManager || hasAuthRole(authUser, 'systemadmin'))
  const hidePayment = isProgramReviewer
  const canEditSchedule = !isProgramReviewer
  const stagedPreviewUrls = useObjectUrls(values.paymentProofFiles)

  const selectedStudentCourse = useMemo(() => {
    if (mode === 'edit') {
      return meta?.studentCourse ?? null
    }
    return (
      (studentsQuery.data ?? []).find(
        (student) => student.id === values.studentId,
      )?.course ?? null
    )
  }, [meta?.studentCourse, mode, studentsQuery.data, values.studentId])

  const tutorStaffType = useMemo(
    () => predictionTestStaffType(selectedStudentCourse),
    [selectedStudentCourse],
  )

  const programOptions = useMemo(
    () => programOptionsForCourse(selectedStudentCourse),
    [selectedStudentCourse],
  )
  const canAssignProgram = programOptions.length > 0
  const academicLeaderProceeded = values.academicLeaderDecision === 'approve'
  const canAssignSessions =
    isAcademicLeader &&
    Boolean(selectedStudentCourse) &&
    academicLeaderProceeded
  const hasScheduleDetails =
    values.scheduleMorning ||
    values.scheduleAfternoon ||
    values.scheduleEvening ||
    values.scheduleNote.trim().length > 0

  const tutorsQuery = useTutorOptionsQuery({
    staffType: tutorStaffType,
    enabled: canAssignSessions && Boolean(tutorStaffType),
  })

  const studentOptions = useMemo(
    () =>
      (studentsQuery.data ?? []).map((student) => ({
        value: student.id,
        label: `${student.fullName} | ${student.phone}`,
        keywords: `${student.fullName} ${courseLabel(student.course)}`,
      })),
    [studentsQuery.data],
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

  const skillFields = useMemo(
    () => skillFieldsForCourse(selectedStudentCourse),
    [selectedStudentCourse],
  )

  const sessionLayout = useMemo(
    () => sessionFieldsForCourse(selectedStudentCourse, values.ieltsProgram),
    [selectedStudentCourse, values.ieltsProgram],
  )
  const savedSessionLayout = useMemo(
    () =>
      sessionFieldsForCourse(
        selectedStudentCourse,
        meta?.ieltsProgram || values.ieltsProgram,
      ),
    [meta?.ieltsProgram, selectedStudentCourse, values.ieltsProgram],
  )

  const sessionFields = canAssignSessions ? sessionLayout : null
  const readOnlySessionFields = canAssignSessions ? null : savedSessionLayout

  const scoresEntered = useMemo(
    () => skillFields.filter((skill) => values[skill.key].trim() !== '').length,
    [skillFields, values],
  )
  const scoresComplete =
    !canAssignProgram || scoresEntered === skillFields.length
  const readyForManagerApproval =
    scoresComplete && (!canAssignProgram || Boolean(values.ieltsProgram))
  const programLockedAfterApproval =
    Boolean(meta?.managerApproved) && !isManager && !isProgramReviewer

  const hasStudent = mode === 'edit' || Boolean(values.studentId)

  const selectedStudent = useMemo(
    () =>
      (studentsQuery.data ?? []).find(
        (student) => student.id === values.studentId,
      ) ?? null,
    [studentsQuery.data, values.studentId],
  )

  const scoreGridClass = isSatCourse(selectedStudentCourse)
    ? 'sm:grid-cols-2'
    : isToeflCourse(selectedStudentCourse)
      ? 'sm:grid-cols-3'
      : 'sm:grid-cols-2 xl:grid-cols-4'

  useEffect(() => {
    if (isProgramReviewer || programLockedAfterApproval || !canAssignProgram) {
      return
    }
    if (!scoresComplete && values.ieltsProgram) {
      onChange('ieltsProgram', '')
    }
  }, [
    canAssignProgram,
    isProgramReviewer,
    onChange,
    programLockedAfterApproval,
    scoresComplete,
    values.ieltsProgram,
  ])

  useEffect(() => {
    if (
      isProgramReviewer ||
      !canSetManagerApproval ||
      readyForManagerApproval ||
      !values.managerApproved
    ) {
      return
    }
    onChange('managerApproved', false)
  }, [
    canSetManagerApproval,
    isProgramReviewer,
    onChange,
    readyForManagerApproval,
    values.managerApproved,
  ])

  function handleAcademicLeaderDecisionChange(
    next: AcademicLeaderDecision | '',
  ) {
    onChange('academicLeaderDecision', next)
    if (next !== 'reject') {
      onChange('academicLeaderRemarks', '')
    }
  }

  function clearSessionTutors() {
    onChange('listeningTutorId', '')
    onChange('readingTutorId', '')
    onChange('writingTutorId', '')
    onChange('speakingTutorId', '')
    onChange('mathTutorId', '')
  }

  function handleStudentChange(nextStudentId: string) {
    onChange('studentId', nextStudentId)
    const selected = (studentsQuery.data ?? []).find(
      (student) => student.id === nextStudentId,
    )
    if (selected?.branchId) {
      onChange('branchId', selected.branchId)
    }
    const previousType = predictionTestStaffType(selectedStudentCourse)
    const nextType = predictionTestStaffType(selected?.course)
    if (previousType !== nextType) {
      clearSessionTutors()
    }
    if (isSatCourse(selected?.course)) {
      onChange('listening', '')
      onChange('writing', '')
      onChange('speaking', '')
      onChange('listeningTutorId', '')
      onChange('writingTutorId', '')
      onChange('speakingTutorId', '')
      onChange('listeningSessions', '')
      onChange('writingSessions', '')
      onChange('speakingSessions', '')
    } else {
      onChange('math', '')
      onChange('mathTutorId', '')
      onChange('mathSessions', '')
      if (isToeflCourse(selected?.course)) {
        onChange('speaking', '')
        onChange('speakingTutorId', '')
        onChange('speakingSessions', '')
      }
    }
    const nextPrograms = programOptionsForCourse(selected?.course)
    if (
      !nextPrograms.some((option) => option.value === values.ieltsProgram)
    ) {
      onChange('ieltsProgram', '')
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit(selectedStudentCourse)
  }

  function addFiles(fileList: FileList | null) {
    if (!fileList?.length) {
      return
    }
    const incoming = Array.from(fileList)
    onChange('paymentProofFiles', [...values.paymentProofFiles, ...incoming])
  }

  function removeStagedFile(index: number) {
    onChange(
      'paymentProofFiles',
      values.paymentProofFiles.filter((_, fileIndex) => fileIndex !== index),
    )
  }

  const existingAttachments: PredictionTestAttachment[] = meta?.attachments ?? []

  const showReadOnlyNotes =
    isProgramReviewer && values.description.trim().length > 0

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      {mode === 'create' ? (
        <FormSectionCard
          icon={UserRound}
          title="Student"
          description="Start here. Payment follows the student’s test type. Scores can wait until they finish the test."
        >
          <Field
            label="Student"
            htmlFor="studentId"
            error={errors.studentId}
            required
            hint="Search by name. Their branch is filled in for the payment."
          >
            <SearchableSelect
              id="studentId"
              value={values.studentId}
              options={studentOptions}
              onChange={handleStudentChange}
              placeholder="Select student..."
              searchPlaceholder="Search by student name..."
              disabled={studentsQuery.isLoading || isProgramReviewer}
              emptyMessage="No prospective students found"
            />
          </Field>
          {selectedStudent ? (
            <div className="flex flex-wrap items-center gap-2 rounded-xl border border-[#C8D4F5]/90 bg-[#F5F8FF] px-3 py-2.5">
              <span className="text-sm font-semibold text-slate-900">
                {selectedStudent.fullName}
              </span>
              <span className="rounded-full bg-white px-2 py-0.5 text-[11px] font-semibold text-[#253CA1] ring-1 ring-[#C8D4F5]">
                {selectedStudent.course
                  ? courseLabel(selectedStudent.course)
                  : 'No test type'}
              </span>
              {selectedStudent.phone ? (
                <span className="text-xs text-slate-500">
                  {selectedStudent.phone}
                </span>
              ) : null}
            </div>
          ) : null}
        </FormSectionCard>
      ) : null}

      {hasStudent ? (
        <>
      <FormSectionCard
        icon={ClipboardCheck}
        title="Scores"
        description={
          isProgramReviewer
            ? 'Recorded after the student finishes the test.'
            : canAssignProgram
              ? 'Optional. Add them after the student finishes the test. The program unlocks when every score is filled.'
              : 'Optional. Leave any skill blank until the student finishes the test.'
        }
      >
        {canAssignProgram && !isProgramReviewer ? (
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-semibold text-slate-500">
              {scoresEntered} of {skillFields.length} entered
            </p>
            {scoresComplete ? (
              <p className="text-xs font-semibold text-emerald-600">
                Ready to assign a program
              </p>
            ) : null}
          </div>
        ) : null}
        {!selectedStudentCourse ? (
          <p className="text-xs text-slate-500">
            This student has no prediction test type yet, so the IELTS score
            set is shown.
          </p>
        ) : null}
        <div className={cn('grid gap-3', scoreGridClass)}>
          {skillFields.map((skill) => (
            <ScoreTile
              key={skill.key}
              label={skill.label}
              htmlFor={skill.key}
              error={errors[skill.key]}
              accent={skill.accent}
            >
              {skill.hint ? (
                <p className="-mt-1 mb-1 text-[11px] leading-snug text-slate-400">
                  {skill.hint}
                </p>
              ) : null}
              {isProgramReviewer ? (
                <p className="pl-2.5 text-lg font-semibold text-slate-900 tabular-nums">
                  {values[skill.key].trim() || '—'}
                </p>
              ) : (
                <Input
                  id={skill.key}
                  inputMode="decimal"
                  value={values[skill.key]}
                  onChange={(event) => onChange(skill.key, event.target.value)}
                  placeholder={
                    isSatCourse(selectedStudentCourse) ? '600' : '6.5'
                  }
                  className="border-transparent bg-transparent pl-2.5 pr-1 text-lg font-semibold tabular-nums shadow-none focus-visible:ring-0"
                />
              )}
            </ScoreTile>
          ))}
        </div>
      </FormSectionCard>

      {showReadOnlyNotes ? (
        <FormSectionCard
          icon={FileText}
          title="Counsellor notes"
          description="Context left with the scores."
          delayClassName="delay-75"
        >
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {values.description}
          </p>
        </FormSectionCard>
      ) : null}

      {isEducationCounsellor ? (
        <FormSectionCard
          icon={FileText}
          title="Notes"
          description="Optional. Anything the reviewer should know about these scores."
          delayClassName="delay-75"
        >
          <Textarea
            id="description"
            aria-label="Notes"
            value={values.description}
            onChange={(event) => onChange('description', event.target.value)}
            placeholder="Optional notes about this prediction test"
          />
          <FieldError message={errors.description} />
        </FormSectionCard>
      ) : null}

      {canAssignProgram ? (
        <FormSectionCard
          icon={BadgeCheck}
          title="Program"
          description={
            isProgramReviewer
              ? 'Proceed with the program offered, or send reasons so the branch manager can change it.'
              : programLockedAfterApproval
                ? 'Approved by the branch manager. Only a branch manager can change the program.'
                : 'Choose the program once every score is in.'
          }
          delayClassName="delay-75"
        >
          {isProgramReviewer ? (
            <>
              <div className="rounded-xl border border-slate-200/80 bg-slate-50 px-3 py-2.5">
                <p className="text-[10px] font-semibold tracking-[0.1em] text-slate-400 uppercase">
                  Program Assigned by Education Counsellor
                </p>
                <p className="mt-0.5 text-sm font-semibold text-slate-800">
                  {values.ieltsProgram
                    ? ieltsProgramLabel(values.ieltsProgram)
                    : 'Not assigned yet'}
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <ChoiceTile
                  name="academicLeaderDecision"
                  title="Proceed"
                  description="Keep the program assigned by the education counsellor."
                  selected={values.academicLeaderDecision === 'approve'}
                  onSelect={() => handleAcademicLeaderDecisionChange('approve')}
                />
                <ChoiceTile
                  name="academicLeaderDecision"
                  title="Request changes"
                  description="Send reasons. The branch manager updates the program."
                  selected={values.academicLeaderDecision === 'reject'}
                  onSelect={() => handleAcademicLeaderDecisionChange('reject')}
                />
              </div>
              <FieldError message={errors.academicLeaderDecision} />
              {!values.ieltsProgram ? (
                <p className="text-xs text-slate-500">
                  The counsellor has not assigned a program yet.
                </p>
              ) : null}

              {values.academicLeaderDecision === 'reject' ? (
                <div className="space-y-3.5 border-t border-slate-100 pt-3.5">
                  <Field
                    label="Reasons"
                    htmlFor="academicLeaderRemarks"
                    error={errors.academicLeaderRemarks}
                    hint="The branch manager sees this and updates the program."
                  >
                    <Textarea
                      id="academicLeaderRemarks"
                      value={values.academicLeaderRemarks}
                      onChange={(event) =>
                        onChange('academicLeaderRemarks', event.target.value)
                      }
                      placeholder="Why this program should change"
                    />
                  </Field>
                </div>
              ) : null}
            </>
          ) : (
            <>
              {canViewProgramReviewOutcome &&
              values.academicLeaderDecision === 'reject' ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                  <p className="text-[10px] font-semibold tracking-[0.1em] text-amber-700 uppercase">
                    Academic leader requested changes
                  </p>
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700">
                    {values.academicLeaderRemarks.trim() ||
                      'No reasons were recorded.'}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {programLockedAfterApproval
                      ? 'The branch manager updates the program.'
                      : isManager
                        ? 'Update the assigned program.'
                        : 'Update Program Assigned by Education Counsellor.'}
                  </p>
                </div>
              ) : null}

              {!scoresComplete ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2.5">
                  <div className="flex items-center justify-between gap-3 text-xs font-semibold text-slate-500">
                    <span>Scores needed</span>
                    <span>
                      {scoresEntered} of {skillFields.length}
                    </span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[#253CA1] transition-[width]"
                      style={{
                        width: `${skillFields.length === 0 ? 0 : (scoresEntered / skillFields.length) * 100}%`,
                      }}
                    />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Fill the remaining scores above, then choose a program.
                  </p>
                </div>
              ) : null}

              <Field
                label="Program Assigned by Education Counsellor"
                htmlFor="ieltsProgram"
                error={errors.ieltsProgram}
                required={isEducationCounsellor && scoresComplete}
                hint={
                  programLockedAfterApproval
                    ? 'The branch manager approved this test. Only a branch manager can change the program.'
                    : scoresComplete
                      ? 'This is the program the student should start with.'
                      : undefined
                }
              >
                <Select
                  id="ieltsProgram"
                  value={values.ieltsProgram}
                  disabled={!scoresComplete || programLockedAfterApproval}
                  onChange={(event) =>
                    onChange(
                      'ieltsProgram',
                      event.target.value as PredictionProgramCode | '',
                    )
                  }
                >
                  <option value="">Select program...</option>
                  {programOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </Select>
              </Field>

              {canViewProgramReviewOutcome &&
              values.academicLeaderDecision === 'approve' ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
                  <p className="text-[10px] font-semibold tracking-[0.1em] text-emerald-700 uppercase">
                    Academic leader proceeded
                  </p>
                  <p className="mt-0.5 text-sm font-semibold text-slate-800">
                    {ieltsProgramLabel(values.ieltsProgram)}
                  </p>
                </div>
              ) : values.ieltsProgram && !values.academicLeaderDecision ? (
                <p className="text-xs text-slate-500">
                  {values.managerApproved
                    ? 'Waiting for the academic leader or a tutor to review this program.'
                    : 'Waiting for the branch manager to approve this prediction test.'}
                </p>
              ) : null}
            </>
          )}
        </FormSectionCard>
      ) : null}

      {!canAssignProgram &&
      (isProgramReviewer ||
        values.managerApproved ||
        Boolean(values.academicLeaderDecision)) ? (
        <FormSectionCard
          icon={BadgeCheck}
          title="Review"
          description={
            isProgramReviewer
              ? 'Approve this prediction test, or send reasons back.'
              : 'The academic leader or a tutor reviews this prediction test after the branch manager approves it.'
          }
          delayClassName="delay-75"
        >
          {isProgramReviewer ? (
            <>
              <div className="grid gap-2 sm:grid-cols-2">
                <ChoiceTile
                  name="academicLeaderDecision"
                  title="Proceed"
                  description="Approve this prediction test."
                  selected={values.academicLeaderDecision === 'approve'}
                  onSelect={() => handleAcademicLeaderDecisionChange('approve')}
                />
                <ChoiceTile
                  name="academicLeaderDecision"
                  title="Request changes"
                  description="Send reasons back to the branch manager."
                  selected={values.academicLeaderDecision === 'reject'}
                  onSelect={() => handleAcademicLeaderDecisionChange('reject')}
                />
              </div>
              <FieldError message={errors.academicLeaderDecision} />
              {values.academicLeaderDecision === 'reject' ? (
                <div className="space-y-3.5 border-t border-slate-100 pt-3.5">
                  <Field
                    label="Reasons"
                    htmlFor="academicLeaderRemarks"
                    error={errors.academicLeaderRemarks}
                    hint="The branch manager sees this."
                  >
                    <Textarea
                      id="academicLeaderRemarks"
                      value={values.academicLeaderRemarks}
                      onChange={(event) =>
                        onChange('academicLeaderRemarks', event.target.value)
                      }
                      placeholder="Why this prediction test should change"
                    />
                  </Field>
                </div>
              ) : null}
            </>
          ) : values.academicLeaderDecision === 'approve' ? (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold tracking-[0.1em] text-emerald-700 uppercase">
                Academic leader proceeded
              </p>
              <p className="mt-0.5 text-sm text-slate-700">
                This prediction test is approved.
              </p>
            </div>
          ) : values.academicLeaderDecision === 'reject' ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
              <p className="text-[10px] font-semibold tracking-[0.1em] text-amber-700 uppercase">
                Academic leader requested changes
              </p>
              <p className="mt-1.5 whitespace-pre-wrap text-sm text-slate-700">
                {values.academicLeaderRemarks.trim() ||
                  'No reasons were recorded.'}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              {values.managerApproved
                ? 'Waiting for the academic leader or a tutor to review this prediction test.'
                : 'Waiting for the branch manager to approve this prediction test.'}
            </p>
          )}
        </FormSectionCard>
      ) : null}

      {!isProgramReviewer && !isEducationCounsellor ? (
        <FormSectionCard
          icon={ShieldCheck}
          title="Branch manager approval"
          description={
            canAssignProgram
              ? 'Required after a program is assigned. Academic leaders see this test only after approval.'
              : 'Academic leaders see this test only after approval.'
          }
          delayClassName="delay-75"
        >
          {readyForManagerApproval ? (
            canSetManagerApproval ? (
              <div className="grid gap-2 sm:grid-cols-2">
                <ChoiceTile
                  name="managerApproved"
                  title="Pending"
                  description="Hold this test until you are ready to send it on."
                  selected={!values.managerApproved}
                  onSelect={() => onChange('managerApproved', false)}
                />
                <ChoiceTile
                  name="managerApproved"
                  title="Approved"
                  description="Send this prediction test to the academic leader."
                  selected={values.managerApproved}
                  onSelect={() => onChange('managerApproved', true)}
                />
              </div>
            ) : (
              <div
                className={cn(
                  'rounded-xl border px-3 py-2.5',
                  values.managerApproved
                    ? 'border-emerald-200 bg-emerald-50'
                    : 'border-slate-200 bg-slate-50',
                )}
              >
                <p
                  className={cn(
                    'text-[10px] font-semibold tracking-[0.1em] uppercase',
                    values.managerApproved
                      ? 'text-emerald-700'
                      : 'text-slate-500',
                  )}
                >
                  {values.managerApproved
                    ? 'Approved by branch manager'
                    : 'Pending branch manager approval'}
                </p>
                <p className="mt-1 text-sm text-slate-700">
                  {values.managerApproved
                    ? 'The academic leader or a tutor can review this prediction test.'
                    : 'The branch manager approves it before the academic leader or a tutor can see it.'}
                </p>
              </div>
            )
          ) : (
            <p className="text-sm text-slate-500">
              {scoresComplete
                ? 'Assign a program before the branch manager can approve this prediction test.'
                : 'Enter every score and assign a program before the branch manager can approve this prediction test.'}
            </p>
          )}
        </FormSectionCard>
      ) : null}

      {!isProgramReviewer && !isEducationCounsellor ? (
        <FormSectionCard
          icon={FileText}
          title="Notes"
          description="Optional. Anything the reviewer should know about these scores."
          delayClassName="delay-75"
        >
          <Textarea
            id="description"
            aria-label="Notes"
            value={values.description}
            onChange={(event) => onChange('description', event.target.value)}
            placeholder="Optional notes about this prediction test"
          />
          <FieldError message={errors.description} />
        </FormSectionCard>
      ) : null}

      {readOnlySessionFields ? (
        <FormSectionCard
          icon={Users}
          title="Sessions"
          description="Assigned by the academic leader."
          delayClassName="delay-75"
        >
          <div className="divide-y divide-slate-100">
            {readOnlySessionFields.map((session) => {
              const tutorNameKey = {
                listeningTutorId: 'listeningTutorName',
                readingTutorId: 'readingTutorName',
                writingTutorId: 'writingTutorName',
                speakingTutorId: 'speakingTutorName',
                mathTutorId: 'mathTutorName',
              } as const
              const tutorName = meta?.[tutorNameKey[session.tutorKey]]?.trim()
              const sessionCount = formatAssignedSessions(
                meta?.[session.sessionsKey],
              )
              return (
                <div
                  key={session.tutorKey}
                  className="py-3.5 first:pt-0 last:pb-0"
                >
                  <p className="mb-2.5 text-sm font-semibold text-slate-800">
                    {session.label}
                  </p>
                  <div className="grid gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Sessions
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800 tabular-nums">
                        {sessionCount}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Tutor
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-800">
                        {tutorName || '—'}
                      </p>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </FormSectionCard>
      ) : null}

      {sessionFields ? (
        <FormSectionCard
          icon={Users}
          title="Sessions"
          description={
            tutorStaffType
              ? `How many sessions each section needs, and which ${tutorStaffType.toLowerCase()} tutor will take it.`
              : 'Select a student to load tutors for this prediction test type.'
          }
          delayClassName="delay-75"
        >
          <div className="divide-y divide-slate-100">
            {sessionFields.map((session) => (
              <div
                key={session.tutorKey}
                className="py-3.5 first:pt-0 last:pb-0"
              >
                <p className="mb-2.5 text-sm font-semibold text-slate-800">
                  {session.label}
                </p>
                <div className="grid gap-3 sm:grid-cols-[6.5rem_minmax(0,1fr)]">
                <Field
                  label="Sessions"
                  htmlFor={session.sessionsKey}
                  error={errors[session.sessionsKey]}
                >
                  <Input
                    id={session.sessionsKey}
                    inputMode="numeric"
                    value={values[session.sessionsKey]}
                    onChange={(event) =>
                      onChange(
                        session.sessionsKey,
                        event.target.value.replace(/[^\d]/g, ''),
                      )
                    }
                    placeholder="0"
                  />
                </Field>
                <Field
                  label="Tutor"
                  htmlFor={session.tutorKey}
                  error={errors[session.tutorKey]}
                >
                  <SearchableSelect
                    id={session.tutorKey}
                    value={values[session.tutorKey]}
                    options={tutorOptions}
                    onChange={(next) => onChange(session.tutorKey, next)}
                    placeholder={
                      tutorStaffType
                        ? `Select ${tutorStaffType.toLowerCase()} tutor...`
                        : 'Select student first...'
                    }
                    searchPlaceholder="Search tutors..."
                    disabled={!tutorStaffType || tutorsQuery.isLoading}
                    clearable
                    emptyMessage={
                      tutorStaffType
                        ? `No ${tutorStaffType.toLowerCase()} tutors found`
                        : 'Select a student first'
                    }
                  />
                </Field>
                </div>
              </div>
            ))}
          </div>
        </FormSectionCard>
      ) : null}

      {canEditSchedule && hasStudent ? (
        <FormSectionCard
          icon={CalendarDays}
          title="Schedule & Note"
          description="When these sessions can run, and anything the tutor should know."
          delayClassName="delay-75"
        >
          <fieldset className="space-y-2">
            <legend className="text-sm font-medium text-slate-700">
              Schedule
            </legend>
            <div className="grid gap-2 sm:grid-cols-3">
              {SCHEDULE_OPTIONS.map((option) => {
                const checked = values[option.key]
                return (
                  <label
                    key={option.key}
                    htmlFor={option.key}
                    className={cn(
                      'flex cursor-pointer items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition',
                      checked
                        ? 'border-[#253CA1] bg-[#F5F8FF] text-slate-800'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-[#C8D4F5]',
                    )}
                  >
                    <input
                      id={option.key}
                      type="checkbox"
                      className="size-4 rounded border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40"
                      checked={checked}
                      onChange={(event) =>
                        onChange(option.key, event.target.checked)
                      }
                    />
                    {option.label}
                  </label>
                )
              })}
            </div>
          </fieldset>
          <Field
            label="Notes"
            htmlFor="scheduleNote"
            error={errors.scheduleNote}
          >
            <Textarea
              id="scheduleNote"
              value={values.scheduleNote}
              onChange={(event) => onChange('scheduleNote', event.target.value)}
              placeholder="Optional notes about the schedule"
            />
          </Field>
        </FormSectionCard>
      ) : null}

      {isProgramReviewer && hasScheduleDetails ? (
        <FormSectionCard
          icon={CalendarDays}
          title="Schedule & Note"
          description="Set by the education counsellor."
          delayClassName="delay-75"
        >
          <div className="flex flex-wrap gap-2">
            {SCHEDULE_OPTIONS.map((option) => (
              <span
                key={option.key}
                className={cn(
                  'rounded-full px-2.5 py-1 text-xs font-semibold',
                  values[option.key]
                    ? 'bg-[#E8EEFF] text-[#253CA1]'
                    : 'bg-slate-100 text-slate-400',
                )}
              >
                {option.label}
              </span>
            ))}
          </div>
          {values.scheduleNote.trim() ? (
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {values.scheduleNote}
            </p>
          ) : null}
        </FormSectionCard>
      ) : null}

      {hidePayment ? null : (
        <FormSectionCard
          icon={CircleDollarSign}
          title="Payment"
          description="Amount, the branch that received it, and proof."
          delayClassName="delay-75"
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field
              label="Amount"
              htmlFor="amount"
              error={errors.amount}
              required
            >
              <CurrencyInput
                id="amount"
                value={values.amount}
                onValueChange={(digits) => onChange('amount', digits)}
                placeholder="0"
              />
            </Field>

            <Field
              label="Payment status"
              htmlFor="status"
              error={errors.status}
              hint={
                lockPaymentStatus
                  ? 'You can see this status. Finance updates it. New payments start as pending.'
                  : undefined
              }
            >
              <Select
                id="status"
                containerClassName="w-full sm:w-full"
                value={values.status}
                disabled={lockPaymentStatus}
                onChange={(event) =>
                  onChange(
                    'status',
                    event.target.value as PredictionTestFormValues['status'],
                  )
                }
              >
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="void">Void</option>
              </Select>
            </Field>
          </div>

          <Field
            label="Payment branch"
            htmlFor="branchId"
            error={errors.branchId}
            required
            hint="Where this payment was received. Used for commission."
          >
            <Select
              id="branchId"
              value={values.branchId}
              onChange={(event) => onChange('branchId', event.target.value)}
              disabled={branchesQuery.isLoading}
            >
              <option value="">Select branch...</option>
              {(branchesQuery.data?.data ?? []).map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </Field>

          <div className="space-y-2">
            <Label htmlFor="paymentProof">Payment Proof</Label>
            <label
              htmlFor="paymentProof"
              className="group flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-[#C8D4F5] bg-[linear-gradient(180deg,rgba(245,248,255,0.9)_0%,rgba(232,238,255,0.55)_100%)] px-4 py-5 text-center transition hover:border-[#253CA1] hover:bg-[#F5F8FF]"
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault()
                addFiles(event.dataTransfer.files)
              }}
            >
              <span className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-[#253CA1] shadow-sm ring-1 ring-[#C8D4F5] transition group-hover:scale-105">
                <ImagePlus className="size-4" />
              </span>
              <span className="text-sm font-semibold text-slate-700">
                Drop or click to add proof images
              </span>
              <span className="text-xs text-slate-400">
                JPG, PNG, or WEBP · max 5 MB each
              </span>
              <input
                id="paymentProof"
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(event) => {
                  addFiles(event.target.files)
                  event.target.value = ''
                }}
              />
            </label>
            <FieldError message={errors.paymentProofFiles} />

            {values.paymentProofFiles.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Ready to upload ({values.paymentProofFiles.length})
                </p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {values.paymentProofFiles.map((file, index) => (
                    <li
                      key={`${file.name}-${file.lastModified}-${index}`}
                      className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                    >
                      <div className="aspect-[4/3] bg-slate-50">
                        {stagedPreviewUrls[index] ? (
                          <img
                            src={stagedPreviewUrls[index]}
                            alt={file.name}
                            className="size-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="flex items-start justify-between gap-2 p-3">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800">
                            {file.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-slate-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          aria-label={`Remove ${file.name}`}
                          className="inline-flex size-7 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white/90 text-slate-500 transition hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                          onClick={() => removeStagedFile(index)}
                          disabled={isSubmitting}
                        >
                          <X className="size-3.5" />
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {existingAttachments.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs font-semibold tracking-wide text-slate-500 uppercase">
                  Uploaded proofs ({existingAttachments.length})
                </p>
                <ul className="grid gap-3 sm:grid-cols-2">
                  {existingAttachments.map((attachment) => (
                    <li
                      key={attachment.id}
                      className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm"
                    >
                      <a
                        href={attachment.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block aspect-[4/3] bg-slate-50"
                      >
                        <img
                          src={attachment.fileUrl}
                          alt="Payment proof"
                          className="size-full object-cover"
                        />
                      </a>
                      <div className="p-3">
                        <a
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-medium text-[#253CA1] hover:underline"
                        >
                          Open proof
                        </a>
                        <p className="mt-0.5 text-[11px] text-slate-400">
                          {formatFileSize(attachment.fileSize)}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
        </FormSectionCard>
      )}
        </>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/80 px-5 py-10 text-center">
          <p className="text-sm font-semibold text-slate-700">
            Payment comes next
          </p>
          <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-slate-500">
            Choose a student first. Score fields match their prediction test
            and can be filled in after they finish.
          </p>
        </div>
      )}

      <div className="sticky bottom-2 z-10 animate-in fade-in slide-in-from-bottom-2 delay-150">
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-slate-200/80 bg-white px-3 py-2.5 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:px-4">
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
            ) : (
              <p className="hidden text-xs text-slate-400 sm:block">
                {hasStudent
                  ? hidePayment
                    ? isAcademicLeader
                      ? 'Decision and session tutors save together.'
                      : 'This review saves with the prediction test.'
                    : canAssignProgram
                      ? 'Scores, program, schedule, and payment save together.'
                      : 'Scores, schedule, and payment save together.'
                  : 'Select a student to continue.'}
              </p>
            )}
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
                ? 'Saving...'
                : mode === 'create'
                  ? 'Create prediction test'
                  : 'Save changes'}
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
