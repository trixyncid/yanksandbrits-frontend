import { useQuery } from '@tanstack/react-query'

import { fetchPredictionTest } from '../api/prediction-tests-api'
import { predictionTestQueryKeys } from '../api/prediction-test-query-keys'

export function usePredictionTestQuery(id: string) {
  return useQuery({
    queryKey: predictionTestQueryKeys.detail(id),
    queryFn: () => fetchPredictionTest(id),
    enabled: Boolean(id),
  })
}
