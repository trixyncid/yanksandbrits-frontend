import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { StaffPermissionForm } from '../components/staff-permission-form'
import { useStaffPermissionForm } from '../hooks/use-staff-permission-form'

export default function StaffPermissionCreatePage() {
  const form = useStaffPermissionForm({ mode: 'create' })

  return (
    <AdminShell>
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-end justify-between gap-4">
          <div>
            <Link
              to="/staff-permissions"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Staff Roles
            </Link>
            <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900">
              New role
            </h2>
            <p className="mt-1 max-w-xl text-sm text-slate-500">
              Give the role a name people will recognize, then tick only the
              pages and actions they should be allowed to use.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <StaffPermissionForm
          mode="create"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          onChange={form.updateField}
          onTogglePermission={form.togglePermission}
          onSetPermissionGroup={form.setPermissionGroup}
          onSubmit={form.submit}
          onCancel={form.cancel}
        />
      </div>
    </AdminShell>
  )
}
