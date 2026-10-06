export type PredictionTestListFilters = {
  search?: string
  status?: 'pending' | 'approved' | 'void' | 'all'
  branchId?: string
  counsellorId?: string
}

export const predictionTestQueryKeys = {
  all: ['prediction-tests'] as const,
  lists: () => [...predictionTestQueryKeys.all, 'list'] as const,
  list: (filters: PredictionTestListFilters = {}) =>
    [...predictionTestQueryKeys.lists(), filters] as const,
  details: () => [...predictionTestQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...predictionTestQueryKeys.details(), id] as const,
}
