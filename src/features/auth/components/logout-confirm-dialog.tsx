import { LogOut } from 'lucide-react'

import { Button } from '../../../shared/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'

type LogoutConfirmDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

export function LogoutConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
}: LogoutConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showClose={false} className="p-0 overflow-hidden">
        <div className="bg-[linear-gradient(135deg,#FFF5F5_0%,#FFFFFF_55%)] px-6 pt-6 pb-2">
          <div className="mb-4 inline-flex size-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 ring-1 ring-rose-100">
            <LogOut className="size-5" />
          </div>
          <DialogHeader className="pr-0">
            <DialogTitle>Sign out?</DialogTitle>
            <DialogDescription>
              You will be signed out of the Yanks &amp; Brits admin panel. You
              can sign back in anytime with your staff account.
            </DialogDescription>
          </DialogHeader>
        </div>

        <DialogFooter className="border-t border-slate-100 bg-slate-50/80 px-6 py-4 mt-0">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            size="sm"
            className="border-transparent bg-rose-600 bg-none text-white shadow-lg shadow-rose-600/20 hover:bg-rose-500 hover:brightness-100"
            onClick={onConfirm}
          >
            <LogOut className="size-3.5" />
            Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
