import { Pencil, Trash2 } from 'lucide-react'

import { Can } from '../../auth/components/can'

type LookupModule = 'institutions' | 'occupations' | 'resources'

/** Round edit / delete buttons used in every lookup table row. */
export function LookupRowActions({
  module,
  noun,
  name,
  onEdit,
  onDelete,
}: {
  module: LookupModule
  /** Singular record type, e.g. "institution". */
  noun: string
  name: string
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Can module={module} action="change">
        <button
          type="button"
          aria-label={`Edit ${noun} ${name}`}
          title={`Edit ${noun}`}
          onClick={onEdit}
          className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-ink transition hover:bg-ink hover:text-white"
        >
          <Pencil className="size-3.5" />
        </button>
      </Can>
      <Can module={module} action="delete">
        <button
          type="button"
          aria-label={`Delete ${noun} ${name}`}
          title={`Delete ${noun}`}
          onClick={onDelete}
          className="inline-flex size-9 items-center justify-center rounded-full bg-canvas text-rose-500 transition hover:bg-rose-500 hover:text-white"
        >
          <Trash2 className="size-3.5" />
        </button>
      </Can>
    </div>
  )
}
