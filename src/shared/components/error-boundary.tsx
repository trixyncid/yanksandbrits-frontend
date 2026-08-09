import { Component, type ErrorInfo, type ReactNode } from 'react'

import { ErrorFallback } from './error-fallback'

type ErrorBoundaryProps = {
  children: ReactNode
  onReset?: () => void
  fallback?: ReactNode | ((args: {
    error: Error
    reset: () => void
  }) => ReactNode)
}

type ErrorBoundaryState = {
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error', error, info.componentStack)
    }
  }

  reset = () => {
    this.props.onReset?.()
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state

    if (!error) {
      return this.props.children
    }

    if (typeof this.props.fallback === 'function') {
      return this.props.fallback({ error, reset: this.reset })
    }

    if (this.props.fallback) {
      return this.props.fallback
    }

    return (
      <ErrorFallback
        error={error}
        onRetry={this.reset}
        onGoHome={() => {
          this.reset()
          if (window.location.pathname !== '/dashboard') {
            window.location.assign('/dashboard')
          }
        }}
      />
    )
  }
}
