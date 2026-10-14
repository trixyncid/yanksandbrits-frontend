import { toast } from 'sonner'

import { AppToast } from '../components/ui/app-toast'

export type AppToastType = 'success' | 'error' | 'info' | 'warning'

type NotifyOptions = {
  title: string
  description?: string
}

/** Errors and warnings stay up longer: they usually need reading. */
const DURATIONS: Record<AppToastType, number> = {
  success: 4000,
  info: 5000,
  warning: 6500,
  error: 7000,
}

export function notify(type: AppToastType, options: NotifyOptions) {
  const duration = DURATIONS[type] ?? 5000
  return toast.custom(
    (id) => (
      <AppToast
        id={id}
        type={type}
        title={options.title}
        description={options.description}
        duration={duration}
      />
    ),
    { duration },
  )
}
