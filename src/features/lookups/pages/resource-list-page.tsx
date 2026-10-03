import type { ColumnDef } from '@tanstack/react-table'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import {
  DataTable,
  DataTableBadge,
  DataTableColumnHeader,
} from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import {
  createResource,
  deleteResource,
  fetchResources,
  updateResource,
  type ResourceItem,
} from '../api/lookups-api'

type ResourceFormValues = {
  name: string
  isCommission: boolean
}

const resourceQueryKey = ['resources', 'list'] as const

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function filterResource(row: ResourceItem, search: string) {
  const haystack = [
    row.name,
    row.isCommission ? 'commission' : 'no commission',
    row.createdBy ?? '',
    row.updatedBy ?? '',
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(search)
}

export default function ResourceListPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ResourceItem | null>(null)
  const [values, setValues] = useState<ResourceFormValues>({
    name: '',
    isCommission: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resourcesQuery = useQuery({
    queryKey: resourceQueryKey,
    queryFn: fetchResources,
  })

  function openCreateDialog() {
    setEditing(null)
    setValues({ name: '', isCommission: true })
    setDialogOpen(true)
  }

  function openEditDialog(item: ResourceItem) {
    setEditing(item)
    setValues({
      name: item.name,
      isCommission: item.isCommission,
    })
    setDialogOpen(true)
  }

  async function handleDelete(item: ResourceItem) {
    requestDeleteConfirm({
      title: 'Delete resource?',
      description: `This will permanently remove ${item.name}. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteResource(item.id)
            await queryClient.invalidateQueries({ queryKey: resourceQueryKey })
            notify('success', {
              title: 'Resource deleted',
              description: `${item.name} has been removed.`,
            })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete resource',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!values.name.trim()) {
      notify('error', {
        title: 'Resource name required',
        description: 'Please fill in the resource name.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (editing) {
        const updated = await updateResource(editing.id, values)
        notify('success', {
          title: 'Resource updated',
          description: `${updated.name} has been saved.`,
        })
      } else {
        const created = await createResource(values)
        notify('success', {
          title: 'Resource created',
          description: `${created.name} has been added.`,
        })
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: resourceQueryKey }),
        queryClient.invalidateQueries({ queryKey: ['lookups', 'resources'] }),
      ])
      setDialogOpen(false)
    } catch (error) {
      notify('error', {
        title: editing ? 'Unable to update resource' : 'Unable to create resource',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = useMemo<ColumnDef<ResourceItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Resource Name" />
        ),
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-slate-900">{row.original.name}</p>
        ),
      },
      {
        accessorKey: 'isCommission',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Commission"
            align="center"
          />
        ),
        cell: ({ row }) => (
          <div className="flex justify-center">
            {row.original.isCommission ? (
              <DataTableBadge tone="info">Eligible</DataTableBadge>
            ) : (
              <DataTableBadge tone="neutral">Excluded</DataTableBadge>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'createdBy',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Created By"
            align="center"
          />
        ),
        cell: ({ row }) => (
          <p className="text-center text-xs font-medium text-slate-600">
            {row.original.createdBy || '—'}
          </p>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Updated At"
            align="center"
          />
        ),
        cell: ({ row }) => (
          <p className="text-center text-xs font-medium text-slate-600">
            {formatDateTime(row.original.updatedAt)}
          </p>
        ),
      },
      {
        id: 'actions',
        enableSorting: false,
        size: 120,
        meta: { sticky: 'right' },
        header: () => (
          <span className="block text-center text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
            Action
          </span>
        ),
        cell: ({ row }) => (
          <div className="flex items-center justify-center gap-2">
            <Can module="resources" action="change">
              <button
                type="button"
                aria-label={`Edit resource ${row.original.name}`}
                onClick={() => openEditDialog(row.original)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#C8D4F5] hover:bg-[#F5F8FF] hover:text-[#1B2A5A]"
              >
                <Pencil className="size-3.5" />
              </button>
            </Can>
            <Can module="resources" action="delete">
              <button
                type="button"
                aria-label={`Delete resource ${row.original.name}`}
                onClick={() => void handleDelete(row.original)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
              >
                <Trash2 className="size-3.5" />
              </button>
            </Can>
          </div>
        ),
      },
    ],
    [],
  )

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-3">
        {resourcesQuery.isSuccess ? (
          <DataTable
            title="Resource List"
            description="Manage lead sources used on prospective student records."
            totalLabel="resources"
            columns={columns}
            data={resourcesQuery.data}
            searchPlaceholder="Search resource..."
            globalFilterFn={filterResource}
            initialPageSize={10}
            emptyMessage="No resources found"
            toolbarActions={
              <Can module="resources" action="add">
                <Button onClick={openCreateDialog}>
                  <Plus className="size-4" />
                  Add New Resource
                </Button>
              </Can>
            }
          />
        ) : null}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          showClose
          className="overflow-hidden p-0 sm:max-w-lg"
        >
          <form
            onSubmit={handleSubmit}
            className="flex max-h-[90vh] flex-col"
          >
            <div className="shrink-0 bg-[linear-gradient(135deg,#E8EEFF_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1] ring-1 ring-[#C8D4F5]">
                {editing ? (
                  <Pencil className="size-5" />
                ) : (
                  <Plus className="size-5" />
                )}
              </div>
              <DialogHeader className="pr-0">
                <DialogTitle>
                  {editing ? 'Update Resource' : 'Add New Resource'}
                </DialogTitle>
                <DialogDescription>
                  Manage lead source options used on prospective students.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
              <div className="space-y-2">
                <Label htmlFor="resource-name">Resource Name</Label>
                <Input
                  id="resource-name"
                  value={values.name}
                  onChange={(event) =>
                    setValues((prev) => ({
                      ...prev,
                      name: event.target.value,
                    }))
                  }
                  placeholder="e.g. Instagram"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="resource-is-commission">Commission</Label>
                <label
                  htmlFor="resource-is-commission"
                  className="flex h-12 cursor-pointer items-center gap-3 rounded-full border border-slate-200/80 bg-white px-4 text-sm text-slate-600 shadow-sm"
                >
                  <input
                    id="resource-is-commission"
                    type="checkbox"
                    className="size-4 rounded border-slate-300 text-[#253CA1] focus:ring-[#253CA1]/40"
                    checked={values.isCommission}
                    onChange={(event) =>
                      setValues((prev) => ({
                        ...prev,
                        isCommission: event.target.checked,
                      }))
                    }
                  />
                  <span>
                    {values.isCommission
                      ? 'Eligible for marketing commission'
                      : 'Excluded from marketing commission'}
                  </span>
                </label>
              </div>
            </div>

            <DialogFooter className="mt-0 shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm" disabled={isSubmitting}>
                {editing ? (
                  <Pencil className="size-3.5" />
                ) : (
                  <Plus className="size-3.5" />
                )}
                {isSubmitting
                  ? editing
                    ? 'Updating...'
                    : 'Saving...'
                  : editing
                    ? 'Update Data'
                    : 'Submit Data'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </AdminShell>
  )
}
