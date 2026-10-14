import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type ProspectiveStudentListStateProps = {
  onRetry?: () => void
}

export function ProspectiveStudentListLoadingState() {
  return <ListLoadingState />
}

export function ProspectiveStudentListErrorState({
  onRetry,
}: ProspectiveStudentListStateProps) {
  return (
    <ListErrorState
      title="Unable to load student responses"
      description="Something went wrong while fetching leads. You can try again."
      onRetry={onRetry}
    />
  )
}
