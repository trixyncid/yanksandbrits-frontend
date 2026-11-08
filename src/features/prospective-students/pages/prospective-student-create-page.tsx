import { Inbox } from 'lucide-react'

import { PageHeader } from '../../../shared/components/page'
import { AdminShell } from '../../admin/components/admin-shell'
import { ExtraStudentsSection } from '../components/extra-students'
import { ProspectiveStudentForm } from '../components/prospective-student-form'
import { useProspectiveStudentForm } from '../hooks/use-prospective-student-form'

export default function ProspectiveStudentCreatePage() {
  const form = useProspectiveStudentForm({ mode: 'create' })

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/prospective-students"
          backLabel="Student Responses"
          title="Add student response"
          description="Log a new inquiry and who will follow up with them."
          icon={Inbox}
          theme="sky"
          pattern="ribbons"
        />

        <ProspectiveStudentForm
          mode="create"
          values={form.values}
          errors={form.errors}
          isSubmitting={form.isSubmitting}
          onChange={form.updateField}
          onSubmit={form.submit}
          onCancel={form.cancel}
          afterStudentSection={
            <ExtraStudentsSection
              students={form.extraStudents}
              errors={form.extraErrors}
              onAdd={form.addExtraStudent}
              onRemove={form.removeExtraStudent}
              onChange={form.updateExtraStudent}
            />
          }
        />
      </div>
    </AdminShell>
  )
}
