import { GlassButton, GlassCard, LoadingIndicator } from '../components'

type UploadPageProps = {
  onPreviewResult: () => void
}

const COPY = {
  eyebrow: '\u804a\u5929\u8bb0\u5f55\u5206\u6790',
  title: '\u5173\u7cfb\u5207\u7247',
  intro:
    '\u4e0a\u4f20\u5fae\u4fe1\u804a\u5929\u6570\u636e\u5e93\u6216\u5df2\u5bfc\u51fa\u7684 JSON\u3001CSV\u3001TXT \u6587\u4ef6\uff0c\u751f\u6210\u4e00\u4efd\u53ef\u89c6\u5316\u5173\u7cfb\u62a5\u544a\u3002',
  fileTitle: '\u804a\u5929\u8bb0\u5f55\u6587\u4ef6',
  selectFile: '\u9009\u62e9\u6587\u4ef6',
  analyze: '\u5f00\u59cb\u5206\u6790',
  preview: '\u67e5\u770b\u5360\u4f4d\u7ed3\u679c',
  idle: '\u7b49\u5f85\u4e0a\u4f20',
}

function UploadPage({ onPreviewResult }: UploadPageProps) {
  return (
    <section className="w-full">
      <GlassCard className="p-6 sm:p-8">
        <div className="grid gap-8 sm:grid-cols-[1fr_220px] sm:items-center">
          <div className="space-y-6">
            <div className="space-y-3">
              <p className="text-sm font-medium text-[#4f8cff] dark:text-[#8fc2ff]">{COPY.eyebrow}</p>
              <h1 className="text-4xl font-semibold leading-tight text-[rgb(var(--text-primary))] sm:text-5xl">
                {COPY.title}
              </h1>
              <p className="max-w-xl text-base leading-7 text-[rgb(var(--text-secondary))]">{COPY.intro}</p>
            </div>

            <div className="rounded-2xl border border-dashed border-white/60 bg-white/[0.24] p-5 backdrop-blur-xl dark:border-white/[0.12] dark:bg-white/[0.06]">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-medium text-[rgb(var(--text-primary))]">{COPY.fileTitle}</p>
                  <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">.db .sqlite .json .csv .txt</p>
                </div>
                <label className="glass-button inline-flex cursor-pointer items-center justify-center px-5 py-3 text-sm font-medium">
                  {COPY.selectFile}
                  <input className="sr-only" type="file" />
                </label>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <GlassButton className="px-5 py-3 text-sm font-semibold">{COPY.analyze}</GlassButton>
              <GlassButton
                className="bg-white/[0.18] px-5 py-3 text-sm font-medium text-[rgb(var(--text-secondary))]"
                onClick={onPreviewResult}
              >
                {COPY.preview}
              </GlassButton>
            </div>

            <LoadingIndicator label={COPY.idle} />
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
      </GlassCard>
    </section>
  )
}

export default UploadPage
