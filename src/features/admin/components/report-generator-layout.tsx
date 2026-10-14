import { CheckCircle2, FileDown, FileText, ListChecks } from 'lucide-react'
import type { ReactNode } from 'react'

import {
  PageHero,
  type PagePattern,
  type PageTheme,
} from '../../../shared/components/page'
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
  /** Hero styling; defaults to a calm report look. */
  theme?: PageTheme
  pattern?: PagePattern
  eyebrow?: string
}

/**
 * Shared page for "pick filters → download a PDF" reports: a compact hero,
 * the criteria card, and a sticky summary with the download button.
 */
export function ReportGeneratorLayout({
  title,
  description,
  criteria,
  summaryItems,
  ready,
  isDownloading,
  onDownload,
  readyHint = 'Fill in the required criteria to enable download.',
  theme = 'mist',
  pattern = 'grid',
  eyebrow = 'Reports',
}: ReportGeneratorLayoutProps) {
  return (
    <AdminShell mainClassName="px-3 pb-6 sm:px-5">
      <div className="animate-in fade-in slide-in-from-bottom-2 mx-auto max-w-6xl space-y-3">
        <PageHero
          compact
          eyebrow={eyebrow}
          title={title}
          description={description}
          theme={theme}
          pattern={pattern}
        />

        <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <section className="rounded-[1.75rem] bg-white p-5 sm:p-6">
            <div className="mb-5 flex items-start gap-3">
              <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                <ListChecks className="size-4" />
              </span>
              <div>
                <h2 className="text-base font-bold tracking-tight text-ink sm:text-lg">
                  What should the report cover?
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Choose the filters for this PDF.
                </p>
              </div>
            </div>
            <div className="space-y-5">{criteria}</div>
          </section>

          <aside className="space-y-3 lg:sticky lg:top-20">
            <div
              className={cn(
                'rounded-[1.75rem] p-5 transition-colors duration-300',
                ready ? 'bg-ink text-white' : 'bg-white',
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  className={cn(
                    'inline-flex size-11 shrink-0 items-center justify-center rounded-full transition-colors',
                    ready ? 'bg-brand-500 text-white' : 'bg-brand-50 text-brand-600',
                  )}
                >
                  {ready ? (
                    <CheckCircle2 className="size-5" />
                  ) : (
                    <FileText className="size-5" />
                  )}
                </span>
                <div>
                  <p className={cn('text-base font-bold', ready ? 'text-white' : 'text-ink')}>
                    {ready ? 'Ready to download' : 'Almost there'}
                  </p>
                  <p
                    className={cn(
                      'mt-0.5 text-xs leading-relaxed',
                      ready ? 'text-white/65' : 'text-slate-500',
                    )}
                  >
                    {ready ? 'Check the summary, then download the PDF.' : readyHint}
                  </p>
                </div>
              </div>

              <dl
                className={cn(
                  'mt-4 space-y-2 rounded-3xl px-4 py-3.5',
                  ready ? 'bg-white/8' : 'bg-canvas/70',
                )}
              >
                {summaryItems.map((item) => (
                  <div
                    key={item.label}
                    className="flex items-start justify-between gap-4"
                  >
                    <dt
                      className={cn(
                        'shrink-0 text-xs font-medium',
                        ready ? 'text-white/60' : 'text-slate-500',
                      )}
                    >
                      {item.label}
                    </dt>
                    <dd
                      className={cn(
                        'text-right text-xs font-semibold',
                        ready ? 'text-white' : 'text-ink',
                      )}
                    >
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>

              <Button
                fullWidth
                size="lg"
                className="mt-4"
                disabled={!ready || isDownloading}
                onClick={onDownload}
              >
                <FileDown className="size-4" />
                {isDownloading ? 'Downloading…' : 'Download PDF'}
              </Button>
              <p
                className={cn(
                  'mt-2 text-center text-[11px]',
                  ready ? 'text-white/50' : 'text-slate-400',
                )}
              >
                The PDF saves to this device
              </p>
            </div>
          </aside>
        </div>
      </div>
    </AdminShell>
  )
}
