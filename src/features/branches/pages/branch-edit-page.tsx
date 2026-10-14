import { useNavigate, useParams } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Building2, MapPinOff, Star } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { EmptyState, PageHeader } from '../../../shared/components/page'
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
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-6xl">
          <BranchListLoadingState />
        </div>
      </AdminShell>
    )
  }

  if (branchQuery.isError || !branchQuery.data) {
    return (
      <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
        <div className="mx-auto max-w-2xl space-y-3">
          {branchQuery.isError ? (
            <BranchListErrorState onRetry={() => void branchQuery.refetch()} />
          ) : (
            <EmptyState
              icon={MapPinOff}
              title="Branch not found"
              description="This branch may have been removed, or the link is wrong."
            />
          )}
          <div className="flex justify-center">
            <Button
              variant="soft"
              size="sm"
              onClick={() => void navigate({ to: '/branches' })}
            >
              <ArrowLeft className="size-3.5" />
              Back to branches
            </Button>
          </div>
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
      title: `Delete ${branch.name}?`,
      description: `This will permanently remove the ${branch.name} branch. This action cannot be undone.`,
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
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/branches"
          backLabel="Branches"
          title={branch.name}
          description="Update this branch's name, contact details and address."
          icon={Building2}
          theme="ink"
          pattern="rings"
          badge={
            branch.isMain ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-white">
                <Star className="size-3 fill-current" />
                Main branch
              </span>
            ) : null
          }
        />

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
    </AdminShell>
  )
}
