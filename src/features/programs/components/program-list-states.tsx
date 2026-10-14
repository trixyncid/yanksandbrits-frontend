import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

export function ProgramListLoadingState() {
  return <ListLoadingState />
}

export function ProgramListErrorState({ onRetry }: { onRetry?: () => void }) {
  return (
    <ListErrorState
      title="Unable to load programs"
      description="Something went wrong while fetching programs. You can try again."
      onRetry={onRetry}
    />
  )
}
