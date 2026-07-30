import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  deletePredictionTest,
  predictionTestToFormValues,
} from '../api/prediction-tests-api'
import { predictionTestQueryKeys } from '../api/prediction-test-query-keys'
import { PredictionTestForm } from '../components/prediction-test-form'
import { usePredictionTestForm } from '../hooks/use-prediction-test-form'
import { usePredictionTestQuery } from '../hooks/use-prediction-test-query'
import type { PredictionTestFormValues } from '../types/prediction-test'

export default function PredictionTestEditPage() {
  const navigate = useNavigate()
  const { testId } = useParams({ strict: false }) as { testId: string }
  const testQuery = usePredictionTestQuery(testId)

  if (testQuery.isLoading) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-slate-500">
          Loading prediction test...
        </div>
      </AdminShell>
    )
  }

  if (testQuery.isError || !testQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
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
        createdAt: test.createdAt,
        updatedAt: test.updatedAt,
        studentName: test.studentName,
        branch: test.branch,
        educationCounsellor: test.educationCounsellor,
        paymentProofUrl: test.paymentProofUrl,
      }}
    />
  )
}

function PredictionTestEditForm({
  testId,
  studentName,
  initialValues,
  meta,
}: {
  testId: string
  studentName: string
  initialValues: PredictionTestFormValues
  meta: {
    createdAt: string
    updatedAt: string
    studentName: string
    branch: string
    educationCounsellor: string
    paymentProofUrl: string
  }
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = usePredictionTestForm({
    mode: 'edit',
    testId,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete prediction test?',
      description: `This will permanently remove ${studentName}. This action cannot be undone.`,
      onConfirm: () => {
        void deletePredictionTest(testId)
          .then(async () => {
            await queryClient.invalidateQueries({
              queryKey: predictionTestQueryKeys.all,
            })
            notify('success', {
              title: 'Prediction test deleted',
              description: `${studentName} has been removed.`,
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
    <AdminShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/prediction-tests"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Prediction Tests
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Update Prediction Test
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit prediction test details for {studentName}.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
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
      </div>
    </AdminShell>
  )
}
