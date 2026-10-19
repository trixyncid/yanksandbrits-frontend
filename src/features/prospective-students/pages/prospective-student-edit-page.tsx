import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Inbox } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import {
  EmptyState,
  ListLoadingState,
  PageHeader,
} from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  deleteProspectiveStudent,
  prospectiveStudentToFormValues,
} from '../api/prospective-students-api'
import { prospectiveStudentQueryKeys } from '../api/prospective-student-query-keys'
import { LeadStatusPill } from '../components/lead-status-pill'
import { ProspectiveStudentForm } from '../components/prospective-student-form'
import { useProspectiveStudentForm } from '../hooks/use-prospective-student-form'
import { useProspectiveStudentQuery } from '../hooks/use-prospective-student-query'
import type {
  ProspectiveStudentFormValues,
  ProspectiveStudentStatus,
} from '../types/prospective-student'

export default function ProspectiveStudentEditPage() {
  const navigate = useNavigate()
  const { prospectiveStudentId } = useParams({ strict: false }) as {
    prospectiveStudentId: string
  }
  const studentQuery = useProspectiveStudentQuery(prospectiveStudentId)

  if (studentQuery.isLoading) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl">
          <ListLoadingState rows={6} />
        </div>
      </AdminShell>
    )
  }

  if (studentQuery.isError || !studentQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-2xl">
          <EmptyState
            icon={Inbox}
            title="Lead not found"
            description="This student response may have been removed or the link is out of date."
            action={
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="ink"
                  onClick={() => void navigate({ to: '/prospective-students' })}
                >
                  <ArrowLeft className="size-4" />
                  Back to student responses
                </Button>
                {studentQuery.isError ? (
                  <Button
                    variant="soft"
                    onClick={() => void studentQuery.refetch()}
                  >
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

  const student = studentQuery.data

  return (
    <ProspectiveStudentEditForm
      prospectiveStudentId={student.id}
      fullName={student.fullName}
      status={student.status}
      initialValues={prospectiveStudentToFormValues(student)}
      meta={{
        createdAt: student.createdAt,
        updatedAt: student.updatedAt,
        branch: student.branch,
        referralStudentName: student.referralStudentName,
      }}
    />
  )
}

function ProspectiveStudentEditForm({
  prospectiveStudentId,
  fullName,
  status,
  initialValues,
  meta,
}: {
  prospectiveStudentId: string
  fullName: string
  status: ProspectiveStudentStatus
  initialValues: ProspectiveStudentFormValues
  meta: {
    createdAt: string
    updatedAt: string
    branch: string
    referralStudentName: string
  }
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
      title: `Delete ${fullName}?`,
      description: `This permanently removes the lead for ${fullName}, including their contact and consult details. This cannot be undone.`,
      confirmLabel: 'Delete lead',
      onConfirm: () => {
        void deleteProspectiveStudent(prospectiveStudentId)
          .then(async () => {
            await queryClient.invalidateQueries({
              queryKey: prospectiveStudentQueryKeys.all,
            })
            notify('success', {
              title: 'Lead deleted',
              description: `${fullName} has been removed.`,
            })
            void navigate({ to: '/prospective-students' })
          })
          .catch((error) => {
            notify('error', {
              title: 'Unable to delete lead',
              description: getApiErrorMessage(error),
            })
          })
      },
    })
  }

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/prospective-students"
          backLabel="Student Responses"
          title={fullName}
          description={
            meta.branch && meta.branch !== '—'
              ? `Editing lead · ${meta.branch}`
              : 'Editing lead'
          }
          icon={Inbox}
          theme="sky"
          pattern="ribbons"
          badge={<LeadStatusPill status={status} className="bg-white" />}
        />

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
    </AdminShell>
  )
}
