import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type StaffPermissionListStateProps = {
  onRetry?: () => void
}

export function StaffPermissionListLoadingState() {
  return <ListLoadingState rows={6} />
}

export function StaffPermissionListErrorState({
  onRetry,
}: StaffPermissionListStateProps) {
  return (
    <ListErrorState
      title="Unable to load roles"
      description="Something went wrong while fetching roles. You can try again."
      onRetry={onRetry}
    />
  )
}
