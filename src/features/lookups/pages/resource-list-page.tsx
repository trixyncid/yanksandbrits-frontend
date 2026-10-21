import type { ColumnDef } from '@tanstack/react-table'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { BadgeDollarSign, BadgeMinus, Megaphone, Plus } from 'lucide-react'
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
import { StatusToggle } from '../../../shared/components/ui/status-toggle'
import { useSessionState } from '../../../shared/hooks/use-session-state'
import { cn } from '../../../shared/lib/cn'
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
import { LookupDialog, LookupField } from '../components/lookup-dialog'
import { LookupRowActions } from '../components/lookup-row-actions'

type ResourceFormValues = {
  name: string
  isCommission: boolean
  isDigitalMarketing: boolean
}

const resourceQueryKey = ['resources', 'list'] as const

function formatDateTime(value: string) {
  if (!value) return '-'
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
    row.isDigitalMarketing ? 'digital marketing' : '',
    row.createdBy ?? '',
    row.updatedBy ?? '',
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(search)
}

type ResourceFilterState = { commission: string }

const EMPTY_FILTERS: ResourceFilterState = { commission: '' }

const COMMISSION_FILTER_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'yes', label: 'Earns commission' },
  { value: 'no', label: 'No commission' },
]

export default function ResourceListPage() {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<ResourceItem | null>(null)
  const [values, setValues] = useState<ResourceFormValues>({
    name: '',
    isCommission: true,
    isDigitalMarketing: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [filters, setFilters] = useSessionState<ResourceFilterState>(
    'list-filters:resources',
    { ...EMPTY_FILTERS },
  )

  const resourcesQuery = useQuery({
    queryKey: resourceQueryKey,
    queryFn: fetchResources,
  })

  function openCreateDialog() {
    setEditing(null)
    setValues({ name: '', isCommission: true, isDigitalMarketing: false })
    setDialogOpen(true)
  }

  function openEditDialog(item: ResourceItem) {
    setEditing(item)
    setValues({
      name: item.name,
      isCommission: item.isCommission,
      isDigitalMarketing: item.isDigitalMarketing,
    })
    setDialogOpen(true)
  }

  const handleDelete = useCallback(
    async (item: ResourceItem) => {
      requestDeleteConfirm({
        title: `Delete ${item.name}?`,
        description: `This will permanently remove the lead source ${item.name}. This action cannot be undone.`,
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
    },
    [queryClient],
  )

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
          <DataTableColumnHeader column={column} title="Lead Source" />
        ),
        cell: ({ row }) => (
          <div className="flex min-w-[14rem] items-center gap-3 py-0.5">
            <span
              className={cn(
                'inline-flex size-10 shrink-0 items-center justify-center rounded-2xl',
                row.original.isCommission
                  ? 'bg-brand-500 text-white'
                  : 'bg-canvas text-slate-500',
              )}
            >
              <Megaphone className="size-4" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900">
                {row.original.name}
              </p>
              <p className="mt-0.5 truncate text-xs text-slate-500">
                Added by {row.original.createdBy || 'unknown'}
              </p>
            </div>
          </div>
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
          <div className="text-center">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                row.original.isCommission
                  ? 'bg-brand-50 text-brand-700'
                  : 'bg-canvas text-slate-500',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'size-1.5 rounded-full',
                  row.original.isCommission ? 'bg-brand-500' : 'bg-slate-400',
                )}
              />
              {row.original.isCommission ? 'Earns commission' : 'No commission'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'isDigitalMarketing',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Digital Marketing"
            align="center"
          />
        ),
        cell: ({ row }) => (
          <div className="text-center">
            <span
              className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold',
                row.original.isDigitalMarketing
                  ? 'bg-violet-50 text-violet-700'
                  : 'bg-canvas text-slate-500',
              )}
            >
              <span
                aria-hidden
                className={cn(
                  'size-1.5 rounded-full',
                  row.original.isDigitalMarketing ? 'bg-violet-500' : 'bg-slate-400',
                )}
              />
              {row.original.isDigitalMarketing ? 'Counts' : 'Not counted'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'updatedAt',
        header: ({ column }) => (
          <DataTableColumnHeader
            column={column}
            title="Last Updated"
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
          <LookupRowActions
            module="resources"
            noun="lead source"
            name={row.original.name}
            onEdit={() => openEditDialog(row.original)}
            onDelete={() => void handleDelete(row.original)}
          />
        ),
      },
    ],
    [handleDelete],
  )

  const allResources = useMemo(
    () => resourcesQuery.data ?? [],
    [resourcesQuery.data],
  )
  const resources = useMemo(
    () =>
      allResources.filter((item) => {
        if (filters.commission === 'yes' && !item.isCommission) return false
        if (filters.commission === 'no' && item.isCommission) return false
        return true
      }),
    [allResources, filters.commission],
  )
  const hasActiveFilters = Boolean(filters.commission)
  const loaded = resourcesQuery.isSuccess
  const stat = (count: number) => (loaded ? count : '–')

  const listFilters = (
    <ListToolbarFilters>
      <ListFilterSelect
        label="Commission"
        ariaLabel="Filter by commission"
        value={filters.commission}
        onChange={(commission) => setFilters({ commission })}
        options={COMMISSION_FILTER_OPTIONS}
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
          title="Lead Sources"
          description="Where new students hear about us, such as Instagram or a friend. Also decides which leads count toward marketing commission."
          theme="mist"
          pattern="dots"
          stats={[
            {
              id: 'all',
              label: 'Lead sources',
              value: stat(allResources.length),
              icon: Megaphone,
              hint: 'Show all lead sources',
              active: !filters.commission,
              onSelect: () => setFilters({ ...EMPTY_FILTERS }),
            },
            {
              id: 'commission',
              label: 'Earn commission',
              value: stat(allResources.filter((item) => item.isCommission).length),
              icon: BadgeDollarSign,
              hint: 'Show sources that earn commission',
              active: filters.commission === 'yes',
              onSelect: () => setFilters({ commission: 'yes' }),
            },
            {
              id: 'no-commission',
              label: 'No commission',
              value: stat(allResources.filter((item) => !item.isCommission).length),
              icon: BadgeMinus,
              hint: 'Show sources that do not earn commission',
              active: filters.commission === 'no',
              onSelect: () => setFilters({ commission: 'no' }),
            },
          ]}
          spotlight={
            <Can module="resources" action="add">
              <HeroSpotlight
                title="Add a lead source"
                description="A new channel? Add it and choose if it earns commission."
                actions={
                  <HeroPillButton icon={Plus} onClick={openCreateDialog}>
                    Add lead source
                  </HeroPillButton>
                }
              />
            </Can>
          }
        />

        {resourcesQuery.isLoading ? <ListLoadingState /> : null}

        {resourcesQuery.isError ? (
          <ListErrorState
            title="Unable to load lead sources"
            description="Something went wrong while fetching lead sources. You can try again."
            onRetry={() => void resourcesQuery.refetch()}
          />
        ) : null}

        {loaded ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 fill-mode-both">
            <DataTable
              variant="soft"
              title="All Lead Sources"
              description="Used on prospective student records."
              totalLabel="sources"
              columns={columns}
              data={resources}
              searchPlaceholder="Search lead sources..."
              searchVariant="pill"
              globalFilterFn={filterResource}
              initialPageSize={10}
              emptyMessage={
                hasActiveFilters
                  ? 'No lead sources match this filter'
                  : 'No lead sources yet'
              }
              toolbarFilters={listFilters}
            />
          </div>
        ) : null}
      </div>

      <LookupDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        icon={Megaphone}
        eyebrow="Lead source"
        title={editing ? `Edit ${editing.name}` : 'Add lead source'}
        description="Shown as a choice on prospective student records."
        submitLabel={editing ? 'Save changes' : 'Add lead source'}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onCancel={() => setDialogOpen(false)}
      >
        <LookupField label="Source name" htmlFor="resource-name" required>
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
        </LookupField>

        <LookupField
          label="Marketing commission"
          htmlFor="resource-is-commission-active"
          hint={
            values.isCommission
              ? 'Students who come from this source count toward marketing commission.'
              : 'Students who come from this source do not count toward marketing commission.'
          }
        >
          <StatusToggle
            id="resource-is-commission"
            label=""
            value={values.isCommission}
            onChange={(isCommission) =>
              setValues((prev) => ({ ...prev, isCommission }))
            }
            activeLabel="Earns commission"
            inactiveLabel="No commission"
          />
        </LookupField>

        <LookupField
          label="Digital Marketing commission"
          htmlFor="resource-is-digital-marketing-active"
          hint={
            values.isDigitalMarketing
              ? 'Each student who enrolls from this source pays every Digital Marketing staff member their own rate.'
              : 'Student responses from this source do not count toward Digital Marketing commission.'
          }
        >
          <StatusToggle
            id="resource-is-digital-marketing"
            label=""
            value={values.isDigitalMarketing}
            onChange={(isDigitalMarketing) =>
              setValues((prev) => ({ ...prev, isDigitalMarketing }))
            }
            activeLabel="Counts"
            inactiveLabel="Not counted"
          />
        </LookupField>
      </LookupDialog>
    </AdminShell>
  )
}
