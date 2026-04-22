import { router } from 'expo-router'
import { api, setUnauthorizedHandler } from './api'
import { DEFAULT_AUTH_ROUTE, LOGIN_ROUTE } from './routes'
import { clearAuthToken, getAuthToken, setAuthToken } from './storage'

export type LoginInput = {
  username: string
  password: string
}

type LoginResponse = {
  user?: Record<string, unknown>
  token?: string
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
      message: string
    }

let signOutPromise: Promise<void> | null = null

export async function login(payload: LoginInput): Promise<LoginResult> {
  const response = (await api.post('login', payload)) as LoginResponse
  const token = response?.token

  if (!token) {
    return {
      ok: false,
      message: response?.message || 'Login failed. Token not found.',
    }
  }

  await setAuthToken(token)

  return {
    ok: true,
    route: DEFAULT_AUTH_ROUTE,
    response,
  }
}

export async function isAuthenticated() {
  const token = await getAuthToken()
  return Boolean(token)
}

export async function signOut(_options?: { reason?: 'manual' | 'unauthorized' }) {
  if (signOutPromise) return signOutPromise

  signOutPromise = (async () => {
    await clearAuthToken()

    try {
      router.replace(LOGIN_ROUTE as any)
    } catch {
      // no-op: this can happen if the router is not ready
    }
  })().finally(() => {
    signOutPromise = null
  })

  return signOutPromise
}

setUnauthorizedHandler(async () => {
  await signOut({ reason: 'unauthorized' })
})
