/**
 * ErrorBoundary component for catching and handling React component errors
 * Follows WebHatchery frontend standards for error handling
 */

import React, { ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Component error caught by ErrorBoundary:', error, errorInfo);

    // In production, you might want to log this to an error reporting service
    // Example: logErrorToService(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-fallback p-6 bg-surface border border-error rounded-lg">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl" role="img" aria-label="Error">
              ⚠️
            </span>
            <h2 className="text-lg font-semibold text-error">Something went wrong</h2>
          </div>

          <p className="text-text-muted mb-4">
            An unexpected error occurred while rendering this component.
          </p>

          {this.state.error && (
            <details className="mb-4">
              <summary className="cursor-pointer text-sm text-text-muted">
                Error details (development only)
              </summary>
              <pre className="mt-2 p-3 bg-bg-1 border rounded text-xs overflow-auto">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}

          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-hover transition-colors"
          >
            Reload page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook for functional components to handle errors
 * Usage: const handleError = useErrorHandler();
 * Then: handleError(error) in try-catch blocks
 */
export function useErrorHandler() {
  return React.useCallback((error: Error) => {
    console.error('Handled error:', error);
    // In a real app, you might dispatch to a global error state
    // or show a toast notification
    throw error; // Re-throw to trigger error boundary
  }, []);
}
