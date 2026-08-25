import axios, { AxiosError, type AxiosProgressEvent } from 'axios'

import type { ApiResponse, ChatMessage, FinalReport, UploadResponse } from './types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000',
  timeout: 180_000,
})

export async function uploadChatFile(file: File, onProgress?: (progress: number) => void) {
  const form = new FormData()
  form.append('file', file)

  const response = await api.post<ApiResponse<UploadResponse>>('/api/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (event: AxiosProgressEvent) => {
      if (!event.total) {
        return
      }
      onProgress?.(Math.round((event.loaded / event.total) * 100))
    },
  })

  return unwrap(response.data)
}

export async function analyzeChat(chatMessages: ChatMessage[]) {
  const response = await api.post<ApiResponse<FinalReport>>('/api/analyze', {
    chat_messages: chatMessages,
  })

  return unwrap(response.data)
}

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    return getAxiosErrorMessage(error)
  }

  return error instanceof Error ? error.message : 'Request failed.'
}

function unwrap<T>(payload: ApiResponse<T>) {
  if ('data' in payload) {
    return payload.data
  }

  throw new Error(payload.message)
}

function getAxiosErrorMessage(error: AxiosError<ApiResponse<unknown>>) {
  const payload = error.response?.data
  if (payload && 'message' in payload) {
    return payload.message
  }

  if (error.code === 'ECONNABORTED') {
    return 'Request timed out.'
  }

  return error.message
}
