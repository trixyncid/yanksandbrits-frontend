import { format } from 'date-fns'
import { FileDown, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { DataTable } from '../../../shared/components/data-table'
import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { DateRangePicker } from '../../../shared/components/ui/date-range-picker'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import type { AppointmentReportFilters } from '../api/appointment-report-query-keys'
import { appointmentReportColumns } from '../components/appointment-report-columns'
import {
  AppointmentReportErrorState,
  AppointmentReportLoadingState,
} from '../components/appointment-report-states'
import {
  appointmentBranchOptions,
  appointmentTutorOptions,
} from '../data/appointment-placeholder'
import { useAppointmentReportQuery } from '../hooks/use-appointment-report-query'
import type { AppointmentReportRow } from '../types/appointment-report'

function filterAppointmentRow(row: AppointmentReportRow, search: string) {
  const haystack = [
    row.program,
    row.tutorName,
    row.studentName,
    row.branch,
  ]
    .join(' ')
    .toLowerCase()

  return haystack.includes(search)
}

export default function AppointmentByTutorPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [branchId, setBranchId] = useState('all')
  const [tutorId, setTutorId] = useState('')
  const [tutorSearch, setTutorSearch] = useState('')
  const [appliedFilters, setAppliedFilters] =
    useState<AppointmentReportFilters | null>(null)

  const reportQuery = useAppointmentReportQuery(appliedFilters)

  const filteredTutors = useMemo(() => {
    const keyword = tutorSearch.trim().toLowerCase()

    return appointmentTutorOptions.filter((option) => {
      if (branchId !== 'all' && option.branchId !== branchId) {
        return false
      }

      if (!keyword) {
        return true
      }

      return option.label.toLowerCase().includes(keyword)
    })
  }, [branchId, tutorSearch])

  function handleSubmit() {
    if (!dateRange?.from || !dateRange.to) {
      notify('warning', {
        title: 'Date range required',
        description: 'Please select both a start and end date.',
      })
      return
    }

    if (!tutorId) {
      notify('warning', {
        title: 'Tutor required',
        description: 'Please select a tutor before generating the report.',
      })
      return
    }

    setAppliedFilters({
      branchId,
      tutorId,
      startDate: format(dateRange.from, 'yyyy-MM-dd'),
      endDate: format(dateRange.to, 'yyyy-MM-dd'),
    })
  }

  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 space-y-4">
        <Card className="overflow-hidden">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-2xl font-bold text-slate-800">
              Appointment By Tutor
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Generate a finished appointment report by date range, branch, and
              tutor. PDF export will be connected later.
            </p>
          </div>

          <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-4 xl:items-end">
            <div className="flex flex-col gap-2">
              <Label htmlFor="appointment-date-range">Date Range</Label>
              <DateRangePicker
                value={dateRange}
                onChange={setDateRange}
                className="w-full"
                placeholder="Select date range"
              />
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="appointment-branch">Branch</Label>
              <Select
                id="appointment-branch"
                value={branchId}
                containerClassName="w-full sm:w-full"
                onChange={(event) => {
                  setBranchId(event.target.value)
                  setTutorId('')
                }}
              >
                {appointmentBranchOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col gap-2 md:col-span-2 xl:col-span-1">
              <Label htmlFor="appointment-tutor">Tutor</Label>
              <Input
                id="tutor-search"
                value={tutorSearch}
                onChange={(event) => setTutorSearch(event.target.value)}
                placeholder="Search tutor by PIN or name..."
              />
              <Select
                id="appointment-tutor"
                value={tutorId}
                containerClassName="w-full sm:w-full"
                onChange={(event) => setTutorId(event.target.value)}
              >
                <option value="" disabled>
                  -- Select Tutor --
                </option>
                {filteredTutors.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>

            <Button className="w-full xl:w-auto" onClick={handleSubmit}>
              <Search className="size-4" />
              Submit Data
            </Button>
          </div>
        </Card>

        {!appliedFilters ? (
          <Card className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-slate-500">
              Choose filters and submit to preview the appointment report.
            </p>
          </Card>
        ) : null}

        {appliedFilters && reportQuery.isLoading ? (
          <AppointmentReportLoadingState />
        ) : null}

        {appliedFilters && reportQuery.isError ? (
          <AppointmentReportErrorState
            onRetry={() => void reportQuery.refetch()}
          />
        ) : null}

        {appliedFilters && reportQuery.isSuccess ? (
          <DataTable
            title="Appointment Preview"
            description={`Tutor: ${reportQuery.data.meta.tutorLabel} · Branch: ${reportQuery.data.meta.branchLabel} · ${format(new Date(reportQuery.data.meta.startDate), 'MMM d, yyyy')} - ${format(new Date(reportQuery.data.meta.endDate), 'MMM d, yyyy')}${
              reportQuery.data.meta.source === 'placeholder'
                ? ' · Placeholder data'
                : ''
            }`}
            totalLabel="appointments"
            columns={appointmentReportColumns}
            data={reportQuery.data.data}
            searchPlaceholder="Search by program, student, branch..."
            globalFilterFn={filterAppointmentRow}
            initialPageSize={10}
            pageSizeOptions={[10, 20, 50]}
            emptyMessage="No appointments found for the selected filters"
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
