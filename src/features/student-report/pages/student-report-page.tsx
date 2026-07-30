import { format } from 'date-fns'
import { FileDown } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { Button } from '../../../shared/components/ui/button'
import { Card } from '../../../shared/components/ui/card'
import { DateRangePicker } from '../../../shared/components/ui/date-range-picker'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { AdminShell } from '../../admin/components/admin-shell'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { downloadStudentRegistrationPdf } from '../api/student-report-api'

export default function StudentReportPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [branchId, setBranchId] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  const branchesQuery = useBranchesQuery()
  const branches = branchesQuery.data?.data ?? []

  useEffect(() => {
    if (!branchId && branches.length > 0) {
      setBranchId(branches[0]!.id)
    }
  }, [branchId, branches])

  async function handleDownload() {
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
        description: 'Please select a branch before downloading the report.',
      })
      return
    }

    setIsDownloading(true)
    try {
      await downloadStudentRegistrationPdf({
        branchId,
        startDate: format(dateRange.from, 'yyyy-MM-dd'),
        endDate: format(dateRange.to, 'yyyy-MM-dd'),
      })
      notify('success', {
        title: 'PDF downloaded',
        description: 'Student registration report has been saved.',
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
            <h2 className="text-2xl font-bold text-slate-800">Student Report</h2>
            <p className="mt-2 text-sm text-slate-500">
              Download a student registration PDF by date range and branch.
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
            </div>

            <Button
              className="w-full md:w-auto"
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
            This report is PDF-only. Choose a date range and branch, then
            download the registration report.
          </p>
        </Card>
      </div>
    </AdminShell>
  )
}
