import { format } from 'date-fns'
import { FileDown } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { DateRangePicker } from '../../../shared/components/ui/date-range-picker'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { useTutorOptionsQuery } from '../../users/hooks/use-user-options'
import { downloadAppointmentByTutorPdf } from '../api/appointment-report-api'

export default function AppointmentByTutorPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [branchId, setBranchId] = useState('all')
  const [tutorId, setTutorId] = useState('')
  const [tutorSearch, setTutorSearch] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  const branchesQuery = useBranchesQuery()
  const tutorsQuery = useTutorOptionsQuery()
  const branches = branchesQuery.data?.data ?? []
  const tutors = tutorsQuery.data ?? []

  useEffect(() => {
    setTutorId('')
  }, [branchId])

  const filteredTutors = useMemo(() => {
    const keyword = tutorSearch.trim().toLowerCase()

    return tutors.filter((tutor) => {
      if (branchId !== 'all' && tutor.branchId !== branchId) {
        return false
      }

      if (!keyword) {
        return true
      }

      const label = `${tutor.pin} ${tutor.fullName}`.toLowerCase()
      return label.includes(keyword)
    })
  }, [branchId, tutorSearch, tutors])

  async function handleDownload() {
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
        description: 'Please select a tutor before downloading the report.',
      })
      return
    }

    setIsDownloading(true)
    try {
      await downloadAppointmentByTutorPdf({
        branchId,
        tutorId,
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
      })
      notify('success', {
        title: 'PDF downloaded',
        description: 'Appointment-by-tutor report has been saved.',
      })
    } catch (error) {
      notify('error', {
        title: 'Unable to download report',
        description: getApiErrorMessage(error),
      })
    } finally {
      setIsDownloading(false)
    }
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
              Download a finished appointment PDF by date range, branch, and
              tutor.
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
                disabled={branchesQuery.isLoading}
                onChange={(event) => setBranchId(event.target.value)}
              >
                <option value="all">All Branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
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
                disabled={tutorsQuery.isLoading}
                onChange={(event) => setTutorId(event.target.value)}
              >
                <option value="" disabled>
                  -- Select Tutor --
                </option>
                {filteredTutors.map((tutor) => (
                  <option key={tutor.id} value={tutor.id}>
                    {tutor.pin} - {tutor.fullName}
                  </option>
                ))}
              </Select>
            </div>

            <Button
              className="w-full xl:w-auto"
              disabled={isDownloading}
              onClick={() => void handleDownload()}
            >
              <FileDown className="size-4" />
              {isDownloading ? 'Downloading…' : 'Download PDF'}
            </Button>
          </div>
        </Card>

        <Card className="px-6 py-14 text-center">
          <p className="text-sm font-medium text-slate-500">
            This report is PDF-only. Choose filters, then download the
            appointment report.
          </p>
        </Card>
      </div>
    </AdminShell>
  )
}
