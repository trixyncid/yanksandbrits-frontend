import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type StudentGroupListStateProps = {
  onRetry?: () => void
}

export function StudentGroupListLoadingState() {
  return <ListLoadingState />
}

export function StudentGroupListErrorState({
  onRetry,
}: StudentGroupListStateProps) {
  return (
    <ListErrorState
      title="Unable to load student groups"
      description="Something went wrong while fetching student groups. You can try again."
      onRetry={onRetry}
    />
  )
}
