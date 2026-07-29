import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { studentResponseQueryKeys } from '../api/student-response-query-keys'
import { StudentResponseForm } from '../components/student-response-form'
import { studentResponseToFormValues } from '../data/student-responses-placeholder'
import { useStudentResponseForm } from '../hooks/use-student-response-form'
import { useStudentResponsesStore } from '../store/student-responses-store'

export default function StudentResponseEditPage() {
  const navigate = useNavigate()
  const { responseId } = useParams({ strict: false }) as { responseId: string }
  const response = useStudentResponsesStore((state) =>
    state.getById(responseId),
  )

  if (!response) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Response not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This response may have been removed or the link is invalid.
          </p>
          <Button
            className="mt-6"
            variant="secondary"
            size="sm"
            onClick={() => void navigate({ to: '/student-responses' })}
          >
            <ArrowLeft className="size-3.5" />
            Back to responses
          </Button>
        </div>
      </AdminShell>
    )
  }

  return (
    <StudentResponseEditForm
      responseId={response.id}
      title={response.title}
      initialValues={studentResponseToFormValues(response)}
      meta={{ createdAt: response.createdAt }}
    />
  )
}

function StudentResponseEditForm({
  responseId,
  title,
  initialValues,
  meta,
}: {
  responseId: string
  title: string
  initialValues: ReturnType<typeof studentResponseToFormValues>
  meta: { createdAt: string }
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const removeResponse = useStudentResponsesStore((state) => state.remove)
  const form = useStudentResponseForm({
    mode: 'edit',
    responseId,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete response?',
      description: `This will permanently remove ${title}. This action cannot be undone.`,
      onConfirm: () => {
        removeResponse(responseId)
        void queryClient.invalidateQueries({
          queryKey: studentResponseQueryKeys.all,
        })
        notify('success', {
          title: 'Response deleted',
          description: `${title} has been removed.`,
        })
        void navigate({ to: '/student-responses' })
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
              Edit details for {title}.
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
