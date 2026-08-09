import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  deleteProspectiveStudent,
  prospectiveStudentToFormValues,
} from '../api/prospective-students-api'
import { prospectiveStudentQueryKeys } from '../api/prospective-student-query-keys'
import { ProspectiveStudentForm } from '../components/prospective-student-form'
import { useProspectiveStudentForm } from '../hooks/use-prospective-student-form'
import { useProspectiveStudentQuery } from '../hooks/use-prospective-student-query'
import type { ProspectiveStudentFormValues } from '../types/prospective-student'

export default function ProspectiveStudentEditPage() {
  const navigate = useNavigate()
  const { prospectiveStudentId } = useParams({ strict: false }) as { prospectiveStudentId: string }
  const studentQuery = useProspectiveStudentQuery(prospectiveStudentId)

  if (studentQuery.isLoading) {
    return (
      <AdminShell>
        <div className="mx-auto max-w-3xl px-6 py-20 text-center text-sm text-slate-500">
          Loading prospective student...
        </div>
      </AdminShell>
    )
  }

  if (studentQuery.isError || !studentQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Prospective student not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This lead may have been removed or the link is invalid.
          </p>
          <Button
            className="mt-6"
            variant="secondary"
            size="sm"
            onClick={() => void navigate({ to: '/prospective-students' })}
          >
            <ArrowLeft className="size-3.5" />
            Back to prospective students
          </Button>
        </div>
      </AdminShell>
    )
  }

  const student = studentQuery.data

  return (
    <ProspectiveStudentEditForm
      prospectiveStudentId={student.id}
      fullName={student.fullName}
      initialValues={prospectiveStudentToFormValues(student)}
      meta={{ createdAt: student.createdAt, updatedAt: student.updatedAt }}
    />
  )
}

function ProspectiveStudentEditForm({
  prospectiveStudentId,
  fullName,
  initialValues,
  meta,
}: {
  prospectiveStudentId: string
  fullName: string
  initialValues: ProspectiveStudentFormValues
  meta: { createdAt: string; updatedAt: string }
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useProspectiveStudentForm({
    mode: 'edit',
    prospectiveStudentId,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete prospective student?',
      description: `This will permanently remove ${fullName}. This action cannot be undone.`,
      onConfirm: () => {
        void deleteProspectiveStudent(prospectiveStudentId)
          .then(async () => {
            await queryClient.invalidateQueries({
              queryKey: prospectiveStudentQueryKeys.all,
            })
            notify('success', {
              title: 'Prospective student deleted',
              description: `${fullName} has been removed.`,
            })
            void navigate({ to: '/prospective-students' })
          })
          .catch((error) => {
            notify('error', {
              title: 'Unable to delete prospective student',
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
              to="/prospective-students"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Prospective Students
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Update Prospective Student
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit lead details for {fullName}.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <ProspectiveStudentForm
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
