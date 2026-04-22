import { createAPIClient } from '@repo/sdk'
import { getAuthToken } from './storage'

let unauthorizedHandler: (() => Promise<void> | void) | null = null

export function setUnauthorizedHandler(handler: () => Promise<void> | void) {
  unauthorizedHandler = handler
}

export const api = createAPIClient({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL!,
  defaultHeaders: {
    Accept: 'application/json, text/plain, */*',
  },
  getToken: async () => (await getAuthToken()) ?? undefined,
  onUnauthorized: async () => {
    if (unauthorizedHandler) await unauthorizedHandler()
  },
})
