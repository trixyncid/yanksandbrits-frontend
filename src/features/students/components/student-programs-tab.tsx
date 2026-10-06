import { useQueryClient } from '@tanstack/react-query'
import { BookOpen, Eye, FileText, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
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
    ongoing: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    completed: 'bg-[#E8EEFF] text-[#1B2A5A] ring-[#C8D4F5]',
  }

  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize ring-1',
        styles[status],
      )}
    >
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
        <span className="text-sm font-semibold tabular-nums text-slate-800">
          {sessionsUsed}
          <span className="font-medium text-slate-400"> / {sessions}</span>
          <span className="ml-2 text-xs font-semibold text-[#1B2A5A]">
            {capped}%
          </span>
        </span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200/80">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#253CA1,#4C6FE0)] transition-[width]"
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
      title: 'Remove program enrollment?',
      description: `This will remove ${enrollment.title} from ${student.fullName}'s program list. This action cannot be undone.`,
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

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4 sm:px-6">
        <p className="text-sm text-slate-500">
          {student.programs.length === 0
            ? 'Track sessions, period, and status for each enrollment.'
            : `${student.programs.length} enrollment${student.programs.length === 1 ? '' : 's'} on this record.`}
        </p>
        <Button variant="secondary" size="sm" onClick={openCreate}>
          <BookOpen className="size-3.5" />
          Add Program
        </Button>
      </div>

      {student.programs.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#E8EEFF] text-[#253CA1]">
            <BookOpen className="size-5" />
          </div>
          <h4 className="mt-4 text-base font-bold text-slate-900">
            No programs enrolled
          </h4>
          <p className="mt-2 max-w-md text-sm text-slate-500">
            Add a program enrollment to track sessions, period, and status for
            this student.
          </p>
          <Button className="mt-5" size="sm" onClick={openCreate}>
            <BookOpen className="size-3.5" />
            Add Program
          </Button>
        </div>
      ) : (
        <ul className="grid gap-4 p-4 sm:p-6">
          {student.programs.map((program) => (
            <li
              key={program.id}
              className="rounded-2xl border border-slate-200/80 bg-slate-50/40 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="text-base font-bold text-slate-900">
                      {program.title}
                    </h4>
                    <ProgramStatusBadge status={program.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    {program.code
                      ? `${program.code}${program.description ? ` · ${program.description}` : ''}`
                      : program.description || 'No description'}
                  </p>
                  <div className="mt-4 max-w-md">
                    <ProgramProgress
                      sessionsUsed={program.sessionsUsed}
                      sessions={program.sessions}
                      progressPercentage={program.progressPercentage}
                    />
                  </div>
                  <p className="mt-3 text-xs text-slate-500">
                    Period {program.period || '—'}
                    {program.createdBy ? ` · Added by ${program.createdBy}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2 lg:shrink-0">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => openDetails(program)}
                  >
                    <Eye className="size-3.5" />
                    Details
                  </Button>
                  <button
                    type="button"
                    aria-label={`Download schedule PDF for ${program.title}`}
                    disabled={downloadingId === program.id}
                    onClick={() => void handleDownloadPdf(program)}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-amber-600 transition hover:border-amber-200 hover:bg-amber-50 disabled:opacity-60"
                  >
                    <FileText className="size-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={`Remove ${program.title}`}
                    onClick={() => handleDelete(program)}
                    className="inline-flex size-9 items-center justify-center rounded-full border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

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
