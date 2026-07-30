import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useMemo } from 'react'

import { Button } from '../../../shared/components/ui/button'
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
    <AdminShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/classrooms"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Classrooms
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Add New Classroom
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Create a room that can be used for class sessions.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
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
      </div>
    </AdminShell>
  )
}
