import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'

export type TrainingSessionStatus = 'booked' | 'done' | 'cancelled'

/** One entry on a tutor's timeline: training they take, or a class they teach. */
export type TrainingTimelineSession = {
  id: string
  kind: 'training' | 'teaching'
  trainingId: string | null
  start: string
  end: string
  status: TrainingSessionStatus
  program: string
  classroom: string
  /** Training: the academic leader. Teaching: the student, group, or trainee. */
  withName: string
}

export type TutorTraining = {
  id: string
  tutorId: string
  tutorName: string
  leaderId: string
  leaderName: string
  programId: string
  programTitle: string
  plannedSessions: number
  doneSessions: number
  bookedSessions: number
  nextSession: TrainingTimelineSession | null
  sessions: TrainingTimelineSession[]
  note: string
}

export type TrainingOptions = {
  programs: { id: string; title: string; code: string }[]
  leaders: { id: string; fullName: string }[]
  canManageAll: boolean
}

type SessionDto = {
  id: number
  kind: 'training' | 'teaching'
  training_id: number | null
  start: string
  end: string
  status: string
  program: string
  classroom: string
  with: string
}

type TrainingDto = {
  id: number
  tutor: number
  tutor_name: string
  leader: number
  leader_name: string
  program: number
  program_title: string
  planned_sessions: number
  done_sessions: number
  booked_sessions: number
  next_session: SessionDto | null
  sessions: SessionDto[]
  note: string
}

const STATUS_FROM_API: Record<string, TrainingSessionStatus> = {
  '1_ON': 'booked',
  '2_FN': 'done',
  '3_CN': 'cancelled',
}
const STATUS_TO_API: Record<TrainingSessionStatus, string> = {
  booked: '1_ON',
  done: '2_FN',
  cancelled: '3_CN',
}

function mapSession(dto: SessionDto): TrainingTimelineSession {
  return {
    id: String(dto.id),
    kind: dto.kind,
    trainingId: dto.training_id == null ? null : String(dto.training_id),
    start: dto.start,
    end: dto.end,
    status: STATUS_FROM_API[dto.status] ?? 'booked',
    program: dto.program,
    classroom: dto.classroom,
    withName: dto.with,
  }
}

function mapTraining(dto: TrainingDto): TutorTraining {
  return {
    id: String(dto.id),
    tutorId: String(dto.tutor),
    tutorName: dto.tutor_name,
    leaderId: String(dto.leader),
    leaderName: dto.leader_name,
    programId: String(dto.program),
    programTitle: dto.program_title,
    plannedSessions: dto.planned_sessions,
    doneSessions: dto.done_sessions,
    bookedSessions: dto.booked_sessions,
    nextSession: dto.next_session ? mapSession(dto.next_session) : null,
    sessions: dto.sessions.map(mapSession),
    note: dto.note,
  }
}

const BASE = '/tutor-trainings'

export const tutorTrainingQueryKeys = {
  all: ['tutor-trainings'] as const,
  forTutor: (tutorId: string) => [...tutorTrainingQueryKeys.all, 'tutor', tutorId] as const,
  timeline: (tutorId: string, range: 'upcoming' | 'past') =>
    [...tutorTrainingQueryKeys.all, 'timeline', tutorId, range] as const,
  options: (tutorId: string) => [...tutorTrainingQueryKeys.all, 'options', tutorId] as const,
}

export async function fetchTutorTrainings(tutorId: string): Promise<TutorTraining[]> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<TrainingDto[]>>(adminPath(BASE), {
    params: { tutor: tutorId },
  })
  return (data.data ?? []).map(mapTraining)
}

export async function fetchTrainingTimeline(
  tutorId: string,
  range: 'upcoming' | 'past',
): Promise<TrainingTimelineSession[]> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<{ sessions: SessionDto[] }>>(
    adminPath(`${BASE}/timeline`),
    { params: { tutor: tutorId, range } },
  )
  return (data.data?.sessions ?? []).map(mapSession)
}

export async function fetchTrainingOptions(tutorId: string): Promise<TrainingOptions> {
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<{
      programs: Array<{ id: number; title: string; code: string }>
      leaders: Array<{ id: number; full_name: string }>
      can_manage_all: boolean
    }>
  >(adminPath(`${BASE}/options`), { params: { tutor: tutorId } })
  return {
    programs: data.data.programs.map((p) => ({ id: String(p.id), title: p.title, code: p.code })),
    leaders: data.data.leaders.map((l) => ({ id: String(l.id), fullName: l.full_name })),
    canManageAll: data.data.can_manage_all,
  }
}

export async function assignTraining(values: {
  tutorId: string
  programId: string
  leaderId: string | null
  plannedSessions: number
  note: string
}): Promise<TutorTraining> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<TrainingDto>>(adminPath(BASE), {
    tutor: Number(values.tutorId),
    program: Number(values.programId),
    leader: values.leaderId ? Number(values.leaderId) : null,
    planned_sessions: values.plannedSessions,
    note: values.note,
  })
  return mapTraining(data.data)
}

export async function updateTraining(
  id: string,
  values: { plannedSessions?: number; note?: string },
): Promise<TutorTraining> {
  const { data } = await httpClient.patch<ApiSuccessEnvelope<TrainingDto>>(
    adminPath(`${BASE}/${id}`),
    { planned_sessions: values.plannedSessions, note: values.note },
  )
  return mapTraining(data.data)
}

export async function removeTraining(id: string): Promise<void> {
  await httpClient.delete(adminPath(`${BASE}/${id}`))
}

/** Book sessions weekly from ``start``; all are booked or none. */
export async function scheduleTrainingSessions(
  id: string,
  values: { start: string; end: string; classroomId: string | null; repeatWeeks: number },
): Promise<TutorTraining> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<TrainingDto>>(
    adminPath(`${BASE}/${id}/sessions`),
    {
      start_time: values.start,
      end_time: values.end,
      classroom: values.classroomId ? Number(values.classroomId) : null,
      repeat_weeks: values.repeatWeeks,
    },
  )
  return mapTraining(data.data)
}

export async function setTrainingSessionStatus(
  sessionId: string,
  status: TrainingSessionStatus,
): Promise<void> {
  await httpClient.post(adminPath(`${BASE}/sessions/${sessionId}/status`), {
    status: STATUS_TO_API[status],
  })
}

export async function deleteTrainingSession(sessionId: string): Promise<void> {
  await httpClient.delete(adminPath(`${BASE}/sessions/${sessionId}`))
}
