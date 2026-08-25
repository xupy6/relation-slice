import { useEffect, useState } from 'react'

import { analyzeChat, getApiErrorMessage, uploadChatFile } from './api'
import ResultPage from './pages/ResultPage'
import UploadPage from './pages/UploadPage'
import { loadHistory, saveHistory } from './storage'
import type { AnalysisHistoryItem, FinalReport, WorkStatus } from './types'

type AppView = 'upload' | 'result'

const COPY = {
  appName: '\u5173\u7cfb\u5207\u7247',
  backToUpload: '\u56de\u5230\u4e0a\u4f20\u9875',
  upload: '\u4e0a\u4f20',
  result: '\u7ed3\u679c',
  missingFile: '\u8bf7\u5148\u9009\u62e9\u4e00\u4e2a\u804a\u5929\u8bb0\u5f55\u6587\u4ef6\u3002',
}

function App() {
  const [view, setView] = useState<AppView>('upload')
  const [report, setReport] = useState<FinalReport | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [status, setStatus] = useState<WorkStatus>('idle')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [messageCount, setMessageCount] = useState(0)
  const [history, setHistory] = useState<AnalysisHistoryItem[]>(() => loadHistory())

  useEffect(() => {
    saveHistory(history)
  }, [history])

  function handleFileSelected(nextFile?: File) {
    if (!nextFile) {
      return
    }

    setFile(nextFile)
    setStatus('idle')
    setError(null)
    setUploadProgress(0)
    setMessageCount(0)
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
      setMessageCount(0)

      const upload = await uploadChatFile(file, setUploadProgress)
      setMessageCount(upload.chat_messages.length)

      setStatus('analyzing')
      const nextReport = await analyzeChat(upload.chat_messages)
      const item: AnalysisHistoryItem = {
        id: `${Date.now()}-${file.name}`,
        fileName: file.name,
        messageCount: upload.chat_messages.length,
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

  return (
    <div className="min-h-screen overflow-x-hidden bg-[rgb(var(--app-bg))] text-[rgb(var(--text-primary))]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.92),transparent_28%),linear-gradient(135deg,rgba(238,247,255,0.96),rgba(255,255,255,0.78)_42%,rgba(255,245,242,0.82))] dark:bg-[linear-gradient(135deg,rgba(14,20,31,0.98),rgba(21,26,38,0.88)_48%,rgba(42,31,34,0.74))]" />

      <header className="sticky top-0 z-20 border-b border-white/50 bg-white/[0.62] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08]">
        <nav className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-5">
          <button
            type="button"
            className="flex items-center gap-3 text-left"
            onClick={() => setView('upload')}
            aria-label={COPY.backToUpload}
          >
            <span className="grid h-9 w-9 place-items-center rounded-[14px] bg-white/70 shadow-soft ring-1 ring-white/70 dark:bg-white/10 dark:ring-white/15">
              <span className="h-3.5 w-3.5 rounded-full bg-[#007aff]" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold leading-5">{COPY.appName}</span>
              <span className="block text-xs leading-4 text-[rgb(var(--text-muted))]">Relation Slice</span>
            </span>
          </button>

          <div className="flex rounded-full border border-white/60 bg-white/[0.48] p-1 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08]">
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
          </div>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[1180px] items-start px-4 py-6 sm:px-5 sm:py-10">
        {view === 'upload' ? (
          <UploadPage
            error={error}
            file={file}
            history={history}
            messageCount={messageCount}
            status={status}
            uploadProgress={uploadProgress}
            onAnalyze={handleAnalyze}
            onClearHistory={handleClearHistory}
            onFileSelected={handleFileSelected}
            onSelectHistory={handleSelectHistory}
          />
        ) : (
          <ResultPage report={report} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}

export default App
