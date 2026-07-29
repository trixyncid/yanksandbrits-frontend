import { httpClient } from '../../../shared/api/http-client'
import { useStudentPaymentsStore } from '../store/student-payments-store'
import type { StudentPaymentListItem } from '../types/student-payment'
import type { StudentPaymentListFilters } from './student-payment-query-keys'

export type StudentPaymentListResponse = {
  data: StudentPaymentListItem[]
  meta: {
    total: number
    source: 'api' | 'placeholder'
  }
}

const PLACEHOLDER_DELAY_MS = 450

function delay(ms: number) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms)
  })
}

function filterPlaceholderPayments(
  payments: StudentPaymentListItem[],
  filters: StudentPaymentListFilters,
) {
  const search = filters.search?.trim().toLowerCase()

  return payments.filter((payment) => {
    if (
      filters.status &&
      filters.status !== 'all' &&
      payment.status !== filters.status
    ) {
      return false
    }

    if (
      filters.branchId &&
      payment.branch.toLowerCase() !== filters.branchId.toLowerCase()
    ) {
      return false
    }

    if (!search) {
      return true
    }

    const haystack = [
      payment.studentPin,
      payment.studentName,
      payment.title,
      payment.description,
      payment.createdBy,
      payment.branch,
      payment.status,
      String(payment.amount),
    ]
      .join(' ')
      .toLowerCase()

    return haystack.includes(search)
  })
}

async function fetchStudentPaymentsFromApi(
  filters: StudentPaymentListFilters,
): Promise<StudentPaymentListResponse> {
  const { data } = await httpClient.get<StudentPaymentListResponse>(
    '/api/student-payments',
    { params: filters },
  )

  return data
}

async function fetchStudentPaymentsPlaceholder(
  filters: StudentPaymentListFilters,
): Promise<StudentPaymentListResponse> {
  await delay(PLACEHOLDER_DELAY_MS)

  const data = filterPlaceholderPayments(
    useStudentPaymentsStore.getState().items,
    filters,
  )

  return {
    data,
    meta: {
      total: data.length,
      source: 'placeholder',
    },
  }
}

export async function fetchStudentPayments(
  filters: StudentPaymentListFilters = {},
): Promise<StudentPaymentListResponse> {
  const hasApiBaseUrl = Boolean(import.meta.env.VITE_API_BASE_URL)

  if (hasApiBaseUrl) {
    try {
      return await fetchStudentPaymentsFromApi(filters)
    } catch {
      return fetchStudentPaymentsPlaceholder(filters)
    }
  }

  return fetchStudentPaymentsPlaceholder(filters)
}
