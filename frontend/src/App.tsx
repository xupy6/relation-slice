import { useState } from 'react'

import type { FinalReport } from './types'
import ResultPage from './pages/ResultPage'
import UploadPage from './pages/UploadPage'

type AppView = 'upload' | 'result'

const COPY = {
  appName: '\u5173\u7cfb\u5207\u7247',
  backToUpload: '\u56de\u5230\u4e0a\u4f20\u9875',
  upload: '\u4e0a\u4f20',
  result: '\u7ed3\u679c',
}

function App() {
  const [view, setView] = useState<AppView>('upload')
  const [report, setReport] = useState<FinalReport | null>(null)

  function handleAnalysisComplete(nextReport: FinalReport) {
    setReport(nextReport)
    setView('result')
  }

  function handleReset() {
    setReport(null)
    setView('upload')
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-[rgb(var(--app-bg))] text-[rgb(var(--text-primary))]">
      <div className="pointer-events-none fixed inset-0 bg-[linear-gradient(135deg,rgba(236,246,255,0.92),rgba(255,255,255,0.72)_42%,rgba(255,241,237,0.76))] dark:bg-[linear-gradient(135deg,rgba(14,20,31,0.96),rgba(21,26,38,0.86)_48%,rgba(42,31,34,0.72))]" />

      <header className="sticky top-0 z-20 border-b border-white/40 bg-white/[0.45] backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08]">
        <nav className="mx-auto flex h-16 max-w-[800px] items-center justify-between px-5">
          <button
            type="button"
            className="flex items-center gap-3 text-left"
            onClick={() => setView('upload')}
            aria-label={COPY.backToUpload}
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/55 shadow-soft ring-1 ring-white/60 dark:bg-white/10 dark:ring-white/15">
              <span className="h-3.5 w-3.5 rounded-full bg-[#4f8cff]" />
            </span>
            <span>
              <span className="block text-[15px] font-semibold leading-5">{COPY.appName}</span>
              <span className="block text-xs leading-4 text-[rgb(var(--text-muted))]">Relation Slice</span>
            </span>
          </button>

          <div className="flex rounded-full border border-white/50 bg-white/[0.35] p-1 shadow-soft backdrop-blur-2xl dark:border-white/10 dark:bg-white/[0.08]">
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

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-64px)] w-full max-w-[800px] items-center px-5 py-10">
        {view === 'upload' ? (
          <UploadPage onAnalysisComplete={handleAnalysisComplete} />
        ) : (
          <ResultPage report={report} onReset={handleReset} />
        )}
      </main>
    </div>
  )
}

export default App
