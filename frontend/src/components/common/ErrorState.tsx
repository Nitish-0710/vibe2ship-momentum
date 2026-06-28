interface ErrorStateProps {
  message?: string
  onRetry?: () => void
}

export default function ErrorState({
  message = 'Something went wrong. Please try again.',
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-2xl"
        style={{
          backgroundColor: 'rgba(239,68,68,0.1)',
          border: '1px solid rgba(239,68,68,0.3)',
        }}
      >
        ⚠️
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">Error</h3>
      <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-colors hover:opacity-80"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
            color: 'var(--color-text)',
          }}
        >
          Try Again
        </button>
      )}
    </div>
  )
}
