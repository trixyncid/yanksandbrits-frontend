import { Building2 } from 'lucide-react'

import { PageHeader } from '../../../shared/components/page'
import { AdminShell } from '../../admin/components/admin-shell'
import { BranchForm } from '../components/branch-form'
import { useBranchForm } from '../hooks/use-branch-form'

export default function BranchCreatePage() {
  const form = useBranchForm({ mode: 'create' })

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/branches"
          backLabel="Branches"
          title="Add branch"
          description="Set up a new school location for students and staff."
          icon={Building2}
          theme="ink"
          pattern="rings"
        />

        <BranchForm
          mode="create"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          onChange={form.updateField}
          onSubmit={form.submit}
          onCancel={form.cancel}
        />
      </div>
    </AdminShell>
  )
}
