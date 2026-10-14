const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
})

/** Natural order, so "Room 2" comes before "Room 10". */
export function compareRoomNames(a: string, b: string): number {
  return collator.compare(a, b)
}

export function compareClassrooms(
  a: { className?: string | null; code?: string | null },
  b: { className?: string | null; code?: string | null },
): number {
  return (
    compareRoomNames(a.className ?? '', b.className ?? '') ||
    compareRoomNames(a.code ?? '', b.code ?? '')
  )
}
