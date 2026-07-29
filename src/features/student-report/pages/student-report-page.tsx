import { format } from 'date-fns'
import { FileDown, Search } from 'lucide-react'
import { useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { DateRangePicker } from '../../../shared/components/ui/date-range-picker'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import type { StudentReportFilters } from '../api/student-report-query-keys'
import { studentReportColumns } from '../components/student-report-columns'
import {
  StudentReportErrorState,
  StudentReportLoadingState,
} from '../components/student-report-states'
import { studentReportBranchOptions } from '../data/student-report-placeholder'
import { useStudentReportQuery } from '../hooks/use-student-report-query'
import type { StudentReportRow } from '../types/student-report'

function filterStudentReportRow(row: StudentReportRow, search: string) {
  const haystack = [
    row.pin,
    row.fullName,
    row.resource,
    row.responseNo,
    ...row.programs,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function StudentReportPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [branchId, setBranchId] = useState('main')
  const [appliedFilters, setAppliedFilters] =
    useState<StudentReportFilters | null>(null)

  const reportQuery = useStudentReportQuery(appliedFilters)

  function handleSubmit() {
    if (!dateRange?.from || !dateRange.to) {
      notify('warning', {
        title: 'Date range required',
        description: 'Please select both a start and end date.',
      })
      return
    }

    if (!branchId) {
      notify('warning', {
        title: 'Branch required',
        description: 'Please select a branch before generating the report.',
      })
      return
    }

    setAppliedFilters({
      branchId,
      startDate: format(dateRange.from, 'yyyy-MM-dd'),
      endDate: format(dateRange.to, 'yyyy-MM-dd'),
    })
  }

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-2xl font-bold text-slate-800">Student Report</h2>
            <p className="mt-2 text-sm text-slate-500">
              Generate a student registration report by date range and branch.
              PDF export will be connected later.
            </p>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)_auto] md:items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="student-report-date-range">Date Range</Label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full"
                placeholder="Select date range"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="student-report-branch">Branch</Label>
              <Select
                id="student-report-branch"
                value={branchId}
                aria-label="Select branch"
                containerClassName="w-full sm:w-full"
                onChange={(event) => setBranchId(event.target.value)}
              >
                <option value="" disabled>
                  -- Select Branch --
                </option>
                {studentReportBranchOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <Button className="w-full md:w-auto" onClick={handleSubmit}>
              <Search className="size-4" />
              Submit Data
            </Button>
          </div>
        </Card>

        {!appliedFilters ? (
          <Card className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-500">
              Choose a date range and branch, then submit to preview the
              registration report.
            </p>
          </Card>
        ) : null}

        {appliedFilters && reportQuery.isLoading ? (
          <StudentReportLoadingState />
        ) : null}

        {appliedFilters && reportQuery.isError ? (
          <StudentReportErrorState
            onRetry={() => void reportQuery.refetch()}
          />
        ) : null}

        {appliedFilters && reportQuery.isSuccess ? (
          <DataTable
            title="Registration Preview"
            description={`Branch: ${reportQuery.data.meta.branchLabel} · ${format(new Date(reportQuery.data.meta.startDate), 'MMM d, yyyy')} - ${format(new Date(reportQuery.data.meta.endDate), 'MMM d, yyyy')}${
              reportQuery.data.meta.source === 'placeholder'
                ? ' · Placeholder data'
                : ''
            }`}
            totalLabel="students"
            columns={studentReportColumns}
            data={reportQuery.data.data}
            searchPlaceholder="Search by pin, name, program..."
            globalFilterFn={filterStudentReportRow}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No students found for the selected filters"
            toolbarActions={
              <Button
                variant="secondary"
                onClick={() =>
                  notify('info', {
                    title: 'Export PDF placeholder',
                    description:
                      'PDF generation will be connected to the backend later.',
                  })
                }
              >
                <FileDown className="size-4" />
                Export PDF
              </Button>
            }
          />
        ) : null}
      </div>
    </AdminShell>
  )
}
