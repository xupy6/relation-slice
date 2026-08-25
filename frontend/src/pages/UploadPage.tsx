import { AlertCircle, BookOpen, Database, FileJson, FileSpreadsheet, FileText, Play, RefreshCw, UploadCloud } from 'lucide-react'
import { type ChangeEvent, type DragEvent, useRef, useState } from 'react'

import { analyzeChat, getApiErrorMessage, uploadChatFile } from '../api'
import { GlassButton, GlassCard, LoadingIndicator } from '../components'
import type { FinalReport } from '../types'

type UploadPageProps = {
  onAnalysisComplete: (report: FinalReport) => void
}

type WorkStatus = 'idle' | 'uploading' | 'analyzing' | 'error'

const COPY = {
  eyebrow: '\u804a\u5929\u8bb0\u5f55\u5206\u6790',
  title: '\u5173\u7cfb\u5207\u7247',
  intro:
    '\u628a\u5df2\u5bfc\u51fa\u7684\u804a\u5929\u6587\u4ef6\u653e\u8fdb\u6765\uff0c\u7cfb\u7edf\u4f1a\u89e3\u6790\u6d88\u606f\u5e76\u751f\u6210\u4e00\u4efd\u53ef\u89c6\u5316\u5173\u7cfb\u62a5\u544a\u3002',
  fileHint: '.db .sqlite .json .csv .txt',
  selectFile: '\u9009\u62e9\u6587\u4ef6',
  analyze: '\u5f00\u59cb\u5206\u6790',
  retry: '\u91cd\u8bd5',
  dropTitle: '\u62d6\u62fd\u804a\u5929\u8bb0\u5f55\u5230\u8fd9\u91cc',
  dropSubtitle: '\u63a8\u8350\u4e0a\u4f20 JSON\u3001CSV \u6216 TXT\uff0c\u6570\u636e\u5e93\u6587\u4ef6\u53ef\u4f5c\u4e3a\u5907\u9009\u3002',
  idle: '\u7b49\u5f85\u4e0a\u4f20',
  uploading: '\u4e0a\u4f20\u4e2d',
  analyzing: '\u5206\u6790\u4e2d...',
  missingFile: '\u8bf7\u5148\u9009\u62e9\u4e00\u4e2a\u804a\u5929\u8bb0\u5f55\u6587\u4ef6\u3002',
  guideTitle: '\u5bfc\u5165\u6559\u7a0b',
  guideIntro: '\u4e0d\u786e\u5b9a\u6587\u4ef6\u600e\u4e48\u51c6\u5907\u65f6\uff0c\u6309\u8fd9\u4e09\u6b65\u8d70\u5c31\u597d\u3002',
  supportTitle: '\u652f\u6301\u683c\u5f0f',
  supportText: '\u6700\u7a33\u59a5\u7684\u662f JSON / CSV / TXT\uff0c\u4e0d\u4f9d\u8d56 WeChatMsg\u3002',
  dbTitle: '\u6570\u636e\u5e93\u6587\u4ef6',
  dbText: '.db / .sqlite \u9700\u8981\u672c\u5730 WeChatMsg \u5bfc\u51fa\u914d\u7f6e\uff1b\u5931\u8d25\u65f6\u6539\u4f20\u5df2\u5bfc\u51fa\u6587\u4ef6\u3002',
}

const guideSteps = [
  {
    icon: FileText,
    title: '\u5148\u5bfc\u51fa\u804a\u5929\u8bb0\u5f55',
    body: '\u4ece WeChatMsg \u6216\u5176\u4ed6\u5de5\u5177\u5bfc\u51fa JSON\u3001CSV\u3001TXT\u3002\u5982\u679c\u5df2\u7ecf\u6709\u5bfc\u51fa\u6587\u4ef6\uff0c\u53ef\u4ee5\u76f4\u63a5\u4e0a\u4f20\u3002',
  },
  {
    icon: FileSpreadsheet,
    title: '\u786e\u8ba4\u5b57\u6bb5',
    body: 'JSON / CSV \u5efa\u8bae\u5305\u542b sender\u3001content\u3001timestamp\u3001msg_type\u3002TXT \u53ef\u7528 2026-08-25 12:00:00 Alice: hello\u3002',
  },
  {
    icon: FileJson,
    title: '\u4e0a\u4f20\u540e\u5206\u6790',
    body: '\u9009\u62e9\u6587\u4ef6\u540e\u70b9\u51fb\u5f00\u59cb\u5206\u6790\u3002\u5982\u679c\u6570\u636e\u5e93\u89e3\u6790\u5931\u8d25\uff0c\u8bf7\u6362\u6210\u5df2\u5bfc\u51fa\u7684 JSON / CSV / TXT\u3002',
  },
]

function UploadPage({ onAnalysisComplete }: UploadPageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<WorkStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const isWorking = status === 'uploading' || status === 'analyzing'
  const progressValue = status === 'uploading' ? uploadProgress : status === 'analyzing' ? 100 : 0

  function handleFile(nextFile?: File) {
    if (!nextFile) {
      return
    }

    setFile(nextFile)
    setStatus('idle')
    setError(null)
    setUploadProgress(0)
  }

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    handleFile(event.target.files?.[0])
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    if (!isWorking) {
      setIsDragging(true)
    }
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (!isWorking) {
      handleFile(event.dataTransfer.files?.[0])
    }
  }

  async function handleAnalyze() {
    if (!file) {
      setError(COPY.missingFile)
      setStatus('error')
      return
    }

    try {
      setError(null)
      setStatus('uploading')
      setUploadProgress(0)
      const upload = await uploadChatFile(file, setUploadProgress)

      setStatus('analyzing')
      const report = await analyzeChat(upload.chat_messages)
      onAnalysisComplete(report)
    } catch (nextError) {
      setError(getApiErrorMessage(nextError))
      setStatus('error')
    }
  }

  return (
    <section className="w-full space-y-6">
      <GlassCard className="p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center">
          <div className="space-y-7">
            <div className="max-w-2xl space-y-4">
              <p className="text-sm font-medium text-[#4f8cff] dark:text-[#8fc2ff]">{COPY.eyebrow}</p>
              <h1 className="text-5xl font-semibold leading-[1.05] text-[rgb(var(--text-primary))] sm:text-6xl">
                {COPY.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[rgb(var(--text-secondary))]">{COPY.intro}</p>
            </div>

            <div
              className={`rounded-2xl border border-dashed p-5 backdrop-blur-xl transition sm:p-6 ${
                isDragging
                  ? 'border-[#4f8cff]/80 bg-[#4f8cff]/10'
                  : 'border-white/60 bg-white/[0.24] dark:border-white/[0.12] dark:bg-white/[0.06]'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid h-12 w-12 flex-none place-items-center rounded-xl bg-white/45 text-[#4f8cff] shadow-soft dark:bg-white/10">
                    <UploadCloud size={22} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold text-[rgb(var(--text-primary))]">
                      {file ? file.name : COPY.dropTitle}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[rgb(var(--text-muted))]">
                      {file ? COPY.fileHint : COPY.dropSubtitle}
                    </p>
                  </div>
                </div>
                <label className="glass-button inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 px-5 py-3 text-sm font-semibold">
                  <UploadCloud size={17} strokeWidth={1.8} />
                  {COPY.selectFile}
                  <input
                    ref={inputRef}
                    className="sr-only"
                    type="file"
                    accept=".db,.sqlite,.sqlite3,.json,.csv,.txt"
                    disabled={isWorking}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/35 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#4f8cff,#53d6b5)] transition-all duration-300"
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-[#ff8f70]/35 bg-[#ff8f70]/12 p-4 text-sm text-[rgb(var(--text-secondary))]">
                <AlertCircle className="mt-0.5 flex-none text-[#e46d52]" size={18} strokeWidth={1.8} />
                <p className="leading-6">{error}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row">
                <GlassButton
                  className="inline-flex min-h-12 items-center justify-center gap-2 px-6 py-3 text-sm font-semibold"
                  disabled={isWorking}
                  onClick={handleAnalyze}
                >
                  <Play size={16} fill="currentColor" strokeWidth={1.8} />
                  {COPY.analyze}
                </GlassButton>
                {status === 'error' ? (
                  <GlassButton
                    className="inline-flex min-h-12 items-center justify-center gap-2 bg-white/[0.18] px-5 py-3 text-sm font-medium text-[rgb(var(--text-secondary))]"
                    disabled={isWorking}
                    onClick={handleAnalyze}
                  >
                    <RefreshCw size={16} strokeWidth={1.8} />
                    {COPY.retry}
                  </GlassButton>
                ) : null}
              </div>

              <LoadingIndicator label={status === 'uploading' ? COPY.uploading : status === 'analyzing' ? COPY.analyzing : COPY.idle} />
            </div>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[320px]">
            <div className="absolute inset-0 rounded-2xl border border-white/50 bg-white/25 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08]" />
            <div className="absolute inset-8 rounded-full border border-white/60 bg-[conic-gradient(from_180deg,#4f8cff,#53d6b5,#ff8f70,#4f8cff)] opacity-85 blur-[0.2px] dark:border-white/15" />
            <div className="absolute inset-20 rounded-full bg-white/[0.72] shadow-soft dark:bg-[#151a26]/[0.82]" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-6xl font-semibold leading-none">{progressValue}</p>
                <p className="mt-3 text-xs font-medium uppercase text-[rgb(var(--text-muted))]">upload</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>

      <GlassCard className="p-6 sm:p-7">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-sm">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/45 text-[#4f8cff] shadow-soft dark:bg-white/10">
                <BookOpen size={19} strokeWidth={1.8} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{COPY.guideTitle}</h2>
                <p className="mt-1 text-sm leading-6 text-[rgb(var(--text-muted))]">{COPY.guideIntro}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              <div className="rounded-2xl bg-white/[0.24] p-4 dark:bg-white/[0.06]">
                <div className="flex items-start gap-3">
                  <FileJson className="mt-0.5 flex-none text-[#4f8cff]" size={18} strokeWidth={1.8} />
                  <div>
                    <p className="text-sm font-semibold">{COPY.supportTitle}</p>
                    <p className="mt-1 text-sm leading-6 text-[rgb(var(--text-muted))]">{COPY.supportText}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-white/[0.24] p-4 dark:bg-white/[0.06]">
                <div className="flex items-start gap-3">
                  <Database className="mt-0.5 flex-none text-[#53d6b5]" size={18} strokeWidth={1.8} />
                  <div>
                    <p className="text-sm font-semibold">{COPY.dbTitle}</p>
                    <p className="mt-1 text-sm leading-6 text-[rgb(var(--text-muted))]">{COPY.dbText}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid flex-1 gap-3 md:grid-cols-3">
            {guideSteps.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={step.title} className="rounded-2xl border border-white/40 bg-white/[0.22] p-4 dark:border-white/10 dark:bg-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <Icon size={18} strokeWidth={1.8} className="text-[#4f8cff]" />
                    <span className="text-xs font-semibold text-[rgb(var(--text-muted))]">0{index + 1}</span>
                  </div>
                  <p className="mt-4 text-sm font-semibold text-[rgb(var(--text-primary))]">{step.title}</p>
                  <p className="mt-2 text-sm leading-6 text-[rgb(var(--text-muted))]">{step.body}</p>
                </div>
              )
            })}
          </div>
        </div>
      </GlassCard>
    </section>
  )
}

export default UploadPage
