import { FileDown } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { notify } from '../../../shared/lib/notify'
import {
  downloadStaffSalaryPdf,
  type BookkeepingStaffSalaryItem,
} from '../api/staff-salary-api'

export function StaffPdfButton({ item }: { item: BookkeepingStaffSalaryItem }) {
  const [isDownloading, setIsDownloading] = useState(false)
  return (
    <button
      type="button"
      disabled={isDownloading}
      onClick={() => {
        void (async () => {
          setIsDownloading(true)
          try {
            await downloadStaffSalaryPdf(item)
            notify('success', {
              title: 'PDF downloaded',
              description: `${item.staffName} salary report saved.`,
            })
          } catch (error) {
            notify('error', {
              title: 'Unable to download PDF',
              description: getApiErrorMessage(error),
            })
          } finally {
            setIsDownloading(false)
          }
        })()
      }}
      title="Download salary PDF"
      aria-label={`Download salary PDF for ${item.staffName}`}
      className="inline-flex h-9 items-center gap-1.5 rounded-full bg-canvas px-3.5 text-xs font-semibold text-ink transition hover:bg-ink hover:text-white disabled:cursor-wait disabled:opacity-60"
    >
      <FileDown className="size-3.5" />
      {isDownloading ? 'Saving…' : 'PDF'}
    </button>
  )
}
