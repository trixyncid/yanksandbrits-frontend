import { useQueryClient } from '@tanstack/react-query'
import { addWeeks, format } from 'date-fns'
import { useState, type FormEvent, type ReactNode } from 'react'

import { getApiErrorMessage } from '../../../shared/api/errors'
import { Button } from '../../../shared/components/ui/button'
import { DatePicker } from '../../../shared/components/ui/date-picker'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../shared/components/ui/dialog'
import { Input } from '../../../shared/components/ui/input'
import { Label } from '../../../shared/components/ui/label'
import { Select } from '../../../shared/components/ui/select'
import { Textarea } from '../../../shared/components/ui/textarea'
import { notify } from '../../../shared/lib/notify'
import { useClassroomsQuery } from '../../classrooms/hooks/use-classrooms-query'
import {
  assignTraining,
  scheduleTrainingSessions,
  tutorTrainingQueryKeys,
  updateTraining,
  type TrainingOptions,
  type TutorTraining,
} from '../api/tutor-training-api'

function FormRow({ label, htmlFor, hint, error, children }: {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {!error && hint ? <p className="text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}

function useRefresh() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: tutorTrainingQueryKeys.all })
}

/** Reset local state each time a dialog opens. */
function useOnOpen(open: boolean, reset: () => void) {
  const [wasOpen, setWasOpen] = useState(open)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) reset()
  }
}

export function AssignTrainingDialog({
  open,
  onOpenChange,
  tutorId,
  tutorName,
  options,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  tutorId: string
  tutorName: string
  options: TrainingOptions | undefined
}) {
  const refresh = useRefresh()
  const [programId, setProgramId] = useState('')
  const [leaderId, setLeaderId] = useState('')
  const [planned, setPlanned] = useState('4')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  useOnOpen(open, () => {
    setProgramId('')
    setLeaderId(options?.leaders.length === 1 ? options.leaders[0].id : '')
    setPlanned('4')
    setNote('')
  })
  const programs = options?.programs ?? []
  const needsLeader = Boolean(options?.canManageAll)
  const plannedCount = Number(planned)
  const valid =
    programId && plannedCount >= 1 && plannedCount <= 200 && (!needsLeader || leaderId)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || saving) return
    setSaving(true)
    try {
      const training = await assignTraining({
        tutorId,
        programId,
        leaderId: needsLeader ? leaderId : null,
        plannedSessions: plannedCount,
        note,
      })
      await refresh()
      notify('success', {
        title: 'Training assigned',
        description: `${training.programTitle} for ${tutorName}. Book its sessions next.`,
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', { title: 'Unable to assign training', description: getApiErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate>
          <DialogHeader>
            <DialogTitle>Assign training</DialogTitle>
            <DialogDescription>
              Pick a program intended for tutors. {tutorName}&apos;s academic leader teaches it.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 space-y-4">
            <FormRow
              label="Training program"
              htmlFor="training-program"
              hint={programs.length === 0 ? 'No programs are marked “Intended for: Tutor” yet. Set one on the Programs page.' : undefined}
            >
              <Select
                id="training-program"
                containerClassName="w-full sm:w-full"
                value={programId}
                onChange={(event) => setProgramId(event.target.value)}
              >
                <option value="">Select a program...</option>
                {programs.map((program) => (
                  <option key={program.id} value={program.id}>
                    {program.title}
                  </option>
                ))}
              </Select>
            </FormRow>
            {needsLeader ? (
              <FormRow
                label="Academic leader (teaches it)"
                htmlFor="training-leader"
                hint={
                  options?.leaders.length
                    ? 'Only leaders in this tutor’s branch who share a subject.'
                    : 'No academic leader covers this tutor’s branch and subject.'
                }
              >
                <Select
                  id="training-leader"
                  containerClassName="w-full sm:w-full"
                  value={leaderId}
                  onChange={(event) => setLeaderId(event.target.value)}
                >
                  <option value="">Select an academic leader...</option>
                  {(options?.leaders ?? []).map((leader) => (
                    <option key={leader.id} value={leader.id}>
                      {leader.fullName}
                    </option>
                  ))}
                </Select>
              </FormRow>
            ) : null}
            <FormRow label="Planned sessions" htmlFor="training-planned">
              <Input
                id="training-planned"
                type="number"
                min={1}
                max={200}
                value={planned}
                onChange={(event) => setPlanned(event.target.value)}
              />
            </FormRow>
            <FormRow label="Note (optional)" htmlFor="training-note">
              <Textarea
                id="training-note"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Goals or focus areas"
              />
            </FormRow>
          </div>
          <DialogFooter>
            <Button type="button" variant="soft" disabled={saving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || saving}>
              {saving ? 'Assigning...' : 'Assign training'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function ScheduleSessionsDialog({
  open,
  onOpenChange,
  training,
  branchId,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  training: TutorTraining | null
  branchId: string | null
}) {
  const refresh = useRefresh()
  const classroomsQuery = useClassroomsQuery({ isActive: 'active', branchId: branchId ?? undefined })
  const [day, setDay] = useState<Date | undefined>(undefined)
  const [startTime, setStartTime] = useState('10:00')
  const [endTime, setEndTime] = useState('11:00')
  const [roomId, setRoomId] = useState('')
  const [weeks, setWeeks] = useState('1')
  const [saving, setSaving] = useState(false)
  useOnOpen(open, () => {
    setDay(undefined)
    setStartTime('10:00')
    setEndTime('11:00')
    setRoomId('')
    setWeeks('1')
  })
  if (!training) return null

  const left = Math.max(training.plannedSessions - training.bookedSessions, 0)
  const weekCount = Number(weeks) || 0
  const timesValid = Boolean(startTime && endTime && endTime > startTime)
  const valid = Boolean(day) && timesValid && weekCount >= 1 && weekCount <= Math.min(12, left)
  const dates = day && weekCount > 0 ? Array.from({ length: Math.min(weekCount, 12) }, (_, i) => addWeeks(day, i)) : []

  function at(date: Date, time: string) {
    const [hours, minutes] = time.split(':').map(Number)
    const value = new Date(date)
    value.setHours(hours, minutes, 0, 0)
    return value.toISOString()
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || !day || saving || !training) return
    setSaving(true)
    try {
      await scheduleTrainingSessions(training.id, {
        start: at(day, startTime),
        end: at(day, endTime),
        classroomId: roomId || null,
        repeatWeeks: weekCount,
      })
      await refresh()
      notify('success', {
        title: weekCount === 1 ? 'Session booked' : `${weekCount} sessions booked`,
        description: `${training.programTitle} with ${training.leaderName}.`,
      })
      onOpenChange(false)
    } catch (error) {
      notify('error', { title: 'Unable to book sessions', description: getApiErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate>
          <DialogHeader>
            <DialogTitle>Book training sessions</DialogTitle>
            <DialogDescription>
              {training.programTitle} · {left} of {training.plannedSessions} planned sessions left to
              book. Clashes with classes or other training are checked for both of you.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-5 space-y-4">
            <FormRow label="First session" htmlFor="training-day">
              <DatePicker value={day} onChange={setDay} placeholder="Pick a date" align="start" />
            </FormRow>
            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Starts" htmlFor="training-start">
                <Input id="training-start" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </FormRow>
              <FormRow
                label="Ends"
                htmlFor="training-end"
                error={startTime && endTime && !timesValid ? 'Must end after it starts.' : undefined}
              >
                <Input id="training-end" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </FormRow>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <FormRow label="Room (optional)" htmlFor="training-room" hint="Leave empty if online.">
                <Select
                  id="training-room"
                  containerClassName="w-full sm:w-full"
                  value={roomId}
                  onChange={(event) => setRoomId(event.target.value)}
                >
                  <option value="">No room</option>
                  {(classroomsQuery.data?.data ?? []).map((room) => (
                    <option key={room.id} value={room.id}>
                      {room.className}
                    </option>
                  ))}
                </Select>
              </FormRow>
              <FormRow
                label="Repeat weekly"
                htmlFor="training-weeks"
                error={weekCount > left ? `Only ${left} left to book.` : undefined}
                hint="Number of weeks"
              >
                <Input
                  id="training-weeks"
                  type="number"
                  min={1}
                  max={Math.min(12, Math.max(left, 1))}
                  value={weeks}
                  onChange={(event) => setWeeks(event.target.value)}
                />
              </FormRow>
            </div>
            {dates.length > 0 && timesValid ? (
              <div className="rounded-2xl bg-violet-50 p-3 text-xs text-violet-900">
                <p className="font-semibold">
                  {dates.length === 1 ? 'Books' : `Books ${dates.length} sessions`}
                </p>
                <ul className="mt-1 space-y-0.5">
                  {dates.map((date) => (
                    <li key={date.toISOString()}>
                      {format(date, 'EEE d MMM yyyy')} · {startTime}–{endTime}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="button" variant="soft" disabled={saving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || saving}>
              {saving ? 'Booking...' : weekCount > 1 ? `Book ${weekCount} sessions` : 'Book session'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function EditTrainingDialog({
  open,
  onOpenChange,
  training,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  training: TutorTraining | null
}) {
  const refresh = useRefresh()
  const [planned, setPlanned] = useState('')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  useOnOpen(open, () => {
    setPlanned(String(training?.plannedSessions ?? ''))
    setNote(training?.note ?? '')
  })
  if (!training) return null
  const plannedCount = Number(planned)
  const valid = plannedCount >= Math.max(training.bookedSessions, 1) && plannedCount <= 200

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!valid || saving || !training) return
    setSaving(true)
    try {
      await updateTraining(training.id, { plannedSessions: plannedCount, note })
      await refresh()
      notify('success', { title: 'Training updated', description: training.programTitle })
      onOpenChange(false)
    } catch (error) {
      notify('error', { title: 'Unable to update training', description: getApiErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !saving && onOpenChange(next)}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate>
          <DialogHeader>
            <DialogTitle>Edit training</DialogTitle>
            <DialogDescription>{training.programTitle} with {training.leaderName}</DialogDescription>
          </DialogHeader>
          <div className="mt-5 space-y-4">
            <FormRow
              label="Planned sessions"
              htmlFor="edit-training-planned"
              error={
                planned && plannedCount < training.bookedSessions
                  ? `At least ${training.bookedSessions}: sessions already booked or done.`
                  : undefined
              }
            >
              <Input
                id="edit-training-planned"
                type="number"
                min={Math.max(training.bookedSessions, 1)}
                max={200}
                value={planned}
                onChange={(event) => setPlanned(event.target.value)}
              />
            </FormRow>
            <FormRow label="Note" htmlFor="edit-training-note">
              <Textarea id="edit-training-note" value={note} onChange={(event) => setNote(event.target.value)} />
            </FormRow>
          </div>
          <DialogFooter>
            <Button type="button" variant="soft" disabled={saving} onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={!valid || saving}>
              {saving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
