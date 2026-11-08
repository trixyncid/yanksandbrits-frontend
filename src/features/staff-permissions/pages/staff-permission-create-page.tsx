import { ShieldPlus } from 'lucide-react'

import { PageHeader } from '../../../shared/components/page'
import { AdminShell } from '../../admin/components/admin-shell'
import { StaffPermissionForm } from '../components/staff-permission-form'
import { useStaffPermissionForm } from '../hooks/use-staff-permission-form'

export default function StaffPermissionCreatePage() {
  const form = useStaffPermissionForm({ mode: 'create' })

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/staff-permissions"
          backLabel="Roles"
          title="New role"
          description="Give the role a name people will recognise, then tick only the pages and actions it should allow."
          icon={ShieldPlus}
          theme="ink"
          pattern="grid"
        />

        <StaffPermissionForm
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
