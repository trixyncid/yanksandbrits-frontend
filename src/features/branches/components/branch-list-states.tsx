import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type BranchListStateProps = {
  onRetry?: () => void
}

export function BranchListLoadingState() {
  return <ListLoadingState rows={5} />
}

export function BranchListErrorState({ onRetry }: BranchListStateProps) {
  return (
    <ListErrorState
      title="Unable to load branches"
      description="Something went wrong while fetching branches. You can try again."
      onRetry={onRetry}
    />
  )
}
