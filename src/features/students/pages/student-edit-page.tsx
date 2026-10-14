import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, UserPen, UserX } from 'lucide-react'

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
import { useModulePermissions } from '../../auth/hooks/use-permissions'
import { deleteStudent, studentToFormValues } from '../api/students-api'
import { studentQueryKeys } from '../api/student-query-keys'
import { StudentForm } from '../components/student-form'
import { useStudentForm } from '../hooks/use-student-form'
import { useStudentQuery } from '../hooks/use-student-query'
import type { StudentDetail, StudentFormValues } from '../types/student'

export default function StudentEditPage() {
  const navigate = useNavigate()
  const { studentId } = useParams({ strict: false }) as { studentId: string }
  const studentQuery = useStudentQuery(studentId)

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
            icon={UserX}
            title="Student not found"
            description="This student may have been removed, or the link is no longer valid."
            action={
              <Button
                variant="ink"
                onClick={() => void navigate({ to: '/students' })}
              >
                <ArrowLeft className="size-4" />
                Back to students
              </Button>
            }
          />
        </div>
      </AdminShell>
    )
  }

  const student = studentQuery.data

  return (
    <StudentEditForm
      student={student}
      initialValues={studentToFormValues(student)}
    />
  )
}

function StudentEditForm({
  student,
  initialValues,
}: {
  student: StudentDetail
  initialValues: StudentFormValues
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { canDelete } = useModulePermissions('students')
  const form = useStudentForm({
    mode: 'edit',
    studentId: student.id,
    initialValues,
  })
  const isActive = form.values.status === 'active'
  const label = student.pin
    ? `${student.fullName} (${student.pin})`
    : student.fullName

  function handleDelete() {
    requestDeleteConfirm({
      title: `Delete ${student.fullName}?`,
      description: `This will permanently remove the student record for ${label}. This cannot be undone.`,
      confirmLabel: 'Delete student',
      onConfirm: () => {
        void deleteStudent(student.id)
          .then(async () => {
            await queryClient.invalidateQueries({
              queryKey: studentQueryKeys.all,
            })
            notify('success', {
              title: 'Student deleted',
              description: `${label} has been removed.`,
            })
            void navigate({ to: '/students' })
          })
          .catch((error) => {
            notify('error', {
              title: 'Unable to delete student',
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
          backTo={`/students/${student.id}`}
          backLabel="Student profile"
          title={form.values.fullName.trim() || student.fullName}
          description={
            form.values.pin.trim() ? (
              <>
                Editing <span className="font-mono">{form.values.pin.trim()}</span>
              </>
            ) : (
              'Editing student profile'
            )
          }
          icon={UserPen}
          theme="harbor"
          pattern="waves"
          badge={
            <span
              className={
                isActive
                  ? 'rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white'
                  : 'rounded-full bg-white/10 px-2.5 py-0.5 text-[11px] font-semibold text-white/70'
              }
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          }
        />

        <StudentForm
          mode="edit"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          meta={{
            createdAt: student.createdAt,
            updatedAt: student.updatedAt,
            createdBy: student.createdBy,
            updatedBy: student.updatedBy,
          }}
          onChange={form.updateField}
          onSubmit={form.submit}
          onCancel={form.cancel}
          onDelete={canDelete ? handleDelete : undefined}
        />
      </div>
    </AdminShell>
  )
}
