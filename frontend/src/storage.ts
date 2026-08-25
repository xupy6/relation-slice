import type { AnalysisHistoryItem } from './types'

const HISTORY_KEY = 'relation-slice:analysis-history'

export function loadHistory(): AnalysisHistoryItem[] {
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveHistory(history: AnalysisHistoryItem[]) {
  window.localStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(0, 20)))
}
