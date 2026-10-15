import type { ColumnDef } from '@tanstack/react-table'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BriefcaseBusiness, Plus, UserRoundX, Users } from 'lucide-react'
import { useCallback, useMemo, useState, type FormEvent } from 'react'

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
import { useSessionState } from '../../../shared/hooks/use-session-state'
import { cn } from '../../../shared/lib/cn'
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
import { LookupDialog, LookupField } from '../components/lookup-dialog'
import { LookupRowActions } from '../components/lookup-row-actions'

type OccupationFormValues = {
  name: string
}

const occupationQueryKey = ['occupations', 'list'] as const

function filterOccupation(row: OccupationItem, search: string) {
  const haystack = [row.name, String(row.totalStudent)].join(' ').toLowerCase()
  return haystack.includes(search)
}

type OccupationFilterState = { students: string }

const EMPTY_FILTERS: OccupationFilterState = { students: '' }

const STUDENT_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'some', label: 'Has students' },
  { value: 'none', label: 'No students yet' },
]

export default function OccupationListPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<OccupationItem | null>(null)
  const [values, setValues] = useState<OccupationFormValues>({ name: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filters, setFilters] = useSessionState<OccupationFilterState>(
    'list-filters:occupations',
    { ...EMPTY_FILTERS },
  )

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

  const handleDelete = useCallback(
    async (item: OccupationItem) => {
      requestDeleteConfirm({
        title: `Delete ${item.name}?`,
        description: `This will permanently remove the occupation ${item.name}. This action cannot be undone.`,
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
    },
    [queryClient],
  )

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
          <div className="flex min-w-[14rem] items-center gap-3 py-0.5">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-ink">
              <BriefcaseBusiness className="size-4" strokeWidth={1.9} />
            </span>
            <p className="truncate text-sm font-semibold text-slate-900">
              {row.original.name}
            </p>
          </div>
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
            module="occupations"
            noun="occupation"
            name={row.original.name}
            onEdit={() => openEditDialog(row.original)}
            onDelete={() => void handleDelete(row.original)}
          />
        ),
      },
    ],
    [handleDelete],
  )

  const allOccupations = useMemo(
    () => occupationsQuery.data ?? [],
    [occupationsQuery.data],
  )
  const occupations = useMemo(
    () =>
      allOccupations.filter((item) => {
        if (filters.students === 'some' && item.totalStudent <= 0) return false
        if (filters.students === 'none' && item.totalStudent > 0) return false
        return true
      }),
    [allOccupations, filters.students],
  )
  const hasActiveFilters = Boolean(filters.students)
  const loaded = occupationsQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')
  const mostCommon = allOccupations.reduce<OccupationItem | null>(
    (best, item) =>
      item.totalStudent > (best?.totalStudent ?? 0) ? item : best,
    null,
  )

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
          title="Occupations"
          description="What students do day to day, such as working or studying. Staff pick from this list on student records."
          theme="mist"
          pattern="dots"
          stats={[
            {
              id: 'all',
              label: 'Occupations',
              value: stat(allOccupations.length),
              icon: BriefcaseBusiness,
              caption: mostCommon ? `Most common: ${mostCommon.name}` : undefined,
              hint: 'Show all occupations',
              active: !filters.students,
              onSelect: () => setFilters({ ...EMPTY_FILTERS }),
            },
            {
              id: 'students',
              label: 'Students linked',
              value: stat(
                allOccupations.reduce((sum, item) => sum + item.totalStudent, 0),
              ),
              icon: Users,
              caption: 'Across all occupations',
            },
            {
              id: 'unused',
              label: 'Not used yet',
              value: stat(
                allOccupations.filter((item) => item.totalStudent <= 0).length,
              ),
              icon: UserRoundX,
              hint: 'Show occupations with no students',
              active: filters.students === 'none',
              onSelect: () => setFilters({ students: 'none' }),
            },
          ]}
          spotlight={
            <Can module="occupations" action="add">
              <HeroSpotlight
                title="Add an occupation"
                description="Give staff another option to choose from."
                actions={
                  <HeroPillButton icon={Plus} onClick={openCreateDialog}>
                    Add occupation
                  </HeroPillButton>
                }
              />
            </Can>
          }
        />

        {occupationsQuery.isLoading ? <ListLoadingState /> : null}

        {occupationsQuery.isError ? (
          <ListErrorState
            title="Unable to load occupations"
            description="Something went wrong while fetching occupations. You can try again."
            onRetry={() => void occupationsQuery.refetch()}
          />
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="All Occupations"
              description="Each option and how many students have it."
              totalLabel="occupations"
              columns={columns}
              data={occupations}
              searchPlaceholder="Search occupations..."
              searchVariant="pill"
              globalFilterFn={filterOccupation}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No occupations match this filter'
                  : 'No occupations yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>

      <LookupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        icon={BriefcaseBusiness}
        eyebrow="Occupation"
        title={editing ? `Edit ${editing.name}` : 'Add occupation'}
        description="Shown as a choice on student records."
        submitLabel={editing ? 'Save changes' : 'Add occupation'}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => setDialogOpen(false)}
      >
        <LookupField label="Occupation name" htmlFor="occupation-name" required>
          <Input
            id="occupation-name"
            value={values.name}
            onChange={(event) => setValues({ name: event.target.value })}
            placeholder="e.g. University Student"
          />
        </LookupField>
      </LookupDialog>
    </AdminShell>
  )
}
