import type { AnalysisHistoryItem, CloneHistoryItem } from './types'

const HISTORY_KEY = 'relation-slice:analysis-history'
const CLONE_HISTORY_KEY = 'relation-slice:clone-history'

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

export function loadCloneHistory(): CloneHistoryItem[] {
  try {
    const raw = window.localStorage.getItem(CLONE_HISTORY_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCloneHistory(history: CloneHistoryItem[]) {
  window.localStorage.setItem(CLONE_HISTORY_KEY, JSON.stringify(history.slice(0, 20)))
}
