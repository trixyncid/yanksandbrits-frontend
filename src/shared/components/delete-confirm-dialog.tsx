import { Trash2, TriangleAlert } from 'lucide-react'

import { Button } from './ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog'
import { useDeleteConfirmStore } from '../lib/delete-confirm-store'

export function DeleteConfirmDialog() {
  const open = useDeleteConfirmStore((state) => state.open)
  const title = useDeleteConfirmStore((state) => state.title)
  const description = useDeleteConfirmStore((state) => state.description)
  const confirmLabel = useDeleteConfirmStore((state) => state.confirmLabel)
  const setOpen = useDeleteConfirmStore((state) => state.setOpen)
  const confirm = useDeleteConfirmStore((state) => state.confirm)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent showClose={false} className="max-w-sm overflow-hidden p-0 text-center">
        <div className="px-6 pt-8 pb-5">
          <div className="relative mx-auto mb-5 flex size-16 items-center justify-center">
            <span
              aria-hidden
              className="absolute inset-0 animate-ping rounded-full bg-rose-100 opacity-60 [animation-duration:2s]"
            />
            <span className="relative inline-flex size-16 items-center justify-center rounded-full bg-rose-50 text-rose-600 ring-8 ring-rose-50/60">
              <Trash2 className="size-6" strokeWidth={1.8} />
            </span>
          </div>
          <DialogHeader className="items-center pr-0">
            <DialogTitle className="text-lg font-bold tracking-tight">
              {title}
            </DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-slate-500">
              {description}
            </DialogDescription>
          </DialogHeader>
          <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1 text-[11px] font-semibold text-slate-500">
            <TriangleAlert className="size-3" />
            This can't be undone
          </p>
        </div>

        <DialogFooter className="mt-0 grid grid-cols-2 gap-2 px-6 pb-6 sm:flex-none">
          <Button variant="soft" onClick={() => setOpen(false)} autoFocus>
            Keep it
          </Button>
          <Button
            className="bg-rose-600 text-white shadow-lg shadow-rose-600/25 hover:bg-rose-500"
            onClick={confirm}
          >
            <Trash2 className="size-4" />
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
