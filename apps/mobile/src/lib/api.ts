import { createAPIClient } from '@repo/sdk'
import { resolveAPIBaseURL } from './config'
import { getAuthToken } from './storage'

let unauthorizedHandler: (() => Promise<void> | void) | null = null

export function setUnauthorizedHandler(handler: () => Promise<void> | void) {
  unauthorizedHandler = handler
}

export const api = createAPIClient({
  baseURL: resolveAPIBaseURL(),
  defaultHeaders: {
    Accept: 'application/json, text/plain, */*',
  },
  getToken: getAuthToken,
  onUnauthorized: async () => {
    if (unauthorizedHandler) await unauthorizedHandler()
  },
})
