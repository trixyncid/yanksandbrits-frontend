import { useState } from 'react'

import type {
  ScheduleDialogContext,
  ScheduleDialogCreateContext,
  ScheduleDialogEditContext,
} from './schedule-form-dialog'

export function useScheduleDialogState() {
  const [context, setContext] = useState<ScheduleDialogContext>(null)

  return {
    context,
    openCreate: (next: Omit<ScheduleDialogCreateContext, 'mode'>) =>
      setContext({ mode: 'create', ...next }),
    openEdit: (next: Omit<ScheduleDialogEditContext, 'mode'>) =>
      setContext({ mode: 'edit', ...next }),
    setOpen: (open: boolean) => {
      if (!open) setContext(null)
    },
  }
}
