import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type ClassroomListStateProps = {
  onRetry?: () => void
}

export function ClassroomListLoadingState() {
  return <ListLoadingState />
}

export function ClassroomListErrorState({
  onRetry,
}: ClassroomListStateProps) {
  return (
    <ListErrorState
      title="Unable to load classrooms"
      description="Something went wrong while fetching classrooms. You can try again."
      onRetry={onRetry}
    />
  )
}
