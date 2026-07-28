import { useQuery } from '@tanstack/react-query'

import { fetchPredictionTests } from '../api/prediction-tests-api'
import {
  predictionTestQueryKeys,
  type PredictionTestListFilters,
} from '../api/prediction-test-query-keys'

export function usePredictionTestsQuery(
  filters: PredictionTestListFilters = {},
) {
  return useQuery({
    queryKey: predictionTestQueryKeys.list(filters),
    queryFn: () => fetchPredictionTests(filters),
  })
}
