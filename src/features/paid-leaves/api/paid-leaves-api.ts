import {
  mapApprovalStatusFromApi,
  mapApprovalStatusToApi,
} from '../../../shared/api/choices'
import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import {
  fetchStaffUserOptions,
  type StaffUserOption,
} from '../../users/api/users-api'
import type {
  PaidLeaveFormValues,
  PaidLeaveListItem,
} from '../types/paid-leave'
import type { PaidLeaveListFilters } from './paid-leave-query-keys'

export type PaidLeaveListResponse = {
  data: PaidLeaveListItem[]
  meta: {
    total: number
  }
}

export type { PaidLeaveFormValues }

type PaidLeaveDto = {
  id: number
  user: number
  user_name?: string | null
  start_date: string
  end_date: string
  notes: string | null
  files: string | null
  fileURL?: string | null
  status: string
  total_days?: number
  created_at: string
  updated_at: string
}

function mapPaidLeave(
  dto: PaidLeaveDto,
  usersById: Map<string, StaffUserOption>,
): PaidLeaveListItem {
  const userId = String(dto.user)
  const user = usersById.get(userId)
  const start = dto.start_date
  const end = dto.end_date
  const totalDays =
    dto.total_days ??
    Math.max(
      1,
      Math.round(
        (new Date(end).getTime() - new Date(start).getTime()) /
          (1000 * 60 * 60 * 24),
      ) + 1,
    )

  const fileUrl = dto.fileURL || dto.files || null

  return {
    id: String(dto.id),
    userId,
    staffPin: user?.pin ?? '',
    staffName: dto.user_name ?? user?.fullName ?? '—',
    staffEmail: user?.email ?? '',
    branch: user?.branchName ?? '—',
    branchId: user?.branchId ?? null,
    startDate: start,
    endDate: end,
    totalDays,
    notes: dto.notes ?? '',
    status: mapApprovalStatusFromApi(dto.status),
    createdAt: dto.created_at,
    hasFile: Boolean(fileUrl),
    fileUrl,
  }
}

function toJsonPayload(values: PaidLeaveFormValues) {
  return {
    user: Number(values.userId),
    start_date: values.startDate,
    end_date: values.endDate,
    notes: values.notes.trim() || null,
    status: mapApprovalStatusToApi(values.status),
  }
}

function toFormDataPayload(values: PaidLeaveFormValues) {
  const payload = toJsonPayload(values)
  const formData = new FormData()
  formData.append('user', String(payload.user))
  formData.append('start_date', payload.start_date)
  formData.append('end_date', payload.end_date)
  if (payload.notes != null) {
    formData.append('notes', payload.notes)
  }
  formData.append('status', payload.status)
  if (values.filesFile) {
    formData.append('files', values.filesFile)
  }
  return formData
}

const multipartHeaders = {
  // Let the browser set multipart boundary (override JSON default).
  'Content-Type': undefined as unknown as string,
}

async function loadStaffLookup() {
  const users = await fetchStaffUserOptions()
  return new Map(users.map((user) => [user.id, user]))
}

export async function fetchPaidLeaves(
  filters: PaidLeaveListFilters = {},
): Promise<PaidLeaveListResponse> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
  }

  if (filters.status && filters.status !== 'all') {
    params.status = mapApprovalStatusToApi(filters.status)
  }

  const [{ items, total }, usersById] = await Promise.all([
    fetchAllPages<PaidLeaveDto>({
      client: httpClient,
      path: '/paid-leaves',
      params,
    }),
    loadStaffLookup(),
  ])

  let data = items.map((dto) => mapPaidLeave(dto, usersById))

  if (filters.branchId) {
    const branchId = filters.branchId.toLowerCase()
    data = data.filter(
      (leave) =>
        leave.branchId?.toLowerCase() === branchId ||
        leave.branch.toLowerCase() === branchId,
    )
  }

  return {
    data,
    meta: { total: filters.branchId ? data.length : total },
  }
}

export async function fetchPaidLeave(id: string): Promise<PaidLeaveListItem> {
  const [{ data }, usersById] = await Promise.all([
    httpClient.get<ApiSuccessEnvelope<PaidLeaveDto>>(`/paid-leaves/${id}`),
    loadStaffLookup(),
  ])
  return mapPaidLeave(data.data, usersById)
}

export async function createPaidLeave(
  values: PaidLeaveFormValues,
): Promise<PaidLeaveListItem> {
  const { data } = values.filesFile
    ? await httpClient.post<ApiSuccessEnvelope<PaidLeaveDto>>(
        '/paid-leaves',
        toFormDataPayload(values),
        { headers: multipartHeaders },
      )
    : await httpClient.post<ApiSuccessEnvelope<PaidLeaveDto>>(
        '/paid-leaves',
        toJsonPayload(values),
      )

  if (data.data?.id != null) {
    return fetchPaidLeave(String(data.data.id))
  }

  const usersById = await loadStaffLookup()
  return mapPaidLeave(data.data, usersById)
}

export async function updatePaidLeave(
  id: string,
  values: PaidLeaveFormValues,
): Promise<PaidLeaveListItem> {
  if (values.filesFile) {
    await httpClient.patch(
      `/paid-leaves/${id}`,
      toFormDataPayload(values),
      { headers: multipartHeaders },
    )
  } else {
    await httpClient.patch(`/paid-leaves/${id}`, toJsonPayload(values))
  }
  return fetchPaidLeave(id)
}

export async function deletePaidLeave(id: string): Promise<void> {
  await httpClient.delete(`/paid-leaves/${id}`)
}

export function paidLeaveToFormValues(
  leave: PaidLeaveListItem,
): PaidLeaveFormValues {
  return {
    userId: leave.userId,
    startDate: leave.startDate.slice(0, 10),
    endDate: leave.endDate.slice(0, 10),
    notes: leave.notes,
    status: leave.status,
    filesFile: null,
  }
}

export const emptyPaidLeaveFormValues: PaidLeaveFormValues = {
  userId: '',
  startDate: '',
  endDate: '',
  notes: '',
  status: 'pending',
  filesFile: null,
}
