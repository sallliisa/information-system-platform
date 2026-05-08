import { createAPIClient } from '@repo/sdk'
import { getAuthToken } from './storage'
import type { ImageUploadResult } from '../components/inputs'

let unauthorizedHandler: (() => Promise<void> | void) | null = null

function ensureTrailingSlash(url: string) {
  return url.endsWith('/') ? url : `${url}/`
}

function resolveAPIBaseURL() {
  const apiBaseURL = process.env.EXPO_PUBLIC_API_BASE_URL

  if (!apiBaseURL) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL is required.')
  }

  return ensureTrailingSlash(apiBaseURL)
}

export function setUnauthorizedHandler(handler: () => Promise<void> | void) {
  unauthorizedHandler = handler
}

export const api = createAPIClient({
  baseURL: resolveAPIBaseURL(),
  defaultHeaders: {
    Accept: 'application/json, text/plain, */*',
  },
  getToken: async () => (await getAuthToken()) ?? undefined,
  onUnauthorized: async () => {
    if (unauthorizedHandler) {
      await unauthorizedHandler()
    }
  },
})

export type MobileUploadFile = {
  uri: string
  name: string
  type: string
  size?: number
}

export type UploadProgress = {
  loaded: number
  total: number
}

function inferNameFromURI(uri: string): string {
  const trimmed = uri.split('?')[0] || ''
  const segment = trimmed.split('/').filter(Boolean).pop()
  return segment || `image-${Date.now()}.jpg`
}

function inferTypeFromName(name: string): string {
  const lower = name.toLowerCase()
  if (lower.endsWith('.png')) return 'image/png'
  if (lower.endsWith('.webp')) return 'image/webp'
  if (lower.endsWith('.heic')) return 'image/heic'
  if (lower.endsWith('.heif')) return 'image/heif'
  if (lower.endsWith('.gif')) return 'image/gif'
  return 'image/jpeg'
}

async function uploadBlobWithXHR({
  uploadURL,
  blob,
  contentType,
  onUploadProgress,
}: {
  uploadURL: string
  blob: Blob
  contentType: string
  onUploadProgress?: (progress: UploadProgress) => void
}) {
  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', uploadURL)
    xhr.setRequestHeader('Content-Type', contentType)

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable) return
      onUploadProgress?.({
        loaded: event.loaded,
        total: event.total,
      })
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve()
        return
      }
      reject(new Error(`Upload failed with status ${xhr.status}`))
    }
    xhr.onerror = () => reject(new Error('Upload failed'))
    xhr.onabort = () => reject(new Error('Upload aborted'))
    xhr.send(blob)
  })
}

export async function fileUpload(
  file: MobileUploadFile,
  directory = '',
  onUploadProgress?: (progress: UploadProgress) => void
): Promise<ImageUploadResult> {
  const fallbackName = inferNameFromURI(file.uri)
  const name = file.name || fallbackName
  const type = file.type || inferTypeFromName(name)

  const presign = await api.post('presigned-url', {
    dir: directory,
    filename: name,
    content_type: type,
  }) as { upload_url?: string; file_path?: string }

  if (!presign?.upload_url || !presign?.file_path) {
    throw new Error('Invalid presigned upload response.')
  }

  const blob = await fetch(file.uri).then((res) => res.blob())
  await uploadBlobWithXHR({
    uploadURL: presign.upload_url,
    blob,
    contentType: type,
    onUploadProgress,
  })

  const register = await api.post('register-file', {
    path: presign.file_path,
    size: file.size,
  }) as { url?: string }

  return {
    success: true,
    path: presign.file_path,
    data: presign.file_path,
    url: register?.url,
  }
}
