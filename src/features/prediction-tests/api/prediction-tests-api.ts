import {
  isGeneralEnglishCourse,
  isSatCourse,
  isToeflCourse,
  mapApprovalStatusFromApi,
  mapApprovalStatusToApi,
} from '../../../shared/api/choices'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { parseCurrencyValue } from '../../../shared/lib/currency'
import type { ProspectiveStudentListItem } from '../../prospective-students/types/prospective-student'
import type {
  PredictionTestAttachment,
  PredictionTestFormValues,
  PredictionTestListItem,
} from '../types/prediction-test'
import {
  emptyGeneralEnglishSpeaking,
  generalEnglishSpeakingFromApi,
  generalEnglishSpeakingToApi,
} from '../lib/general-english-speaking'
import {
  emptyGeneralEnglishWriting,
  generalEnglishWritingFromApi,
  generalEnglishWritingToApi,
} from '../lib/general-english-writing'
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
  listening: string | number | null
  reading: string | number | null
  writing: string | number | null
  speaking: string | number | null
  math?: string | number | null
  written_test_score?: string | number | null
  general_english_tutor?: number | null
  general_english_tutor_name?: string | null
  general_english_speaking?: Record<
    string,
    boolean | string | null
  > | null
  general_english_writing?: Record<
    string,
    boolean | string | null
  > | null
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
    listening: scoreFromApi(dto.listening),
    reading: scoreFromApi(dto.reading),
    writing: scoreFromApi(dto.writing),
    speaking: scoreFromApi(dto.speaking),
    math: scoreFromApi(dto.math),
    writtenTestScore: scoreFromApi(dto.written_test_score),
    generalEnglishTutorId:
      dto.general_english_tutor == null
        ? null
        : String(dto.general_english_tutor),
    generalEnglishTutorName: dto.general_english_tutor_name ?? '',
    generalEnglishSpeaking: generalEnglishSpeakingFromApi(
      dto.general_english_speaking,
    ),
    generalEnglishWriting: generalEnglishWritingFromApi(
      dto.general_english_writing,
    ),
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

function toJsonPayload(
  values: PredictionTestFormValues,
  options: {
    omitPayment?: boolean
    includeGeneralEnglishTutor?: boolean
    course?: string | null
  } = {},
) {
  const generalEnglish = isGeneralEnglishCourse(options.course)
  const payload: Record<string, unknown> = {
    student: Number(values.studentId),
    listening: generalEnglish ? null : scoreToApiValue(values.listening),
    reading: generalEnglish ? null : scoreToApiValue(values.reading),
    writing: generalEnglish ? null : scoreToApiValue(values.writing),
    speaking: generalEnglish ? null : scoreToApiValue(values.speaking),
    math: generalEnglish ? null : scoreToApiValue(values.math),
    written_test_score: generalEnglish
      ? scoreToApiValue(values.writtenTestScore)
      : null,
    description: values.description.trim() || null,
  }

  if (generalEnglish) {
    payload.general_english_speaking = generalEnglishSpeakingToApi(
      values.generalEnglishSpeaking,
    )
    payload.general_english_writing = generalEnglishWritingToApi(
      values.generalEnglishWriting,
    )
  }

  if (options.includeGeneralEnglishTutor) {
    payload.general_english_tutor = isGeneralEnglishCourse(options.course)
      ? tutorIdToApi(values.generalEnglishTutorId)
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
    includeGeneralEnglishTutor?: boolean
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
    includeGeneralEnglishTutor?: boolean
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
  return {
    studentId: test.studentId,
    branchId: test.branchId ?? '',
    listening: sat ? '' : scoreToFormValue(test.listening),
    reading: scoreToFormValue(test.reading),
    writing: sat ? '' : scoreToFormValue(test.writing),
    speaking: toefl || sat ? '' : scoreToFormValue(test.speaking),
    math: sat ? scoreToFormValue(test.math) : '',
    writtenTestScore: isGeneralEnglishCourse(test.studentCourse)
      ? scoreToFormValue(test.writtenTestScore)
      : '',
    generalEnglishTutorId: test.generalEnglishTutorId ?? '',
    generalEnglishSpeaking: test.generalEnglishSpeaking,
    generalEnglishWriting: test.generalEnglishWriting,
    description: test.description,
    amount: String(test.amount),
    status: test.status,
    paymentProofFiles: [],
  }
}

export const emptyPredictionTestFormValues: PredictionTestFormValues = {
  studentId: '',
  branchId: '',
  listening: '',
  reading: '',
  writing: '',
  speaking: '',
  math: '',
  writtenTestScore: '',
  generalEnglishTutorId: '',
  generalEnglishSpeaking: emptyGeneralEnglishSpeaking(),
  generalEnglishWriting: emptyGeneralEnglishWriting(),
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
