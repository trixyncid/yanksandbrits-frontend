import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  deleteProgram,
  programToFormValues,
} from '../api/programs-api'
import { programQueryKeys } from '../api/program-query-keys'
import { ProgramForm } from '../components/program-form'
import {
  ProgramListErrorState,
  ProgramListLoadingState,
} from '../components/program-list-states'
import { useProgramForm } from '../hooks/use-program-form'
import { useProgramQuery } from '../hooks/use-program-query'
import type { ProgramFormValues, ProgramListItem } from '../types/program'

export default function ProgramEditPage() {
  const navigate = useNavigate()
  const { programId } = useParams({ strict: false }) as { programId: string }
  const programQuery = useProgramQuery(programId)

  if (programQuery.isLoading) {
    return (
      <AdminShell>
        <ProgramListLoadingState />
      </AdminShell>
    )
  }

  if (programQuery.isError || !programQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Program not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This program may have been removed or the link is invalid.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void navigate({ to: '/programs' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to programs
            </Button>
            {programQuery.isError ? (
              <Button size="sm" onClick={() => void programQuery.refetch()}>
                Retry
              </Button>
            ) : null}
          </div>
          {programQuery.isError ? (
            <div className="mt-8 w-full">
              <ProgramListErrorState
                onRetry={() => void programQuery.refetch()}
              />
            </div>
          ) : null}
        </div>
      </AdminShell>
    )
  }

  return (
    <ProgramEditForm
      program={programQuery.data}
      initialValues={programToFormValues(programQuery.data)}
    />
  )
}

function ProgramEditForm({
  program,
  initialValues,
}: {
  program: ProgramListItem
  initialValues: ProgramFormValues
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useProgramForm({
    mode: 'edit',
    programId: program.id,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete program?',
      description: `This will permanently remove ${program.title}. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteProgram(program.id)
            await queryClient.invalidateQueries({
              queryKey: programQueryKeys.all,
            })
            notify('success', {
              title: 'Program deleted',
              description: `${program.title} has been removed.`,
            })
            void navigate({ to: '/programs' })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete program',
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
              Edit details for {program.title}.
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
            meta={{
              createdAt: program.createdAt,
              updatedAt: program.updatedAt,
              createdBy: program.createdBy ?? '',
            }}
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
