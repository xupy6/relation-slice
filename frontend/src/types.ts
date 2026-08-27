export type ChatMessage = {
  sender: string
  content: string
  timestamp: string
  msg_type: string
}

export type ApiSuccess<T> = {
  code: 0
  data: T
}

export type ApiFailure = {
  code: number
  message: string
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure

export type UploadResponse = {
  chat_messages: ChatMessage[]
}

export type LanguagePersonReport = {
  name?: string
  extroversion?: number
  rationality?: number
  emotionality?: number
  playfulness?: number
  mbti?: string
}

export type LanguageReport = {
  person_a?: LanguagePersonReport
  person_b?: LanguagePersonReport
  keywords_style?: string[]
}

export type EmotionCurvePoint = {
  timestamp: string
  score: number
}

export type EmotionReport = {
  positive_ratio?: number
  negative_ratio?: number
  neutral_ratio?: number
  emotion_curve?: EmotionCurvePoint[]
}

export type InteractionReport = {
  dependence_score?: {
    person_a?: number
    person_b?: number
  }
  tacit_score?: number
  initiation_ratio?: {
    person_a?: number
    person_b?: number
  }
  avg_reply_delay?: {
    person_a?: number
    person_b?: number
  }
}

export type RelationReport = {
  relationship_type?: string
  suggestions?: string[]
  confidence?: number
}

export type AllReports = {
  language_report?: LanguageReport
  emotion_report?: EmotionReport
  interaction_report?: InteractionReport
  relation_report?: RelationReport
}

export type FinalReport = {
  intimacy_score?: number
  summary_text?: string
  fun_tags?: string[]
  all_reports?: AllReports
  chat_heatmap?: HeatmapCell[]
  chat_hourly_heatmap?: HeatmapCell[]
}

export type WorkStatus = 'idle' | 'uploading' | 'analyzing' | 'error'

export type CloneStatus = 'idle' | 'uploading' | 'distilling' | 'chatting' | 'error'

export type CloneProfile = {
  clone_name?: string
  target_sender?: string
  persona_summary?: string
  role_card?: Record<string, unknown>
  speaking_style?: string[]
  signature_phrases?: string[]
  emotional_tone?: string
  reply_rules?: string[]
  memory_snippets?: CloneMemorySnippet[]
}

export type CloneMemorySnippet = {
  id?: string
  sender?: string
  content?: string
  timestamp?: string
  before?: string
  after?: string
  keywords?: string[]
}

export type HeatmapCell = {
  date: string
  count: number
}

export type CloneMessage = {
  role: 'user' | 'clone'
  content: string
  createdAt?: string
}

export type CloneHistoryItem = {
  id: string
  fileName: string
  messageCount: number
  createdAt: string
  profile: CloneProfile
  messages: CloneMessage[]
}

export type AnalysisHistoryItem = {
  id: string
  fileName: string
  messageCount: number
  createdAt: string
  report: FinalReport
}

export type UserAccount = {
  username: string
  createdAt: string
}

export type VoiceSynthesisResponse = {
  status: 'reserved' | 'ready'
  provider: string
  audio_url?: string | null
  message: string
}
