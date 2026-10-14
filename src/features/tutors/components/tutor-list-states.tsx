import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type TutorListStateProps = {
  onRetry?: () => void
}

export function TutorListLoadingState() {
  return <ListLoadingState />
}

export function TutorListErrorState({ onRetry }: TutorListStateProps) {
  return (
    <ListErrorState
      title="Unable to load tutors"
      description="Something went wrong while fetching tutors. You can try again."
      onRetry={onRetry}
    />
  )
}
