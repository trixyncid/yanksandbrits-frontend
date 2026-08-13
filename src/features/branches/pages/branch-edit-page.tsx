import { Link, useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import {
  branchToFormValues,
  deleteBranch,
} from '../api/branches-api'
import { branchQueryKeys } from '../api/branch-query-keys'
import { BranchForm } from '../components/branch-form'
import {
  BranchListErrorState,
  BranchListLoadingState,
} from '../components/branch-list-states'
import { useBranchForm } from '../hooks/use-branch-form'
import { useBranchQuery } from '../hooks/use-branch-query'
import type { BranchFormValues, BranchListItem } from '../types/branch'

export default function BranchEditPage() {
  const navigate = useNavigate()
  const { branchId } = useParams({ strict: false }) as { branchId: string }
  const branchQuery = useBranchQuery(branchId)

  if (branchQuery.isLoading) {
    return (
      <AdminShell>
        <BranchListLoadingState />
      </AdminShell>
    )
  }

  if (branchQuery.isError || !branchQuery.data) {
    return (
      <AdminShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">
            Branch not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This branch may have been removed or the link is invalid.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void navigate({ to: '/branches' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to branches
            </Button>
            {branchQuery.isError ? (
              <Button
                size="sm"
                onClick={() => void branchQuery.refetch()}
              >
                Retry
              </Button>
            ) : null}
          </div>
          {branchQuery.isError ? (
            <div className="mt-8 w-full">
              <BranchListErrorState
                onRetry={() => void branchQuery.refetch()}
              />
            </div>
          ) : null}
        </div>
      </AdminShell>
    )
  }

  return (
    <BranchEditForm
      branch={branchQuery.data}
      initialValues={branchToFormValues(branchQuery.data)}
    />
  )
}

function BranchEditForm({
  branch,
  initialValues,
}: {
  branch: BranchListItem
  initialValues: BranchFormValues
}) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const form = useBranchForm({
    mode: 'edit',
    branchId: branch.id,
    initialValues,
  })

  function handleDelete() {
    requestDeleteConfirm({
      title: 'Delete branch?',
      description: `This will permanently remove ${branch.name}. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteBranch(branch.id)
            await queryClient.invalidateQueries({
              queryKey: branchQueryKeys.all,
            })
            notify('success', {
              title: 'Branch deleted',
              description: `${branch.name} has been removed.`,
            })
            void navigate({ to: '/branches' })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete branch',
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
              to="/branches"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Branches
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Update Branch
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Edit details for {branch.name}.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
          <BranchForm
            mode="edit"
            values={form.values}
            errors={form.errors}
            isSubmitting={form.isSubmitting}
            meta={{
              createdAt: branch.createdAt,
              updatedAt: branch.updatedAt,
              createdBy: branch.createdBy,
              totalStudent: branch.totalStudent,
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
