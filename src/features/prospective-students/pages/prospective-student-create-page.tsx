import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { ProspectiveStudentForm } from '../components/prospective-student-form'
import { useProspectiveStudentForm } from '../hooks/use-prospective-student-form'

export default function ProspectiveStudentCreatePage() {
  const form = useProspectiveStudentForm({ mode: 'create' })

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/prospective-students"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#253CA1]"
            >
              <ArrowLeft className="size-4" />
              Prospective Students
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Add Prospective Student
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Capture inquiry details and assign a counsellor for follow-up.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <ProspectiveStudentForm
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
