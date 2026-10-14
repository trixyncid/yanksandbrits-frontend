import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

export function StaffListLoadingState() {
  return <ListLoadingState />
}

export function StaffListErrorState({ onRetry }: { onRetry: () => void }) {
  return (
    <ListErrorState
      title="Unable to load user accounts"
      description="Something went wrong while fetching user accounts. You can try again."
      onRetry={onRetry}
    />
  )
}
