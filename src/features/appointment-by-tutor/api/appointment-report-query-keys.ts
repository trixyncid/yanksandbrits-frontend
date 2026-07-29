export type AppointmentReportFilters = {
  branchId: string
  tutorId: string
  startDate: string
  endDate: string
}

export const appointmentReportQueryKeys = {
  all: ['appointment-by-tutor'] as const,
  lists: () => [...appointmentReportQueryKeys.all, 'list'] as const,
  list: (filters: AppointmentReportFilters) =>
    [...appointmentReportQueryKeys.lists(), filters] as const,
}
