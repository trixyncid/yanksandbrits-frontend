import type { ColumnDef } from '@tanstack/react-table'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { DataTable, DataTableColumnHeader } from '../../../shared/components/data-table'
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
  createOccupation,
  deleteOccupation,
  fetchOccupations,
  updateOccupation,
  type OccupationItem,
} from '../api/lookups-api'

type OccupationFormValues = {
  name: string
}

const occupationQueryKey = ['occupations', 'list'] as const

function filterOccupation(row: OccupationItem, search: string) {
  const haystack = [row.name, String(row.totalStudent)].join(' ').toLowerCase()
  return haystack.includes(search)
}

export default function OccupationListPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<OccupationItem | null>(null)
  const [values, setValues] = useState<OccupationFormValues>({ name: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const occupationsQuery = useQuery({
    queryKey: occupationQueryKey,
    queryFn: fetchOccupations,
  })

  function openCreateDialog() {
    setEditing(null)
    setValues({ name: '' })
    setDialogOpen(true)
  }

  function openEditDialog(item: OccupationItem) {
    setEditing(item)
    setValues({
      name: item.name,
    })
    setDialogOpen(true)
  }

  async function handleDelete(item: OccupationItem) {
    requestDeleteConfirm({
      title: 'Delete occupation?',
      description: `This will permanently remove ${item.name}. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteOccupation(item.id)
            await queryClient.invalidateQueries({ queryKey: occupationQueryKey })
            notify('success', {
              title: 'Occupation deleted',
              description: `${item.name} has been removed.`,
            })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete occupation',
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
        title: 'Occupation name required',
        description: 'Please fill in the occupation name.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (editing) {
        const updated = await updateOccupation(editing.id, values)
        notify('success', {
          title: 'Occupation updated',
          description: `${updated.name} has been saved.`,
        })
      } else {
        const created = await createOccupation(values)
        notify('success', {
          title: 'Occupation created',
          description: `${created.name} has been added.`,
        })
      }
      await queryClient.invalidateQueries({ queryKey: occupationQueryKey })
      setDialogOpen(false)
    } catch (error) {
      notify('error', {
        title: editing ? 'Unable to update occupation' : 'Unable to create occupation',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = useMemo<ColumnDef<OccupationItem>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Occupation" />
        ),
        cell: ({ row }) => (
          <p className="text-sm font-semibold text-slate-900">{row.original.name}</p>
        ),
      },
      {
        accessorKey: 'totalStudent',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Students" align="center" />
        ),
        cell: ({ row }) => (
          <p className="text-center text-xs font-semibold text-slate-700">
            {row.original.totalStudent}
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
            <Can module="occupations" action="change">
              <button
                type="button"
                aria-label={`Edit occupation ${row.original.name}`}
                onClick={() => openEditDialog(row.original)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
              >
                <Pencil className="size-3.5" />
              </button>
            </Can>
            <Can module="occupations" action="delete">
              <button
                type="button"
                aria-label={`Delete occupation ${row.original.name}`}
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
        {occupationsQuery.isSuccess ? (
          <DataTable
            title="Occupation List"
            description="Manage occupation records used on student profiles."
            totalLabel="occupations"
            columns={columns}
            data={occupationsQuery.data}
            searchPlaceholder="Search occupation..."
            globalFilterFn={filterOccupation}
            initialPageSize={10}
            emptyMessage="No occupations found"
            toolbarActions={
              <Can module="occupations" action="add">
                <Button onClick={openCreateDialog}>
                  <Plus className="size-4" />
                  Add New Occupation
                </Button>
              </Can>
            }
          />
        ) : null}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Update Occupation' : 'Add New Occupation'}
              </DialogTitle>
              <DialogDescription>
                Manage occupation options used on student records.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="occupation-name">Occupation Name</Label>
              <Input
                id="occupation-name"
                value={values.name}
                onChange={(event) => setValues({ name: event.target.value })}
                placeholder="e.g. University Student"
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setDialogOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
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
