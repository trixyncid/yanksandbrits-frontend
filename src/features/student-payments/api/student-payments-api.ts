import {
  mapApprovalStatusFromApi,
  mapApprovalStatusToApi,
  mapPaymentPlanStatusFromApi,
} from '../../../shared/api/choices'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { parseCurrencyValue } from '../../../shared/lib/currency'
import { fetchStudents } from '../../students/api/students-api'
import type { StudentListItem } from '../../students/types/student'
import { summarizePaymentBranches } from '../lib/payment-display'
import type {
  StudentPaymentFormValues,
  StudentPaymentListItem,
  StudentPaymentTerm,
  StudentPaymentTermAttachment,
  StudentPaymentTermStatus,
} from '../types/student-payment'
import type { StudentPaymentListFilters } from './student-payment-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type StudentPaymentListResponse = {
  data: StudentPaymentListItem[]
  meta: {
    total: number
  }
}

type StudentPaymentTermAttachmentDto = {
  id: number
  file_key: string
  file_url: string
}

type StudentPaymentTermDto = {
  id: number
  amount: number
  status: string
  description: string | null
  payment_date: string
  branch?: number | null
  branch_name?: string | null
  attachments?: StudentPaymentTermAttachmentDto[]
  created_at: string
  created_by_name?: string | null
}

type StudentPaymentDto = {
  id: number
  student: number | null
  student_name?: string | null
  prospective_student?: number | null
  prospective_student_name?: string | null
  title: string | null
  full_amount: number
  discount_amount?: number
  amount_due?: number
  paid_amount: number
  status: string
  linked_prediction_test_amount?: number
  linked_prediction_tests?: Array<{
    id: number
    amount: number
    status: string
    created_at: string
  }>
  commission_base_amount?: number
  prediction_folded_into_commission?: boolean
  prediction_claimed_elsewhere?: boolean
  installment_plan?: string
  installment_plan_approved?: boolean
  installment_plan_approved_at?: string | null
  installment_plan_approved_by_name?: string | null
  terms?: StudentPaymentTermDto[]
  created_at: string
  created_by_name?: string | null
}

function mapAttachment(
  dto: StudentPaymentTermAttachmentDto,
): StudentPaymentTermAttachment {
  return {
    id: String(dto.id),
    fileKey: dto.file_key,
    fileUrl: dto.file_url,
  }
}

function mapTerm(dto: StudentPaymentTermDto): StudentPaymentTerm {
  return {
    id: String(dto.id),
    amount: dto.amount ?? 0,
    status: mapApprovalStatusFromApi(dto.status),
    description: dto.description ?? '',
    paymentDate: dto.payment_date ?? dto.created_at.slice(0, 10),
    createdAt: dto.created_at,
    createdBy: dto.created_by_name ?? '—',
    branchId: dto.branch == null ? null : String(dto.branch),
    branch: dto.branch_name ?? '—',
    attachments: (dto.attachments ?? []).map(mapAttachment),
  }
}

function mapPayment(
  dto: StudentPaymentDto,
  studentsById: Map<string, StudentListItem>,
): StudentPaymentListItem {
  const studentId = dto.student == null ? null : String(dto.student)
  const prospectiveStudentId =
    dto.prospective_student == null ? null : String(dto.prospective_student)
  const student = studentId ? studentsById.get(studentId) : undefined
  const terms = (dto.terms ?? []).map(mapTerm)
  const branches = summarizePaymentBranches(terms)
  const displayName =
    dto.student_name ??
    dto.prospective_student_name ??
    student?.fullName ??
    '—'

  return {
    id: String(dto.id),
    studentId,
    prospectiveStudentId,
    studentPin: student?.pin ?? '',
    studentName: displayName,
    title: dto.title ?? '',
    fullAmount: dto.full_amount ?? 0,
    discountAmount: dto.discount_amount ?? 0,
    paidAmount: dto.paid_amount ?? 0,
    status: mapPaymentPlanStatusFromApi(dto.status),
    terms,
    createdAt: dto.created_at,
    createdBy: dto.created_by_name ?? '—',
    branchId: branches.branchId,
    branch:
      branches.branch !== '—'
        ? branches.branch
        : (student?.branch ?? '—'),
    linkedPredictionTestAmount: dto.linked_prediction_test_amount ?? 0,
    linkedPredictionTests: (dto.linked_prediction_tests ?? []).map((item) => ({
      id: String(item.id),
      amount: item.amount ?? 0,
      status: item.status,
      createdAt: item.created_at,
    })),
    commissionBaseAmount:
      dto.commission_base_amount ??
      Math.max(0, (dto.full_amount ?? 0) - (dto.discount_amount ?? 0)) +
        (dto.linked_prediction_test_amount ?? 0),
    predictionFoldedIntoCommission:
      dto.prediction_folded_into_commission ?? false,
    predictionClaimedElsewhere: dto.prediction_claimed_elsewhere ?? false,
    installmentPlan:
      dto.installment_plan === 'two' || (dto.terms?.length ?? 0) >= 2
        ? 'two'
        : 'full',
    installmentPlanApproved: dto.installment_plan_approved ?? false,
    installmentPlanApprovedAt: dto.installment_plan_approved_at ?? '',
    installmentPlanApprovedBy: dto.installment_plan_approved_by_name ?? '',
  }
}

function toWritePayload(
  values: StudentPaymentFormValues,
  options?: { omitStatus?: boolean; omitOwner?: boolean },
) {
  const payload: Record<string, unknown> = {
    title: values.title.trim(),
    full_amount: parseCurrencyValue(values.fullAmount),
    discount_amount: parseCurrencyValue(values.discountAmount),
    ...(values.installmentPlan
      ? { installment_plan: values.installmentPlan }
      : {}),
    terms: values.terms.map((term) => {
      const termPayload: Record<string, unknown> = {
        amount: parseCurrencyValue(term.amount),
        description: term.description.trim() || null,
        payment_date: term.paymentDate,
        branch: term.branchId ? Number(term.branchId) : null,
      }
      if (term.id) {
        termPayload.id = Number(term.id)
      }
      if (!options?.omitStatus) {
        termPayload.status = mapApprovalStatusToApi(term.status)
      }
      return termPayload
    }),
  }
  if (!options?.omitOwner) {
    if (values.studentId) {
      payload.student = Number(values.studentId)
      payload.prospective_student = null
    } else if (values.prospectiveStudentId) {
      payload.prospective_student = Number(values.prospectiveStudentId)
      payload.student = null
    }
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
    if (filters.status === 'incomplete' || filters.status === 'complete') {
      params.status = filters.status === 'complete' ? '2_CP' : '1_IN'
    } else {
      params.status =
        filters.status === 'approved'
          ? '2_AP'
          : filters.status === 'void'
            ? '3_VD'
            : '1_PD'
    }
  }

  if (filters.studentId) {
    params.student = Number(filters.studentId)
  }

  if (filters.branchId) {
    params.branch = Number(filters.branchId)
  }

  const [{ items, total }, studentsById] = await Promise.all([
    fetchAllPages<StudentPaymentDto>({
      client: httpClient,
      path: adminPath('/payments'),
      params,
    }),
    loadStudentLookup(),
  ])

  const data = items.map((dto) => mapPayment(dto, studentsById))

  return {
    data,
    meta: { total },
  }
}

export async function fetchStudentPayment(
  id: string,
): Promise<StudentPaymentListItem> {
  const [{ data }, studentsById] = await Promise.all([
    httpClient.get<ApiSuccessEnvelope<StudentPaymentDto>>(
      adminPath(`/payments/${id}`),
    ),
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
  >(
    adminPath(`/payments/${id}`),
    toWritePayload(values, { ...options, omitOwner: true }),
  )
  const studentsById = await loadStudentLookup()
  return mapPayment(data.data, studentsById)
}

export async function deleteStudentPayment(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/payments/${id}`))
}

const multipartHeaders = {
  // Let the browser set multipart boundary (override JSON default).
  'Content-Type': undefined as unknown as string,
}

export async function uploadStudentPaymentTermProof(
  paymentId: string,
  termId: string,
  file: File,
): Promise<StudentPaymentListItem> {
  const formData = new FormData()
  formData.append('payment_proof', file)
  const { data } = await httpClient.post<
    ApiSuccessEnvelope<StudentPaymentDto>
  >(
    adminPath(`/payments/${paymentId}/terms/${termId}/attachments`),
    formData,
    { headers: multipartHeaders },
  )
  const studentsById = await loadStudentLookup()
  return mapPayment(data.data, studentsById)
}

export async function deleteStudentPaymentTerm(
  paymentId: string,
  termId: string,
): Promise<StudentPaymentListItem> {
  const { data } = await httpClient.delete<
    ApiSuccessEnvelope<StudentPaymentDto>
  >(adminPath(`/payments/${paymentId}/terms/${termId}`))
  const studentsById = await loadStudentLookup()
  return mapPayment(data.data, studentsById)
}

export async function approveStudentPaymentInstallmentPlan(
  paymentId: string,
): Promise<StudentPaymentListItem> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<StudentPaymentDto>>(
    adminPath(`/payments/${paymentId}/approve-installment-plan`),
  )
  const studentsById = await loadStudentLookup()
  return mapPayment(data.data, studentsById)
}

export async function bulkUpdateStudentPaymentTermStatus(
  paymentId: string,
  termIds: string[],
  status: StudentPaymentTermStatus,
): Promise<StudentPaymentListItem> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<StudentPaymentDto>>(
    adminPath(`/payments/${paymentId}/terms/bulk-status`),
    {
      ids: termIds.map((id) => Number(id)),
      status: mapApprovalStatusToApi(status),
    },
  )
  const studentsById = await loadStudentLookup()
  return mapPayment(data.data, studentsById)
}

export async function fetchLinkedPredictionTest(params: {
  studentId?: string
  prospectiveStudentId?: string
  paymentId?: string
  fullAmount?: string | number
}): Promise<{
  linkedPredictionTestAmount: number
  linkedPredictionTests: StudentPaymentListItem['linkedPredictionTests']
  commissionBaseAmount: number
  predictionFoldedIntoCommission: boolean
  predictionClaimedElsewhere: boolean
}> {
  const fullAmount =
    typeof params.fullAmount === 'string'
      ? parseCurrencyValue(params.fullAmount)
      : (params.fullAmount ?? 0)
  const query: Record<string, number> = { full_amount: fullAmount }
  if (params.studentId) {
    query.student = Number(params.studentId)
  }
  if (params.prospectiveStudentId) {
    query.prospective_student = Number(params.prospectiveStudentId)
  }
  if (params.paymentId) {
    query.payment = Number(params.paymentId)
  }
  const { data } = await httpClient.get<
    ApiSuccessEnvelope<{
      linked_prediction_test_amount: number
      linked_prediction_tests: Array<{
        id: number
        amount: number
        status: string
        created_at: string
      }>
      commission_base_amount: number
      prediction_folded_into_commission?: boolean
      prediction_claimed_elsewhere?: boolean
    }>
  >(adminPath('/payments/linked-prediction-test'), {
    params: query,
  })
  const payload = data.data
  return {
    linkedPredictionTestAmount: payload.linked_prediction_test_amount ?? 0,
    linkedPredictionTests: (payload.linked_prediction_tests ?? []).map(
      (item) => ({
        id: String(item.id),
        amount: item.amount ?? 0,
        status: item.status,
        createdAt: item.created_at,
      }),
    ),
    commissionBaseAmount:
      payload.commission_base_amount ??
      fullAmount + (payload.linked_prediction_test_amount ?? 0),
    predictionFoldedIntoCommission:
      payload.prediction_folded_into_commission ?? false,
    predictionClaimedElsewhere: payload.prediction_claimed_elsewhere ?? false,
  }
}

export function studentPaymentToFormValues(
  payment: StudentPaymentListItem,
): StudentPaymentFormValues {
  return {
    studentId: payment.studentId ?? '',
    prospectiveStudentId: payment.prospectiveStudentId ?? '',
    title: payment.title,
    fullAmount: String(payment.fullAmount || ''),
    discountAmount: String(payment.discountAmount || ''),
    installmentPlan: payment.installmentPlan,
    terms:
      payment.terms.length > 0
        ? payment.terms.map((term) => ({
            key: term.id,
            id: term.id,
            amount: String(term.amount || ''),
            status: term.status,
            description: term.description,
            paymentDate: term.paymentDate,
            branchId: term.branchId ?? '',
          }))
        : [],
  }
}

export function createEmptyStudentPaymentFormValues(): StudentPaymentFormValues {
  return {
    studentId: '',
    prospectiveStudentId: '',
    title: '',
    fullAmount: '',
    discountAmount: '',
    installmentPlan: '',
    terms: [],
  }
}

export const emptyStudentPaymentFormValues = createEmptyStudentPaymentFormValues()
