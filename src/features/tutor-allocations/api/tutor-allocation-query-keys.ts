export const tutorAllocationQueryKeys = {
  all: ['tutor-allocations'] as const,
  lists: () => [...tutorAllocationQueryKeys.all, 'list'] as const,
  list: () => [...tutorAllocationQueryKeys.lists()] as const,
  details: () => [...tutorAllocationQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...tutorAllocationQueryKeys.details(), id] as const,
  eligibleStudents: (program: string, classType: string, allocationId = '') =>
    [
      ...tutorAllocationQueryKeys.all,
      'eligible-students',
      program,
      classType,
      allocationId,
    ] as const,
}
