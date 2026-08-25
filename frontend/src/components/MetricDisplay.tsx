import GlassCard from './GlassCard'

type MetricDisplayProps = {
  label: string
  value: string | number
  suffix?: string
  hint?: string
}

function MetricDisplay({ label, value, suffix, hint }: MetricDisplayProps) {
  return (
    <GlassCard className="p-5">
      <div className="flex min-h-[96px] flex-col justify-between">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-semibold leading-none">{value}</span>
          {suffix ? <span className="text-sm font-medium text-[rgb(var(--text-muted))]">{suffix}</span> : null}
        </div>
        <div>
          <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{label}</p>
          {hint ? <p className="mt-1 text-xs leading-5 text-[rgb(var(--text-muted))]">{hint}</p> : null}
        </div>
      </div>
    </GlassCard>
  )
}

export default MetricDisplay
