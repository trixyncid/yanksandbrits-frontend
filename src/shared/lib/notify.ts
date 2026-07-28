import { toast } from 'sonner'

export type AppToastType = 'success' | 'error' | 'info' | 'warning'

type NotifyOptions = {
  title: string
  description?: string
}

export function notify(type: AppToastType, options: NotifyOptions) {
  const description = options.description

  switch (type) {
    case 'success':
      return toast.success(options.title, { description })
    case 'error':
      return toast.error(options.title, { description })
    case 'warning':
      return toast.warning(options.title, { description })
    case 'info':
    default:
      return toast.info(options.title, { description })
  }
}
