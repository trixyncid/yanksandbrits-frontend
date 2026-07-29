import { Link } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import { AdminShell } from '../../admin/components/admin-shell'
import { ProgramForm } from '../components/program-form'
import { useProgramForm } from '../hooks/use-program-form'

export default function ProgramCreatePage() {
  const form = useProgramForm({ mode: 'create' })

  return (
    <AdminShell>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="animate-in fade-in slide-in-from-bottom-1 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to="/programs"
              className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#4274B9]"
            >
              <ArrowLeft className="size-4" />
              Programs
            </Link>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-900">
              Add New Program
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Create an academic program with schedule colors.
            </p>
          </div>
          <Button variant="secondary" size="sm" onClick={form.cancel}>
            Go Back
          </Button>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-2 rounded-[1.75rem] border border-slate-200/80 bg-white p-6 shadow-sm sm:p-8">
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
      </div>
    </AdminShell>
  )
}
