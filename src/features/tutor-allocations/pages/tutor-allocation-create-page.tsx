import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { TutorAllocationForm } from '../components/tutor-allocation-form'
import { useTutorAllocationForm } from '../hooks/use-tutor-allocation-form'

export default function TutorAllocationCreatePage() {
  const form = useTutorAllocationForm({ mode: 'create' })

  return (
    <AdminShell>
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/tutor-allocations"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#253CA1]"
            >
              <ArrowLeft className="size-4" />
              Tutor Allocation
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Add Student Record and Tutor Allocation
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Choose a private student or a group, then assign tutors and a schedule.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
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
      </div>
    </AdminShell>
  )
}
