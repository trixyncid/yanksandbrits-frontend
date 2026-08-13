import { useNavigate } from '@tanstack/react-router'
import { useQueryClient } from '@tanstack/react-query'
import { Pencil, Trash2 } from 'lucide-react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { requestDeleteConfirm } from '../../../shared/lib/delete-confirm-store'
import { notify } from '../../../shared/lib/notify'
import { Can } from '../../auth/components/can'
import { deleteProgram } from '../api/programs-api'
import { programQueryKeys } from '../api/program-query-keys'
import type { ProgramListItem } from '../types/program'

export function ProgramActionsCell({ program }: { program: ProgramListItem }) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return (
    <div className="flex items-center justify-center gap-2">
      <Can module="programs" action="change">
        <button
          type="button"
          aria-label={`Edit program ${program.code}`}
          onClick={() =>
            void navigate({
              to: '/programs/$programId/edit',
              params: { programId: program.id },
            })
          }
          className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-[#BED2F2] hover:bg-[#F8FBFF] hover:text-[#2F5A94]"
        >
          <Pencil className="size-3.5" />
        </button>
      </Can>
      <Can module="programs" action="delete">
        <button
        type="button"
        aria-label={`Delete program ${program.code}`}
        onClick={() =>
          requestDeleteConfirm({
            title: 'Delete program?',
            description: `This will permanently remove ${program.title}. This action cannot be undone.`,
            onConfirm: () => {
              void (async () => {
                try {
                  await deleteProgram(program.id)
                  await queryClient.invalidateQueries({
                    queryKey: programQueryKeys.all,
                  })
                  notify('success', {
                    title: 'Program deleted',
                    description: `${program.title} has been removed.`,
                  })
                } catch (error) {
                  notify('error', {
                    title: 'Unable to delete program',
                    description: getApiErrorMessage(error),
                  })
                }
              })()
            },
          })
        }
        className="inline-flex size-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-rose-500 transition hover:border-rose-200 hover:bg-rose-50"
      >
        <Trash2 className="size-3.5" />
        </button>
      </Can>
    </div>
  )
}
