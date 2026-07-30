import { format, startOfDay } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { Select } from '../../../shared/components/ui/select'
import { notify } from '../../../shared/lib/notify'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { useDayScheduleQuery } from '../../schedules/hooks/use-day-schedule-query'
import { AdminShell } from '../components/admin-shell'
import { DashboardStats } from '../components/dashboard-stats'
import { DashboardTimetable } from '../components/dashboard-timetable'

export default function DashboardPage() {
  const today = startOfDay(new Date())
  const todayKey = format(today, 'yyyy-MM-dd')
  const branchesQuery = useBranchesQuery()
  const branches = branchesQuery.data?.data ?? []
  const [branchId, setBranchId] = useState('')
  const [appliedBranchId, setAppliedBranchId] = useState('')

  useEffect(() => {
    if (!branchId && branches.length > 0) {
      const firstId = branches[0]!.id
      setBranchId(firstId)
      setAppliedBranchId(firstId)
    }
  }, [branchId, branches])

  const scheduleQuery = useDayScheduleQuery(
    appliedBranchId
      ? { date: todayKey, branchId: appliedBranchId }
      : null,
  )

  const selectedBranch =
    branches.find((branch) => branch.id === appliedBranchId) ?? null

  const stats = useMemo(() => {
    const scheduleStats = scheduleQuery.data?.stats
    const studentTotal = selectedBranch?.totalStudent ?? 0

    return [
      {
        id: 'sessions',
        label: 'Today sessions',
        value: String(scheduleStats?.sessionCount ?? 0),
        detail: 'Across all classrooms',
      },
      {
        id: 'students',
        label: 'Total students',
        value: studentTotal.toLocaleString('en-US'),
        detail: selectedBranch
          ? `${selectedBranch.name} enrollments`
          : 'Branch enrollments',
      },
      {
        id: 'tutors',
        label: 'Active tutors',
        value: String(scheduleStats?.tutorCount ?? 0),
        detail: 'On schedule today',
      },
      {
        id: 'rooms',
        label: 'Classrooms in use',
        value: String(scheduleStats?.classroomCount ?? 0),
        detail: 'With sessions today',
      },
    ]
  }, [scheduleQuery.data?.stats, selectedBranch])

  function handleSearch() {
    if (!branchId) {
      notify('warning', {
        title: 'Branch required',
        description: 'Please select a branch first.',
      })
      return
    }
    setAppliedBranchId(branchId)
  }

  return (
    <AdminShell>
      <div className="space-y-6">
        <section className="animate-in fade-in slide-in-from-bottom-2">
          <Card className="overflow-hidden">
            <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">
                  Class Schedule | Branch:{' '}
                  {selectedBranch?.name ?? 'Select branch'}
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  Overview schedule for today ({format(today, 'MMMM d, yyyy')}).
                </p>
              </div>

              <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:items-center">
                <Select
                  value={branchId}
                  aria-label="Select branch"
                  disabled={branchesQuery.isLoading || branches.length === 0}
                  onChange={(event) => setBranchId(event.target.value)}
                >
                  {branches.length === 0 ? (
                    <option value="">Loading branches…</option>
                  ) : (
                    branches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.name}
                      </option>
                    ))
                  )}
                </Select>

                <Button onClick={handleSearch}>Search</Button>
              </div>
            </div>

            <DashboardStats stats={stats} />
          </Card>
        </section>

        <section>
          <DashboardTimetable
            columns={scheduleQuery.data?.columns ?? []}
            events={scheduleQuery.data?.events ?? []}
            branchId={appliedBranchId}
            isLoading={scheduleQuery.isLoading || scheduleQuery.isFetching}
            dateLabel="Today"
          />
        </section>
      </div>
    </AdminShell>
  )
}
