import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Pencil } from 'lucide-react'

import { courseLabel } from '../../../shared/api/choices'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { DataTableBadge } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { useInvalidateNavBadges } from '../../admin/hooks/use-nav-badges-query'
import {
  useIsAcademicLeader,
  useIsProgramReviewer,
} from '../../auth/hooks/use-permissions'
import {
  deletePredictionTest,
  predictionTestToFormValues,
} from '../api/prediction-tests-api'
import { predictionTestQueryKeys } from '../api/prediction-test-query-keys'
import { PredictionTestForm } from '../components/prediction-test-form'
import { usePredictionTestForm } from '../hooks/use-prediction-test-form'
import { usePredictionTestQuery } from '../hooks/use-prediction-test-query'
import type {
  AcademicLeaderDecision,
  AcademicLeaderStatus,
  PredictionTestFormValues,
  PredictionTestListItem,
  PredictionTestStatus,
} from '../types/prediction-test'

export default function PredictionTestEditPage() {
  const navigate = useNavigate()
  const { testId } = useParams({ strict: false }) as { testId: string }
  const testQuery = usePredictionTestQuery(testId)

  if (testQuery.isLoading) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center">
          <div className="mx-auto h-10 w-10 animate-pulse rounded-2xl bg-[#E8EEFF]" />
          <p className="mt-4 text-sm text-slate-500">Loading prediction test...</p>
        </div>
      </AdminShell>
    )
  }

  if (testQuery.isError || !testQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1]">
            <Pencil className="size-6" />
          </div>
          <h2 className="mt-4 text-2xl font-bold text-slate-900">
            Prediction test not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This record may have been removed or the link is invalid.
          </p>
          <Button
            className="mt-6"
            variant="secondary"
            size="sm"
            onClick={() => void navigate({ to: '/prediction-tests' })}
          >
            <ArrowLeft className="size-3.5" />
            Back to prediction tests
          </Button>
        </div>
      </AdminShell>
    )
  }

  const test = testQuery.data

  return (
    <PredictionTestEditForm
      testId={test.id}
      studentName={test.studentName}
      initialValues={predictionTestToFormValues(test)}
      meta={{
        attachments: test.attachments,
        studentCourse: test.studentCourse,
        managerApproved: test.managerApproved,
        listeningTutorName: test.listeningTutorName,
        readingTutorName: test.readingTutorName,
        writingTutorName: test.writingTutorName,
        speakingTutorName: test.speakingTutorName,
        mathTutorName: test.mathTutorName,
        ieltsProgram: test.ieltsProgram,
        listeningSessions: test.listeningSessions,
        readingSessions: test.readingSessions,
        writingSessions: test.writingSessions,
        speakingSessions: test.speakingSessions,
        mathSessions: test.mathSessions,
      }}
      detail={{
        studentId: test.studentId,
        studentName: test.studentName,
        studentSrNumber: test.studentSrNumber,
        studentCourse: test.studentCourse,
        educationCounsellor: test.educationCounsellor,
        branch: test.branch,
        status: test.status,
        managerApproved: test.managerApproved,
        academicLeaderStatus: test.academicLeaderStatus,
        academicLeaderDecision: test.academicLeaderDecision,
        createdAt: test.createdAt,
        updatedAt: test.updatedAt,
      }}
    />
  )
}

function PredictionTestEditForm({
  testId,
  studentName,
  initialValues,
  meta,
  detail,
}: {
  testId: string
  studentName: string
  initialValues: PredictionTestFormValues
  meta: {
    attachments: PredictionTestListItem['attachments']
    studentCourse: string | null
    managerApproved: boolean
    listeningTutorName: string
    readingTutorName: string
    writingTutorName: string
    speakingTutorName: string
    mathTutorName: string
  }
  detail: {
    studentId: string
    studentName: string
    studentSrNumber: string
    studentCourse: string | null
    educationCounsellor: string
    branch: string
    status: PredictionTestStatus
    managerApproved: boolean
    academicLeaderStatus: AcademicLeaderStatus
    academicLeaderDecision: AcademicLeaderDecision | null
    createdAt: string
    updatedAt: string
  }
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const invalidateNavBadges = useInvalidateNavBadges()
  const form = usePredictionTestForm({
    mode: 'edit',
    testId,
    initialValues,
  })
  const hidePayment = useIsProgramReviewer()
  const isAcademicLeader = useIsAcademicLeader()

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete prediction test?',
      description: `This will permanently remove the prediction test for ${studentName}. This action cannot be undone.`,
      onConfirm: () => {
        void deletePredictionTest(testId)
          .then(async () => {
            await queryClient.invalidateQueries({
              queryKey: predictionTestQueryKeys.all,
            })
            invalidateNavBadges()
            notify('success', {
              title: 'Prediction test deleted',
              description: `Prediction test for ${studentName} has been removed.`,
            })
            void navigate({ to: '/prediction-tests' })
          })
          .catch((error) => {
            notify('error', {
              title: 'Unable to delete prediction test',
              description: getApiErrorMessage(error),
            })
          })
      },
    })
  }

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-4xl space-y-4">
        <section className="animate-in fade-in slide-in-from-bottom-1 overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.04)] sm:rounded-3xl">
          <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
            <div className="flex min-w-0 items-start gap-3">
              <div className="inline-flex size-12 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(160deg,#253CA1_0%,#1B2A5A_100%)] text-sm font-bold tracking-wide text-white shadow-md shadow-[#253CA1]/25">
                {getInitials(detail.studentName)}
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                    {detail.studentName}
                  </h2>
                  {detail.studentSrNumber ? (
                    <span className="rounded-full bg-[#E8EEFF] px-2 py-0.5 text-[11px] font-semibold text-[#253CA1]">
                      {detail.studentSrNumber}
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  {[
                    detail.studentCourse
                      ? courseLabel(detail.studentCourse)
                      : null,
                    detail.educationCounsellor
                      ? `Counsellor: ${detail.educationCounsellor}`
                      : null,
                    detail.branch && detail.branch !== '—'
                      ? detail.branch
                      : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'Prediction test'}
                </p>
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  {hidePayment ? null : (
                    <DataTableBadge tone={paymentStatusTone(detail.status)}>
                      {paymentStatusLabel(detail.status)}
                    </DataTableBadge>
                  )}
                  {hidePayment ? null : (
                    <DataTableBadge
                      tone={detail.managerApproved ? 'success' : 'info'}
                    >
                      {detail.managerApproved
                        ? 'Approved by BM'
                        : 'Awaiting Approval by BM'}
                    </DataTableBadge>
                  )}
                  <DataTableBadge
                    tone={reviewStatusTone(
                      detail.academicLeaderStatus,
                      detail.academicLeaderDecision,
                    )}
                  >
                    {reviewStatusLabel(detail.academicLeaderDecision)}
                  </DataTableBadge>
                  {isAcademicLeader ? null : (
                    <Link
                      to="/prospective-students/$prospectiveStudentId/edit"
                      params={{ prospectiveStudentId: detail.studentId }}
                      className="text-xs font-semibold text-[#253CA1] hover:underline"
                    >
                      View lead
                    </Link>
                  )}
                </div>
                <p className="mt-2 text-xs text-slate-400">
                  Created {formatDateTime(detail.createdAt)} · Updated{' '}
                  {formatDateTime(detail.updatedAt)}
                </p>
              </div>
            </div>
            <Button
              variant="secondary"
              size="sm"
              className="shrink-0"
              onClick={form.cancel}
            >
              Go Back
            </Button>
          </div>
        </section>

        <PredictionTestForm
          mode="edit"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          meta={meta}
          onChange={form.updateField}
          onSubmit={form.submit}
          onCancel={form.cancel}
          onDelete={handleDelete}
        />
      </div>
    </AdminShell>
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

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

function paymentStatusLabel(status: PredictionTestStatus) {
  if (status === 'approved') return 'Approved by Finance'
  if (status === 'pending') return 'Awaiting Approval by Finance'
  return 'Void'
}

function paymentStatusTone(status: PredictionTestStatus) {
  if (status === 'approved') return 'success' as const
  if (status === 'pending') return 'info' as const
  return 'danger' as const
}

function reviewStatusLabel(decision: AcademicLeaderDecision | null) {
  if (decision === 'reject') return 'Changes Requested by AL'
  if (decision === 'approve') return 'Approved by AL'
  return 'Awaiting Approval by AL'
}

function reviewStatusTone(
  status: AcademicLeaderStatus,
  decision: AcademicLeaderDecision | null,
) {
  if (decision === 'reject') return 'warning' as const
  if (decision === 'approve' || status === 'reviewed') return 'success' as const
  return 'info' as const
}
