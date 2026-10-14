import { useQueryClient } from '@tanstack/react-query'
import { BookOpen, Eye, FileText, Loader2, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { EmptyState } from '../../../shared/components/page'
import { Button } from '../../../shared/components/ui/button'
import { cn } from '../../../shared/lib/cn'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import {
  deleteStudentProgram,
  downloadStudentProgramPdf,
} from '../api/students-api'
import { studentQueryKeys } from '../api/student-query-keys'
import type { StudentDetail, StudentProgramItem } from '../types/student'
import { StudentProgramDialog } from './student-program-dialog'

function ProgramStatusBadge({
  status,
}: {
  status: StudentProgramItem['status']
}) {
  const styles = {
    ongoing: { pill: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' },
    completed: { pill: 'bg-brand-50 text-brand-700', dot: 'bg-brand-500' },
  }

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize',
        styles[status].pill,
      )}
    >
      <span aria-hidden className={cn('size-1.5 rounded-full', styles[status].dot)} />
      {status}
    </span>
  )
}

function ProgramProgress({
  sessionsUsed,
  sessions,
  progressPercentage,
}: {
  sessionsUsed: number
  sessions: number
  progressPercentage: number
}) {
  const capped = Math.max(0, Math.min(100, progressPercentage))

  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs font-medium text-slate-500">Sessions</span>
        <span className="text-sm font-semibold tabular-nums text-ink">
          {sessionsUsed}
          <span className="font-medium text-slate-400"> / {sessions}</span>
          <span className="ml-2 text-xs font-semibold text-brand-700">
            {capped}%
          </span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-canvas">
        <div
          className="h-full rounded-full bg-linear-to-r from-brand-600 to-brand-400 transition-[width]"
          style={{ width: `${capped}%` }}
        />
      </div>
    </div>
  )
}

type StudentProgramsTabProps = {
  student: StudentDetail
}

export function StudentProgramsTab({ student }: StudentProgramsTabProps) {
  const queryClient = useQueryClient()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedEnrollment, setSelectedEnrollment] =
    useState<StudentProgramItem | null>(null)
  const [downloadingId, setDownloadingId] = useState<string | null>(null)

  function openCreate() {
    setSelectedEnrollment(null)
    setDialogOpen(true)
  }

  function openDetails(enrollment: StudentProgramItem) {
    setSelectedEnrollment(enrollment)
    setDialogOpen(true)
  }

  function handleDelete(enrollment: StudentProgramItem) {
    requestDeleteConfirm({
      title: `Remove ${enrollment.title}?`,
      description: `This will remove ${enrollment.title} from ${student.fullName}'s programs. This cannot be undone.`,
      confirmLabel: 'Remove program',
      onConfirm: () => {
        void (async () => {
          try {
            await deleteStudentProgram(enrollment.id)
            await queryClient.invalidateQueries({
              queryKey: studentQueryKeys.detail(student.id),
            })
            notify('success', {
              title: 'Program removed',
              description: `${enrollment.title} has been removed from this student.`,
            })
          } catch (error) {
            notify('error', {
              title: 'Unable to remove program',
              description: getApiErrorMessage(error),
            })
          }
        })()
      },
    })
  }

  async function handleDownloadPdf(enrollment: StudentProgramItem) {
    if (downloadingId) return
    setDownloadingId(enrollment.id)
    try {
      await downloadStudentProgramPdf(
        enrollment.id,
        `${student.pin}-${enrollment.title}.pdf`,
      )
    } catch (error) {
      notify('error', {
        title: 'Unable to download schedule PDF',
        description: getApiErrorMessage(error),
      })
    } finally {
      setDownloadingId(null)
    }
  }

  const programCount = student.programs.length

  return (
    <>
      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] bg-white px-5 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-canvas text-ink">
              <BookOpen className="size-[1.1rem]" strokeWidth={1.9} />
            </span>
            <div className="min-w-0">
              <h3 className="text-base font-bold tracking-tight text-ink">
                Programs
              </h3>
              <p className="mt-0.5 text-xs text-slate-500">
                {programCount === 0
                  ? 'Track sessions, period, and status for each enrollment.'
                  : `${programCount} enrollment${programCount === 1 ? '' : 's'} on this record.`}
              </p>
            </div>
          </div>
          {programCount > 0 ? (
            <Button size="sm" onClick={openCreate}>
              <Plus className="size-4" />
              Add program
            </Button>
          ) : null}
        </div>

        {programCount === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No programs yet"
            description="Add a program enrollment to track sessions, period, and status for this student."
            action={
              <Button onClick={openCreate}>
                <Plus className="size-4" />
                Add program
              </Button>
            }
          />
        ) : (
          <ul className="grid gap-3 md:grid-cols-2">
            {student.programs.map((program) => (
              <li
                key={program.id}
                className="flex flex-col gap-4 rounded-[1.75rem] bg-white p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h4 className="text-base font-bold tracking-tight text-ink">
                        {program.title}
                      </h4>
                      <ProgramStatusBadge status={program.status} />
                    </div>
                    <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                      {program.code ? (
                        <span className="font-mono">{program.code}</span>
                      ) : null}
                      {program.code && program.description ? ' · ' : null}
                      {program.description ||
                        (program.code ? null : 'No description')}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      aria-label={`Download schedule PDF for ${program.title}`}
                      title="Download schedule PDF"
                      disabled={downloadingId === program.id}
                      onClick={() => void handleDownloadPdf(program)}
                      className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-brand-500 hover:text-white disabled:opacity-60"
                    >
                      {downloadingId === program.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <FileText className="size-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      aria-label={`Remove ${program.title}`}
                      title="Remove program"
                      onClick={() => handleDelete(program)}
                      className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-rose-500 transition hover:bg-rose-500 hover:text-white"
                    >
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl bg-canvas px-4 py-3">
                  <ProgramProgress
                    sessionsUsed={program.sessionsUsed}
                    sessions={program.sessions}
                    progressPercentage={program.progressPercentage}
                  />
                </div>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-slate-500">
                    Period{' '}
                    <span className="font-semibold text-ink">
                      {Number(program.period) > 0
                        ? `${program.period} ${Number(program.period) === 1 ? 'month' : 'months'}`
                        : '—'}
                    </span>
                    {program.createdBy ? ` · Added by ${program.createdBy}` : ''}
                  </p>
                  <Button
                    type="button"
                    variant="soft"
                    size="sm"
                    onClick={() => openDetails(program)}
                  >
                    <Eye className="size-3.5" />
                    Details
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <StudentProgramDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedEnrollment(null)
        }}
        studentId={student.id}
        studentName={student.fullName}
        enrollment={selectedEnrollment}
      />
    </>
  )
}
