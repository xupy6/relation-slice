import type { AnalysisHistoryItem, CloneHistoryItem, UserAccount } from './types'

const LEGACY_HISTORY_KEY = 'relation-slice:analysis-history'
const LEGACY_CLONE_HISTORY_KEY = 'relation-slice:clone-history'
const USERS_KEY = 'relation-slice:users'
const CURRENT_USER_KEY = 'relation-slice:current-user'
const DISCLAIMER_KEY = 'relation-slice:disclaimer-accepted'

type StoredUser = UserAccount & {
  password: string
}

export function hasAcceptedDisclaimer() {
  return window.localStorage.getItem(DISCLAIMER_KEY) === 'true'
}

export function acceptDisclaimer() {
  window.localStorage.setItem(DISCLAIMER_KEY, 'true')
}

export function loadCurrentUser(): UserAccount | null {
  const username = window.localStorage.getItem(CURRENT_USER_KEY)
  if (!username) {
    return null
  }

  return findUser(username)
}

export function registerUser(username: string, password: string): UserAccount {
  const normalizedUsername = normalizeUsername(username)
  validateCredentials(normalizedUsername, password)

  const users = loadUsers()
  if (users.some((user) => user.username === normalizedUsername)) {
    throw new Error('用户名已存在。')
  }

  const account: StoredUser = {
    username: normalizedUsername,
    password,
    createdAt: new Date().toISOString(),
  }
  saveUsers([...users, account])
  window.localStorage.setItem(CURRENT_USER_KEY, account.username)
  return stripPassword(account)
}

export function loginUser(username: string, password: string): UserAccount {
  const normalizedUsername = normalizeUsername(username)
  validateCredentials(normalizedUsername, password)

  const user = loadUsers().find((item) => item.username === normalizedUsername)
  if (!user || user.password !== password) {
    throw new Error('用户名或密码不正确。')
  }

  window.localStorage.setItem(CURRENT_USER_KEY, user.username)
  return stripPassword(user)
}

export function logoutUser() {
  window.localStorage.removeItem(CURRENT_USER_KEY)
}

export function loadHistory(username?: string): AnalysisHistoryItem[] {
  return loadList<AnalysisHistoryItem>(historyKey(username), LEGACY_HISTORY_KEY)
}

export function saveHistory(history: AnalysisHistoryItem[], username?: string) {
  window.localStorage.setItem(historyKey(username), JSON.stringify(history.slice(0, 20)))
}

export function loadCloneHistory(username?: string): CloneHistoryItem[] {
  return loadList<CloneHistoryItem>(cloneHistoryKey(username), LEGACY_CLONE_HISTORY_KEY)
}

export function saveCloneHistory(history: CloneHistoryItem[], username?: string) {
  window.localStorage.setItem(cloneHistoryKey(username), JSON.stringify(history.slice(0, 20)))
}

function validateCredentials(username: string, password: string) {
  if (username.length < 3) {
    throw new Error('用户名至少 3 位。')
  }
  if (password.length < 6) {
    throw new Error('密码至少 6 位。')
  }
}

function normalizeUsername(username: string) {
  return username.trim()
}

function findUser(username: string) {
  const user = loadUsers().find((item) => item.username === username)
  return user ? stripPassword(user) : null
}

function stripPassword(user: StoredUser): UserAccount {
  return {
    username: user.username,
    createdAt: user.createdAt,
  }
}

function loadUsers(): StoredUser[] {
  try {
    const raw = window.localStorage.getItem(USERS_KEY)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveUsers(users: StoredUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users))
}

function loadList<T>(key: string, legacyKey: string): T[] {
  try {
    const raw = window.localStorage.getItem(key) ?? window.localStorage.getItem(legacyKey)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function historyKey(username?: string) {
  return `relation-slice:${username || 'guest'}:analysis-history`
}

function cloneHistoryKey(username?: string) {
  return `relation-slice:${username || 'guest'}:clone-history`
}
