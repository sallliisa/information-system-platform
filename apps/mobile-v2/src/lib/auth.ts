import { router } from 'expo-router'
import { api, setUnauthorizedHandler } from './api'
import { mobileConfig } from './config'
import { DEFAULT_AUTH_ROUTE, LOGIN_ROUTE } from './routes'
import {
  clearAuthToken,
  clearPermissions,
  clearPostLoginRedirect,
  clearProfile,
  consumePostLoginRedirect,
  getAuthToken,
  setAuthToken,
  setPermissions,
  setProfile,
} from './storage'

type LoginInput = {
  username: string
  password: string
}

type LoginResponse = {
  user?: Record<string, unknown>
  token?: string
  tasks?: unknown[]
  message?: string
}

export type LoginResult =
  | {
      ok: true
      route: string
      response: LoginResponse
    }
  | {
      ok: false
      reason: 'no-access' | 'invalid'
      message: string
    }

let signOutPromise: Promise<void> | null = null

export function shouldBlockNoAccess({ tasks, mode }: { tasks: unknown[] | undefined; mode: string }) {
  return mode === 'PRODUCTION' && Array.isArray(tasks) && tasks.length === 0
}

export async function isAuthenticated() {
  const token = await getAuthToken()
  return Boolean(token)
}

export async function signOut(options?: { reason?: 'manual' | 'unauthorized' }) {
  if (signOutPromise) return signOutPromise

  const reason = options?.reason ?? 'manual'

  signOutPromise = (async () => {
    await Promise.all([clearAuthToken(), clearProfile(), clearPermissions()])
    if (reason === 'manual') {
      await clearPostLoginRedirect()
    }

    try {
      router.replace(LOGIN_ROUTE as any)
    } catch {}
  })().finally(() => {
    signOutPromise = null
  })

  return signOutPromise
}

export async function login(payload: LoginInput): Promise<LoginResult> {
  const response = (await api.post('login', payload)) as LoginResponse
  const token = response?.token
  const tasks = response?.tasks ?? []

  if (!token) {
    return {
      ok: false,
      reason: 'invalid',
      message: response?.message || 'Login failed. Token not found.',
    }
  }

  if (shouldBlockNoAccess({ tasks, mode: mobileConfig.mode })) {
    return {
      ok: false,
      reason: 'no-access',
      message: 'You do not have access to this application.',
    }
  }

  await Promise.all([setAuthToken(token), setProfile(response?.user || {}), setPermissions(tasks)])

  const postLoginRoute = (await consumePostLoginRedirect()) || DEFAULT_AUTH_ROUTE
  return {
    ok: true,
    route: postLoginRoute,
    response,
  }
}

setUnauthorizedHandler(async () => {
  await signOut({ reason: 'unauthorized' })
})
