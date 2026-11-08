import { useEffect, useMemo } from 'react'

const pendingRevokes = new WeakMap<string[], ReturnType<typeof setTimeout>>()

/**
 * Blob URLs for previewing local files, revoked when the files change or the
 * component unmounts. The revoke is deferred one tick so StrictMode's
 * unmount/remount of the same effect can cancel it instead of leaving the
 * previews pointing at revoked URLs.
 */
export function useObjectUrls(files: File[] | undefined): string[] {
  const urls = useMemo(
    () => (files ?? []).map((file) => URL.createObjectURL(file)),
    [files],
  )

  useEffect(() => {
    const pending = pendingRevokes.get(urls)
    if (pending !== undefined) {
      clearTimeout(pending)
      pendingRevokes.delete(urls)
    }
    return () => {
      pendingRevokes.set(
        urls,
        setTimeout(() => {
          pendingRevokes.delete(urls)
          for (const url of urls) {
            URL.revokeObjectURL(url)
          }
        }, 0),
      )
    }
  }, [urls])

  return urls
}
