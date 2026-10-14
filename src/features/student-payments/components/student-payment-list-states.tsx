import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type StudentPaymentListStateProps = {
  onRetry?: () => void
}

export function StudentPaymentListLoadingState() {
  return <ListLoadingState />
}

export function StudentPaymentListErrorState({
  onRetry,
}: StudentPaymentListStateProps) {
  return (
    <ListErrorState
      title="Unable to load student payments"
      description="Something went wrong while fetching payment plans. You can try again."
      onRetry={onRetry}
    />
  )
}
