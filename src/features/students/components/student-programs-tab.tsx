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
    completed: 'bg-[#EDF4FF] text-[#2F5A94] ring-[#BED2F2]',
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
    <div className="min-w-[9rem] space-y-1.5">
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold tabular-nums text-slate-800">
          {sessionsUsed}
          <span className="font-medium text-slate-400"> / {sessions}</span>
        </span>
        <span className="text-xs font-semibold tabular-nums text-[#2F5A94]">
          {capped}%
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#4274B9] transition-[width]"
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
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-6 py-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Program List</h3>
          <p className="mt-1 text-sm text-slate-500">
            Programs enrolled for this student.
          </p>
        </div>
        <Button variant="secondary" size="sm" onClick={openCreate}>
          <BookOpen className="size-3.5" />
          Add Program
        </Button>
      </div>

      {student.programs.length === 0 ? (
        <div className="flex flex-col items-center px-6 py-16 text-center">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-[#EDF4FF] text-[#4274B9]">
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
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
              <tr>
                <th className="px-6 py-3">Program</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3">Progress</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {student.programs.map((program) => (
                <tr key={program.id} className="border-t border-slate-100">
                  <td className="px-6 py-4">
                    <p className="font-semibold text-slate-900">
                      {program.title}
                    </p>
                    <p className="text-xs text-slate-500">
                      {program.code
                        ? `${program.code}${program.description ? ` · ${program.description}` : ''}`
                        : program.description || '—'}
                    </p>
                  </td>
                  <td className="px-4 py-4 text-slate-600">{program.period}</td>
                  <td className="px-4 py-4">
                    <ProgramProgress
                      sessionsUsed={program.sessionsUsed}
                      sessions={program.sessions}
                      progressPercentage={program.progressPercentage}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <ProgramStatusBadge status={program.status} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end gap-2">
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
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-amber-600 transition hover:border-amber-200 hover:bg-amber-50 disabled:opacity-60"
                      >
                        <FileText className="size-3.5" />
                      </button>
                      <button
                        type="button"
                        aria-label={`Remove ${program.title}`}
                        onClick={() => handleDelete(program)}
                        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
