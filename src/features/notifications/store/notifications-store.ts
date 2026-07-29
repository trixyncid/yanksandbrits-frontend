import { create } from 'zustand'

import { notificationsPlaceholder } from '../data/notifications-placeholder'
import type { AppNotification } from '../types/notification'

type NotificationsState = {
  items: AppNotification[]
  getById: (id: string) => AppNotification | undefined
  markRead: (id: string) => void
  markAllRead: () => void
  remove: (id: string) => void
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: notificationsPlaceholder,
  getById: (id) => get().items.find((item) => item.id === id),
  markRead: (id) =>
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, read: true } : item,
      ),
    })),
  markAllRead: () =>
    set((state) => ({
      items: state.items.map((item) => ({ ...item, read: true })),
    })),
  remove: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
    })),
}))
