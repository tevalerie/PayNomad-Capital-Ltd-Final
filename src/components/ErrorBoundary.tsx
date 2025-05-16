import React, { useState, useEffect, Component } from "react";
import { useNavigate } from "react-router-dom";

interface ErrorFallbackProps {
  error: Error;
  errorInfo?: React.ErrorInfo;
  resetErrorBoundary: () => void;
}

function ErrorFallback({
  error,
  errorInfo,
  resetErrorBoundary,
}: ErrorFallbackProps) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong
        </h2>
        <p className="text-gray-700 mb-4">
          We've encountered an unexpected error. Our team has been notified.
        </p>
        <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40 mb-4">
          {error.message}
        </pre>
        {errorInfo && (
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto max-h-40 mb-4">
            {errorInfo.componentStack}
          </pre>
        )}
        <button
          onClick={resetErrorBoundary}
          className="w-full bg-[#0077be] hover:bg-[#0066a6] text-white py-2 px-4 rounded"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

// Using class component for error boundary as React doesn't support error boundaries with hooks yet
class ErrorBoundaryClass extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error("Error caught by ErrorBoundary:", error);
    console.error("Component stack:", errorInfo.componentStack);

    this.setState({
      error,
      errorInfo,
    });
  }

  resetErrorBoundary = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Force refresh the page as a last resort
    window.location.reload();
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          errorInfo={this.state.errorInfo || undefined}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }

    return this.props.children;
  }
}

// Functional wrapper for the class component to maintain API compatibility
export function ErrorBoundary({ children }: ErrorBoundaryProps) {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>;
}

export default ErrorBoundary;
