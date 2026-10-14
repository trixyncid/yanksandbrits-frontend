import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type MarketingListStateProps = {
  onRetry?: () => void
}

export function MarketingListLoadingState() {
  return <ListLoadingState />
}

export function MarketingListErrorState({ onRetry }: MarketingListStateProps) {
  return (
    <ListErrorState
      title="Unable to load education counsellors"
      description="Something went wrong while fetching education counsellor accounts. You can try again."
      onRetry={onRetry}
    />
  )
}
