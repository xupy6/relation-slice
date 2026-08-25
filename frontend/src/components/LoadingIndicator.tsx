type LoadingIndicatorProps = {
  label?: string
}

function LoadingIndicator({ label }: LoadingIndicatorProps) {
  return (
    <div className="flex items-center gap-3 text-sm font-medium text-[rgb(var(--text-secondary))]">
      <span className="liquid-loader" aria-hidden="true" />
      {label ? <span>{label}</span> : null}
    </div>
  )
}

export default LoadingIndicator
