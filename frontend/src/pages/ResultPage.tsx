const metrics = [
  { label: '亲密值', value: '85' },
  { label: '依赖指数', value: '72' },
  { label: '默契程度', value: '78' },
]

function ResultPage() {
  return (
    <section className="w-full space-y-5">
      <div className="glass p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-[#4f8cff] dark:text-[#8fc2ff]">分析结果</p>
            <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">安全型关系</h1>
          </div>
          <span className="w-fit rounded-full border border-white/50 bg-white/[0.35] px-4 py-2 text-sm font-medium text-[rgb(var(--text-secondary))] shadow-soft backdrop-blur-xl dark:border-white/10 dark:bg-white/[0.08]">
            稳定陪伴型
          </span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {metrics.map((metric) => (
          <div key={metric.label} className="glass p-5">
            <p className="text-3xl font-semibold leading-none">{metric.value}</p>
            <p className="mt-3 text-sm text-[rgb(var(--text-muted))]">{metric.label}</p>
          </div>
        ))}
      </div>

      <div className="glass p-6">
        <div className="h-56 rounded-2xl border border-white/[0.45] bg-white/20 dark:border-white/10 dark:bg-white/[0.06]" />
      </div>
    </section>
  )
}

export default ResultPage
