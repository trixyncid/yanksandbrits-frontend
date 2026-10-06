import {
  CircleDollarSign,
  ClipboardCheck,
  ImagePlus,
  PenLine,
  Users,
  UserRound,
  X,
} from 'lucide-react'
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react'

import {
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
  isGeneralEnglishCourse,
  isSatCourse,
  isToeflCourse,
} from '../../../shared/api/choices'
import { GENERAL_ENGLISH_SPEAKING_LEVELS, GENERAL_ENGLISH_SPEAKING_COMMENT_MAX_LENGTH } from '../lib/general-english-speaking'
import {
  GENERAL_ENGLISH_WRITING_LEVELS,
  GENERAL_ENGLISH_WRITING_COMMENT_MAX_LENGTH,
} from '../lib/general-english-writing'
import {
  useAuthUser,
  useCanAssignGeneralEnglishTutor,
  useIsAcademicLeader,
  useIsProgramReviewer,
  useIsRestrictedMarketing,
  useIsTutorReviewer,
  useLocksPaymentStatus,
} from '../../auth/hooks/use-permissions'
import { hasAuthRole } from '../../auth/types/auth'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { useTutorOptionsQuery } from '../../users/hooks/use-user-options'
import { useProspectiveStudentOptionsQuery } from '../hooks/use-prospective-student-options-query'
import type {
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


function skillFieldsForCourse(course: string | null | undefined) {
  if (isGeneralEnglishCourse(course)) {
    return []
  }
  if (isSatCourse(course)) {
    return SAT_SKILL_FIELDS
  }
  if (isToeflCourse(course)) {
    return TOEFL_SKILL_FIELDS
  }
  return IELTS_SKILL_FIELDS
}


type PredictionTestFormProps = {
  mode: 'create' | 'edit'
  values: PredictionTestFormValues
  errors: PredictionTestFormErrors
  isSubmitting: boolean
  meta?: Pick<
    PredictionTestListItem,
    | 'attachments'
    | 'studentCourse'
  >
  onChange: <K extends keyof PredictionTestFormValues>(
    field: K,
    value: PredictionTestFormValues[K],
  ) => void
  onSubmit: (course: string | null) => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

type ChecklistLevel = {
  code: string
  label: string
  criteria: readonly { key: string; label: string }[]
}

type ChecklistValue = {
  notes: string
  criteria: Record<string, { checked: boolean; comment: string }>
}

function GeneralEnglishChecklist({
  idPrefix,
  levels,
  value,
  readOnly,
  commentMaxLength,
  notesHint,
  notesPlaceholder,
  onChange,
}: {
  idPrefix: string
  levels: readonly ChecklistLevel[]
  value: ChecklistValue
  readOnly: boolean
  commentMaxLength: number
  notesHint: string
  notesPlaceholder: string
  onChange: (next: ChecklistValue) => void
}) {
  return (
    <div className="space-y-5">
      {levels.map((level) => (
        <fieldset key={level.code} className="space-y-2">
          <legend className="text-sm font-semibold text-slate-900">
            {level.label}
          </legend>
          <div className="space-y-2">
            {level.criteria.map((criterion) => {
              const current = value.criteria[criterion.key]
              const checked = Boolean(current?.checked)
              const comment = current?.comment ?? ''
              return (
                <div
                  key={criterion.key}
                  className={cn(
                    'space-y-2 rounded-xl border px-3 py-2.5 transition',
                    checked
                      ? 'border-[#253CA1] bg-[#F5F8FF]'
                      : 'border-slate-200 bg-white',
                  )}
                >
                  <label
                    htmlFor={`${idPrefix}-${criterion.key}`}
                    className={cn(
                      'flex items-start gap-2.5 text-sm leading-snug',
                      readOnly ? 'cursor-default' : 'cursor-pointer',
                      checked ? 'text-slate-800' : 'text-slate-600',
                    )}
                  >
                    <input
                      id={`${idPrefix}-${criterion.key}`}
                      type="checkbox"
                      className="mt-0.5 size-4 shrink-0 rounded border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40 disabled:opacity-70"
                      checked={checked}
                      disabled={readOnly}
                      onChange={(event) =>
                        onChange({
                          ...value,
                          criteria: {
                            ...value.criteria,
                            [criterion.key]: {
                              checked: event.target.checked,
                              comment,
                            },
                          },
                        })
                      }
                    />
                    <span>{criterion.label}</span>
                  </label>
                  {readOnly ? (
                    comment.trim() ? (
                      <p className="pl-6 text-xs leading-relaxed text-slate-600">
                        {comment}
                      </p>
                    ) : null
                  ) : (
                    <Input
                      id={`${idPrefix}-${criterion.key}-comment`}
                      value={comment}
                      maxLength={commentMaxLength}
                      onChange={(event) =>
                        onChange({
                          ...value,
                          criteria: {
                            ...value.criteria,
                            [criterion.key]: {
                              checked,
                              comment: event.target.value,
                            },
                          },
                        })
                      }
                      placeholder="Optional comment"
                      aria-label={`Comment for ${criterion.label}`}
                      className="ml-6 w-[calc(100%-1.5rem)] bg-white"
                    />
                  )}
                </div>
              )
            })}
          </div>
        </fieldset>
      ))}
      <Field
        label="Additional notes"
        htmlFor={`${idPrefix}-notes`}
        hint={readOnly ? undefined : notesHint}
      >
        {readOnly ? (
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
            {value.notes.trim() || '—'}
          </p>
        ) : (
          <Textarea
            id={`${idPrefix}-notes`}
            value={value.notes}
            onChange={(event) =>
              onChange({
                ...value,
                notes: event.target.value,
              })
            }
            placeholder={notesPlaceholder}
          />
        )}
      </Field>
    </div>
  )
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
  const isEducationCounsellor = useIsRestrictedMarketing()
  const isProgramReviewer = useIsProgramReviewer()
  const isTutorReviewer = useIsTutorReviewer()
  const authUser = useAuthUser()
  const isAssignedPredictionTutor =
    isTutorReviewer &&
    authUser != null &&
    values.generalEnglishTutorId !== '' &&
    values.generalEnglishTutorId === String(authUser.id)
  const canAssignGeneralEnglishTutor = useCanAssignGeneralEnglishTutor()
  const hidePayment = isProgramReviewer
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

  const isBranchManager =
    !authUser?.is_superuser &&
    (hasAuthRole(authUser, 'branch-manager') || hasAuthRole(authUser, 'manager'))
  const generalEnglishScoresViewOnly =
    isGeneralEnglishCourse(selectedStudentCourse) &&
    !isAcademicLeader &&
    (isEducationCounsellor || isBranchManager)
  const scoresReadOnly =
    generalEnglishScoresViewOnly ||
    (isProgramReviewer &&
      !isAssignedPredictionTutor &&
      !(isAcademicLeader && isGeneralEnglishCourse(selectedStudentCourse)))

  const showGeneralEnglishTutor =
    isGeneralEnglishCourse(selectedStudentCourse) && canAssignGeneralEnglishTutor

  const generalEnglishTutorsQuery = useTutorOptionsQuery({
    staffType: 'English',
    enabled: showGeneralEnglishTutor,
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

  const generalEnglishTutorOptions = useMemo(
    () =>
      (generalEnglishTutorsQuery.data ?? []).map((tutor) => ({
        value: tutor.id,
        label: `${tutor.pin} | ${tutor.fullName}`,
        keywords: `${tutor.pin} ${tutor.fullName} ${tutor.email}`,
      })),
    [generalEnglishTutorsQuery.data],
  )

  const skillFields = useMemo(
    () => skillFieldsForCourse(selectedStudentCourse),
    [selectedStudentCourse],
  )

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

  function handleStudentChange(nextStudentId: string) {
    onChange('studentId', nextStudentId)
    const selected = (studentsQuery.data ?? []).find(
      (student) => student.id === nextStudentId,
    )
    if (selected?.branchId) {
      onChange('branchId', selected.branchId)
    }
    if (isSatCourse(selected?.course)) {
      onChange('listening', '')
      onChange('writing', '')
      onChange('speaking', '')
    } else if (isGeneralEnglishCourse(selected?.course)) {
      onChange('listening', '')
      onChange('reading', '')
      onChange('writing', '')
      onChange('speaking', '')
      onChange('math', '')
    } else {
      onChange('math', '')
      onChange('writtenTestScore', '')
      if (isToeflCourse(selected?.course)) {
        onChange('speaking', '')
      }
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
    !isEducationCounsellor &&
    !isAssignedPredictionTutor &&
    values.description.trim().length > 0 &&
    (scoresReadOnly || isAcademicLeader)

  const paymentSection = hidePayment ? null : (
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
  )


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
          {mode === 'edit' ? paymentSection : null}
      {showGeneralEnglishTutor ? (
        <FormSectionCard
          icon={Users}
          title="Tutor"
          description="This tutor can see and edit the General English prediction test once they are assigned."
        >
          <Field
            label="General English Prediction Test Tutor (Speaking & Writing)"
            htmlFor="generalEnglishTutorId"
            error={errors.generalEnglishTutorId}
          >
            <SearchableSelect
              id="generalEnglishTutorId"
              value={values.generalEnglishTutorId}
              options={generalEnglishTutorOptions}
              onChange={(next) => onChange('generalEnglishTutorId', next)}
              placeholder="Select tutor..."
              searchPlaceholder="Search tutors..."
              disabled={generalEnglishTutorsQuery.isLoading}
              clearable
              emptyMessage="No English tutors found"
            />
          </Field>
        </FormSectionCard>
      ) : null}
      <FormSectionCard
        icon={ClipboardCheck}
        title={
          isGeneralEnglishCourse(selectedStudentCourse)
            ? 'Speaking'
            : 'Prediction Test Score'
        }
        description={
          isGeneralEnglishCourse(selectedStudentCourse)
            ? scoresReadOnly
              ? 'Recorded after the student finishes the test.'
              : "Tick each descriptor that matches this student's speaking. Comments and notes are optional."
            : scoresReadOnly
              ? 'Recorded after the student finishes the test.'
              : 'Optional. Leave any skill blank until the student finishes the test.'
        }
      >
        {isGeneralEnglishCourse(selectedStudentCourse) ? (
          <GeneralEnglishChecklist
            idPrefix="speaking"
            levels={GENERAL_ENGLISH_SPEAKING_LEVELS}
            value={values.generalEnglishSpeaking}
            readOnly={scoresReadOnly}
            commentMaxLength={GENERAL_ENGLISH_SPEAKING_COMMENT_MAX_LENGTH}
            notesHint="Optional. Anything else about this speaking assessment."
            notesPlaceholder="Optional notes about this speaking assessment"
            onChange={(next) =>
              onChange(
                'generalEnglishSpeaking',
                next as PredictionTestFormValues['generalEnglishSpeaking'],
              )
            }
          />
        ) : (
          <>
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
              {scoresReadOnly ? (
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
          </>
        )}
        {!isProgramReviewer ? (
          <div className="border-t border-slate-100 pt-3.5">
            <Field
              label="Notes"
              htmlFor="description"
              error={errors.description}
              hint="Optional. Anything the reviewer should know about these scores."
            >
              <Textarea
                id="description"
                value={values.description}
                onChange={(event) => onChange('description', event.target.value)}
                placeholder="Optional notes about this prediction test"
              />
            </Field>
          </div>
        ) : showReadOnlyNotes ? (
          <div className="border-t border-slate-100 pt-3.5">
            <p className="text-xs font-semibold text-slate-500">
              Counsellor notes
            </p>
            <p className="mt-1.5 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {values.description}
            </p>
          </div>
        ) : null}
      </FormSectionCard>

      {isGeneralEnglishCourse(selectedStudentCourse) ? (
        <>
          <FormSectionCard
            icon={PenLine}
            title="Writing"
            description={
              scoresReadOnly
                ? 'Recorded after the student finishes the test.'
                : 'Tick each descriptor that matches this student\'s writing. Comments and notes are optional.'
            }
          >
            <GeneralEnglishChecklist
              idPrefix="writing"
              levels={GENERAL_ENGLISH_WRITING_LEVELS}
              value={values.generalEnglishWriting}
              readOnly={scoresReadOnly}
              commentMaxLength={GENERAL_ENGLISH_WRITING_COMMENT_MAX_LENGTH}
              notesHint="Optional. Anything else about this writing assessment."
              notesPlaceholder="Optional notes about this writing assessment"
              onChange={(next) =>
                onChange(
                  'generalEnglishWriting',
                  next as PredictionTestFormValues['generalEnglishWriting'],
                )
              }
            />
          </FormSectionCard>
          {isTutorReviewer ? null : (
          <FormSectionCard
            icon={ClipboardCheck}
            title="Written Test"
            description={
              scoresReadOnly
                ? 'Recorded after the student finishes the test.'
                : 'Enter the written test score.'
            }
          >
            <Field
              label="Score"
              htmlFor="writtenTestScore"
              error={errors.writtenTestScore}
            >
              {scoresReadOnly ? (
                <p className="text-lg font-semibold text-slate-900 tabular-nums">
                  {values.writtenTestScore.trim() || '—'}
                </p>
              ) : (
                <Input
                  id="writtenTestScore"
                  inputMode="decimal"
                  value={values.writtenTestScore}
                  onChange={(event) =>
                    onChange('writtenTestScore', event.target.value)
                  }
                  placeholder="6.5"
                />
              )}
            </Field>
          </FormSectionCard>
          )}
        </>
      ) : null}



          {mode === 'create' ? paymentSection : null}
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
                      ? isGeneralEnglishCourse(selectedStudentCourse)
                        ? 'Speaking, writing, and the written test save together.'
                        : 'Scores on this prediction test are read only.'
                      : isAssignedPredictionTutor
                        ? 'Speaking and writing save together.'
                        : 'Scores on this prediction test are read only.'
                    : 'Scores and payment save together.'
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
