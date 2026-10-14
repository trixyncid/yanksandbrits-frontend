import { CalendarRange } from 'lucide-react'

import { PageHeader } from '../../../shared/components/page'
import { AdminShell } from '../../admin/components/admin-shell'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { BookkeepingForm } from '../components/bookkeeping-form'
import { useBookkeepingForm } from '../hooks/use-bookkeeping-form'

export default function BookkeepingCreatePage() {
  const form = useBookkeepingForm({ mode: 'create' })
  const branchesQuery = useBranchesQuery()

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/bookkeeping"
          backLabel="Bookkeeping"
          title="Add payroll period"
          description="Create a payroll period. Approving it generates salary calculations."
          icon={CalendarRange}
          theme="dusk"
          pattern="waves"
        />

        <BookkeepingForm
          mode="create"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          branchOptions={branchesQuery.data?.data ?? []}
          branchesLoading={branchesQuery.isLoading}
          onChange={form.updateField}
          onSubmit={form.submit}
          onCancel={form.cancel}
        />
      </div>
    </AdminShell>
  )
}
