import { createAPIClient } from '@repo/sdk'
import { getAuthToken } from './storage'

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
