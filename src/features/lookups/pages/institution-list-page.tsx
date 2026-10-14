import type { ColumnDef } from '@tanstack/react-table'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Landmark, MapPin, Phone, Plus, UserRoundX, Users } from 'lucide-react'
import { useMemo, useState, type FormEvent } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import {
  ClearListFiltersButton,
  DataTable,
  DataTableColumnHeader,
  ListFilterSelect,
  ListToolbarFilters,
} from '../../../shared/components/data-table'
import {
  HeroPillButton,
  HeroSpotlight,
  ListErrorState,
  ListLoadingState,
  PageHero,
} from '../../../shared/components/page'
import { Input } from '../../../shared/components/ui/input'
import { Textarea } from '../../../shared/components/ui/textarea'
import { useSessionState } from '../../../shared/hooks/use-session-state'
import { cn } from '../../../shared/lib/cn'
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
import { LookupDialog, LookupField } from '../components/lookup-dialog'
import { LookupRowActions } from '../components/lookup-row-actions'

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

type InstitutionFilterState = { students: string }

const EMPTY_FILTERS: InstitutionFilterState = { students: '' }

const STUDENT_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'some', label: 'Has students' },
  { value: 'none', label: 'No students yet' },
]

function monogram(name: string) {
  const letters = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
  return (letters || '?').toUpperCase()
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
  const [filters, setFilters] = useSessionState<InstitutionFilterState>(
    'list-filters:institutions',
    { ...EMPTY_FILTERS },
  )

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
      title: `Delete ${item.name}?`,
      description: `This will permanently remove the institution ${item.name}. This action cannot be undone.`,
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
          <div className="flex min-w-[15rem] items-center gap-3 py-0.5">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-xs font-bold text-brand-700">
              {monogram(row.original.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {row.original.name}
              </p>
              <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-slate-500">
                <Phone className="size-3 shrink-0 text-slate-400" />
                {row.original.phone || 'No phone'}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'address',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Address" />
        ),
        cell: ({ row }) =>
          row.original.address ? (
            <p
              className="flex max-w-[420px] items-center gap-1.5 text-xs font-medium text-slate-600"
              title={row.original.address}
            >
              <MapPin className="size-3 shrink-0 text-slate-400" />
              <span className="truncate">{row.original.address}</span>
            </p>
          ) : (
            <span className="text-xs text-slate-400">-</span>
          ),
      },
      {
        accessorKey: 'totalStudent',
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title="Students" align="center" />
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tabular-nums',
                row.original.totalStudent > 0
                  ? 'bg-brand-50 text-brand-700'
                  : 'bg-canvas text-slate-500',
              )}
            >
              <Users className="size-3" />
              {row.original.totalStudent}
            </span>
          </div>
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
          <LookupRowActions
            module="institutions"
            noun="institution"
            name={row.original.name}
            onEdit={() => openEditDialog(row.original)}
            onDelete={() => void handleDelete(row.original)}
          />
        ),
      },
    ],
    [],
  )

  const allInstitutions = useMemo(
    () => institutionsQuery.data ?? [],
    [institutionsQuery.data],
  )
  const institutions = useMemo(
    () =>
      allInstitutions.filter((item) => {
        if (filters.students === 'some' && item.totalStudent <= 0) return false
        if (filters.students === 'none' && item.totalStudent > 0) return false
        return true
      }),
    [allInstitutions, filters.students],
  )
  const hasActiveFilters = Boolean(filters.students)
  const loaded = institutionsQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')

  const listFilters = (
    <ListToolbarFilters>
      <ListFilterSelect
        label="Students"
        ariaLabel="Filter by students"
        value={filters.students}
        onChange={(students) => setFilters({ students })}
        options={STUDENT_FILTER_OPTIONS}
      />
      <ClearListFiltersButton
        visible={hasActiveFilters}
        onClear={() => setFilters({ ...EMPTY_FILTERS })}
        className="h-10 rounded-full border-transparent bg-ink text-white hover:bg-ink-soft hover:text-white"
      />
    </ListToolbarFilters>
  )

  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="space-y-3">
        <PageHero
          eyebrow="Settings · Lists"
          title="Institutions"
          description="Schools and universities students come from. Staff pick from this list on student records."
          theme="mist"
          pattern="dots"
          stats={[
            {
              id: 'all',
              label: 'Institutions',
              value: stat(allInstitutions.length),
              icon: Landmark,
              hint: 'Show all institutions',
              active: !filters.students,
              onSelect: () => setFilters({ ...EMPTY_FILTERS }),
            },
            {
              id: 'students',
              label: 'Students linked',
              value: stat(
                allInstitutions.reduce(
                  (sum, item) => sum + item.totalStudent,
                  0,
                ),
              ),
              icon: Users,
              caption: 'Across all institutions',
            },
            {
              id: 'unused',
              label: 'Not used yet',
              value: stat(
                allInstitutions.filter((item) => item.totalStudent <= 0).length,
              ),
              icon: UserRoundX,
              hint: 'Show institutions with no students',
              active: filters.students === 'none',
              onSelect: () => setFilters({ students: 'none' }),
            },
          ]}
          spotlight={
            <Can module="institutions" action="add">
              <HeroSpotlight
                title="Add an institution"
                description="Missing from the list? Add it so staff can pick it."
                actions={
                  <HeroPillButton icon={Plus} onClick={openCreateDialog}>
                    Add institution
                  </HeroPillButton>
                }
              />
            </Can>
          }
        />

        {institutionsQuery.isLoading ? <ListLoadingState /> : null}

        {institutionsQuery.isError ? (
          <ListErrorState
            title="Unable to load institutions"
            description="Something went wrong while fetching institutions. You can try again."
            onRetry={() => void institutionsQuery.refetch()}
          />
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="All Institutions"
              description="Contact details and how many students come from each."
              totalLabel="institutions"
              columns={columns}
              data={institutions}
              searchPlaceholder="Search by name, phone, or address..."
              searchVariant="pill"
              globalFilterFn={filterInstitution}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No institutions match this filter'
                  : 'No institutions yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>

      <LookupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        icon={Landmark}
        eyebrow="Institution"
        title={editing ? `Edit ${editing.name}` : 'Add institution'}
        description="Shown as a choice on student records."
        submitLabel={editing ? 'Save changes' : 'Add institution'}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => setDialogOpen(false)}
        wide
      >
        <LookupField label="Institution name" htmlFor="institution-name" required>
          <Input
            id="institution-name"
            value={values.name}
            onChange={(event) =>
              setValues((v) => ({ ...v, name: event.target.value }))
            }
            placeholder="e.g. Universitas Indonesia"
          />
        </LookupField>

        <LookupField
          label="Phone"
          htmlFor="institution-phone"
          hint="Optional."
        >
          <Input
            id="institution-phone"
            value={values.phone}
            onChange={(event) =>
              setValues((v) => ({ ...v, phone: event.target.value }))
            }
            placeholder="e.g. +6221..."
          />
        </LookupField>

        <LookupField
          label="Address"
          htmlFor="institution-address"
          hint="Optional."
        >
          <Textarea
            id="institution-address"
            value={values.address}
            onChange={(event) =>
              setValues((v) => ({ ...v, address: event.target.value }))
            }
            placeholder="Street, city, postal code"
          />
        </LookupField>
      </LookupDialog>
    </AdminShell>
  )
}
