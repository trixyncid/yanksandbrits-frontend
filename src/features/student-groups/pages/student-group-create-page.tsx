import { Users } from 'lucide-react'

import { PageHeader } from '../../../shared/components/page'
import { AdminShell } from '../../admin/components/admin-shell'
import { StudentGroupForm } from '../components/student-group-form'
import { useStudentGroupForm } from '../hooks/use-student-group-form'

export default function StudentGroupCreatePage() {
  const form = useStudentGroupForm({ mode: 'create' })

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/student-groups"
          backLabel="Student Groups"
          title="Add student group"
          description="Give the group a name and pick the students who learn together."
          icon={Users}
          theme="sky"
          pattern="rings"
        />

        <StudentGroupForm
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
