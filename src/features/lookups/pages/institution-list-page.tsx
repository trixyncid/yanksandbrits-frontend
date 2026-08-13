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
import { Textarea } from '../../../shared/components/ui/textarea'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { Can } from '../../auth/components/can'
import {
  createInstitution,
  deleteInstitution,
  fetchInstitutions,
  updateInstitution,
  type InstitutionItem,
} from '../api/lookups-api'

type InstitutionFormValues = {
  name: string
  address: string
  phone: string
}

const institutionQueryKey = ['institutions', 'list'] as const

function filterInstitution(row: InstitutionItem, search: string) {
  const haystack = [row.name, row.address, row.phone, String(row.totalStudent)]
    .join(' ')
    .toLowerCase()
  return haystack.includes(search)
}

export default function InstitutionListPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<InstitutionItem | null>(null)
  const [values, setValues] = useState<InstitutionFormValues>({
    name: '',
    address: '',
    phone: '',
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const institutionsQuery = useQuery({
    queryKey: institutionQueryKey,
    queryFn: fetchInstitutions,
  })

  function openCreateDialog() {
    setEditing(null)
    setValues({ name: '', address: '', phone: '' })
    setDialogOpen(true)
  }

  function openEditDialog(item: InstitutionItem) {
    setEditing(item)
    setValues({
      name: item.name,
      address: item.address,
      phone: item.phone,
    })
    setDialogOpen(true)
  }

  async function handleDelete(item: InstitutionItem) {
    requestDeleteConfirm({
      title: 'Delete institution?',
      description: `This will permanently remove ${item.name}. This action cannot be undone.`,
      onConfirm: () => {
        void (async () => {
          try {
            await deleteInstitution(item.id)
            await queryClient.invalidateQueries({ queryKey: institutionQueryKey })
            notify('success', {
              title: 'Institution deleted',
              description: `${item.name} has been removed.`,
            })
          } catch (error) {
            notify('error', {
              title: 'Unable to delete institution',
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
        title: 'Institution name required',
        description: 'Please fill in the institution name.',
      })
      return
    }

    setIsSubmitting(true)
    try {
      if (editing) {
        const updated = await updateInstitution(editing.id, values)
        notify('success', {
          title: 'Institution updated',
          description: `${updated.name} has been saved.`,
        })
      } else {
        const created = await createInstitution(values)
        notify('success', {
          title: 'Institution created',
          description: `${created.name} has been added.`,
        })
      }
      await queryClient.invalidateQueries({ queryKey: institutionQueryKey })
      setDialogOpen(false)
    } catch (error) {
      notify('error', {
        title: editing ? 'Unable to update institution' : 'Unable to create institution',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const columns = useMemo<ColumnDef<InstitutionItem>[]>(
    () => [
      {
        id: 'institution',
        accessorFn: (row) => `${row.name} ${row.phone}`,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Institution" />
        ),
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-semibold text-slate-900">{row.original.name}</p>
            <p className="mt-0.5 text-xs text-slate-500">{row.original.phone || '-'}</p>
          </div>
        ),
      },
      {
        accessorKey: 'address',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Address" />
        ),
        cell: ({ row }) => (
          <p className="max-w-[420px] truncate text-xs font-medium text-slate-600">
            {row.original.address || '-'}
          </p>
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
            <Can module="institutions" action="change">
              <button
                type="button"
                aria-label={`Edit institution ${row.original.name}`}
                onClick={() => openEditDialog(row.original)}
                className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
              >
                <Pencil className="size-3.5" />
              </button>
            </Can>
            <Can module="institutions" action="delete">
              <button
                type="button"
                aria-label={`Delete institution ${row.original.name}`}
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
        {institutionsQuery.isSuccess ? (
          <DataTable
            title="Institution List"
            description="Manage institutions and related student counts."
            totalLabel="institutions"
            columns={columns}
            data={institutionsQuery.data}
            searchPlaceholder="Search by name, phone, address..."
            globalFilterFn={filterInstitution}
            initialPageSize={10}
            emptyMessage="No institutions found"
            toolbarActions={
              <Can module="institutions" action="add">
                <Button onClick={openCreateDialog}>
                  <Plus className="size-4" />
                  Add New Institution
                </Button>
              </Can>
            }
          />
        ) : null}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-5">
            <DialogHeader>
              <DialogTitle>
                {editing ? 'Update Institution' : 'Add New Institution'}
              </DialogTitle>
              <DialogDescription>
                Manage institution details used on student records.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-2">
              <Label htmlFor="institution-name">Institution Name</Label>
              <Input
                id="institution-name"
                value={values.name}
                onChange={(event) => setValues((v) => ({ ...v, name: event.target.value }))}
                placeholder="e.g. Universitas Indonesia"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution-phone">Phone</Label>
              <Input
                id="institution-phone"
                value={values.phone}
                onChange={(event) => setValues((v) => ({ ...v, phone: event.target.value }))}
                placeholder="e.g. +6221..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="institution-address">Address</Label>
              <Textarea
                id="institution-address"
                value={values.address}
                onChange={(event) => setValues((v) => ({ ...v, address: event.target.value }))}
                placeholder="Street, city, postal code"
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
