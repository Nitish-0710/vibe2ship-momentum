interface EmptyStateProps {
  title?: string
  description?: string
  action?: React.ReactNode
}

export default function EmptyState({
  title = 'No tasks yet',
  description = 'Add your first task to get started.',
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      {/* Icon */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-2xl"
        style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
      >
        📋
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm mb-6 max-w-xs" style={{ color: 'var(--color-text-muted)' }}>
        {description}
      </p>
      {action}
    </div>
  )
}
