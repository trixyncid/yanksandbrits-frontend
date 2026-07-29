import { create } from 'zustand'

type DeleteConfirmRequest = {
  title: string
  description: string
  confirmLabel?: string
  onConfirm: () => void
}

type DeleteConfirmState = {
  open: boolean
  title: string
  description: string
  confirmLabel: string
  onConfirm: (() => void) | null
  requestDelete: (request: DeleteConfirmRequest) => void
  setOpen: (open: boolean) => void
  confirm: () => void
}

export const useDeleteConfirmStore = create<DeleteConfirmState>((set, get) => ({
  open: false,
  title: 'Delete?',
  description: 'This action cannot be undone.',
  confirmLabel: 'Delete',
  onConfirm: null,
  requestDelete: (request) =>
    set({
      open: true,
      title: request.title,
      description: request.description,
      confirmLabel: request.confirmLabel ?? 'Delete',
      onConfirm: request.onConfirm,
    }),
  setOpen: (open) => {
    if (!open) {
      set({ open: false, onConfirm: null })
      return
    }
    set({ open: true })
  },
  confirm: () => {
    const { onConfirm } = get()
    set({ open: false, onConfirm: null })
    onConfirm?.()
  },
}))

export function requestDeleteConfirm(request: DeleteConfirmRequest) {
  useDeleteConfirmStore.getState().requestDelete(request)
}
