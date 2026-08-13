import { format } from 'date-fns'
import { useEffect, useMemo, useState } from 'react'
import type { DateRange } from 'react-day-picker'

import { DateRangePicker } from '../../../shared/components/ui/date-range-picker'
import { Label } from '../../../shared/components/ui/label'
import { SearchableSelect } from '../../../shared/components/ui/searchable-select'
import { Select } from '../../../shared/components/ui/select'
import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import { ReportGeneratorLayout } from '../../admin/components/report-generator-layout'
import { useBranchesQuery } from '../../branches/hooks/use-branches-query'
import { useTutorOptionsQuery } from '../../users/hooks/use-user-options'
import { downloadAppointmentByTutorPdf } from '../api/appointment-report-api'

function formatPeriod(range: DateRange | undefined) {
  if (!range?.from || !range.to) {
    return 'Not selected'
  }
  return `${format(range.from, 'MMM d, yyyy')} – ${format(range.to, 'MMM d, yyyy')}`
}

export default function AppointmentByTutorPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>()
  const [branchId, setBranchId] = useState('all')
  const [tutorId, setTutorId] = useState('')
  const [isDownloading, setIsDownloading] = useState(false)

  const branchesQuery = useBranchesQuery()
  const tutorsQuery = useTutorOptionsQuery()
  const branches = branchesQuery.data?.data ?? []
  const tutors = tutorsQuery.data ?? []

  useEffect(() => {
    setTutorId('')
  }, [branchId])

  const tutorOptions = useMemo(() => {
    return tutors
      .filter((tutor) => branchId === 'all' || tutor.branchId === branchId)
      .map((tutor) => ({
        value: tutor.id,
        label: `${tutor.pin} · ${tutor.fullName}`,
        keywords: `${tutor.pin} ${tutor.fullName}`,
      }))
  }, [branchId, tutors])

  const selectedBranchName = useMemo(() => {
    if (branchId === 'all') {
      return 'All branches'
    }
    return branches.find((branch) => branch.id === branchId)?.name ?? 'Not selected'
  }, [branchId, branches])

  const selectedTutorLabel = useMemo(() => {
    if (!tutorId) {
      return 'Not selected'
    }
    return (
      tutorOptions.find((option) => option.value === tutorId)?.label ??
      'Not selected'
    )
  }, [tutorId, tutorOptions])

  const ready = Boolean(dateRange?.from && dateRange.to && tutorId)

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
        description: 'Tutor sessions report has been saved.',
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
      title="Tutor Sessions"
      description="Generate a PDF of finished sessions a tutor has taught over a selected period and branch."
      ready={ready}
      isDownloading={isDownloading}
      onDownload={() => void handleDownload()}
      readyHint="Select a date range and tutor to enable download."
      summaryItems={[
        { label: 'Period', value: formatPeriod(dateRange) },
        { label: 'Branch', value: selectedBranchName },
        { label: 'Tutor', value: selectedTutorLabel },
      ]}
      criteria={
        <>
          <div className="flex flex-col gap-2">
            <Label htmlFor="appointment-date-range">
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
            <Label htmlFor="appointment-branch">Branch</Label>
            <Select
              id="appointment-branch"
              value={branchId}
              containerClassName="w-full sm:w-full"
              disabled={branchesQuery.isLoading}
              onChange={(event) => setBranchId(event.target.value)}
            >
              <option value="all">All branches</option>
              {branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="appointment-tutor">
              Tutor <span className="text-rose-500">*</span>
            </Label>
            <SearchableSelect
              id="appointment-tutor"
              value={tutorId}
              options={tutorOptions}
              onChange={setTutorId}
              placeholder="Select tutor…"
              searchPlaceholder="Search by PIN or name…"
              emptyMessage="No tutors match the current branch or search."
              disabled={tutorsQuery.isLoading}
              clearable
            />
          </div>
        </>
      }
    />
  )
}
