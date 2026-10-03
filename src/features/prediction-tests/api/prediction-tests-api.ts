import {
  isCombinedIeltsProgram,
  isHskCourse,
  isIeltsCourse,
  isSatCourse,
  isToeflCourse,
  mapApprovalStatusFromApi,
  mapApprovalStatusToApi,
  programOptionsForCourse,
  type PredictionProgramCode,
} from '../../../shared/api/choices'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { parseCurrencyValue } from '../../../shared/lib/currency'
import type { ProspectiveStudentListItem } from '../../prospective-students/types/prospective-student'
import type {
  AcademicLeaderDecision,
  AcademicLeaderStatus,
  PredictionTestAttachment,
  PredictionTestFormValues,
  PredictionTestListItem,
} from '../types/prediction-test'
import type { PredictionTestListFilters } from './prediction-test-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type PredictionTestListResponse = {
  data: PredictionTestListItem[]
  meta: {
    total: number
  }
}

type PredictionTestAttachmentDto = {
  id: number
  file_key: string
  file_size: number
  file_url: string
  created_at: string
}

type PredictionTestDto = {
  id: number
  student: number
  student_name: string | null
  student_email?: string | null
  student_phone?: string | null
  student_sr_number?: string | null
  student_course?: string | null
  marketing?: number | null
  marketing_name?: string | null
  branch?: number | null
  branch_name?: string | null
  ielts_program?: string | null
  manager_approved?: boolean | null
  academic_leader_decision?: string | null
  academic_leader_remarks?: string | null
  academic_leader_status?: string | null
  effective_ielts_program?: string | null
  listening: string | number | null
  reading: string | number | null
  writing: string | number | null
  speaking: string | number | null
  math?: string | number | null
  listening_tutor?: number | null
  reading_tutor?: number | null
  writing_tutor?: number | null
  speaking_tutor?: number | null
  math_tutor?: number | null
  listening_tutor_name?: string | null
  reading_tutor_name?: string | null
  writing_tutor_name?: string | null
  speaking_tutor_name?: string | null
  math_tutor_name?: string | null
  listening_sessions?: number | null
  reading_sessions?: number | null
  writing_sessions?: number | null
  speaking_sessions?: number | null
  math_sessions?: number | null
  schedule_morning?: boolean | null
  schedule_afternoon?: boolean | null
  schedule_evening?: boolean | null
  schedule_note?: string | null
  description: string | null
  amount: number
  status: string
  attachments?: PredictionTestAttachmentDto[]
  imageURL: string | null
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

function scoreFromApi(value: string | number | null | undefined): number | null {
  if (value == null || value === '') {
    return null
  }
  const parsed = Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

function scoreToFormValue(value: number | null): string {
  return value == null ? '' : String(value)
}

function scoreToApiValue(value: string): number | null {
  const trimmed = value.trim().replace(',', '.')
  if (trimmed === '') {
    return null
  }
  const parsed = Number(trimmed)
  return Number.isNaN(parsed) ? null : parsed
}

function mapAttachment(dto: PredictionTestAttachmentDto): PredictionTestAttachment {
  return {
    id: String(dto.id),
    fileKey: dto.file_key,
    fileSize: dto.file_size,
    fileUrl: dto.file_url,
    createdAt: dto.created_at,
  }
}

function mapDecisionFromApi(
  value: string | null | undefined,
): AcademicLeaderDecision | null {
  if (value === 'AP') return 'approve'
  if (value === 'RJ') return 'reject'
  return null
}

function mapAcademicLeaderStatusFromApi(
  value: string | null | undefined,
  decision: AcademicLeaderDecision | null,
): AcademicLeaderStatus {
  if (value === '2_RV' || decision != null) {
    return 'reviewed'
  }
  return 'pending_review'
}

function mapDecisionToApi(
  value: AcademicLeaderDecision | '',
): string | null {
  if (value === 'approve') return 'AP'
  if (value === 'reject') return 'RJ'
  return null
}

function mapItem(dto: PredictionTestDto): PredictionTestListItem {
  const attachments = (dto.attachments ?? []).map(mapAttachment)
  const paymentProofUrl = attachments[0]?.fileUrl || dto.imageURL || ''

  return {
    id: String(dto.id),
    studentId: String(dto.student),
    studentName: dto.student_name ?? '—',
    studentEmail: dto.student_email ?? '',
    studentPhone: dto.student_phone ?? '',
    studentSrNumber: dto.student_sr_number ?? '',
    studentCourse: dto.student_course ?? null,
    ieltsProgram: (dto.ielts_program as PredictionProgramCode | null) ?? null,
    managerApproved: Boolean(dto.manager_approved),
    academicLeaderDecision: mapDecisionFromApi(dto.academic_leader_decision),
    academicLeaderRemarks: dto.academic_leader_remarks ?? '',
    academicLeaderStatus: mapAcademicLeaderStatusFromApi(
      dto.academic_leader_status,
      mapDecisionFromApi(dto.academic_leader_decision),
    ),
    effectiveIeltsProgram:
      (dto.effective_ielts_program as PredictionProgramCode | null) ?? null,
    listening: scoreFromApi(dto.listening),
    reading: scoreFromApi(dto.reading),
    writing: scoreFromApi(dto.writing),
    speaking: scoreFromApi(dto.speaking),
    math: scoreFromApi(dto.math),
    listeningTutorId:
      dto.listening_tutor == null ? null : String(dto.listening_tutor),
    readingTutorId:
      dto.reading_tutor == null ? null : String(dto.reading_tutor),
    writingTutorId:
      dto.writing_tutor == null ? null : String(dto.writing_tutor),
    speakingTutorId:
      dto.speaking_tutor == null ? null : String(dto.speaking_tutor),
    mathTutorId: dto.math_tutor == null ? null : String(dto.math_tutor),
    listeningTutorName: dto.listening_tutor_name ?? '',
    readingTutorName: dto.reading_tutor_name ?? '',
    writingTutorName: dto.writing_tutor_name ?? '',
    speakingTutorName: dto.speaking_tutor_name ?? '',
    mathTutorName: dto.math_tutor_name ?? '',
    listeningSessions: dto.listening_sessions ?? 0,
    readingSessions: dto.reading_sessions ?? 0,
    writingSessions: dto.writing_sessions ?? 0,
    speakingSessions: dto.speaking_sessions ?? 0,
    mathSessions: dto.math_sessions ?? 0,
    scheduleMorning: Boolean(dto.schedule_morning),
    scheduleAfternoon: Boolean(dto.schedule_afternoon),
    scheduleEvening: Boolean(dto.schedule_evening),
    scheduleNote: dto.schedule_note ?? '',
    description: dto.description ?? '',
    amount: dto.amount ?? 0,
    status: mapApprovalStatusFromApi(dto.status),
    educationCounsellor: dto.marketing_name ?? '—',
    attachments,
    hasPaymentProof: attachments.length > 0 || Boolean(paymentProofUrl),
    paymentProofUrl,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    branchId: dto.branch == null ? null : String(dto.branch),
    branch: dto.branch_name ?? '—',
  }
}

function tutorIdToApi(value: string): number | null {
  return value ? Number(value) : null
}

function sessionCountToApi(value: string): number {
  const trimmed = value.trim()
  if (trimmed === '') {
    return 0
  }
  return Number(trimmed)
}

function sessionCountToFormValue(value: number | null | undefined): string {
  if (value == null || value === 0) {
    return ''
  }
  return String(value)
}

type SessionSlot = {
  tutorKey:
    | 'listeningTutorId'
    | 'readingTutorId'
    | 'writingTutorId'
    | 'speakingTutorId'
    | 'mathTutorId'
  sessionsKey:
    | 'listeningSessions'
    | 'readingSessions'
    | 'writingSessions'
    | 'speakingSessions'
    | 'mathSessions'
}

const LISTENING_SLOT: SessionSlot = {
  tutorKey: 'listeningTutorId',
  sessionsKey: 'listeningSessions',
}
const WRITING_SLOT: SessionSlot = {
  tutorKey: 'writingTutorId',
  sessionsKey: 'writingSessions',
}
const SPEAKING_SLOT: SessionSlot = {
  tutorKey: 'speakingTutorId',
  sessionsKey: 'speakingSessions',
}
const MATH_SLOT: SessionSlot = {
  tutorKey: 'mathTutorId',
  sessionsKey: 'mathSessions',
}

function clearSessionSlots(
  values: PredictionTestFormValues,
  slots: SessionSlot[],
): PredictionTestFormValues {
  const next = { ...values }
  for (const slot of slots) {
    next[slot.tutorKey] = ''
    next[slot.sessionsKey] = ''
  }
  return next
}

/** Drop tutors and session counts that the current program layout does not use. */
export function applySessionLayout(
  values: PredictionTestFormValues,
  course: string | null | undefined,
): PredictionTestFormValues {
  if (isSatCourse(course)) {
    return clearSessionSlots(values, [LISTENING_SLOT, WRITING_SLOT, SPEAKING_SLOT])
  }
  if (isToeflCourse(course)) {
    return clearSessionSlots(values, [SPEAKING_SLOT, MATH_SLOT])
  }
  if (
    isIeltsCourse(course) &&
    isCombinedIeltsProgram(values.ieltsProgram)
  ) {
    return clearSessionSlots(values, [WRITING_SLOT, SPEAKING_SLOT, MATH_SLOT])
  }
  if (isIeltsCourse(course) || isHskCourse(course)) {
    return clearSessionSlots(values, [MATH_SLOT])
  }
  return values
}

function toJsonPayload(
  values: PredictionTestFormValues,
  options: {
    omitPayment?: boolean
    includeAcademicLeaderReview?: boolean
    includeManagerApproval?: boolean
    includeSessions?: boolean
    course?: string | null
  } = {},
) {
  const sessionValues = applySessionLayout(values, options.course)
  const payload: Record<string, unknown> = {
    student: Number(sessionValues.studentId),
    ielts_program: sessionValues.ieltsProgram || null,
    listening: scoreToApiValue(sessionValues.listening),
    reading: scoreToApiValue(sessionValues.reading),
    writing: scoreToApiValue(sessionValues.writing),
    speaking: scoreToApiValue(sessionValues.speaking),
    math: scoreToApiValue(sessionValues.math),
    schedule_morning: sessionValues.scheduleMorning,
    schedule_afternoon: sessionValues.scheduleAfternoon,
    schedule_evening: sessionValues.scheduleEvening,
    schedule_note: sessionValues.scheduleNote.trim() || null,
    description: sessionValues.description.trim() || null,
  }

  if (options.includeSessions) {
    payload.listening_tutor = tutorIdToApi(sessionValues.listeningTutorId)
    payload.reading_tutor = tutorIdToApi(sessionValues.readingTutorId)
    payload.writing_tutor = tutorIdToApi(sessionValues.writingTutorId)
    payload.speaking_tutor = tutorIdToApi(sessionValues.speakingTutorId)
    payload.math_tutor = tutorIdToApi(sessionValues.mathTutorId)
    payload.listening_sessions = sessionCountToApi(sessionValues.listeningSessions)
    payload.reading_sessions = sessionCountToApi(sessionValues.readingSessions)
    payload.writing_sessions = sessionCountToApi(sessionValues.writingSessions)
    payload.speaking_sessions = sessionCountToApi(sessionValues.speakingSessions)
    payload.math_sessions = sessionCountToApi(sessionValues.mathSessions)
  }

  if (options.includeManagerApproval) {
    payload.manager_approved = values.managerApproved
  }

  if (options.includeAcademicLeaderReview) {
    payload.academic_leader_decision = mapDecisionToApi(
      values.academicLeaderDecision,
    )
    payload.academic_leader_remarks =
      values.academicLeaderDecision === 'reject'
        ? values.academicLeaderRemarks.trim() || null
        : null
  }

  if (!options.omitPayment) {
    payload.branch = values.branchId ? Number(values.branchId) : null
    payload.amount = parseCurrencyValue(values.amount)
    payload.status = mapApprovalStatusToApi(values.status)
  }

  return payload
}

export async function fetchPredictionTests(
  filters: PredictionTestListFilters = {},
): Promise<PredictionTestListResponse> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
    marketing: filters.counsellorId ? Number(filters.counsellorId) : undefined,
  }

  if (filters.status && filters.status !== 'all') {
    params.status = mapApprovalStatusToApi(filters.status)
  }

  if (filters.managerApproval && filters.managerApproval !== 'all') {
    params.manager_approval = filters.managerApproval
  }

  if (
    filters.academicLeaderStatus &&
    filters.academicLeaderStatus !== 'all'
  ) {
    params.academic_leader_status =
      filters.academicLeaderStatus === 'reviewed' ? '2_RV' : '1_PR'
  }

  const { items, total } = await fetchAllPages<PredictionTestDto>({
    client: httpClient,
    path: adminPath('/prediction-tests'),
    params,
  })

  return {
    data: items.map(mapItem),
    meta: { total },
  }
}

export async function fetchPredictionTest(
  id: string,
): Promise<PredictionTestListItem> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<PredictionTestDto>>(
    adminPath(`/prediction-tests/${id}`),
  )
  return mapItem(data.data)
}

const multipartHeaders = {
  // Let the browser set multipart boundary (override JSON default).
  'Content-Type': undefined as unknown as string,
}

export async function createPredictionTest(
  values: PredictionTestFormValues,
  options: {
    omitPayment?: boolean
    includeAcademicLeaderReview?: boolean
    includeManagerApproval?: boolean
    includeSessions?: boolean
    course?: string | null
  } = {},
): Promise<PredictionTestListItem> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<PredictionTestDto>>(
    adminPath('/prediction-tests'),
    toJsonPayload(values, options),
  )

  if (data.data?.id == null) {
    throw new Error('Prediction test was created without an id.')
  }

  const id = String(data.data.id)
  if (!options.omitPayment) {
    for (const file of values.paymentProofFiles) {
      await uploadPredictionTestProof(id, file)
    }
  }
  return fetchPredictionTest(id)
}

export async function updatePredictionTest(
  id: string,
  values: PredictionTestFormValues,
  options: {
    omitPayment?: boolean
    includeAcademicLeaderReview?: boolean
    includeManagerApproval?: boolean
    includeSessions?: boolean
    course?: string | null
  } = {},
): Promise<PredictionTestListItem> {
  await httpClient.patch(
    adminPath(`/prediction-tests/${id}`),
    toJsonPayload(values, options),
  )
  if (!options.omitPayment) {
    for (const file of values.paymentProofFiles) {
      await uploadPredictionTestProof(id, file)
    }
  }
  return fetchPredictionTest(id)
}

export async function uploadPredictionTestProof(
  id: string,
  file: File,
): Promise<PredictionTestListItem> {
  const formData = new FormData()
  formData.append('payment_proof', file)
  const { data } = await httpClient.post<ApiSuccessEnvelope<PredictionTestDto>>(
    adminPath(`/prediction-tests/${id}/attachments`),
    formData,
    { headers: multipartHeaders },
  )
  return mapItem(data.data)
}

export async function deletePredictionTestProof(
  id: string,
  attachmentId: string,
): Promise<PredictionTestListItem> {
  const { data } = await httpClient.delete<ApiSuccessEnvelope<PredictionTestDto>>(
    adminPath(`/prediction-tests/${id}/attachments/${attachmentId}`),
  )
  return mapItem(data.data)
}

export async function deletePredictionTest(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/prediction-tests/${id}`))
}

export async function bulkUpdatePredictionTestStatus(
  ids: string[],
  status: PredictionTestFormValues['status'],
): Promise<{ updated: number; ids: number[]; status: string }> {
  const { data } = await httpClient.post<
    ApiSuccessEnvelope<{ updated: number; ids: number[]; status: string }>
  >(adminPath('/prediction-tests/bulk-status'), {
    ids: ids.map((id) => Number(id)),
    status: mapApprovalStatusToApi(status),
  })
  return data.data
}

export function predictionTestToFormValues(
  test: PredictionTestListItem,
): PredictionTestFormValues {
  const toefl = isToeflCourse(test.studentCourse)
  const sat = isSatCourse(test.studentCourse)
  const allowedPrograms = new Set(
    programOptionsForCourse(test.studentCourse).map((option) => option.value),
  )
  const assignedProgram =
    test.ieltsProgram && allowedPrograms.has(test.ieltsProgram)
      ? test.ieltsProgram
      : ''
  return {
    studentId: test.studentId,
    branchId: test.branchId ?? '',
    ieltsProgram: assignedProgram,
    managerApproved: test.managerApproved,
    academicLeaderDecision: test.academicLeaderDecision ?? '',
    academicLeaderRemarks: test.academicLeaderRemarks ?? '',
    listening: sat ? '' : scoreToFormValue(test.listening),
    reading: scoreToFormValue(test.reading),
    writing: sat ? '' : scoreToFormValue(test.writing),
    speaking: toefl || sat ? '' : scoreToFormValue(test.speaking),
    math: sat ? scoreToFormValue(test.math) : '',
    listeningTutorId: sat ? '' : (test.listeningTutorId ?? ''),
    readingTutorId: test.readingTutorId ?? '',
    writingTutorId: sat ? '' : (test.writingTutorId ?? ''),
    speakingTutorId: toefl || sat ? '' : (test.speakingTutorId ?? ''),
    mathTutorId: sat ? (test.mathTutorId ?? '') : '',
    listeningSessions: sat
      ? ''
      : sessionCountToFormValue(test.listeningSessions),
    readingSessions: sessionCountToFormValue(test.readingSessions),
    writingSessions: sat
      ? ''
      : sessionCountToFormValue(test.writingSessions),
    speakingSessions:
      toefl || sat ? '' : sessionCountToFormValue(test.speakingSessions),
    mathSessions: sat ? sessionCountToFormValue(test.mathSessions) : '',
    scheduleMorning: test.scheduleMorning,
    scheduleAfternoon: test.scheduleAfternoon,
    scheduleEvening: test.scheduleEvening,
    scheduleNote: test.scheduleNote,
    description: test.description,
    amount: String(test.amount),
    status: test.status,
    paymentProofFiles: [],
  }
}

export const emptyPredictionTestFormValues: PredictionTestFormValues = {
  studentId: '',
  branchId: '',
  ieltsProgram: '',
  managerApproved: false,
  academicLeaderDecision: '',
  academicLeaderRemarks: '',
  listening: '',
  reading: '',
  writing: '',
  speaking: '',
  math: '',
  listeningTutorId: '',
  readingTutorId: '',
  writingTutorId: '',
  speakingTutorId: '',
  mathTutorId: '',
  listeningSessions: '',
  readingSessions: '',
  writingSessions: '',
  speakingSessions: '',
  mathSessions: '',
  scheduleMorning: false,
  scheduleAfternoon: false,
  scheduleEvening: false,
  scheduleNote: '',
  description: '',
  amount: '',
  status: 'pending',
  paymentProofFiles: [],
}

export type ProspectiveStudentOption = Pick<
  ProspectiveStudentListItem,
  'id' | 'fullName' | 'phone' | 'email' | 'branchId' | 'course'
>

export async function fetchProspectiveStudentOptions(): Promise<
  ProspectiveStudentOption[]
> {
  const { items } = await fetchAllPages<{
    id: number
    full_name: string
    email: string | null
    phone: string
    branch: number | null
    course: string | null
  }>({
    client: httpClient,
    path: adminPath('/prospective-students'),
  })

  return items.map((item) => ({
    id: String(item.id),
    fullName: item.full_name,
    phone: item.phone ?? '',
    email: item.email ?? '',
    branchId: item.branch == null ? null : String(item.branch),
    course: item.course ?? '',
  }))
}
