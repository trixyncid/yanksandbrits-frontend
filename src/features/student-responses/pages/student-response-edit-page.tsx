import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  deleteStudentResponse,
  studentResponseToFormValues,
} from '../api/student-responses-api'
import { studentResponseQueryKeys } from '../api/student-response-query-keys'
import { StudentResponseForm } from '../components/student-response-form'
import {
  StudentResponseListErrorState,
  StudentResponseListLoadingState,
} from '../components/student-response-list-states'
import { useStudentResponseForm } from '../hooks/use-student-response-form'
import { useStudentResponseQuery } from '../hooks/use-student-response-query'
import type {
  StudentResponseFormValues,
  StudentResponseListItem,
} from '../types/student-response'

export default function StudentResponseEditPage() {
  const navigate = useNavigate()
  const { responseId } = useParams({ strict: false }) as { responseId: string }
  const responseQuery = useStudentResponseQuery(responseId)

  if (responseQuery.isLoading) {
    return (
      <AdminShell>
        <StudentResponseListLoadingState />
      </AdminShell>
    )
  }

  if (responseQuery.isError || !responseQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Response not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This response may have been removed or the link is invalid.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void navigate({ to: '/student-responses' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to responses
            </Button>
            {responseQuery.isError ? (
              <Button size="sm" onClick={() => void responseQuery.refetch()}>
                Retry
              </Button>
            ) : null}
          </div>
          {responseQuery.isError ? (
            <div className="mt-8 w-full">
              <StudentResponseListErrorState
                onRetry={() => void responseQuery.refetch()}
              />
            </div>
          ) : null}
        </div>
      </AdminShell>
    )
  }

  return (
    <StudentResponseEditForm
      response={responseQuery.data}
      initialValues={studentResponseToFormValues(responseQuery.data)}
    />
  )
}

function StudentResponseEditForm({
  response,
  initialValues,
}: {
  response: StudentResponseListItem
  initialValues: StudentResponseFormValues
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useStudentResponseForm({
    mode: 'edit',
    responseId: response.id,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete response?',
      description: `This will permanently remove ${response.title}. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteStudentResponse(response.id)
            await queryClient.invalidateQueries({
              queryKey: studentResponseQueryKeys.all,
            })
            notify('success', {
              title: 'Response deleted',
              description: `${response.title} has been removed.`,
            })
            void navigate({ to: '/student-responses' })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete response',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/student-responses"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Student Responses
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Update Student Response
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit details for {response.title}.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <StudentResponseForm
            mode="edit"
            values={form.values}
            errors={form.errors}
            isSubmitting={form.isSubmitting}
            meta={{ createdAt: response.createdAt }}
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
