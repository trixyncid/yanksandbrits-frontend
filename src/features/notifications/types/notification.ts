export type NotificationCategory =
  | 'payment'
  | 'schedule'
  | 'student'
  | 'leave'
  | 'system'

export type AppNotification = {
  id: string
  title: string
  body: string
  category: NotificationCategory
  createdAt: string
  read: boolean
  reference?: string
  branch?: string
  actor?: string
}
