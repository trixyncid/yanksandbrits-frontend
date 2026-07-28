import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { Select } from '../../../shared/components/ui/select'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../components/admin-shell'
import { DashboardStats } from '../components/dashboard-stats'
import { DashboardTimetable } from '../components/dashboard-timetable'

const branchOptions = [
  { value: 'main', label: 'Main Branch' },
  { value: 'west', label: 'West Branch' },
  { value: 'south', label: 'South Branch' },
]

export default function DashboardPage() {
  return (
    <AdminShell>
      <div className="space-y-6">
        <section className="animate-in fade-in slide-in-from-bottom-2">
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Class Schedule | Branch: Main Branch
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Overview schedule for today with placeholder data prepared for
                  future API integration.
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Select
                  defaultValue="main"
                  aria-label="Select branch"
                  onChange={() =>
                    notify('info', {
                      title: 'Branch selection placeholder',
                      description:
                        'Branch filtering will be wired to backend data later.',
                    })
                  }
                >
                  {branchOptions.map((branch) => (
                    <option key={branch.value} value={branch.value}>
                      {branch.label}
                    </option>
                  ))}
                </Select>

                <Button
                  onClick={() =>
                    notify('info', {
                      title: 'Filter placeholder',
                      description:
                        'Branch filtering will be wired to backend data later.',
                    })
                  }
                >
                  Search
                </Button>
              </div>
            </div>

            <DashboardStats />
          </Card>
        </section>

        <section>
          <DashboardTimetable />
        </section>
      </div>
    </AdminShell>
  )
}
