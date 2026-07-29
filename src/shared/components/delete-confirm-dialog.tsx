import { Trash2 } from 'lucide-react'

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
      <DialogContent showClose={false} className="overflow-hidden p-0">
        <div className="bg-[linear-gradient(135deg,#FFF5F5_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
          <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <Trash2 className="size-5" />
          </div>
          <DialogHeader className="pr-0">
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="mt-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="border-transparent bg-rose-600 bg-none text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 hover:brightness-100"
            onClick={confirm}
          >
            <Trash2 className="size-3.5" />
            {confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
