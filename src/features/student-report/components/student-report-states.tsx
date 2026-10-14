import {
  ListErrorState,
  ListLoadingState,
} from '../../../shared/components/page'

type StudentReportStateProps = {
  onRetry?: () => void
}

export function StudentReportLoadingState() {
  return <ListLoadingState rows={6} />
}

export function StudentReportErrorState({ onRetry }: StudentReportStateProps) {
  return (
    <ListErrorState
      title="Unable to load student report"
      description="Something went wrong while preparing the report preview. You can try again."
      onRetry={onRetry}
    />
  )
}
