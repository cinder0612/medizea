"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="bg-black/50 backdrop-blur-lg rounded-lg p-8 max-w-2xl w-full">
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-amber-200">
                Something went wrong
              </h1>
              <p className="text-amber-100/80">
                An unexpected error occurred. Please try refreshing the page or
                contact support if the problem persists.
              </p>
              <Button
                onClick={() => {
                  this.setState({ hasError: false, error: null })
                  window.location.reload()
                }}
                className="bg-amber-500 hover:bg-amber-600 text-black"
              >
                Try again
              </Button>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <div className="mt-6 p-4 bg-black/40 rounded text-sm text-amber-200/60 font-mono">
                <p>Error: {this.state.error.message}</p>
                <p className="mt-2">Stack: {this.state.error.stack}</p>
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
