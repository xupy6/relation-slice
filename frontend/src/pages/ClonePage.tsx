import {
  Bot,
  BrainCircuit,
  Clock3,
  History,
  MessageCircle,
  Send,
  Sparkles,
  Trash2,
  UploadCloud,
  UserRound,
  X,
} from 'lucide-react'
import { type ChangeEvent, type DragEvent, type FormEvent, useState } from 'react'

import { GlassButton, GlassCard, LoadingIndicator } from '../components'
import type { CloneHistoryItem, CloneMessage, CloneProfile, CloneStatus } from '../types'

type ClonePageProps = {
  activePanel: 'upload' | 'chat'
  error: string | null
  files: File[]
  messages: CloneMessage[]
  messageCount: number
  profile: CloneProfile | null
  status: CloneStatus
  history: CloneHistoryItem[]
  uploadProgress: number
  onClearFiles: () => void
  onClearHistory: () => void
  onDistill: () => void
  onFilesSelected: (files?: File[]) => void
  onSend: (message: string) => void
  onSelectHistory: (item: CloneHistoryItem) => void
}

const COPY = {
  eyebrow: '\u8d5b\u535a\u514b\u9686',
  title: 'TA\u6765\u4e86',
  intro:
    '\u5148\u5bfc\u5165\u804a\u5929\u8bb0\u5f55\uff0c\u7cfb\u7edf\u4f1a\u63d0\u53d6\u8bed\u6c14\u3001\u60c5\u7eea\u8282\u594f\u548c\u5e38\u7528\u8868\u8fbe\uff0c\u751f\u6210\u4e00\u4e2a AI \u6a21\u62df\u4eba\u683c\u3002',
  dropTitle: '\u628a\u804a\u5929\u8bb0\u5f55\u653e\u5230\u8fd9\u91cc',
  fileHint: '.db .sqlite .json .csv .txt',
  selectFiles: '\u9009\u62e9\u6587\u4ef6',
  clearFiles: '\u6e05\u7a7a\u6587\u4ef6',
  distill: '\u5f00\u59cb\u514b\u9686\u84b8\u998f',
  profileTitle: '\u514b\u9686\u753b\u50cf',
  chatTitle: '\u5bf9\u8bdd\u5ba4',
  inputPlaceholder: '\u8ddf TA \u8bf4\u70b9\u4ec0\u4e48...',
  emptyChat: '\u84b8\u998f\u5b8c\u6210\u540e\uff0c\u4f60\u4eec\u7684\u5bf9\u8bdd\u4f1a\u51fa\u73b0\u5728\u8fd9\u91cc\u3002',
  idle: '\u5f85\u5bfc\u5165',
  ready: '\u6587\u4ef6\u5df2\u5c31\u7eea',
  uploading: '\u4e0a\u4f20\u4e2d',
  distilling: '\u84b8\u998f\u4e2d...',
  chatting: '\u56de\u590d\u4e2d...',
  fileCount: '\u6587\u4ef6\u6570',
  messageCount: '\u6d88\u606f\u6570',
  noProfile: '\u8fd8\u6ca1\u6709\u751f\u6210\u753b\u50cf',
  simulationNote: '\u8fd9\u662f AI \u6a21\u62df\u5bf9\u8bdd\uff0c\u4e0d\u4ee3\u8868\u771f\u4eba\u672c\u4eba\u3002',
  historyTitle: '\u514b\u9686\u5386\u53f2',
  emptyHistory: '\u84b8\u998f\u5b8c\u6210\u540e\uff0c\u514b\u9686\u5bf9\u8bdd\u4f1a\u4fdd\u5b58\u5728\u8fd9\u91cc\u3002',
  clearHistory: '\u6e05\u7a7a',
}

function ClonePage({
  activePanel,
  error,
  files,
  messages,
  messageCount,
  profile,
  status,
  history,
  uploadProgress,
  onClearFiles,
  onClearHistory,
  onDistill,
  onFilesSelected,
  onSend,
  onSelectHistory,
}: ClonePageProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [draft, setDraft] = useState('')
  const isWorking = status === 'uploading' || status === 'distilling' || status === 'chatting'
  const statusLabel = getStatusLabel(status, files.length)
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

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault()
    setIsDragging(false)
    if (!isWorking) {
      onFilesSelected(Array.from(event.dataTransfer.files ?? []))
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const message = draft.trim()
    if (!message || !profile || status === 'chatting') {
      return
    }

    setDraft('')
    onSend(message)
  }

  return (
    <section className={`grid w-full gap-6 xl:items-start ${activePanel === 'chat' ? 'xl:grid-cols-[380px_minmax(0,1fr)]' : ''}`}>
      <div className="space-y-6">
        {activePanel === 'upload' ? (
          <GlassCard className="apple-panel p-6 sm:p-8 lg:p-10">
            <div className="max-w-4xl space-y-4">
              <p className="text-sm font-medium text-[#007aff] dark:text-[#8fc2ff]">{COPY.eyebrow}</p>
              <h1 className="max-w-4xl text-4xl font-semibold leading-[1.08] text-[rgb(var(--text-primary))] sm:text-5xl">
                {COPY.title}
              </h1>
              <p className="max-w-3xl text-base leading-8 text-[rgb(var(--text-secondary))] sm:text-lg">{COPY.intro}</p>
            </div>

            <div
              className={`mt-8 rounded-[28px] border border-dashed p-6 backdrop-blur-2xl transition ${
                isDragging
                  ? 'border-[#007aff]/80 bg-[#007aff]/10'
                  : 'border-white/70 bg-white/[0.34] dark:border-white/[0.12] dark:bg-white/[0.06]'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-4">
                  <span className="grid h-14 w-14 flex-none place-items-center rounded-[20px] bg-white/60 text-[#007aff] shadow-soft dark:bg-white/10">
                    <BrainCircuit size={24} strokeWidth={1.8} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-[rgb(var(--text-primary))]" title={selectedFileLabel}>
                      {files.length ? selectedFileLabel : COPY.dropTitle}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-[rgb(var(--text-muted))]">
                      {files.length ? `${files.length} files - ${COPY.fileHint}` : COPY.simulationNote}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <label className="glass-button inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 px-5 py-3 text-sm font-semibold">
                    <UploadCloud size={17} strokeWidth={1.8} />
                    {COPY.selectFiles}
                    <input
                      className="sr-only"
                      type="file"
                      multiple
                      accept=".db,.sqlite,.sqlite3,.json,.csv,.txt"
                      disabled={isWorking}
                      onChange={handleInputChange}
                    />
                  </label>
                  <button
                    type="button"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-white/[0.32] px-5 text-sm font-medium text-[rgb(var(--text-secondary))] shadow-soft transition hover:bg-white/[0.5] hover:text-[#ff3b30] disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/[0.08]"
                    disabled={!files.length || isWorking}
                    onClick={onClearFiles}
                  >
                    <X size={16} strokeWidth={1.8} />
                    {COPY.clearFiles}
                  </button>
                </div>
              </div>

              <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/45 dark:bg-white/10">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#007aff,#5ac8fa,#34c759)] transition-all duration-300"
                  style={{ width: `${status === 'distilling' ? 100 : uploadProgress}%` }}
                />
              </div>
            </div>

            {error ? (
              <div className="mt-5 rounded-[22px] border border-[#ff9f0a]/35 bg-[#ff9f0a]/12 p-4 text-sm leading-6 text-[rgb(var(--text-secondary))]">
                {error}
              </div>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <GlassButton
                className="primary-gradient-button inline-flex min-h-12 items-center justify-center gap-2 px-6 py-3 text-sm font-semibold"
                disabled={!files.length || isWorking}
                onClick={onDistill}
              >
                <Sparkles size={16} strokeWidth={1.8} />
                {COPY.distill}
              </GlassButton>
              <LoadingIndicator label={statusLabel} />
            </div>
          </GlassCard>
        ) : null}

        <GlassCard className="apple-panel p-6 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-[16px] bg-white/55 text-[#5856d6] shadow-soft dark:bg-white/10">
                <Bot size={19} strokeWidth={1.8} />
              </span>
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{COPY.profileTitle}</h2>
            </div>
            <span className="rounded-full bg-white/[0.46] px-3 py-1 text-xs font-semibold text-[rgb(var(--text-muted))] shadow-soft dark:bg-white/[0.08]">
              {COPY.fileCount}: {files.length}
            </span>
          </div>

          {profile ? (
            <div className="mt-5 rounded-[24px] border border-white/50 bg-white/[0.34] p-5 shadow-soft dark:border-white/10 dark:bg-white/[0.06]">
              <p className="text-2xl font-semibold leading-tight">{profile.clone_name || profile.target_sender}</p>
              <p className="mt-3 text-sm leading-7 text-[rgb(var(--text-secondary))]">{profile.persona_summary}</p>
              <p className="mt-4 text-xs leading-5 text-[rgb(var(--text-muted))]">{COPY.simulationNote}</p>
            </div>
          ) : (
            <div className="mt-5 rounded-[24px] bg-white/[0.28] p-5 text-sm leading-7 text-[rgb(var(--text-muted))] dark:bg-white/[0.06]">
              {COPY.noProfile}
            </div>
          )}
        </GlassCard>

        <CloneHistoryPanel history={history} onClearHistory={onClearHistory} onSelectHistory={onSelectHistory} />
      </div>

      {activePanel === 'chat' ? (
      <GlassCard className="apple-panel chat-room-panel flex h-[calc(100vh-130px)] min-h-[620px] flex-col p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-[16px] bg-white/55 text-[#007aff] shadow-soft dark:bg-white/10">
              <MessageCircle size={19} strokeWidth={1.8} />
            </span>
            <div>
              <h2 className="text-lg font-semibold text-[rgb(var(--text-primary))]">{COPY.chatTitle}</h2>
              <p className="text-xs text-[rgb(var(--text-muted))]">
                {COPY.messageCount}: {messageCount}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 flex-1 space-y-3 overflow-y-auto rounded-[26px] border border-white/45 bg-white/[0.24] p-4 dark:border-white/10 dark:bg-white/[0.04]">
          {messages.length ? (
            messages.map((item, index) => (
              <div key={`${item.role}-${index}`} className={`flex ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[82%] rounded-[24px] px-4 py-3 text-sm leading-6 shadow-soft ${
                    item.role === 'user'
                      ? 'bg-[#007aff] text-white'
                      : 'border border-white/50 bg-white/[0.56] text-[rgb(var(--text-primary))] dark:border-white/10 dark:bg-white/[0.1]'
                  }`}
                >
                  <div className="mb-1 flex items-center gap-2 text-xs opacity-75">
                    {item.role === 'user' ? <UserRound size={13} /> : <Bot size={13} />}
                    {item.role === 'user' ? 'You' : profile?.clone_name || 'Clone'}
                  </div>
                  {item.content}
                </div>
              </div>
            ))
          ) : (
            <div className="grid h-full min-h-[260px] place-items-center text-center text-sm leading-7 text-[rgb(var(--text-muted))]">
              {COPY.emptyChat}
            </div>
          )}
        </div>

        <form className="mt-4 flex gap-3" onSubmit={handleSubmit}>
          <input
            className="chat-input min-h-12 flex-1 rounded-full border border-white/60 bg-white/[0.52] px-5 text-sm text-[rgb(var(--text-primary))] shadow-soft outline-none transition placeholder:text-[rgb(var(--text-muted))] focus:border-[#007aff]/60 dark:border-white/10 dark:bg-white/[0.08]"
            disabled={!profile || status === 'chatting'}
            placeholder={COPY.inputPlaceholder}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <GlassButton
            className="primary-gradient-button send-gradient-button inline-flex min-h-12 w-12 items-center justify-center"
            disabled={!profile || status === 'chatting' || !draft.trim()}
            type="submit"
          >
            <Send size={17} strokeWidth={1.8} />
          </GlassButton>
        </form>
      </GlassCard>
      ) : null}
    </section>
  )
}

function CloneHistoryPanel({
  history,
  onClearHistory,
  onSelectHistory,
}: {
  history: CloneHistoryItem[]
  onClearHistory: () => void
  onSelectHistory: (item: CloneHistoryItem) => void
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
                  <p className="truncate text-sm font-semibold text-[rgb(var(--text-primary))]">
                    {item.profile.clone_name || item.profile.target_sender || item.fileName}
                  </p>
                  <p className="mt-1 text-xs text-[rgb(var(--text-muted))]">
                    {item.messageCount} messages - {formatDate(item.createdAt)}
                  </p>
                </div>
                <span className="rounded-full bg-white/[0.45] px-3 py-1 text-xs font-semibold text-[#5856d6] dark:bg-white/[0.08]">
                  {item.messages.length}
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

function getSelectedFileLabel(files: File[]) {
  if (!files.length) {
    return ''
  }

  if (files.length === 1) {
    return files[0].name
  }

  return `${files[0].name} + ${files.length - 1} files`
}

function getStatusLabel(status: CloneStatus, fileCount: number) {
  if (status === 'uploading') {
    return COPY.uploading
  }
  if (status === 'distilling') {
    return COPY.distilling
  }
  if (status === 'chatting') {
    return COPY.chatting
  }
  return fileCount ? COPY.ready : COPY.idle
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

export default ClonePage
