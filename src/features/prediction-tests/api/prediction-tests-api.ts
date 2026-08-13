import {
  mapApprovalStatusFromApi,
  mapApprovalStatusToApi,
} from '../../../shared/api/choices'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { parseCurrencyValue } from '../../../shared/lib/currency'
import type { ProspectiveStudentListItem } from '../../prospective-students/types/prospective-student'
import type {
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

type PredictionTestDto = {
  id: number
  student: number
  student_name: string | null
  student_email?: string | null
  student_phone?: string | null
  marketing?: number | null
  marketing_name?: string | null
  branch_name?: string | null
  score: number | null
  description: string | null
  amount: number
  status: string
  payment_proof: string | null
  imageURL: string | null
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

function proofUrl(dto: PredictionTestDto) {
  return dto.imageURL || dto.payment_proof || ''
}

function mapItem(dto: PredictionTestDto): PredictionTestListItem {
  const url = proofUrl(dto)

  return {
    id: String(dto.id),
    studentId: String(dto.student),
    studentName: dto.student_name ?? '—',
    studentEmail: dto.student_email ?? '',
    studentPhone: dto.student_phone ?? '',
    score: dto.score == null || dto.score === 0 ? null : dto.score,
    description: dto.description ?? '',
    amount: dto.amount ?? 0,
    status: mapApprovalStatusFromApi(dto.status),
    educationCounsellor: dto.marketing_name ?? '—',
    hasPaymentProof: Boolean(url),
    paymentProofUrl: url,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    branch: dto.branch_name ?? '—',
  }
}

function toJsonPayload(values: PredictionTestFormValues) {
  const scoreTrimmed = values.score.trim()
  return {
    student: Number(values.studentId),
    score: scoreTrimmed === '' ? 0 : Number(scoreTrimmed),
    description: values.description.trim() || null,
    amount: parseCurrencyValue(values.amount),
    status: mapApprovalStatusToApi(values.status),
  }
}

function toFormDataPayload(values: PredictionTestFormValues) {
  const payload = toJsonPayload(values)
  const formData = new FormData()
  formData.append('student', String(payload.student))
  formData.append('score', String(payload.score))
  if (payload.description != null) {
    formData.append('description', payload.description)
  }
  formData.append('amount', String(payload.amount))
  formData.append('status', payload.status)
  if (values.paymentProofFile) {
    formData.append('payment_proof', values.paymentProofFile)
  }
  return formData
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
): Promise<PredictionTestListItem> {
  const { data } = values.paymentProofFile
    ? await httpClient.post<ApiSuccessEnvelope<PredictionTestDto>>(
        adminPath('/prediction-tests'),
        toFormDataPayload(values),
        { headers: multipartHeaders },
      )
    : await httpClient.post<ApiSuccessEnvelope<PredictionTestDto>>(
        adminPath('/prediction-tests'),
        toJsonPayload(values),
      )

  if (data.data?.id != null) {
    return fetchPredictionTest(String(data.data.id))
  }

  return {
    id: '',
    studentId: values.studentId,
    studentName: '—',
    studentEmail: '',
    studentPhone: '',
    score: values.score.trim() === '' ? null : Number(values.score),
    description: values.description.trim(),
    amount: parseCurrencyValue(values.amount),
    status: values.status,
    educationCounsellor: '—',
    hasPaymentProof: Boolean(values.paymentProofFile),
    paymentProofUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    branch: '—',
  }
}

export async function updatePredictionTest(
  id: string,
  values: PredictionTestFormValues,
): Promise<PredictionTestListItem> {
  if (values.paymentProofFile) {
    await httpClient.patch(
      adminPath(`/prediction-tests/${id}`),
      toFormDataPayload(values),
      { headers: multipartHeaders },
    )
  } else {
    await httpClient.patch(adminPath(`/prediction-tests/${id}`), toJsonPayload(values))
  }
  return fetchPredictionTest(id)
}

export async function deletePredictionTest(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/prediction-tests/${id}`))
}

export function predictionTestToFormValues(
  test: PredictionTestListItem,
): PredictionTestFormValues {
  return {
    studentId: test.studentId,
    score: test.score == null || test.score === 0 ? '' : String(test.score),
    description: test.description,
    amount: String(test.amount),
    status: test.status,
    paymentProofFile: null,
  }
}

export const emptyPredictionTestFormValues: PredictionTestFormValues = {
  studentId: '',
  score: '',
  description: '',
  amount: '',
  status: 'pending',
  paymentProofFile: null,
}

export type ProspectiveStudentOption = Pick<
  ProspectiveStudentListItem,
  'id' | 'fullName' | 'phone' | 'email'
>

export async function fetchProspectiveStudentOptions(): Promise<
  ProspectiveStudentOption[]
> {
  const { items } = await fetchAllPages<{
    id: number
    full_name: string
    email: string | null
    phone: string
  }>({
    client: httpClient,
    path: adminPath('/prospective-students'),
  })

  return items.map((item) => ({
    id: String(item.id),
    fullName: item.full_name,
    phone: item.phone ?? '',
    email: item.email ?? '',
  }))
}
