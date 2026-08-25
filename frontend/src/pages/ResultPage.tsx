import { GlassCard, LoadingIndicator, MetricDisplay } from '../components'

const COPY = {
  eyebrow: '\u5206\u6790\u7ed3\u679c',
  relationType: '\u5b89\u5168\u578b\u5173\u7cfb',
  tag: '\u7a33\u5b9a\u966a\u4f34\u578b',
  chartPlaceholder: '\u56fe\u8868\u5360\u4f4d',
}

const metrics = [
  { label: '\u4eb2\u5bc6\u503c', value: '85', suffix: '/100', hint: '\u4e92\u52a8\u6e29\u5ea6' },
  { label: '\u4f9d\u8d56\u6307\u6570', value: '72', suffix: '%', hint: '\u4e3b\u52a8\u56de\u5e94' },
  { label: '\u9ed8\u5951\u7a0b\u5ea6', value: '78', suffix: '%', hint: '\u8282\u594f\u5408\u62cd' },
]

function ResultPage() {
  return (
    <section className="w-full space-y-5">
      <GlassCard className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#4f8cff] dark:text-[#8fc2ff]">{COPY.eyebrow}</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{COPY.relationType}</h1>
          </div>
          <span className="w-fit rounded-full border border-white/50 bg-white/[0.35] px-4 py-2 text-sm font-medium text-[rgb(var(--text-secondary))] shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]">
            {COPY.tag}
          </span>
        </div>
      </GlassCard>

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <MetricDisplay key={metric.label} {...metric} />
        ))}
      </div>

      <GlassCard className="p-6">
        <div className="grid h-56 place-items-center rounded-2xl border border-white/[0.45] bg-white/20 dark:border-white/10 dark:bg-white/[0.06]">
          <LoadingIndicator label={COPY.chartPlaceholder} />
        </div>
      </GlassCard>
    </section>
  )
}

export default ResultPage
