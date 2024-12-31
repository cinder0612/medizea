'use client'

import ErrorBoundary from '@/components/error-boundary'

interface ErrorProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function Error({ error, reset }: ErrorProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <ErrorBoundary
        error={error}
        reset={reset}
      />
    </div>
  )
}

