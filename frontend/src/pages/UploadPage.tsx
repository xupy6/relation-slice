import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Clock3,
  Database,
  ExternalLink,
  FileJson,
  FileSpreadsheet,
  FileText,
  HelpCircle,
  History,
  Play,
  RefreshCw,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import { type ChangeEvent, type DragEvent, useState } from 'react'

import { GlassButton, GlassCard, LoadingIndicator } from '../components'
import type { AnalysisHistoryItem, WorkStatus } from '../types'

type UploadPageProps = {
  error: string | null
  files: File[]
  history: AnalysisHistoryItem[]
  messageCount: number
  status: WorkStatus
  uploadProgress: number
  analysisProgress: number
  onAnalyze: () => void
  onClearFiles: () => void
  onClearHistory: () => void
  onFilesSelected: (files?: File[]) => void
  onSelectHistory: (item: AnalysisHistoryItem) => void
}

const COPY = {
  eyebrow: '\u804a\u5929\u8bb0\u5f55\u5206\u6790',
  title: '\u5173\u7cfb\u5207\u7247',
  intro:
    '\u5bfc\u5165\u804a\u5929\u8bb0\u5f55\uff0c\u8ba9 AI \u628a\u4e24\u4e2a\u4eba\u7684\u8bed\u6c14\u3001\u8282\u594f\u548c\u60c5\u7eea\u56de\u58f0\u5207\u6210\u4e00\u4efd\u6e05\u723d\u7684\u5173\u7cfb\u62a5\u544a\u3002',
  fileHint: '.db .sqlite .json .csv .txt .png .jpg .webp',
  selectFiles: '\u9009\u62e9\u591a\u4e2a\u6587\u4ef6',
  analyze: '\u5f00\u59cb\u5206\u6790',
  retry: '\u91cd\u8bd5',
  dropTitle: '\u628a\u804a\u5929\u8bb0\u5f55\u653e\u5230\u8fd9\u91cc',
  dropSubtitle: '\u63a8\u8350 JSON\u3001CSV \u6216 TXT\uff1b\u6570\u636e\u5e93\u6587\u4ef6\u53ef\u4f5c\u4e3a\u5907\u9009\u3002',
  idle: '\u5f85\u4e0a\u4f20',
  ready: '\u6587\u4ef6\u5df2\u5c31\u7eea',
  uploading: '\u4e0a\u4f20\u4e2d',
  analyzing: '\u5206\u6790\u4e2d...',
  guideTitle: '\u5bfc\u5165\u6559\u7a0b',
  guideButton: '\u67e5\u770b\u5fae\u4fe1\u804a\u5929\u8bb0\u5f55\u5bfc\u51fa\u6559\u7a0b',
  guideIntro: '\u4e0d\u786e\u5b9a\u6587\u4ef6\u600e\u4e48\u51c6\u5907\u65f6\uff0c\u5148\u770b\u8fd9\u91cc\u3002',
  exportHelpTitle: '\u600e\u4e48\u5bfc\u51fa\u5fae\u4fe1\u804a\u5929\u8bb0\u5f55',
  exportHelpIntro:
    '\u5efa\u8bae\u7528 WeChatMsg \u5148\u628a\u804a\u5929\u8bb0\u5f55\u5bfc\u51fa\u6210 JSON\u3001CSV \u6216 TXT\uff0c\u518d\u56de\u5230\u8fd9\u91cc\u4e0a\u4f20\u5206\u6790\u3002',
  exportHelpLink: '\u6253\u5f00 WeChatMsg \u5b98\u65b9 GitHub',
  close: '\u5173\u95ed',
  supportTitle: '\u652f\u6301\u683c\u5f0f',
  supportText: '\u6700\u7a33\u59a5\u7684\u662f JSON / CSV / TXT\uff1b\u622a\u56fe\u53ef\u5c1d\u8bd5 OCR \u89e3\u6790\u3002',
  dbTitle: '\u6570\u636e\u5e93\u6587\u4ef6',
  dbText: '.db / .sqlite \u9700\u8981\u672c\u5730 WeChatMsg \u5bfc\u51fa\u914d\u7f6e\uff1b\u5931\u8d25\u65f6\u6539\u4f20\u5df2\u5bfc\u51fa\u6587\u4ef6\u3002',
  statusTitle: '\u5f53\u524d\u4efb\u52a1',
  selectedFile: '\u5df2\u9009\u6587\u4ef6',
  fileCount: '\u6587\u4ef6\u6570',
  parsedMessages: '\u89e3\u6790\u6d88\u606f',
  uploadPercent: '\u4e0a\u4f20\u8fdb\u5ea6',
  noFile: '\u5c1a\u672a\u9009\u62e9',
  multiFileName: '\u4e2a\u6587\u4ef6\u5df2\u9009',
  relationshipMap: '\u5173\u7cfb\u56fe\u8c31',
  graphHintIdle: '\u9009\u62e9\u6587\u4ef6\u540e\u5f00\u59cb\u8fde\u63a5\u6570\u636e\u3002',
  graphHintReady: '\u804a\u5929\u6570\u636e\u5c31\u7eea\uff0c\u53ef\u5f00\u59cb\u5206\u6790\u3002',
  historyTitle: '\u5386\u53f2\u8bb0\u5f55',
  emptyHistory: '\u5b8c\u6210\u5206\u6790\u540e\uff0c\u8bb0\u5f55\u4f1a\u4fdd\u5b58\u5728\u8fd9\u91cc\u3002',
  clearHistory: '\u6e05\u7a7a',
  clearFiles: '\u6e05\u7a7a\u6587\u4ef6',
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

const exportSteps = [
  '\u6253\u5f00 WeChatMsg \u5b98\u65b9 GitHub\uff0c\u6309 README \u6216\u6587\u6863\u5b89\u88c5\u5e76\u542f\u52a8\u5de5\u5177\u3002',
  '\u6309\u5de5\u5177\u63d0\u793a\u9009\u62e9\u9700\u8981\u5bfc\u51fa\u7684\u5fae\u4fe1\u8d26\u53f7\u3001\u597d\u53cb\u6216\u7fa4\u804a\u3002',
  '\u5728\u5bfc\u51fa\u529f\u80fd\u91cc\u9009\u62e9 JSON\u3001CSV \u6216 TXT \u683c\u5f0f\uff1b\u8fd9\u4e09\u79cd\u683c\u5f0f\u53ef\u4ee5\u76f4\u63a5\u4e0a\u4f20\u5230\u5173\u7cfb\u5207\u7247\u3002',
  '\u5982\u679c\u4f60\u53ea\u62ff\u5230 .db \u6216 .sqlite \u6587\u4ef6\uff0c\u4e5f\u53ef\u4ee5\u5c1d\u8bd5\u4e0a\u4f20\uff1b\u4f46\u540e\u7aef\u9700\u8981\u914d\u597d WeChatMsg CLI\u3002',
]

const wechatMsgUrl = 'https://github.com/LC044/WeChatMsg'

function getSelectedFileLabel(files: File[]) {
  if (!files.length) {
    return ''
  }

  if (files.length === 1) {
    return files[0].name
  }

  return `${files[0].name} + ${files.length - 1} ${COPY.multiFileName}`
}

function UploadPage({
  error,
  files,
  history,
  messageCount,
  status,
  uploadProgress,
  analysisProgress,
  onAnalyze,
  onClearFiles,
  onClearHistory,
  onFilesSelected,
  onSelectHistory,
}: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showExportHelp, setShowExportHelp] = useState(false)

  const isWorking = status === 'uploading' || status === 'analyzing'
  const progressValue = status === 'uploading' ? uploadProgress : status === 'analyzing' ? analysisProgress : uploadProgress
  const statusLabel = status === 'uploading' ? COPY.uploading : status === 'analyzing' ? COPY.analyzing : files.length ? COPY.ready : COPY.idle
  const selectedFileLabel = getSelectedFileLabel(files)

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onFilesSelected(Array.from(event.target.files ?? []))
    event.currentTarget.value = ''
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
      onFilesSelected(Array.from(event.dataTransfer.files ?? []))
    }
  }

  return (
    <section className="grid w-full gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="space-y-6">
        <GlassCard className="apple-panel p-6 sm:p-8 lg:p-10">
          <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_340px] xl:items-stretch">
            <div className="flex flex-col justify-between gap-8">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-medium text-[#007aff] dark:text-[#8fc2ff]">{COPY.eyebrow}</p>
              <h1 className="text-5xl font-semibold leading-[1.04] text-[rgb(var(--text-primary))] sm:text-6xl">
                {COPY.title}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[rgb(var(--text-secondary))]">{COPY.intro}</p>
            </div>

            <div
              className={`rounded-[26px] border border-dashed p-6 backdrop-blur-xl transition sm:p-7 ${
                isDragging
                  ? 'border-[#007aff]/80 bg-[#007aff]/10'
                  : 'border-white/70 bg-white/[0.34] dark:border-white/[0.12] dark:bg-white/[0.06]'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid h-14 w-14 flex-none place-items-center rounded-[20px] bg-white/60 text-[#007aff] shadow-soft dark:bg-white/10">
                    <UploadCloud size={24} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-[rgb(var(--text-primary))]" title={selectedFileLabel}>
                      {files.length ? selectedFileLabel : COPY.dropTitle}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[rgb(var(--text-muted))]">
                      {files.length ? `${files.length} files - ${COPY.fileHint}` : COPY.dropSubtitle}
                    </p>
                  </div>
                </div>
                <label className="glass-button inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 px-5 py-3 text-sm font-semibold">
                  <UploadCloud size={17} strokeWidth={1.8} />
                  {COPY.selectFiles}
                  <input
                    className="sr-only"
                    type="file"
                    multiple
                    accept=".db,.sqlite,.sqlite3,.json,.csv,.txt,.png,.jpg,.jpeg,.webp,.bmp"
                    disabled={isWorking}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className={status === 'analyzing' ? 'liquid-analysis-progress mt-6' : 'mt-6 h-2 overflow-hidden rounded-full bg-white/45 dark:bg-white/10'}>
                <div
                  className={status === 'analyzing' ? 'liquid-analysis-fill' : 'h-full rounded-full bg-[linear-gradient(90deg,#007aff,#5ac8fa,#34c759)] transition-all duration-300'}
                  style={{ width: `${progressValue}%` }}
                />
              </div>
            </div>

            {error ? (
              <div className="flex items-start gap-3 rounded-[22px] border border-[#ff9f0a]/35 bg-[#ff9f0a]/12 p-4 text-sm text-[rgb(var(--text-secondary))]">
                <AlertCircle className="mt-0.5 flex-none text-[#ff7a45]" size={18} strokeWidth={1.8} />
                <p className="leading-6">{error}</p>
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-col gap-3 sm:flex-row">
                <GlassButton
                  className="primary-gradient-button inline-flex min-h-12 items-center justify-center gap-2 px-6 py-3 text-sm font-semibold"
                  disabled={isWorking}
                  onClick={onAnalyze}
                >
                  <Play size={16} fill="currentColor" strokeWidth={1.8} />
                  {COPY.analyze}
                </GlassButton>
                {status === 'error' ? (
                  <GlassButton
                    className="inline-flex min-h-12 items-center justify-center gap-2 bg-white/[0.2] px-5 py-3 text-sm font-medium text-[rgb(var(--text-secondary))]"
                    disabled={isWorking}
                    onClick={onAnalyze}
                  >
                    <RefreshCw size={16} strokeWidth={1.8} />
                    {COPY.retry}
                  </GlassButton>
                ) : null}
              </div>

              <LoadingIndicator label={statusLabel} />
            </div>
            </div>

            <StatusPanel
              fileCount={files.length}
              messageCount={messageCount}
              progressValue={progressValue}
              selectedFileLabel={selectedFileLabel}
              statusLabel={statusLabel}
              onClearFiles={onClearFiles}
            />
          </div>
        </GlassCard>

        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <ImportGuide onShowHelp={() => setShowExportHelp(true)} />
          <HistoryPanel history={history} onClearHistory={onClearHistory} onSelectHistory={onSelectHistory} />
        </div>
      </div>

      <aside className="2xl:sticky 2xl:top-24">
        <RelationMapPanel
          fileCount={files.length}
          messageCount={messageCount}
          progressValue={progressValue}
          isAnalyzing={status === 'analyzing'}
          statusLabel={statusLabel}
        />
      </aside>

      {showExportHelp ? <ExportHelp onClose={() => setShowExportHelp(false)} /> : null}
    </section>
  )
}

function StatusRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] bg-white/[0.36] px-4 py-3 dark:bg-white/[0.06]">
      <p className="text-xs font-medium text-[rgb(var(--text-muted))]">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold text-[rgb(var(--text-primary))]">{value}</p>
    </div>
  )
}

function StatusPanel({
  fileCount,
  messageCount,
  progressValue,
  selectedFileLabel,
  statusLabel,
  onClearFiles,
}: {
  fileCount: number
  messageCount: number
  progressValue: number
  selectedFileLabel: string
  statusLabel: string
  onClearFiles: () => void
}) {
  return (
    <div className="rounded-[28px] border border-white/55 bg-white/[0.34] p-5 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{COPY.statusTitle}</p>
          <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{statusLabel}</p>
        </div>
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/55 text-[#34c759] shadow-soft dark:bg-white/10">
          <CheckCircle2 size={19} strokeWidth={1.8} />
        </span>
      </div>

      <div className="mt-6 grid gap-3">
        <StatusRow label={COPY.selectedFile} value={selectedFileLabel || COPY.noFile} />
        <StatusRow label={COPY.fileCount} value={String(fileCount)} />
        <StatusRow label={COPY.parsedMessages} value={String(messageCount)} />
        <StatusRow label={COPY.uploadPercent} value={`${progressValue}%`} />
      </div>

      <button
        type="button"
        className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-full bg-white/[0.32] px-4 text-sm font-medium text-[rgb(var(--text-secondary))] shadow-soft transition hover:bg-white/[0.5] hover:text-[#ff3b30] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/[0.08]"
        disabled={!fileCount}
        onClick={onClearFiles}
      >
        <X size={15} strokeWidth={1.8} />
        {COPY.clearFiles}
      </button>
    </div>
  )
}

function RelationMapPanel({
  fileCount,
  messageCount,
  progressValue,
  isAnalyzing,
  statusLabel,
}: {
  fileCount: number
  messageCount: number
  progressValue: number
  isAnalyzing: boolean
  statusLabel: string
}) {
  const hasFiles = fileCount > 0

  return (
    <div className="flex min-h-[360px] flex-col justify-between rounded-[28px] border border-white/55 bg-white/[0.34] p-5 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
      <div>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{COPY.relationshipMap}</p>
            <p className="mt-1 text-xs leading-5 text-[rgb(var(--text-muted))]">
              {hasFiles ? COPY.graphHintReady : COPY.graphHintIdle}
            </p>
          </div>
          <span className="inline-flex min-h-9 items-center rounded-full bg-white/[0.5] px-3 text-xs font-semibold text-[#34c759] shadow-soft dark:bg-white/10">
            {statusLabel}
          </span>
        </div>

        <div className="relative mt-7 h-56 overflow-hidden rounded-[26px] border border-white/45 bg-[linear-gradient(145deg,rgba(255,255,255,0.42),rgba(255,255,255,0.18))] dark:border-white/10 dark:bg-white/[0.05]">
          <div className="absolute left-[18%] top-[42%] h-px w-[64%] bg-[linear-gradient(90deg,rgba(0,122,255,0.16),rgba(90,200,250,0.78),rgba(52,199,89,0.18))]" />
          <div
            className={`absolute left-[19%] top-[31%] grid h-20 w-20 place-items-center rounded-full border border-white/70 bg-white/[0.72] text-sm font-semibold shadow-soft transition dark:border-white/10 dark:bg-white/[0.1] ${
              hasFiles ? 'text-[#007aff]' : 'text-[rgb(var(--text-muted))]'
            }`}
          >
            A
          </div>
          <div
            className={`absolute right-[19%] top-[31%] grid h-20 w-20 place-items-center rounded-full border border-white/70 bg-white/[0.72] text-sm font-semibold shadow-soft transition dark:border-white/10 dark:bg-white/[0.1] ${
              hasFiles ? 'text-[#ff2d55]' : 'text-[rgb(var(--text-muted))]'
            }`}
          >
            B
          </div>

          <GraphNode className="left-[42%] top-[14%]" label={'\u6d88\u606f'} active={hasFiles} color="#5ac8fa" />
          <GraphNode className="left-[32%] bottom-[14%]" label={'\u60c5\u7eea'} active={hasFiles} color="#ff9f0a" />
          <GraphNode className="right-[30%] bottom-[14%]" label={'\u8282\u594f'} active={hasFiles} color="#34c759" />

          <div className={isAnalyzing ? 'liquid-analysis-progress absolute inset-x-8 bottom-5 h-1.5' : 'absolute inset-x-8 bottom-5 h-1.5 overflow-hidden rounded-full bg-white/50 dark:bg-white/10'} aria-hidden="true">
            <div
              className={isAnalyzing ? 'liquid-analysis-fill' : 'h-full rounded-full bg-[linear-gradient(90deg,#007aff,#5ac8fa,#34c759)] transition-all duration-300'}
              style={{ width: `${progressValue}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3">
        <StatusRow label={COPY.fileCount} value={String(fileCount)} />
        <StatusRow label={COPY.parsedMessages} value={String(messageCount)} />
      </div>
    </div>
  )
}

function GraphNode({
  active,
  className,
  color,
  label,
}: {
  active: boolean
  className: string
  color: string
  label: string
}) {
  return (
    <div
      className={`absolute grid h-12 w-12 place-items-center rounded-full border border-white/70 bg-white/[0.66] text-[11px] font-semibold shadow-soft transition dark:border-white/10 dark:bg-white/[0.1] ${className}`}
      style={{ color: active ? color : 'rgb(var(--text-muted))' }}
    >
      {label}
    </div>
  )
}

function ImportGuide({ onShowHelp }: { onShowHelp: () => void }) {
  return (
    <GlassCard className="apple-panel p-6 sm:p-7">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[16px] bg-white/55 text-[#007aff] shadow-soft dark:bg-white/10">
              <BookOpen size={19} strokeWidth={1.8} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{COPY.guideTitle}</h2>
                <button
                  type="button"
                  className="grid h-8 w-8 place-items-center rounded-full bg-white/[0.42] text-[#007aff] shadow-soft transition hover:bg-white/[0.62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007aff]/70 dark:bg-white/[0.08] dark:hover:bg-white/[0.14]"
                  aria-label={COPY.guideButton}
                  title={COPY.guideButton}
                  onClick={onShowHelp}
                >
                  <HelpCircle size={17} strokeWidth={1.8} />
                </button>
              </div>
              <p className="mt-1 text-sm leading-6 text-[rgb(var(--text-muted))]">{COPY.guideIntro}</p>
            </div>
          </div>

          <div className="mt-5 grid gap-3">
            <InfoBlock icon={FileJson} title={COPY.supportTitle} body={COPY.supportText} color="#007aff" />
            <InfoBlock icon={Database} title={COPY.dbTitle} body={COPY.dbText} color="#34c759" />
          </div>
        </div>

        <div className="grid flex-1 gap-3 md:grid-cols-3">
          {guideSteps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className="relative overflow-hidden rounded-[24px] border border-white/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.58),rgba(255,255,255,0.2))] p-4 shadow-soft backdrop-blur-2xl transition hover:-translate-y-0.5 hover:bg-white/[0.5] dark:border-white/10 dark:bg-white/[0.06]"
              >
                <div className="pointer-events-none absolute inset-x-4 top-0 h-px bg-white/80 dark:bg-white/20" />
                <div className="flex items-center justify-between">
                  <span className="grid h-9 w-9 place-items-center rounded-[15px] bg-white/[0.54] text-[#007aff] shadow-soft dark:bg-white/[0.08]">
                    <Icon size={18} strokeWidth={1.8} />
                  </span>
                  <span className="rounded-full bg-white/[0.46] px-2.5 py-1 text-xs font-semibold text-[rgb(var(--text-muted))] shadow-soft dark:bg-white/[0.08]">
                    0{index + 1}
                  </span>
                </div>
                <p className="mt-4 text-sm font-semibold text-[rgb(var(--text-primary))]">{step.title}</p>
                <p className="mt-2 text-sm leading-6 text-[rgb(var(--text-muted))]">{step.body}</p>
              </div>
            )
          })}
        </div>
      </div>
    </GlassCard>
  )
}

function InfoBlock({
  icon: Icon,
  title,
  body,
  color,
}: {
  icon: typeof FileJson
  title: string
  body: string
  color: string
}) {
  return (
    <div className="rounded-[22px] bg-white/[0.3] p-4 dark:bg-white/[0.06]">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 flex-none" color={color} size={18} strokeWidth={1.8} />
        <div>
          <p className="text-sm font-semibold">{title}</p>
          <p className="mt-1 text-sm leading-6 text-[rgb(var(--text-muted))]">{body}</p>
        </div>
      </div>
    </div>
  )
}

function HistoryPanel({
  history,
  onClearHistory,
  onSelectHistory,
}: {
  history: AnalysisHistoryItem[]
  onClearHistory: () => void
  onSelectHistory: (item: AnalysisHistoryItem) => void
}) {
  return (
    <GlassCard className="apple-panel p-6 sm:p-7">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-[16px] bg-white/55 text-[#5856d6] shadow-soft dark:bg-white/10">
            <History size={19} strokeWidth={1.8} />
          </span>
          <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{COPY.historyTitle}</h2>
        </div>
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-full bg-white/[0.42] text-[rgb(var(--text-muted))] shadow-soft transition hover:bg-white/[0.62] hover:text-[#ff3b30] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/[0.08]"
          aria-label={COPY.clearHistory}
          title={COPY.clearHistory}
          disabled={!history.length}
          onClick={onClearHistory}
        >
          <Trash2 size={17} strokeWidth={1.8} />
        </button>
      </div>

      <div className="mt-5 space-y-3">
        {history.length ? (
          history.slice(0, 5).map((item) => (
            <button
              key={item.id}
              type="button"
              className="w-full rounded-[20px] bg-white/[0.32] p-4 text-left transition hover:bg-white/[0.5] dark:bg-white/[0.06] dark:hover:bg-white/[0.1]"
              onClick={() => onSelectHistory(item)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-[rgb(var(--text-primary))]">{item.fileName}</p>
                  <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
                    {item.messageCount} messages - {formatDate(item.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-white/[0.45] px-3 py-1 text-xs font-semibold text-[#007aff] dark:bg-white/[0.08]">
                  {item.report.intimacy_score ?? 0}
                </span>
              </div>
            </button>
          ))
        ) : (
          <div className="rounded-[20px] bg-white/[0.28] p-4 dark:bg-white/[0.06]">
            <div className="flex items-start gap-3">
              <Clock3 className="mt-0.5 flex-none text-[#8e8e93]" size={18} strokeWidth={1.8} />
              <p className="text-sm leading-6 text-[rgb(var(--text-muted))]">{COPY.emptyHistory}</p>
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  )
}

function ExportHelp({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-white/[0.34] px-4 backdrop-blur-xl dark:bg-black/[0.28]">
      <GlassCard className="apple-panel w-full max-w-2xl p-6 sm:p-7">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-sm font-medium text-[#007aff] dark:text-[#8fc2ff]">{COPY.guideTitle}</p>
            <h2 className="mt-2 text-2xl font-semibold leading-tight text-[rgb(var(--text-primary))]">
              {COPY.exportHelpTitle}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[rgb(var(--text-secondary))]">{COPY.exportHelpIntro}</p>
          </div>
          <button
            type="button"
            className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white/[0.42] text-[rgb(var(--text-secondary))] shadow-soft transition hover:bg-white/[0.62] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#007aff]/70 dark:bg-white/[0.08] dark:hover:bg-white/[0.14]"
            aria-label={COPY.close}
            onClick={onClose}
          >
            <X size={18} strokeWidth={1.8} />
          </button>
        </div>

        <div className="mt-6 grid gap-3">
          {exportSteps.map((step, index) => (
            <div key={step} className="flex gap-3 rounded-[22px] bg-white/[0.3] p-4 dark:bg-white/[0.06]">
              <span className="grid h-7 w-7 flex-none place-items-center rounded-full bg-white/[0.56] text-xs font-semibold text-[#007aff] dark:bg-white/[0.1]">
                {index + 1}
              </span>
              <p className="text-sm leading-7 text-[rgb(var(--text-secondary))]">{step}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            className="glass-button inline-flex min-h-11 items-center justify-center gap-2 px-5 py-3 text-sm font-semibold"
            href={wechatMsgUrl}
            target="_blank"
            rel="noreferrer"
          >
            {COPY.exportHelpLink}
            <ExternalLink size={16} strokeWidth={1.8} />
          </a>
          <button
            type="button"
            className="rounded-full px-5 py-3 text-sm font-medium text-[rgb(var(--text-secondary))] transition hover:bg-white/[0.3] hover:text-[rgb(var(--text-primary))] dark:hover:bg-white/[0.08]"
            onClick={onClose}
          >
            {COPY.close}
          </button>
        </div>
      </GlassCard>
    </div>
  )
}

function formatDate(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return value
  }

  return `${date.getMonth() + 1}/${date.getDate()} ${String(date.getHours()).padStart(2, '0')}:${String(
    date.getMinutes(),
  ).padStart(2, '0')}`
}

export default UploadPage
