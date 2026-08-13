import {
  mapApprovalStatusFromApi,
  mapApprovalStatusToApi,
} from '../../../shared/api/choices'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { parseCurrencyValue } from '../../../shared/lib/currency'
import { fetchStudents } from '../../students/api/students-api'
import type { StudentListItem } from '../../students/types/student'
import type {
  StudentPaymentFormValues,
  StudentPaymentListItem,
} from '../types/student-payment'
import type { StudentPaymentListFilters } from './student-payment-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type StudentPaymentListResponse = {
  data: StudentPaymentListItem[]
  meta: {
    total: number
  }
}

type StudentPaymentDto = {
  id: number
  student: number
  student_name?: string | null
  title: string | null
  description: string | null
  amount: number
  status: string
  payment_proof: string | null
  created_at: string
  updated_at: string
  created_by: number | null
  created_by_name?: string | null
  updated_by: number | null
  updated_by_name?: string | null
}

function mapPayment(
  dto: StudentPaymentDto,
  studentsById: Map<string, StudentListItem>,
): StudentPaymentListItem {
  const studentId = String(dto.student)
  const student = studentsById.get(studentId)

  return {
    id: String(dto.id),
    studentId,
    studentPin: student?.pin ?? '',
    studentName: dto.student_name ?? student?.fullName ?? '—',
    title: dto.title ?? '',
    description: dto.description ?? '',
    amount: dto.amount ?? 0,
    transactionDate: dto.created_at,
    status: mapApprovalStatusFromApi(dto.status),
    createdBy: dto.created_by_name ?? '—',
    hasPaymentProof: Boolean(dto.payment_proof),
    paymentProofUrl: dto.payment_proof || null,
    branch: student?.branch ?? '—',
  }
}

function toWritePayload(
  values: StudentPaymentFormValues,
  options?: { omitStatus?: boolean },
) {
  const payload: Record<string, unknown> = {
    student: Number(values.studentId),
    title: values.title.trim(),
    description: values.description.trim() || null,
    amount: parseCurrencyValue(values.amount),
  }
  if (!options?.omitStatus) {
    payload.status = mapApprovalStatusToApi(values.status)
  }
  return payload
}

async function loadStudentLookup() {
  const { data } = await fetchStudents()
  return new Map(data.map((student) => [student.id, student]))
}

export async function fetchStudentPayments(
  filters: StudentPaymentListFilters = {},
): Promise<StudentPaymentListResponse> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
  }

  if (filters.status && filters.status !== 'all') {
    params.status = mapApprovalStatusToApi(filters.status)
  }

  if (filters.studentId) {
    params.student = Number(filters.studentId)
  }

  const [{ items, total }, studentsById] = await Promise.all([
    fetchAllPages<StudentPaymentDto>({
      client: httpClient,
      path: adminPath('/payments'),
      params,
    }),
    loadStudentLookup(),
  ])

  let data = items.map((dto) => mapPayment(dto, studentsById))

  if (filters.branchId) {
    const branchId = filters.branchId.toLowerCase()
    data = data.filter((payment) => payment.branch.toLowerCase() === branchId)
  }

  return {
    data,
    meta: { total: filters.branchId ? data.length : total },
  }
}

export async function fetchStudentPayment(
  id: string,
): Promise<StudentPaymentListItem> {
  const [{ data }, studentsById] = await Promise.all([
    httpClient.get<ApiSuccessEnvelope<StudentPaymentDto>>(adminPath(`/payments/${id}`)),
    loadStudentLookup(),
  ])
  return mapPayment(data.data, studentsById)
}

export async function createStudentPayment(
  values: StudentPaymentFormValues,
  options?: { omitStatus?: boolean },
): Promise<StudentPaymentListItem> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<StudentPaymentDto>>(
    adminPath('/payments'),
    toWritePayload(values, options),
  )
  const studentsById = await loadStudentLookup()
  return mapPayment(data.data, studentsById)
}

export async function updateStudentPayment(
  id: string,
  values: StudentPaymentFormValues,
  options?: { omitStatus?: boolean },
): Promise<StudentPaymentListItem> {
  const { data } = await httpClient.patch<
    ApiSuccessEnvelope<StudentPaymentDto>
  >(adminPath(`/payments/${id}`), toWritePayload(values, options))
  const studentsById = await loadStudentLookup()
  return mapPayment(data.data, studentsById)
}

export async function deleteStudentPayment(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/payments/${id}`))
}

export function studentPaymentToFormValues(
  payment: StudentPaymentListItem,
): StudentPaymentFormValues {
  return {
    studentId: payment.studentId,
    title: payment.title,
    description: payment.description,
    amount: String(payment.amount),
    status: payment.status,
    hasPaymentProof: payment.hasPaymentProof,
  }
}

export const emptyStudentPaymentFormValues: StudentPaymentFormValues = {
  studentId: '',
  title: '',
  description: '',
  amount: '',
  status: 'pending',
  hasPaymentProof: false,
}
