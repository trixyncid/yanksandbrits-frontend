import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { classroomQueryKeys } from '../api/classroom-query-keys'
import { ClassroomForm } from '../components/classroom-form'
import { classroomToFormValues } from '../data/classrooms-placeholder'
import { useClassroomForm } from '../hooks/use-classroom-form'
import { useClassroomsStore } from '../store/classrooms-store'

export default function ClassroomEditPage() {
  const navigate = useNavigate()
  const { classroomId } = useParams({ strict: false }) as {
    classroomId: string
  }
  const classroom = useClassroomsStore((state) => state.getById(classroomId))

  if (!classroom) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Classroom not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This classroom may have been removed or the link is invalid.
          </p>
          <Button
            className="mt-6"
            variant="secondary"
            size="sm"
            onClick={() => void navigate({ to: '/classrooms' })}
          >
            <ArrowLeft className="size-3.5" />
            Back to classrooms
          </Button>
        </div>
      </AdminShell>
    )
  }

  return (
    <ClassroomEditForm
      classroomId={classroom.id}
      className={classroom.className}
      initialValues={classroomToFormValues(classroom)}
      meta={{
        createdAt: classroom.createdAt,
        updatedAt: classroom.updatedAt,
        createdBy: classroom.createdBy,
      }}
    />
  )
}

function ClassroomEditForm({
  classroomId,
  className,
  initialValues,
  meta,
}: {
  classroomId: string
  className: string
  initialValues: ReturnType<typeof classroomToFormValues>
  meta: { createdAt: string; updatedAt: string; createdBy: string }
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const removeClassroom = useClassroomsStore((state) => state.remove)
  const form = useClassroomForm({
    mode: 'edit',
    classroomId,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete classroom?',
      description: `This will permanently remove ${className}. This action cannot be undone.`,
      onConfirm: () => {
        removeClassroom(classroomId)
        void queryClient.invalidateQueries({
          queryKey: classroomQueryKeys.all,
        })
        notify('success', {
          title: 'Classroom deleted',
          description: `${className} has been removed.`,
        })
        void navigate({ to: '/classrooms' })
      },
    })
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/classrooms"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Classrooms
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Update Classroom
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit details for {className}.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <ClassroomForm
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
