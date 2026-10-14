import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type StateProps = { onRetry?: () => void }

export function MarketingReportListLoadingState() {
  return <ListLoadingState />
}

export function MarketingReportListErrorState({ onRetry }: StateProps) {
  return (
    <ListErrorState
      title="Unable to load education counsellor salaries"
      description="Something went wrong while fetching salaries. You can try again."
      onRetry={onRetry}
    />
  )
}
