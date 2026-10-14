import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type StateProps = { onRetry?: () => void }

export function BookkeepingListLoadingState() {
  return <ListLoadingState rows={5} />
}

export function BookkeepingListErrorState({ onRetry }: StateProps) {
  return (
    <ListErrorState
      title="Unable to load bookkeeping"
      description="Something went wrong while fetching bookkeeping periods. You can try again."
      onRetry={onRetry}
    />
  )
}
