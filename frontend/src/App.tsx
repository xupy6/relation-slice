import { useEffect, useRef, useState } from 'react'
import { Gift, MessageCircle, MoreHorizontal, Pause, Play, SkipBack, SkipForward, X } from 'lucide-react'

import { analyzeChat, chatWithClone, distillClone, getApiErrorMessage, uploadChatFiles } from './api'
import ClonePage from './pages/ClonePage'
import ResultPage from './pages/ResultPage'
import UploadPage from './pages/UploadPage'
import { loadCloneHistory, loadHistory, saveCloneHistory, saveHistory } from './storage'
import type {
  AnalysisHistoryItem,
  CloneHistoryItem,
  CloneMessage,
  CloneProfile,
  CloneStatus,
  FinalReport,
  WorkStatus,
} from './types'

type AppView = 'upload' | 'result' | 'cloneUpload' | 'cloneChat'
type NavGroup = 'relation' | 'clone'
type RelationSubView = 'upload' | 'result'
type CloneSubView = 'cloneUpload' | 'cloneChat'

const MUSIC_TRACKS = [
  { title: 'Sunny Day', src: '/music/%E6%99%B4%E5%A4%A9-%E5%91%A8%E6%9D%B0%E4%BC%A6.mp3' },
  { title: 'Love Confession', src: '/music/%E5%91%8A%E7%99%BD%E6%B0%94%E7%90%83-%E5%91%A8%E6%9D%B0%E4%BC%A6.mp3' },
  { title: 'Cold City', src: '/music/%E4%BB%BB%E7%84%B6%2B-%2B%E5%87%89%E5%9F%8E.mp3' },
]

const COPY = {
  appName: '\u6d88\u5931\u7684TA',
  backToUpload: '\u56de\u5230\u4e0a\u4f20\u9875',
  relationSlice: '\u5173\u7cfb\u5207\u7247',
  upload: '\u4e0a\u4f20',
  result: '\u7ed3\u679c',
  clone: '\u8d5b\u535a\u514b\u9686',
  chat: '\u5bf9\u8bdd',
  musicBox: '\u97f3\u4e50\u76d2',
  previousTrack: '\u4e0a\u4e00\u9996',
  nextTrack: '\u4e0b\u4e00\u9996',
  more: '\u66f4\u591a',
  contactAuthor: '\u8054\u7cfb\u4f5c\u8005',
  reward: '\u8d5e\u8d4f',
  qq: 'QQ',
  wechat: '\u5fae\u4fe1',
  github: 'GitHub',
  close: '\u5173\u95ed',
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
  const [cloneHistory, setCloneHistory] = useState<CloneHistoryItem[]>(() => loadCloneHistory())
  const [activeCloneHistoryId, setActiveCloneHistoryId] = useState<string | null>(null)
  const [cloneProfile, setCloneProfile] = useState<CloneProfile | null>(null)
  const [cloneMessages, setCloneMessages] = useState<CloneMessage[]>([])
  const [cloneStatus, setCloneStatus] = useState<CloneStatus>('idle')
  const [cloneError, setCloneError] = useState<string | null>(null)
  const [isMusicPlaying, setIsMusicPlaying] = useState(false)
  const [musicTrackIndex, setMusicTrackIndex] = useState(0)
  const [musicProgress, setMusicProgress] = useState(0)
  const [isMoreOpen, setIsMoreOpen] = useState(false)
  const [openMorePanel, setOpenMorePanel] = useState<'contact' | 'reward' | null>(null)
  const [hoveredNavGroup, setHoveredNavGroup] = useState<NavGroup | null>(null)
  const [hoveredRelationSubView, setHoveredRelationSubView] = useState<RelationSubView | null>(null)
  const [hoveredCloneSubView, setHoveredCloneSubView] = useState<CloneSubView | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    saveHistory(history)
  }, [history])

  useEffect(() => {
    saveCloneHistory(cloneHistory)
  }, [cloneHistory])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) {
      return
    }

    setMusicProgress(0)
    if (isMusicPlaying) {
      void audio.play().catch(() => setIsMusicPlaying(false))
    }
  }, [isMusicPlaying, musicTrackIndex])

  function handleFilesSelected(nextFiles?: File[]) {
    if (!nextFiles?.length) {
      return
    }

    setFiles((current) => mergeFiles(current, nextFiles))
    setStatus('idle')
    setError(null)
    setCloneProfile(null)
    setCloneMessages([])
    setActiveCloneHistoryId(null)
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
    setActiveCloneHistoryId(null)
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
      const item: CloneHistoryItem = {
        id: `${Date.now()}-${files.map((item) => item.name).join('-')}`,
        fileName: files.length === 1 ? files[0].name : `${files.length} files`,
        messageCount: upload.chat_messages.length,
        createdAt: new Date().toISOString(),
        profile,
        messages: [],
      }
      setCloneProfile(profile)
      setCloneMessages([])
      setActiveCloneHistoryId(item.id)
      setCloneHistory((current) => [item, ...current].slice(0, 20))
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
      try {
        await audio.play()
        setIsMusicPlaying(true)
      } catch {
        setIsMusicPlaying(false)
      }
      return
    }

    audio.pause()
    setIsMusicPlaying(false)
  }

  function handleMusicTimeUpdate() {
    const audio = audioRef.current
    if (!audio || !audio.duration) {
      setMusicProgress(0)
      return
    }

    setMusicProgress(Math.round((audio.currentTime / audio.duration) * 100))
  }

  function handleMusicSeek(progress: number) {
    const audio = audioRef.current
    if (!audio || !audio.duration) {
      return
    }

    audio.currentTime = (progress / 100) * audio.duration
    setMusicProgress(progress)
  }

  function handlePreviousTrack() {
    setMusicTrackIndex((current) => (current === 0 ? MUSIC_TRACKS.length - 1 : current - 1))
  }

  function handleNextTrack() {
    setMusicTrackIndex((current) => (current + 1) % MUSIC_TRACKS.length)
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
      const completedConversation: CloneMessage[] = [...nextConversation, { role: 'clone', content: response.reply }]
      setCloneMessages(completedConversation)
      setCloneHistory((current) =>
        current.map((item) =>
          item.id === activeCloneHistoryId ? { ...item, messages: completedConversation, profile: cloneProfile } : item,
        ),
      )
      setCloneStatus('idle')
    } catch (nextError) {
      setCloneError(getApiErrorMessage(nextError))
      setCloneStatus('error')
    }
  }

  function handleSelectCloneHistory(item: CloneHistoryItem) {
    setCloneProfile(item.profile)
    setCloneMessages(item.messages)
    setActiveCloneHistoryId(item.id)
    setMessageCount(item.messageCount)
    setCloneError(null)
    setCloneStatus('idle')
    setView('cloneChat')
  }

  function handleClearCloneHistory() {
    setCloneHistory([])
    setActiveCloneHistoryId(null)
  }

  const activeNavGroup: NavGroup = isRelationView(view) ? 'relation' : 'clone'
  const liquidNavGroup = hoveredNavGroup ?? activeNavGroup
  const relationSubView = hoveredRelationSubView ?? (view === 'result' ? 'result' : 'upload')
  const cloneSubView = hoveredCloneSubView ?? (view === 'cloneChat' ? 'cloneChat' : 'cloneUpload')
  const currentTrack = MUSIC_TRACKS[musicTrackIndex]

  return (
    <div className="min-h-screen overflow-x-hidden bg-[rgb(var(--app-bg))] text-[rgb(var(--text-primary))]">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(255,255,255,0.92),transparent_28%),linear-gradient(135deg,rgba(238,247,255,0.96),rgba(255,255,255,0.78)_42%,rgba(255,245,242,0.82))] dark:bg-[linear-gradient(135deg,rgba(14,20,31,0.98),rgba(21,26,38,0.88)_48%,rgba(42,31,34,0.74))]" />

      <header className="sticky top-0 z-20 border-b border-white/55 bg-[linear-gradient(90deg,rgba(255,255,255,0.7),rgba(238,247,255,0.64)_36%,rgba(255,245,250,0.58)_72%,rgba(255,255,255,0.7))] backdrop-blur-2xl dark:border-white/10 dark:bg-[linear-gradient(90deg,rgba(255,255,255,0.08),rgba(92,140,255,0.1)_44%,rgba(255,120,170,0.08))]">
        <nav className="relative flex h-14 w-full items-center justify-between px-4 sm:px-6">
          <div className="ml-2 flex items-center gap-6">
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
            <div
              className={`music-box-player ${isMusicPlaying ? 'music-box-playing' : ''}`}
              title={`${COPY.musicBox}: ${currentTrack.title}`}
            >
              <button type="button" className="music-control" aria-label={COPY.previousTrack} onClick={handlePreviousTrack}>
                <SkipBack size={12} fill="currentColor" />
              </button>
              <button type="button" className="music-control music-control-main" aria-label={COPY.musicBox} onClick={handleToggleMusic}>
                {isMusicPlaying ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
              </button>
              <button type="button" className="music-control" aria-label={COPY.nextTrack} onClick={handleNextTrack}>
                <SkipForward size={12} fill="currentColor" />
              </button>
              <input
                className="music-progress"
                type="range"
                min="0"
                max="100"
                value={musicProgress}
                aria-label={COPY.musicBox}
                onChange={(event) => handleMusicSeek(Number(event.target.value))}
              />
              <span className={`music-box-disc ${isMusicPlaying ? 'music-box-disc-active' : ''}`} />
            </div>
            <audio
              ref={audioRef}
              src={currentTrack.src}
              onEnded={handleNextTrack}
              onLoadedMetadata={handleMusicTimeUpdate}
              onPause={() => setIsMusicPlaying(false)}
              onPlay={() => setIsMusicPlaying(true)}
              onTimeUpdate={handleMusicTimeUpdate}
            />
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

          <div
            className="nav-shell"
            data-mode={activeNavGroup}
            onMouseLeave={() => {
              setHoveredNavGroup(null)
              setHoveredRelationSubView(null)
              setHoveredCloneSubView(null)
            }}
          >
            <span className={`nav-liquid ${liquidNavGroup === 'clone' ? 'nav-liquid-clone' : 'nav-liquid-relation'}`} />
            <button
              type="button"
              className={isRelationView(view) ? 'nav-pill nav-main-pill nav-pill-active' : 'nav-pill nav-main-pill'}
              onClick={() => setView('upload')}
              onMouseEnter={() => setHoveredNavGroup('relation')}
            >
              {COPY.relationSlice}
            </button>
            {isRelationView(view) ? (
              <div className="nav-sub-shell" onMouseLeave={() => setHoveredRelationSubView(null)}>
                <span className={`nav-sub-liquid ${relationSubView === 'result' ? 'nav-sub-liquid-right' : ''}`} />
                <button
                  type="button"
                  className={view === 'upload' ? 'nav-pill nav-sub-pill nav-pill-active' : 'nav-pill nav-sub-pill'}
                  onClick={() => setView('upload')}
                  onMouseEnter={() => setHoveredRelationSubView('upload')}
                >
                  {COPY.upload}
                </button>
                <button
                  type="button"
                  className={view === 'result' ? 'nav-pill nav-sub-pill nav-pill-active' : 'nav-pill nav-sub-pill'}
                  onClick={() => setView('result')}
                  onMouseEnter={() => setHoveredRelationSubView('result')}
                >
                  {COPY.result}
                </button>
              </div>
            ) : null}
            <button
              type="button"
              className={isCloneView(view) ? 'nav-pill nav-main-pill nav-pill-active' : 'nav-pill nav-main-pill'}
              onClick={() => setView('cloneUpload')}
              onMouseEnter={() => setHoveredNavGroup('clone')}
            >
              {COPY.clone}
            </button>
            {isCloneView(view) ? (
              <div className="nav-sub-shell" onMouseLeave={() => setHoveredCloneSubView(null)}>
                <span className={`nav-sub-liquid ${cloneSubView === 'cloneChat' ? 'nav-sub-liquid-right' : ''}`} />
                <button
                  type="button"
                  className={view === 'cloneUpload' ? 'nav-pill nav-sub-pill nav-pill-active' : 'nav-pill nav-sub-pill'}
                  onClick={() => setView('cloneUpload')}
                  onMouseEnter={() => setHoveredCloneSubView('cloneUpload')}
                >
                  {COPY.upload}
                </button>
                <button
                  type="button"
                  className={view === 'cloneChat' ? 'nav-pill nav-sub-pill nav-pill-active' : 'nav-pill nav-sub-pill'}
                  onClick={() => setView('cloneChat')}
                  onMouseEnter={() => setHoveredCloneSubView('cloneChat')}
                >
                  {COPY.chat}
                </button>
              </div>
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
            history={cloneHistory}
            uploadProgress={uploadProgress}
            onClearFiles={handleClearFiles}
            onClearHistory={handleClearCloneHistory}
            onDistill={handleDistillClone}
            onFilesSelected={handleFilesSelected}
            onSend={handleCloneSend}
            onSelectHistory={handleSelectCloneHistory}
          />
        ) : (
          <ResultPage report={report} onReset={handleReset} />
        )}
      </main>

      <div
        className="more-root fixed bottom-5 left-5 z-30"
        onMouseEnter={() => setIsMoreOpen(true)}
        onMouseLeave={() => setIsMoreOpen(false)}
      >
        <button
          type="button"
          className="more-trigger"
          aria-expanded={isMoreOpen}
          onFocus={() => setIsMoreOpen(true)}
        >
          <MoreHorizontal size={17} strokeWidth={1.8} />
          {COPY.more}
        </button>
        {isMoreOpen ? (
          <div className="more-menu">
            <button
              type="button"
              className="more-menu-item"
              onClick={() => {
                setOpenMorePanel('contact')
                setIsMoreOpen(false)
              }}
            >
              <MessageCircle size={16} strokeWidth={1.8} />
              {COPY.contactAuthor}
            </button>
            <button
              type="button"
              className="more-menu-item"
              onClick={() => {
                setOpenMorePanel('reward')
                setIsMoreOpen(false)
              }}
            >
              <Gift size={16} strokeWidth={1.8} />
              {COPY.reward}
            </button>
          </div>
        ) : null}
      </div>

      {openMorePanel ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-white/[0.34] px-4 backdrop-blur-xl dark:bg-black/[0.28]">
          <div className="glass apple-panel w-full max-w-md p-6 sm:p-7">
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="text-sm font-medium text-[#007aff] dark:text-[#8fc2ff]">{COPY.more}</p>
                <h2 className="mt-2 text-2xl font-semibold leading-tight">
                  {openMorePanel === 'contact' ? COPY.contactAuthor : COPY.reward}
                </h2>
              </div>
              <button
                type="button"
                className="grid h-9 w-9 flex-none place-items-center rounded-full bg-white/[0.42] text-[rgb(var(--text-secondary))] shadow-soft transition hover:bg-white/[0.62] dark:bg-white/[0.08]"
                aria-label={COPY.close}
                onClick={() => setOpenMorePanel(null)}
              >
                <X size={18} strokeWidth={1.8} />
              </button>
            </div>

            {openMorePanel === 'contact' ? (
              <div className="mt-6 grid gap-3">
                <a className="contact-link" href="tencent://message/?uin=2788637607&Site=&Menu=yes">
                  <BrandIcon type="qq" />
                  {COPY.qq}: 2788637607
                </a>
                <a className="contact-link" href="weixin://">
                  <BrandIcon type="wechat" />
                  {COPY.wechat}: xupy666
                </a>
                <a className="contact-link" href="https://github.com/xupy6" target="_blank" rel="noreferrer">
                  <BrandIcon type="github" />
                  {COPY.github}: xupy6
                </a>
              </div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-[28px] border border-white/60 bg-white/[0.42] p-3 shadow-soft dark:border-white/10 dark:bg-white/[0.08]">
                <img className="mx-auto max-h-[62vh] w-full rounded-[22px] object-contain" src="/picture/reward.png" alt={COPY.reward} />
              </div>
            )}
          </div>
        </div>
      ) : null}
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

function BrandIcon({ type }: { type: 'qq' | 'wechat' | 'github' }) {
  return (
    <span className={`brand-icon brand-icon-${type}`} aria-hidden="true">
      {type === 'qq' ? <QQIcon /> : type === 'wechat' ? <WeChatIcon /> : <GitHubIcon />}
    </span>
  )
}

function QQIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" focusable="false">
      <ellipse cx="12" cy="9.2" rx="5.1" ry="6.1" fill="currentColor" />
      <ellipse cx="12" cy="15.2" rx="6.1" ry="5.2" fill="currentColor" />
      <ellipse cx="12" cy="15.4" rx="3.1" ry="3.5" fill="white" opacity="0.92" />
      <circle cx="10.1" cy="8.2" r="0.7" fill="white" />
      <circle cx="13.9" cy="8.2" r="0.7" fill="white" />
      <path d="M10.4 10.3h3.2l-1.6 1.2z" fill="white" opacity="0.9" />
      <path d="M6.5 14.2 3.9 18.5l3.9-.7M17.5 14.2l2.6 4.3-3.9-.7" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </svg>
  )
}

function WeChatIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" focusable="false">
      <path d="M4.2 10.5c0-3.2 3.2-5.8 7.1-5.8s7.1 2.6 7.1 5.8-3.2 5.8-7.1 5.8a8.4 8.4 0 0 1-2.1-.3l-3.1 1.5.8-2.4a5.6 5.6 0 0 1-2.7-4.6Z" fill="currentColor" />
      <path d="M11.4 13.4c0-2.6 2.5-4.7 5.5-4.7s5.5 2.1 5.5 4.7a4.6 4.6 0 0 1-2.1 3.7l.6 2-2.5-1.1a6.6 6.6 0 0 1-1.5.2c-3 0-5.5-2.1-5.5-4.8Z" fill="white" stroke="currentColor" strokeLinejoin="round" strokeWidth="1.4" />
      <circle cx="8.8" cy="9.7" r="0.7" fill="white" />
      <circle cx="13.5" cy="9.7" r="0.7" fill="white" />
      <circle cx="15.2" cy="12.8" r="0.55" fill="currentColor" />
      <circle cx="18.5" cy="12.8" r="0.55" fill="currentColor" />
    </svg>
  )
}

function GitHubIcon() {
  return (
    <svg viewBox="0 0 24 24" role="img" focusable="false">
      <path
        d="M12 3.7c-4.6 0-8.3 3.7-8.3 8.3 0 3.7 2.4 6.8 5.8 7.9.4.1.6-.2.6-.4v-1.6c-2.4.5-2.9-1-2.9-1-.4-.9-.9-1.2-.9-1.2-.8-.5.1-.5.1-.5.8.1 1.3.9 1.3.9.7 1.3 2 1 2.4.8.1-.5.3-.9.5-1.1-1.9-.2-3.9-1-3.9-4.1 0-.9.3-1.7.9-2.3-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.4.9.7-.2 1.4-.3 2.1-.3s1.4.1 2.1.3c1.6-1.1 2.4-.9 2.4-.9.5 1.2.2 2.1.1 2.3.5.6.8 1.4.8 2.3 0 3.2-2 3.9-3.9 4.1.3.3.6.8.6 1.6v2.1c0 .2.2.5.6.4 3.3-1.1 5.7-4.2 5.7-7.9 0-4.6-3.7-8.3-8.3-8.3Z"
        fill="currentColor"
      />
    </svg>
  )
}

export default App
