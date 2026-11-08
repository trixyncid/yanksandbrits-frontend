import {
  BookOpen,
  CalendarDays,
  Clock3,
  Palette,
  Power,
  TriangleAlert,
} from 'lucide-react'
import type { FormEvent, ReactNode } from 'react'

import { FormSectionCard } from '../../../shared/components/feature-page'
import { FormSaveBar } from '../../../shared/components/page'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { StatusToggle } from '../../../shared/components/ui/status-toggle'
import { Textarea } from '../../../shared/components/ui/textarea'
import { cn } from '../../../shared/lib/cn'
import { STAFF_TYPE_OPTIONS } from '../../users/api/users-api'
import {
  PROGRAM_AUDIENCE_OPTIONS,
  type ProgramFormErrors,
  type ProgramFormValues,
  type ProgramListItem,
} from '../types/program'

const SUBJECT_CHOICES: { value: ProgramFormValues['subject']; label: string }[] = [
  { value: '', label: 'None' },
  ...STAFF_TYPE_OPTIONS.map((option) => ({
    value: option.value,
    label: option.label,
  })),
]

/** Ready-made pairs that read well on the schedule. */
const COLOR_PRESETS = [
  { background: '#253CA1', text: '#FFFFFF' },
  { background: '#0F766E', text: '#FFFFFF' },
  { background: '#7C3AED', text: '#FFFFFF' },
  { background: '#BE123C', text: '#FFFFFF' },
  { background: '#B45309', text: '#FFFFFF' },
  { background: '#DCE2F6', text: '#15225A' },
  { background: '#DCFCE7', text: '#14532D' },
  { background: '#FEF3C7', text: '#78350F' },
] as const

function FieldError({ message }: { message?: string }) {
  if (!message) {
    return null
  }

  return <p className="text-xs text-rose-500">{message}</p>
}

function Field({
  label,
  htmlFor,
  error,
  children,
  hint,
  required,
}: {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
  hint?: string
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="text-rose-500"> *</span> : null}
      </Label>
      {children}
      {hint ? <p className="text-xs text-slate-400">{hint}</p> : null}
      <FieldError message={error} />
    </div>
  )
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value))
}

function relativeLuminance(hex: string) {
  const match = /^#([0-9A-Fa-f]{6})$/.exec(hex.trim())
  if (!match) return null
  const channels = [0, 2, 4].map((offset) => {
    const value = parseInt(match[1].slice(offset, offset + 2), 16) / 255
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4
  })
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2]
}

/** WCAG contrast ratio, or null while either color is incomplete. */
function contrastRatio(background: string, text: string) {
  const first = relativeLuminance(background)
  const second = relativeLuminance(text)
  if (first == null || second == null) return null
  const [light, dark] = first > second ? [first, second] : [second, first]
  return (light + 0.05) / (dark + 0.05)
}

function ColorField({
  id,
  label,
  value,
  error,
  onChange,
}: {
  id: string
  label: string
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  return (
    <Field label={label} htmlFor={id} error={error}>
      <div className="flex items-center gap-2">
        <input
          aria-label={`${label} picker`}
          type="color"
          value={/^#[0-9A-Fa-f]{6}$/.test(value) ? value : '#253CA1'}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          className="size-11 shrink-0 cursor-pointer rounded-xl border border-slate-200 bg-white p-1"
        />
        <Input
          id={id}
          value={value}
          onChange={(event) => onChange(event.target.value.toUpperCase())}
          placeholder="#253CA1"
          className="font-mono uppercase"
          maxLength={7}
        />
      </div>
    </Field>
  )
}

/** Who the program is for: students, tutors, or both. */
function AudienceChoice({
  value,
  onChange,
}: {
  value: ProgramFormValues['audience']
  onChange: (value: ProgramFormValues['audience']) => void
}) {
  return (
    <div
      id="audience"
      role="radiogroup"
      aria-label="Intended for"
      className="grid grid-cols-3 gap-2"
    >
      {PROGRAM_AUDIENCE_OPTIONS.map((choice) => {
        const selected = value === choice.value
        return (
          <button
            key={choice.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(choice.value)}
            className={cn(
              'h-10 rounded-full border px-3 text-sm font-semibold transition',
              selected
                ? 'border-ink bg-ink text-white'
                : 'border-transparent bg-canvas text-slate-600 hover:bg-canvas-deep hover:text-ink',
            )}
          >
            {choice.label}
          </button>
        )
      })}
    </div>
  )
}

function SubjectChoice({
  value,
  onChange,
}: {
  value: ProgramFormValues['subject']
  onChange: (value: ProgramFormValues['subject']) => void
}) {
  return (
    <div
      id="subject"
      role="radiogroup"
      aria-label="Subject"
      className="grid grid-cols-2 gap-2 sm:grid-cols-5"
    >
      {SUBJECT_CHOICES.map((choice) => {
        const selected = value === choice.value
        return (
          <button
            key={choice.value || 'none'}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(choice.value)}
            className={cn(
              'h-10 rounded-full border px-3 text-sm font-semibold transition',
              selected
                ? 'border-ink bg-ink text-white'
                : 'border-transparent bg-canvas text-slate-600 hover:bg-canvas-deep hover:text-ink',
            )}
          >
            {choice.label}
          </button>
        )
      })}
    </div>
  )
}

function ProgramPreview({ values }: { values: ProgramFormValues }) {
  const background = values.backgroundColor || '#FFFFFF'
  const text = values.textColor || '#000000'
  const code = values.code.trim() || 'CODE'
  const title = values.title.trim() || 'Program title'

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
          On the schedule
        </p>
        <div
          className="mt-1.5 rounded-xl px-3 py-2.5 shadow-sm ring-1 ring-black/5"
          style={{ backgroundColor: background, color: text }}
        >
          <p className="text-xs font-bold">{code}</p>
          <p className="truncate text-xs opacity-90">{title}</p>
          <p className="mt-1 text-[11px] opacity-80">09:00 – 10:30 · Room A</p>
        </div>
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-[0.12em] text-slate-400 uppercase">
          In lists
        </p>
        <div className="mt-1.5 flex items-center gap-2.5 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5">
          <div
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl text-[10px] font-bold ring-1 ring-black/5"
            style={{ backgroundColor: background, color: text }}
          >
            {code.replace(/[^A-Za-z0-9]/g, '').slice(0, 3).toUpperCase() || '?'}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">
              {title}
            </p>
            <p className="truncate font-mono text-xs text-slate-500">{code}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

type ProgramFormProps = {
  mode: 'create' | 'edit'
  values: ProgramFormValues
  errors: ProgramFormErrors
  isSubmitting: boolean
  meta?: Pick<ProgramListItem, 'createdAt' | 'updatedAt' | 'createdBy'>
  onChange: <K extends keyof ProgramFormValues>(
    field: K,
    value: ProgramFormValues[K],
  ) => void
  onSubmit: () => void | Promise<void>
  onCancel: () => void
  onDelete?: () => void
}

export function ProgramForm({
  mode,
  values,
  errors,
  isSubmitting,
  meta,
  onChange,
  onSubmit,
  onCancel,
  onDelete,
}: ProgramFormProps) {
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await onSubmit()
  }

  const contrast = contrastRatio(values.backgroundColor, values.textColor)
  const hardToRead = contrast != null && contrast < 4.5

  return (
    <form className="space-y-3" onSubmit={handleSubmit} noValidate>
      <div className="grid items-start gap-3 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-3">
          <FormSectionCard
            icon={BookOpen}
            title="Program"
            description="What students enroll in and tutors teach."
          >
            <div className="grid gap-3 sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)]">
              <Field
                label="Code"
                htmlFor="code"
                error={errors.code}
                required
              >
                <Input
                  id="code"
                  value={values.code}
                  onChange={(event) => onChange('code', event.target.value)}
                  placeholder="IELTS-INT"
                  className="font-mono"
                />
              </Field>
              <Field
                label="Title"
                htmlFor="title"
                error={errors.title}
                required
              >
                <Input
                  id="title"
                  value={values.title}
                  onChange={(event) => onChange('title', event.target.value)}
                  placeholder="IELTS Intensive"
                />
              </Field>
            </div>

            <Field
              label="Subject"
              htmlFor="subject"
              error={errors.subject}
              hint="Decides which academic leader sees this program in an Additional Program class. With no subject, every academic leader sees it."
            >
              <SubjectChoice
                value={values.subject}
                onChange={(subject) => onChange('subject', subject)}
              />
            </Field>

            <Field
              label="Intended for"
              htmlFor="audience"
              error={errors.audience}
              hint="Who this program is for: students taking it, tutors teaching it, or both. For labelling only."
            >
              <AudienceChoice
                value={values.audience}
                onChange={(audience) => onChange('audience', audience)}
              />
            </Field>

            <Field
              label="Description"
              htmlFor="description"
              error={errors.description}
            >
              <Textarea
                id="description"
                value={values.description}
                onChange={(event) =>
                  onChange('description', event.target.value)
                }
                placeholder="What this program covers, level, or package details (optional)"
                className="min-h-24"
              />
            </Field>
          </FormSectionCard>

          <FormSectionCard
            icon={Palette}
            title="Schedule Colors"
            description="How this program stands out on the class schedule."
            delayClassName="delay-75"
          >
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-slate-700">Quick pick</p>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => {
                  const selected =
                    values.backgroundColor === preset.background &&
                    values.textColor === preset.text
                  return (
                    <button
                      key={preset.background}
                      type="button"
                      aria-label={`Use ${preset.background} with ${preset.text} text`}
                      aria-pressed={selected}
                      onClick={() => {
                        onChange('backgroundColor', preset.background)
                        onChange('textColor', preset.text)
                      }}
                      className={cn(
                        'inline-flex size-9 items-center justify-center rounded-xl text-xs font-bold ring-1 ring-black/5 transition hover:-translate-y-0.5',
                        selected &&
                          'ring-2 ring-ink ring-offset-2 ring-offset-white',
                      )}
                      style={{
                        backgroundColor: preset.background,
                        color: preset.text,
                      }}
                    >
                      Aa
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <ColorField
                id="backgroundColor"
                label="Background"
                value={values.backgroundColor}
                error={errors.backgroundColor}
                onChange={(value) => onChange('backgroundColor', value)}
              />
              <ColorField
                id="textColor"
                label="Text"
                value={values.textColor}
                error={errors.textColor}
                onChange={(value) => onChange('textColor', value)}
              />
            </div>

            {hardToRead ? (
              <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-xs text-amber-900">
                <TriangleAlert className="mt-0.5 size-3.5 shrink-0" />
                <p>
                  The text may be hard to read on this background. Try a
                  darker or lighter text color, or pick a pair above.
                </p>
              </div>
            ) : null}
          </FormSectionCard>
        </div>

        <div className="space-y-3 lg:sticky lg:top-4">
          <FormSectionCard
            icon={CalendarDays}
            title="Preview"
            description="Updates as you type."
            delayClassName="delay-75"
          >
            <ProgramPreview values={values} />
          </FormSectionCard>

          <FormSectionCard
            icon={Power}
            title="Availability"
            description="Inactive programs stay on old records but can't be picked for new ones."
            delayClassName="delay-100"
          >
            <StatusToggle
              id="program-is-active"
              label=""
              value={values.isActive}
              onChange={(next) => onChange('isActive', next)}
              error={errors.isActive}
            />
          </FormSectionCard>

          {mode === 'edit' && meta ? (
            <FormSectionCard
              icon={Clock3}
              title="Record Info"
              description="System details for this program."
              delayClassName="delay-100"
            >
              <dl className="grid gap-2">
                <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                  <dt className="text-xs text-slate-500">Date created</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                    {formatDateTime(meta.createdAt)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                  <dt className="text-xs text-slate-500">Date updated</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                    {formatDateTime(meta.updatedAt)}
                  </dd>
                </div>
                <div className="rounded-2xl bg-canvas px-3.5 py-2.5">
                  <dt className="text-xs text-slate-500">Created by</dt>
                  <dd className="mt-0.5 text-sm font-semibold text-slate-800">
                    {meta.createdBy || '-'}
                  </dd>
                </div>
              </dl>
            </FormSectionCard>
          ) : null}
        </div>
      </div>

      <FormSaveBar
        mode={mode}
        isSubmitting={isSubmitting}
        onCancel={onCancel}
        onDelete={onDelete}
        deleteLabel="Delete program"
        submitLabel={mode === 'create' ? 'Create program' : undefined}
        hint="Check the preview before saving."
      />
    </form>
  )
}
