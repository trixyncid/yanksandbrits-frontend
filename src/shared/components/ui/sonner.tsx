import type { CSSProperties } from 'react'
import { Toaster } from 'sonner'

/**
 * Hosts the app's toasts as top-centre notifications. The card itself lives
 * in `app-toast.tsx`; here we size the column so the card always fits it
 * (sonner's default column is a fixed 356px).
 */
export function AppToaster() {
  return (
    <Toaster
      position="top-center"
      offset={16}
      mobileOffset={12}
      gap={8}
      visibleToasts={3}
      // List toasts one under another instead of stacking them behind each
      // other, so text never overlaps.
      expand
      style={{ '--width': 'min(25rem, calc(100vw - 1.5rem))' } as CSSProperties}
      toastOptions={{
        unstyled: true,
        // Fill the column on wider screens; on phones sonner sizes it itself.
        className: 'min-[601px]:w-full',
      }}
    />
  )
}
