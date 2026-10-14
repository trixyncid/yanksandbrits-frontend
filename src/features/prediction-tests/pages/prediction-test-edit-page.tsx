import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, ArrowUpRight, ClipboardList } from 'lucide-react'

import { courseLabel } from '../../../shared/api/choices'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { EmptyState, PageHeader } from '../../../shared/components/page'
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
import { PredictionTestListLoadingState } from '../components/prediction-test-list-states'
import { PredictionTestStatusPill } from '../components/prediction-test-status-pill'
import { usePredictionTestForm } from '../hooks/use-prediction-test-form'
import { usePredictionTestQuery } from '../hooks/use-prediction-test-query'
import type {
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
        <div className="mx-auto max-w-6xl">
          <PredictionTestListLoadingState />
        </div>
      </AdminShell>
    )
  }

  if (testQuery.isError || !testQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon={ClipboardList}
            title="Prediction test not found"
            description="This record may have been removed or the link is invalid."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="soft"
                  onClick={() => void navigate({ to: '/prediction-tests' })}
                >
                  <ArrowLeft className="size-4" />
                  Back to prediction tests
                </Button>
                {testQuery.isError ? (
                  <Button variant="ink" onClick={() => void testQuery.refetch()}>
                    Try again
                  </Button>
                ) : null}
              </div>
            }
          />
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
        status: test.status,
      }}
      detail={{
        studentId: test.studentId,
        studentName: test.studentName,
        studentSrNumber: test.studentSrNumber,
        studentCourse: test.studentCourse,
        educationCounsellor: test.educationCounsellor,
        branch: test.branch,
        status: test.status,
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
    status: PredictionTestStatus
  }
  detail: {
    studentId: string
    studentName: string
    studentSrNumber: string
    studentCourse: string | null
    educationCounsellor: string
    branch: string
    status: PredictionTestStatus
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
      title: `Delete ${studentName}'s prediction test?`,
      description: `This permanently removes the prediction test for ${studentName}, including its scores, payment record and uploaded proofs. This cannot be undone.`,
      confirmLabel: 'Delete test',
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

  const subtitle =
    [
      detail.studentCourse ? courseLabel(detail.studentCourse) : null,
      detail.educationCounsellor
        ? `Counsellor: ${detail.educationCounsellor}`
        : null,
      detail.branch && detail.branch !== '—' ? detail.branch : null,
    ]
      .filter(Boolean)
      .join(' · ') || 'Prediction test'

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/prediction-tests"
          backLabel="Prediction Tests"
          title={detail.studentName}
          description={
            <>
              {subtitle}
              <span className="mt-0.5 block text-xs text-slate-500">
                Created {formatDateTime(detail.createdAt)} · Updated{' '}
                {formatDateTime(detail.updatedAt)}
              </span>
            </>
          }
          icon={ClipboardList}
          theme="dawn"
          pattern="dots"
          badge={
            <>
              {detail.studentSrNumber ? (
                <span className="rounded-full bg-white px-2.5 py-0.5 text-[11px] font-semibold text-brand-700">
                  {detail.studentSrNumber}
                </span>
              ) : null}
              {hidePayment ? null : (
                <PredictionTestStatusPill status={detail.status} long />
              )}
            </>
          }
          actions={
            isAcademicLeader ? null : (
              <Link
                to="/prospective-students/$prospectiveStudentId/edit"
                params={{ prospectiveStudentId: detail.studentId }}
                className="inline-flex h-10 items-center gap-1.5 rounded-full bg-white px-4 text-sm font-semibold text-ink shadow-sm transition hover:bg-ink hover:text-white"
              >
                View lead
                <ArrowUpRight className="size-4" />
              </Link>
            )
          }
        />

        <PredictionTestForm
          mode="edit"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          meta={meta}
          studentName={studentName}
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
