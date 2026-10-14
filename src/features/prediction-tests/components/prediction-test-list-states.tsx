import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type PredictionTestListStateProps = {
  onRetry?: () => void
}

export function PredictionTestListLoadingState() {
  return <ListLoadingState />
}

export function PredictionTestListErrorState({
  onRetry,
}: PredictionTestListStateProps) {
  return (
    <ListErrorState
      title="Unable to load prediction tests"
      description="Something went wrong while fetching prediction tests. You can try again."
      onRetry={onRetry}
    />
  )
}
