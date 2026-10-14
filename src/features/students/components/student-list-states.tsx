import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type StudentListStateProps = {
  onRetry?: () => void
}

export function StudentListLoadingState() {
  return <ListLoadingState />
}

export function StudentListErrorState({ onRetry }: StudentListStateProps) {
  return (
    <ListErrorState
      title="Unable to load students"
      description="Something went wrong while fetching the student list. You can try again."
      onRetry={onRetry}
    />
  )
}
