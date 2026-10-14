import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

export function TutorAllocationListLoadingState() {
  return <ListLoadingState />
}

export function TutorAllocationListErrorState({
  onRetry,
}: {
  onRetry?: () => void
}) {
  return (
    <ListErrorState
      title="Unable to load classes"
      description="Something went wrong while fetching tutor allocations. You can try again."
      onRetry={onRetry}
    />
  )
}
