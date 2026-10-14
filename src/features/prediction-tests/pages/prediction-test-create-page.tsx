import { ClipboardList } from 'lucide-react'

import { PageHeader } from '../../../shared/components/page'
import { AdminShell } from '../../admin/components/admin-shell'
import { PredictionTestForm } from '../components/prediction-test-form'
import { usePredictionTestForm } from '../hooks/use-prediction-test-form'

export default function PredictionTestCreatePage() {
  const form = usePredictionTestForm({ mode: 'create' })

  return (
    <AdminShell mainClassName="px-3 py-4 sm:px-5 sm:py-5">
      <div className="mx-auto max-w-6xl space-y-3">
        <PageHeader
          backTo="/prediction-tests"
          backLabel="Prediction Tests"
          title="Add prediction test"
          description="Choose a student and record the payment. Scores can be added after the student finishes the test."
          icon={ClipboardList}
          theme="dawn"
          pattern="dots"
        />

        <PredictionTestForm
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
