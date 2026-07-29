import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { programQueryKeys } from '../api/program-query-keys'
import { ProgramForm } from '../components/program-form'
import { programToFormValues } from '../data/programs-placeholder'
import { useProgramForm } from '../hooks/use-program-form'
import { useProgramsStore } from '../store/programs-store'

export default function ProgramEditPage() {
  const navigate = useNavigate()
  const { programId } = useParams({ strict: false }) as { programId: string }
  const program = useProgramsStore((state) => state.getById(programId))

  if (!program) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Program not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This program may have been removed or the link is invalid.
          </p>
          <Button
            className="mt-6"
            variant="secondary"
            size="sm"
            onClick={() => void navigate({ to: '/programs' })}
          >
            <ArrowLeft className="size-3.5" />
            Back to programs
          </Button>
        </div>
      </AdminShell>
    )
  }

  return (
    <ProgramEditForm
      programId={program.id}
      title={program.title}
      initialValues={programToFormValues(program)}
      meta={{
        createdAt: program.createdAt,
        updatedAt: program.updatedAt,
        createdBy: program.createdBy,
      }}
    />
  )
}

function ProgramEditForm({
  programId,
  title,
  initialValues,
  meta,
}: {
  programId: string
  title: string
  initialValues: ReturnType<typeof programToFormValues>
  meta: { createdAt: string; updatedAt: string; createdBy: string }
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const removeProgram = useProgramsStore((state) => state.remove)
  const form = useProgramForm({
    mode: 'edit',
    programId,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete program?',
      description: `This will permanently remove ${title}. This action cannot be undone.`,
      onConfirm: () => {
        removeProgram(programId)
        void queryClient.invalidateQueries({
          queryKey: programQueryKeys.all,
        })
        notify('success', {
          title: 'Program deleted',
          description: `${title} has been removed.`,
        })
        void navigate({ to: '/programs' })
      },
    })
  }

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/programs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Programs
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Update Program
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
          <ProgramForm
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
