import { useSearch } from '@tanstack/react-router'
import { CalendarPlus } from 'lucide-react'

import { PageHeader } from '../../../shared/components/page'
import { AdminShell } from '../../admin/components/admin-shell'
import { emptyPaidLeaveFormValues } from '../api/paid-leaves-api'
import { PaidLeaveForm } from '../components/paid-leave-form'
import { usePaidLeaveForm } from '../hooks/use-paid-leave-form'

export default function PaidLeaveCreatePage() {
  const { userId } = useSearch({ strict: false }) as { userId?: string }
  const form = usePaidLeaveForm({
    mode: 'create',
    initialValues: {
      ...emptyPaidLeaveFormValues,
      userId: userId ?? '',
    },
  })

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/paid-leaves"
          backLabel="Paid Leave"
          title="Record paid leave"
          description="Add days off for a staff member or tutor. Approved leave comes off their balance."
          icon={CalendarPlus}
          theme="mist"
          pattern="waves"
        />

        <PaidLeaveForm
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
