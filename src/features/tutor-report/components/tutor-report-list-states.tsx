import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type StateProps = { onRetry?: () => void }

export function TutorReportListLoadingState() {
  return <ListLoadingState />
}

export function TutorReportListErrorState({ onRetry }: StateProps) {
  return (
    <ListErrorState
      title="Unable to load tutor salaries"
      description="Something went wrong while fetching tutor salaries. You can try again."
      onRetry={onRetry}
    />
  )
}
