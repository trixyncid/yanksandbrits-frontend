import { FileDown, FileText } from 'lucide-react'
import type { ReactNode } from 'react'

import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { AdminShell } from './admin-shell'

export type ReportSummaryItem = {
  label: string
  value: string
}

type ReportGeneratorLayoutProps = {
  title: string
  description: string
  criteria: ReactNode
  summaryItems: ReportSummaryItem[]
  ready: boolean
  isDownloading: boolean
  onDownload: () => void
  readyHint?: string
}

export function ReportGeneratorLayout({
  title,
  description,
  criteria,
  summaryItems,
  ready,
  isDownloading,
  onDownload,
  readyHint = 'Fill in the required criteria to enable download.',
}: ReportGeneratorLayoutProps) {
  return (
    <AdminShell>
      <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#4274B9] uppercase">
            Reports
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-slate-500">
            {description}
          </p>
        </header>

        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-b from-[#F8FBFF] to-white shadow-sm">
          <div className="grid lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.85fr)]">
            <section className="space-y-6 border-b border-slate-200/80 p-6 sm:p-8 lg:border-r lg:border-b-0">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Report criteria
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Set the filters used to generate this PDF.
                </p>
              </div>
              <div className="space-y-5">{criteria}</div>
            </section>

            <aside
              className={cn(
                'flex flex-col gap-5 bg-white/70 p-6 sm:p-8 transition-opacity duration-200',
                ready ? 'opacity-100' : 'opacity-90',
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-xl transition-colors',
                    ready
                      ? 'bg-gradient-to-br from-[#5A8BC9] to-[#2F5A94] text-white shadow-md shadow-[#4274B9]/25'
                      : 'bg-[#EDF4FF] text-[#4274B9]',
                  )}
                >
                  <FileText className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {ready ? 'Ready to export' : 'Complete the criteria'}
                  </p>
                  <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {ready
                      ? 'Review the summary, then download the PDF.'
                      : readyHint}
                  </p>
                </div>
              </div>

              <dl className="space-y-3 rounded-xl border border-slate-200/80 bg-[#F8FBFF]/80 px-4 py-3.5">
                {summaryItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-4"
                  >
                    <dt className="shrink-0 text-xs font-medium text-slate-500">
                      {item.label}
                    </dt>
                    <dd className="text-right text-xs font-semibold text-slate-800">
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <div className="mt-auto space-y-2">
                <Button
                  fullWidth
                  size="lg"
                  disabled={!ready || isDownloading}
                  onClick={onDownload}
                >
                  <FileDown className="size-4" />
                  {isDownloading ? 'Downloading…' : 'Download PDF'}
                </Button>
                <p className="text-center text-[11px] text-slate-400">
                  PDF downloads to your device
                </p>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
