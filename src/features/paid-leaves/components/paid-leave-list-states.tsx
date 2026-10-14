import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type PaidLeaveListStateProps = {
  onRetry?: () => void
}

export function PaidLeaveListLoadingState() {
  return <ListLoadingState />
}

export function PaidLeaveListErrorState({ onRetry }: PaidLeaveListStateProps) {
  return (
    <ListErrorState
      title="Unable to load paid leave"
      description="Something went wrong while fetching paid leave records. You can try again."
      onRetry={onRetry}
    />
  )
}
