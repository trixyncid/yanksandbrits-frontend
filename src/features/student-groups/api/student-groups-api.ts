import { httpClient } from '../../../shared/api/http-client'
import { fetchAllPages } from '../../../shared/api/pagination'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'
import { fetchStudents } from '../../students/api/students-api'
import type { StudentListItem } from '../../students/types/student'
import type {
  StudentGroupFormValues,
  StudentGroupListItem,
  StudentGroupMember,
} from '../types/student-group'
import type { StudentGroupListFilters } from './student-group-query-keys'
import { adminPath } from '../../../shared/api/paths'

export type StudentGroupListResponse = {
  data: StudentGroupListItem[]
  meta: {
    total: number
  }
}

type StudentGroupDto = {
  id: number
  group_name: string
  participant: number[]
  is_active: boolean
  created_at: string
  updated_at: string
  created_by: number | null
  updated_by: number | null
}

function mapMembers(
  participantIds: number[],
  studentsById: Map<string, StudentListItem>,
): StudentGroupMember[] {
  return participantIds.map((participantId) => {
    const id = String(participantId)
    const student = studentsById.get(id)
    return {
      id,
      pin: student?.pin ?? '',
      fullName: student?.fullName ?? '—',
    }
  })
}

function mapGroup(
  dto: StudentGroupDto,
  studentsById: Map<string, StudentListItem>,
): StudentGroupListItem {
  const members = mapMembers(dto.participant ?? [], studentsById)
  const firstMember = members
    .map((member) => studentsById.get(member.id))
    .find(Boolean)

  return {
    id: String(dto.id),
    groupName: dto.group_name,
    members,
    status: dto.is_active ? 'active' : 'inactive',
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
    createdBy: dto.created_by == null ? '—' : String(dto.created_by),
    branch: firstMember?.branch ?? '—',
  }
}

function toWritePayload(values: StudentGroupFormValues) {
  return {
    group_name: values.groupName.trim(),
    participant: values.memberIds.map((id) => Number(id)),
    is_active: values.status === 'active',
  }
}

async function loadStudentLookup() {
  const { data } = await fetchStudents()
  return new Map(data.map((student) => [student.id, student]))
}

export async function fetchStudentGroups(
  filters: StudentGroupListFilters = {},
): Promise<StudentGroupListResponse> {
  const params: Record<string, unknown> = {
    search: filters.search?.trim() || undefined,
  }

  if (filters.status === 'active') params.is_active = true
  if (filters.status === 'inactive') params.is_active = false

  const [{ items, total }, studentsById] = await Promise.all([
    fetchAllPages<StudentGroupDto>({
      client: httpClient,
      path: adminPath('/student-groups'),
      params,
    }),
    loadStudentLookup(),
  ])

  let data = items.map((dto) => mapGroup(dto, studentsById))

  if (filters.branchId) {
    const branchId = filters.branchId.toLowerCase()
    data = data.filter((group) => group.branch.toLowerCase() === branchId)
  }

  return {
    data,
    meta: { total: filters.branchId ? data.length : total },
  }
}

export async function fetchStudentGroup(
  id: string,
): Promise<StudentGroupListItem> {
  const [{ data }, studentsById] = await Promise.all([
    httpClient.get<ApiSuccessEnvelope<StudentGroupDto>>(
      adminPath(`/student-groups/${id}`),
    ),
    loadStudentLookup(),
  ])
  return mapGroup(data.data, studentsById)
}

export async function createStudentGroup(
  values: StudentGroupFormValues,
): Promise<StudentGroupListItem> {
  const { data } = await httpClient.post<ApiSuccessEnvelope<StudentGroupDto>>(
    adminPath('/student-groups'),
    toWritePayload(values),
  )
  const studentsById = await loadStudentLookup()
  return mapGroup(data.data, studentsById)
}

export async function updateStudentGroup(
  id: string,
  values: StudentGroupFormValues,
): Promise<StudentGroupListItem> {
  const { data } = await httpClient.patch<ApiSuccessEnvelope<StudentGroupDto>>(
    adminPath(`/student-groups/${id}`),
    toWritePayload(values),
  )
  const studentsById = await loadStudentLookup()
  return mapGroup(data.data, studentsById)
}

export async function deleteStudentGroup(id: string): Promise<void> {
  await httpClient.delete(adminPath(`/student-groups/${id}`))
}

export function studentGroupToFormValues(
  group: StudentGroupListItem,
): StudentGroupFormValues {
  return {
    groupName: group.groupName,
    memberIds: group.members.map((member) => member.id),
    status: group.status,
  }
}

export const emptyStudentGroupFormValues: StudentGroupFormValues = {
  groupName: '',
  memberIds: [],
  status: 'active',
}
