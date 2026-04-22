import { router } from 'expo-router'
import { api, setUnauthorizedHandler } from './api'
import { mobileConfig } from './config'
import { SYSTEM_LOGIN_ROUTE_ID, getRouteHref } from './route-manifest'
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
import { getDefaultPrivateRouteHref } from '../features/routes/catalog.index'

type LoginInput = {
  username: string
  password: string
}

type LoginResponse = {
  user?: Record<string, any>
  token?: string
  tasks?: any[]
  message?: string
}

type LoginResult =
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
const LOGIN_ROUTE = getRouteHref(SYSTEM_LOGIN_ROUTE_ID)
const DEFAULT_AUTH_FALLBACK_ROUTE = '/menu'

export function shouldBlockNoAccess({ tasks, mode }: { tasks: any[] | undefined; mode: string }) {
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
      message: response?.message || 'Login gagal. Token tidak ditemukan.',
    }
  }

  if (shouldBlockNoAccess({ tasks, mode: mobileConfig.mode })) {
    return {
      ok: false,
      reason: 'no-access',
      message: 'Anda tidak memiliki akses ke aplikasi ini',
    }
  }

  await Promise.all([setAuthToken(token), setProfile(response?.user || {}), setPermissions(tasks)])
  const postLoginRoute = (await consumePostLoginRedirect()) || getDefaultPrivateRouteHref(tasks, DEFAULT_AUTH_FALLBACK_ROUTE)

  return {
    ok: true,
    route: postLoginRoute,
    response,
  }
}

setUnauthorizedHandler(async () => {
  await signOut({ reason: 'unauthorized' })
})
