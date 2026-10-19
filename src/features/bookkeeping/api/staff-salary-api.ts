import { downloadBlob } from '../../../shared/api/download'
import { httpClient } from '../../../shared/api/http-client'
import { adminPath } from '../../../shared/api/paths'
import type { ApiSuccessEnvelope } from '../../../shared/api/types'

/** Base salary saved for a staff member (Finance, CRO, …) in a bookkeeping period. */
export type BookkeepingStaffSalaryItem = {
  id: string
  staffName: string
  staffPin: string
  staffEmail: string
  roles: string[]
  branchName: string
  mainSalary: number
  /** Academic leader bonus from tutor headcount; 0 for other staff. */
  bonusSalary: number
  tutorHeadcount: number
  totalSalary: number
}

type StaffSalaryDto = {
  id: number
  staff_name: string | null
  staff_pin: string | null
  staff_email: string | null
  staff_roles?: string[]
  branch_name?: string | null
  main_salary: number
  bonus_salary?: number
  tutor_headcount?: number
  total_salary: number
}

function mapStaffSalary(dto: StaffSalaryDto): BookkeepingStaffSalaryItem {
  return {
    id: String(dto.id),
    staffName: dto.staff_name ?? '—',
    staffPin: dto.staff_pin ?? '',
    staffEmail: dto.staff_email ?? '',
    roles: dto.staff_roles ?? [],
    branchName: dto.branch_name ?? '',
    mainSalary: dto.main_salary ?? 0,
    bonusSalary: dto.bonus_salary ?? 0,
    tutorHeadcount: dto.tutor_headcount ?? 0,
    totalSalary: dto.total_salary ?? 0,
  }
}

export async function fetchBookkeepingStaffSalaries(
  bookkeepingId: string,
): Promise<{ data: BookkeepingStaffSalaryItem[]; meta: { total: number } }> {
  const { data } = await httpClient.get<ApiSuccessEnvelope<StaffSalaryDto[]>>(
    adminPath('/staff-salary-calculations'),
    { params: { bookkeeping: Number(bookkeepingId) } },
  )
  const rows = (data.data ?? []).map(mapStaffSalary)
  return { data: rows, meta: { total: rows.length } }
}

export async function downloadStaffSalaryPdf(item: BookkeepingStaffSalaryItem) {
  const { data } = await httpClient.get<Blob>(
    adminPath(`/staff-salary-calculations/${item.id}/pdf`),
    { responseType: 'blob', timeout: 60000 },
  )
  await downloadBlob(data, `staff-salary-${item.staffPin || item.id}.pdf`)
}
