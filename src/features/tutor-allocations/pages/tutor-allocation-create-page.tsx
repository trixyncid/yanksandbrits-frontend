import { UsersRound } from 'lucide-react'

import { PageHeader } from '../../../shared/components/page'
import { AdminShell } from '../../admin/components/admin-shell'
import { TutorAllocationForm } from '../components/tutor-allocation-form'
import { useTutorAllocationForm } from '../hooks/use-tutor-allocation-form'

export default function TutorAllocationCreatePage() {
  const form = useTutorAllocationForm({ mode: 'create' })

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/tutor-allocations"
          backLabel="Tutor Allocation"
          title="Add class"
          description="Choose a private student or a group, then set the sessions and weekly times. Tutors are added after approval."
          icon={UsersRound}
          theme="harbor"
          pattern="ribbons"
        />
        <TutorAllocationForm
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
