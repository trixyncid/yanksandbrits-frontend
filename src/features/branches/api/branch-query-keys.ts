export type BranchListFilters = {
  search?: string
}

export const branchQueryKeys = {
  all: ['branches'] as const,
  lists: () => [...branchQueryKeys.all, 'list'] as const,
  list: (filters: BranchListFilters = {}) =>
    [...branchQueryKeys.lists(), filters] as const,
  details: () => [...branchQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...branchQueryKeys.details(), id] as const,
}

export const brandQueryKeys = {
  all: ['brands'] as const,
  lists: () => [...brandQueryKeys.all, 'list'] as const,
  options: () => [...brandQueryKeys.lists(), 'options'] as const,
}
