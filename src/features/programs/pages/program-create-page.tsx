import { BookOpen } from 'lucide-react'

import { PageHeader } from '../../../shared/components/page'
import { AdminShell } from '../../admin/components/admin-shell'
import { ProgramForm } from '../components/program-form'
import { useProgramForm } from '../hooks/use-program-form'

export default function ProgramCreatePage() {
  const form = useProgramForm({ mode: 'create' })

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/programs"
          backLabel="Programs"
          title="Add program"
          description="Set up a program students can enroll in, and how it looks on the schedule."
          icon={BookOpen}
          theme="harbor"
          pattern="arcs"
        />

        <ProgramForm
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
