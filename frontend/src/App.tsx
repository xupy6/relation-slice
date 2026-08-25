import { useEffect, useRef, useState } from 'react'

import { analyzeChat, chatWithClone, distillClone, getApiErrorMessage, uploadChatFiles } from './api'
import ClonePage from './pages/ClonePage'
import ResultPage from './pages/ResultPage'
import UploadPage from './pages/UploadPage'
import { loadHistory, saveHistory } from './storage'
import type { AnalysisHistoryItem, CloneMessage, CloneProfile, CloneStatus, FinalReport, WorkStatus } from './types'

type AppView = 'upload' | 'result' | 'cloneUpload' | 'cloneChat'

const COPY = {
  appName: '\u6d88\u5931\u7684TA',
  backToUpload: '\u56de\u5230\u4e0a\u4f20\u9875',
  relationSlice: '\u5173\u7cfb\u5207\u7247',
  upload: '\u4e0a\u4f20',
  result: '\u7ed3\u679c',
  clone: '\u8d5b\u535a\u514b\u9686',
  chat: '\u5bf9\u8bdd',
  musicBox: '\u97f3\u4e50\u76d2',
  missingFile: '\u8bf7\u5148\u9009\u62e9\u804a\u5929\u8bb0\u5f55\u6587\u4ef6\u3002',
}

function App() {
  const [view, setView] = useState<AppView>('upload')
  const [report, setReport] = useState<FinalReport | null>(null)
  const [files, setFiles] = useState<File[]>([])
  const [status, setStatus] = useState<WorkStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [history, setHistory] = useState<AnalysisHistoryItem[]>(() => loadHistory())
  const [cloneProfile, setCloneProfile] = useState<CloneProfile | null>(null)
  const [cloneMessages, setCloneMessages] = useState<CloneMessage[]>([])
  const [cloneStatus, setCloneStatus] = useState<CloneStatus>('idle')
  const [cloneError, setCloneError] = useState<string | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    saveHistory(history)
  }, [history])

  function handleFilesSelected(nextFiles?: File[]) {
    if (!nextFiles?.length) {
      return
    }

    setFiles((current) => mergeFiles(current, nextFiles))
    setStatus('idle')
    setError(null)
    setCloneProfile(null)
    setCloneMessages([])
    setCloneStatus('idle')
    setCloneError(null)
    setUploadProgress(0)
    setMessageCount(0)
  }

  function handleClearFiles() {
    setFiles([])
    setUploadProgress(0)
    setMessageCount(0)
    setError(null)
    setCloneError(null)
    setCloneProfile(null)
    setCloneMessages([])
    setStatus('idle')
    setCloneStatus('idle')
  }

  async function handleAnalyze() {
    if (!files.length) {
      setError(COPY.missingFile)
      setStatus('error')
      return
    }

    try {
      setError(null)
      setStatus('uploading')
      setUploadProgress(0)
      setMessageCount(0)

      const upload = await uploadChatFiles(files, setUploadProgress)
      const uploadedMessages = upload.chat_messages
      setMessageCount(uploadedMessages.length)

      setStatus('analyzing')
      const nextReport = await analyzeChat(uploadedMessages)
      const item: AnalysisHistoryItem = {
        id: `${Date.now()}-${files.map((item) => item.name).join('-')}`,
        fileName: files.length === 1 ? files[0].name : `${files.length} files`,
        messageCount: uploadedMessages.length,
        createdAt: new Date().toISOString(),
        report: nextReport,
      }

      setReport(nextReport)
      setHistory((current) => [item, ...current].slice(0, 20))
      setStatus('idle')
      setUploadProgress(100)
      setView('result')
    } catch (nextError) {
      setError(getApiErrorMessage(nextError))
      setStatus('error')
    }
  }

  function handleReset() {
    setReport(null)
    setView('upload')
  }

  function handleSelectHistory(item: AnalysisHistoryItem) {
    setReport(item.report)
    setMessageCount(item.messageCount)
    setView('result')
  }

  function handleClearHistory() {
    setHistory([])
  }

  async function handleDistillClone() {
    if (!files.length) {
      setCloneError(COPY.missingFile)
      setCloneStatus('error')
      return
    }

    try {
      setCloneError(null)
      setCloneStatus('uploading')
      setUploadProgress(0)
      setMessageCount(0)

      const upload = await uploadChatFiles(files, setUploadProgress)
      setMessageCount(upload.chat_messages.length)

      setCloneStatus('distilling')
      const profile = await distillClone(upload.chat_messages)
      setCloneProfile(profile)
      setCloneMessages([])
      setCloneStatus('idle')
      setUploadProgress(100)
      setView('cloneChat')
    } catch (nextError) {
      setCloneError(getApiErrorMessage(nextError))
      setCloneStatus('error')
    }
  }

  async function handleToggleMusic() {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    if (audio.paused) {
      await audio.play()
      setIsMusicPlaying(true)
      return
    }

    audio.pause()
    setIsMusicPlaying(false)
  }

  async function handleCloneSend(message: string) {
    if (!cloneProfile || cloneStatus === 'chatting') {
      return
    }

    const nextConversation: CloneMessage[] = [...cloneMessages, { role: 'user', content: message }]
    setCloneMessages(nextConversation)
    setCloneError(null)
    setCloneStatus('chatting')

    try {
      const response = await chatWithClone(cloneProfile, message, nextConversation)
      setCloneMessages([...nextConversation, { role: 'clone', content: response.reply }])
      setCloneStatus('idle')
    } catch (nextError) {
      setCloneError(getApiErrorMessage(nextError))
      setCloneStatus('error')
    }
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[rgb(var(--app-bg))] text-[rgb(var(--text-primary))]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.92),transparent_28%),linear-gradient(135deg,rgba(238,247,255,0.96),rgba(255,255,255,0.78)_42%,rgba(255,245,242,0.82))] dark:bg-[linear-gradient(135deg,rgba(14,20,31,0.98),rgba(21,26,38,0.88)_48%,rgba(42,31,34,0.74))]" />

      <header className="sticky top-0 z-20 border-b border-white/50 bg-white/[0.62] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08]">
        <nav className="relative flex h-14 w-full items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="grid h-7 w-16 place-items-center rounded-full bg-white/62 shadow-soft ring-1 ring-white/70 transition hover:bg-white/80 dark:bg-white/10 dark:ring-white/15"
              onClick={() => setView('upload')}
              aria-label={COPY.backToUpload}
            >
              <span className="flex gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#ffbd2e]" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
              </span>
            </button>
            <button
              type="button"
              className={`music-box ${isMusicPlaying ? 'music-box-active' : ''}`}
              aria-label={COPY.musicBox}
              title={COPY.musicBox}
              onClick={handleToggleMusic}
            >
              <span className="music-box-pin" />
              <span className="music-box-disc" />
            </button>
            <audio ref={audioRef} src="/music/ta-music.wav" loop onPause={() => setIsMusicPlaying(false)} onPlay={() => setIsMusicPlaying(true)} />
          </div>

          <button
            type="button"
            className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 text-center"
            onClick={() => setView('upload')}
            aria-label={COPY.backToUpload}
          >
            <span className="block text-[15px] font-semibold leading-5">{COPY.appName}</span>
            <span className="block text-xs leading-4 text-[rgb(var(--text-muted))]">Relation Slice</span>
          </button>

          <div className="flex max-w-[calc(100vw-118px)] gap-2 overflow-x-auto rounded-full border border-white/60 bg-white/[0.48] p-1 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08]">
            <button
              type="button"
              className={isRelationView(view) ? 'nav-pill-active' : 'nav-pill'}
              onClick={() => setView('upload')}
            >
              {COPY.relationSlice}
            </button>
            {isRelationView(view) ? (
              <>
                <button
                  type="button"
                  className={view === 'upload' ? 'nav-pill-active' : 'nav-pill'}
                  onClick={() => setView('upload')}
                >
                  {COPY.upload}
                </button>
                <button
                  type="button"
                  className={view === 'result' ? 'nav-pill-active' : 'nav-pill'}
                  onClick={() => setView('result')}
                >
                  {COPY.result}
                </button>
              </>
            ) : null}
            <button
              type="button"
              className={isCloneView(view) ? 'nav-pill-active' : 'nav-pill'}
              onClick={() => setView('cloneUpload')}
            >
              {COPY.clone}
            </button>
            {isCloneView(view) ? (
              <>
                <button
                  type="button"
                  className={view === 'cloneUpload' ? 'nav-pill-active' : 'nav-pill'}
                  onClick={() => setView('cloneUpload')}
                >
                  {COPY.upload}
                </button>
                <button
                  type="button"
                  className={view === 'cloneChat' ? 'nav-pill-active' : 'nav-pill'}
                  onClick={() => setView('cloneChat')}
                >
                  {COPY.chat}
                </button>
              </>
            ) : null}
          </div>
        </nav>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-56px)] w-full items-start px-3 py-5 sm:px-6 sm:py-8 2xl:px-8">
        {view === 'upload' ? (
          <UploadPage
            error={error}
            files={files}
            history={history}
            messageCount={messageCount}
            status={status}
            uploadProgress={uploadProgress}
            onAnalyze={handleAnalyze}
            onClearFiles={handleClearFiles}
            onClearHistory={handleClearHistory}
            onFilesSelected={handleFilesSelected}
            onSelectHistory={handleSelectHistory}
          />
        ) : isCloneView(view) ? (
          <ClonePage
            activePanel={view === 'cloneChat' ? 'chat' : 'upload'}
            error={cloneError}
            files={files}
            messages={cloneMessages}
            messageCount={messageCount}
            profile={cloneProfile}
            status={cloneStatus}
            uploadProgress={uploadProgress}
            onClearFiles={handleClearFiles}
            onDistill={handleDistillClone}
            onFilesSelected={handleFilesSelected}
            onSend={handleCloneSend}
          />
        ) : (
          <ResultPage report={report} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}

function mergeFiles(current: File[], nextFiles: File[]) {
  const byFingerprint = new Map<string, File>()
  for (const file of [...current, ...nextFiles]) {
    byFingerprint.set(`${file.name}-${file.size}-${file.lastModified}`, file)
  }
  return Array.from(byFingerprint.values())
}

function isRelationView(view: AppView) {
  return view === 'upload' || view === 'result'
}

function isCloneView(view: AppView) {
  return view === 'cloneUpload' || view === 'cloneChat'
}

export default App
