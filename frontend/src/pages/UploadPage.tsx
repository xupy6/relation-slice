import { AlertCircle, FileText, Play, RefreshCw, UploadCloud } from 'lucide-react'
import { type DragEvent, type ChangeEvent, useRef, useState } from 'react'

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
    '\u4e0a\u4f20\u5fae\u4fe1\u804a\u5929\u6570\u636e\u5e93\u6216\u5df2\u5bfc\u51fa\u7684 JSON\u3001CSV\u3001TXT \u6587\u4ef6\uff0c\u751f\u6210\u4e00\u4efd\u53ef\u89c6\u5316\u5173\u7cfb\u62a5\u544a\u3002',
  fileTitle: '\u804a\u5929\u8bb0\u5f55\u6587\u4ef6',
  fileHint: '.db .sqlite .json .csv .txt',
  selectFile: '\u9009\u62e9\u6587\u4ef6',
  analyze: '\u5f00\u59cb\u5206\u6790',
  retry: '\u91cd\u8bd5',
  dropTitle: '\u62d6\u62fd\u6587\u4ef6\u5230\u8fd9\u91cc',
  dropSubtitle: '\u6216\u70b9\u51fb\u53f3\u4fa7\u6309\u94ae\u9009\u62e9',
  idle: '\u7b49\u5f85\u4e0a\u4f20',
  uploading: '\u4e0a\u4f20\u4e2d',
  analyzing: '\u5206\u6790\u4e2d...',
  missingFile: '\u8bf7\u5148\u9009\u62e9\u4e00\u4e2a\u804a\u5929\u8bb0\u5f55\u6587\u4ef6\u3002',
}

function UploadPage({ onAnalysisComplete }: UploadPageProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<WorkStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const isWorking = status === 'uploading' || status === 'analyzing'

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

            <div
              className={`rounded-2xl border border-dashed p-5 backdrop-blur-xl transition ${
                isDragging
                  ? 'border-[#4f8cff]/80 bg-[#4f8cff]/10'
                  : 'border-white/60 bg-white/[0.24] dark:border-white/[0.12] dark:bg-white/[0.06]'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="grid h-10 w-10 flex-none place-items-center rounded-xl bg-white/45 text-[#4f8cff] shadow-soft dark:bg-white/10">
                    <FileText size={18} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[rgb(var(--text-primary))]">
                      {file ? file.name : COPY.dropTitle}
                    </p>
                    <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">{file ? COPY.fileHint : COPY.dropSubtitle}</p>
                  </div>
                </div>
                <label className="glass-button inline-flex cursor-pointer items-center justify-center gap-2 px-5 py-3 text-sm font-medium">
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

              {status === 'uploading' ? (
                <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/35 dark:bg-white/10">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#4f8cff,#53d6b5)] transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              ) : null}
            </div>

            {error ? (
              <div className="flex items-start gap-3 rounded-2xl border border-[#ff8f70]/35 bg-[#ff8f70]/12 p-4 text-sm text-[rgb(var(--text-secondary))]">
                <AlertCircle className="mt-0.5 flex-none text-[#e46d52]" size={18} strokeWidth={1.8} />
                <p className="leading-6">{error}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <GlassButton className="inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold" disabled={isWorking} onClick={handleAnalyze}>
                <Play size={16} fill="currentColor" strokeWidth={1.8} />
                {COPY.analyze}
              </GlassButton>
              {status === 'error' ? (
                <GlassButton
                  className="inline-flex items-center justify-center gap-2 bg-white/[0.18] px-5 py-3 text-sm font-medium text-[rgb(var(--text-secondary))]"
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

          <div className="relative mx-auto aspect-square w-full max-w-[220px]">
            <div className="absolute inset-0 rounded-2xl border border-white/50 bg-white/25 shadow-glass backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08]" />
            <div className="absolute inset-7 rounded-full border border-white/60 bg-[conic-gradient(from_180deg,#4f8cff,#53d6b5,#ff8f70,#4f8cff)] opacity-85 blur-[0.2px] dark:border-white/15" />
            <div className="absolute inset-14 rounded-full bg-white/70 shadow-soft dark:bg-[#151a26]/[0.82]" />
            <div className="absolute inset-0 grid place-items-center">
              <div className="text-center">
                <p className="text-4xl font-semibold leading-none">
                  {status === 'uploading' ? uploadProgress : status === 'analyzing' ? 100 : 0}
                </p>
                <p className="mt-2 text-xs font-medium uppercase text-[rgb(var(--text-muted))]">upload</p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </section>
  )
}

export default UploadPage
