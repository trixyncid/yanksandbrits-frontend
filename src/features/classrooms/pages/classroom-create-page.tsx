import { DoorOpen } from 'lucide-react'
import { useMemo } from 'react'

import { PageHeader } from '../../../shared/components/page'
import { AdminShell } from '../../admin/components/admin-shell'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { ClassroomForm } from '../components/classroom-form'
import { useClassroomForm } from '../hooks/use-classroom-form'

export default function ClassroomCreatePage() {
  const form = useClassroomForm({ mode: 'create' })
  const branchesQuery = useBranchesQuery()
  const branchOptions = useMemo(
    () =>
      (branchesQuery.data?.data ?? []).map((branch) => ({
        id: branch.id,
        name: branch.name,
      })),
    [branchesQuery.data?.data],
  )

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/classrooms"
          backLabel="Classrooms"
          title="Add classroom"
          description="Add a room that classes at this branch can be booked into."
          icon={DoorOpen}
          theme="mist"
          pattern="grid"
        />

        <ClassroomForm
          mode="create"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          branchOptions={branchOptions}
          branchesLoading={branchesQuery.isLoading}
          onChange={form.updateField}
          onSubmit={form.submit}
          onCancel={form.cancel}
        />
      </div>
    </AdminShell>
  )
}
