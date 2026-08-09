import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { DateRangePicker } from '../../../shared/components/ui/date-range-picker'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { ReportGeneratorLayout } from '../../admin/components/report-generator-layout'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { downloadStudentRegistrationPdf } from '../api/student-report-api'

function formatPeriod(range: DateRange | undefined) {
  if (!range?.from || !range.to) {
    return 'Not selected'
  }
  return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`
}

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

  const selectedBranchName = useMemo(() => {
    if (!branchId) {
      return 'Not selected'
    }
    return branches.find((branch) => branch.id === branchId)?.name ?? 'Not selected'
  }, [branchId, branches])

  const ready = Boolean(dateRange?.from && dateRange.to && branchId)

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
    <ReportGeneratorLayout
      title="Student Report"
      description="Generate a student registration PDF filtered by enrollment period and branch."
      ready={ready}
      isDownloading={isDownloading}
      onDownload={() => void handleDownload()}
      readyHint="Select a date range and branch to enable download."
      summaryItems={[
        { label: 'Period', value: formatPeriod(dateRange) },
        { label: 'Branch', value: selectedBranchName },
      ]}
      criteria={
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="student-report-date-range">
              Date range <span className="text-rose-500">*</span>
            </Label>
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              className="w-full"
              placeholder="Select date range"
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="student-report-branch">
              Branch <span className="text-rose-500">*</span>
            </Label>
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
        </>
      }
    />
  )
}
