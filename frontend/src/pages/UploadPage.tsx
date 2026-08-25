type UploadPageProps = {
  onPreviewResult: () => void
}

function UploadPage({ onPreviewResult }: UploadPageProps) {
  return (
    <section className="w-full">
      <div className="glass p-6 sm:p-8">
        <div className="grid gap-8 sm:grid-cols-[1fr_220px] sm:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#4f8cff] dark:text-[#8fc2ff]">聊天记录分析</p>
              <h1 className="text-4xl font-semibold leading-tight text-[rgb(var(--text-primary))] sm:text-5xl">
                关系切片
              </h1>
              <p className="max-w-xl text-base leading-7 text-[rgb(var(--text-secondary))]">
                上传微信聊天数据库或已导出的 JSON、CSV、TXT 文件，生成一份可视化关系报告。
              </p>
            </div>

            <div className="rounded-2xl border border-dashed border-white/60 bg-white/[0.24] p-5 backdrop-blur-xl dark:border-white/[0.12] dark:bg-white/[0.06]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">聊天记录文件</p>
                  <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">.db .sqlite .json .csv .txt</p>
                </div>
                <label className="glass-button inline-flex cursor-pointer items-center justify-center px-5 py-3 text-sm font-medium">
                  选择文件
                  <input className="sr-only" type="file" />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" className="glass-button px-5 py-3 text-sm font-semibold">
                开始分析
              </button>
              <button
                type="button"
                className="rounded-full px-5 py-3 text-sm font-medium text-[rgb(var(--text-secondary))] transition hover:bg-white/30 hover:text-[rgb(var(--text-primary))] dark:hover:bg-white/[0.08]"
                onClick={onPreviewResult}
              >
                查看占位结果
              </button>
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[220px]">
            <div className="absolute inset-0 rounded-2xl border border-white/50 bg-white/25 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08]" />
            <div className="absolute inset-7 rounded-full border border-white/60 bg-[conic-gradient(from_180deg,#4f8cff,#53d6b5,#ff8f70,#4f8cff)] opacity-85 blur-[0.2px] dark:border-white/15" />
            <div className="absolute inset-14 rounded-full bg-white/70 shadow-soft dark:bg-[#151a26]/[0.82]" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-4xl font-semibold leading-none">85</p>
                <p className="mt-2 text-xs font-medium uppercase text-[rgb(var(--text-muted))]">intimacy</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default UploadPage
