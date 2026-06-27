/**
 * Full-screen loading spinner displayed during auth initialization.
 * Prevents flash of unauthenticated content on page load.
 */
export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--color-bg)' }}>
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-purple-500 animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-transparent border-t-violet-400 animate-spin" style={{ animationDuration: '0.6s' }} />
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          Loading Momentum...
        </p>
      </div>
    </div>
  )
}
