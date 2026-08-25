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
  file: File | null
  history: AnalysisHistoryItem[]
  messageCount: number
  status: WorkStatus
  uploadProgress: number
  onAnalyze: () => void
  onClearHistory: () => void
  onFileSelected: (file?: File) => void
  onSelectHistory: (item: AnalysisHistoryItem) => void
}

const COPY = {
  eyebrow: '\u804a\u5929\u8bb0\u5f55\u5206\u6790',
  title: '\u5173\u7cfb\u5207\u7247',
  intro:
    '\u5bfc\u5165\u804a\u5929\u8bb0\u5f55\uff0c\u8ba9 AI \u628a\u4e24\u4e2a\u4eba\u7684\u8bed\u6c14\u3001\u8282\u594f\u548c\u60c5\u7eea\u56de\u58f0\u5207\u6210\u4e00\u4efd\u6e05\u723d\u7684\u5173\u7cfb\u62a5\u544a\u3002',
  fileHint: '.db .sqlite .json .csv .txt',
  selectFile: '\u9009\u62e9\u6587\u4ef6',
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
  supportText: '\u6700\u7a33\u59a5\u7684\u662f JSON / CSV / TXT\uff0c\u4e0d\u4f9d\u8d56 WeChatMsg\u3002',
  dbTitle: '\u6570\u636e\u5e93\u6587\u4ef6',
  dbText: '.db / .sqlite \u9700\u8981\u672c\u5730 WeChatMsg \u5bfc\u51fa\u914d\u7f6e\uff1b\u5931\u8d25\u65f6\u6539\u4f20\u5df2\u5bfc\u51fa\u6587\u4ef6\u3002',
  statusTitle: '\u5f53\u524d\u4efb\u52a1',
  selectedFile: '\u5df2\u9009\u6587\u4ef6',
  parsedMessages: '\u89e3\u6790\u6d88\u606f',
  uploadPercent: '\u4e0a\u4f20\u8fdb\u5ea6',
  noFile: '\u5c1a\u672a\u9009\u62e9',
  historyTitle: '\u5386\u53f2\u8bb0\u5f55',
  emptyHistory: '\u5b8c\u6210\u5206\u6790\u540e\uff0c\u8bb0\u5f55\u4f1a\u4fdd\u5b58\u5728\u8fd9\u91cc\u3002',
  clearHistory: '\u6e05\u7a7a',
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

function UploadPage({
  error,
  file,
  history,
  messageCount,
  status,
  uploadProgress,
  onAnalyze,
  onClearHistory,
  onFileSelected,
  onSelectHistory,
}: UploadPageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [showExportHelp, setShowExportHelp] = useState(false)

  const isWorking = status === 'uploading' || status === 'analyzing'
  const progressValue = status === 'uploading' ? uploadProgress : status === 'analyzing' ? 100 : uploadProgress
  const statusLabel = status === 'uploading' ? COPY.uploading : status === 'analyzing' ? COPY.analyzing : file ? COPY.ready : COPY.idle

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    onFileSelected(event.target.files?.[0])
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
      onFileSelected(event.dataTransfer.files?.[0])
    }
  }

  return (
    <section className="w-full space-y-6">
      <GlassCard className="apple-panel p-6 sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-stretch">
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
                    <p className="truncate text-lg font-semibold text-[rgb(var(--text-primary))]">
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
                    className="sr-only"
                    type="file"
                    accept=".db,.sqlite,.sqlite3,.json,.csv,.txt"
                    disabled={isWorking}
                    onChange={handleInputChange}
                  />
                </label>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/45 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#007aff,#5ac8fa,#34c759)] transition-all duration-300"
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
                  className="inline-flex min-h-12 items-center justify-center gap-2 px-6 py-3 text-sm font-semibold"
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

          <div className="rounded-[28px] border border-white/55 bg-white/[0.34] p-5 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.06]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[rgb(var(--text-primary))]">{COPY.statusTitle}</p>
                <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">{statusLabel}</p>
              </div>
              <span className="grid h-10 w-10 place-items-center rounded-full bg-white/55 text-[#34c759] shadow-soft dark:bg-white/10">
                <CheckCircle2 size={19} strokeWidth={1.8} />
              </span>
            </div>

            <div className="mt-6 grid gap-3">
              <StatusRow label={COPY.selectedFile} value={file ? file.name : COPY.noFile} />
              <StatusRow label={COPY.parsedMessages} value={String(messageCount)} />
              <StatusRow label={COPY.uploadPercent} value={`${progressValue}%`} />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <ImportGuide onShowHelp={() => setShowExportHelp(true)} />
        <HistoryPanel history={history} onClearHistory={onClearHistory} onSelectHistory={onSelectHistory} />
      </div>

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
              <div key={step.title} className="rounded-[22px] border border-white/50 bg-white/[0.28] p-4 dark:border-white/10 dark:bg-white/[0.05]">
                <div className="flex items-center justify-between">
                  <Icon size={18} strokeWidth={1.8} className="text-[#007aff]" />
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
                    {item.messageCount} messages · {formatDate(item.createdAt)}
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
