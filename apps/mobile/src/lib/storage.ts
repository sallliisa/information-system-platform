import * as SecureStore from 'expo-secure-store'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Platform } from 'react-native'
import { isLoginRoute } from './routes'

const TOKEN_KEY = 'token'
const PROFILE_KEY = 'profile'
const PERMISSIONS_KEY = 'permissions'
const POST_LOGIN_REDIRECT_KEY = 'aiso_post_login_redirect'

function getWebStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return null
  return window.localStorage
}

async function getStorageItem(key: string) {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(key) ?? null
  }

  try {
    return await AsyncStorage.getItem(key)
  } catch {
    return getWebStorage()?.getItem(key) ?? null
  }
}

async function setStorageItem(key: string, value: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(key, value)
    return
  }

  try {
    await AsyncStorage.setItem(key, value)
  } catch {
    getWebStorage()?.setItem(key, value)
  }
}

async function removeStorageItem(key: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(key)
    return
  }

  try {
    await AsyncStorage.removeItem(key)
  } catch {
    getWebStorage()?.removeItem(key)
  }
}

function normalizeInternalRoute(path: string | null | undefined): string | null {
  const trimmedPath = String(path || '').trim()
  if (!trimmedPath) return null
  if (!trimmedPath.startsWith('/')) return null
  if (trimmedPath.startsWith('//')) return null
  if (isLoginRoute(trimmedPath)) return null
  return trimmedPath
}

export async function getAuthToken() {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(TOKEN_KEY) ?? null
  }

  try {
    return await SecureStore.getItemAsync(TOKEN_KEY)
  } catch {
    return getWebStorage()?.getItem(TOKEN_KEY) ?? null
  }
}

export async function setAuthToken(token: string) {
  if (Platform.OS === 'web') {
    getWebStorage()?.setItem(TOKEN_KEY, token)
    return
  }

  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token)
  } catch {
    getWebStorage()?.setItem(TOKEN_KEY, token)
  }
}

export async function clearAuthToken() {
  if (Platform.OS === 'web') {
    getWebStorage()?.removeItem(TOKEN_KEY)
    return
  }

  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY)
  } catch {
    getWebStorage()?.removeItem(TOKEN_KEY)
  }
}

function parseJSONValue<T>(value: string | null, fallback: T): T {
  if (!value) return fallback
  try {
    return JSON.parse(value) as T
  } catch {
    return fallback
  }
}

export async function getProfile<T = Record<string, any> | null>(): Promise<T> {
  return parseJSONValue<T>(await getStorageItem(PROFILE_KEY), null as T)
}

export async function setProfile(profile: Record<string, any>) {
  await setStorageItem(PROFILE_KEY, JSON.stringify(profile || {}))
}

export async function clearProfile() {
  await removeStorageItem(PROFILE_KEY)
}

export async function getPermissions<T = any[]>(): Promise<T> {
  return parseJSONValue<T>(await getStorageItem(PERMISSIONS_KEY), [] as T)
}

export async function setPermissions(permissions: any[]) {
  await setStorageItem(PERMISSIONS_KEY, JSON.stringify(permissions || []))
}

export async function clearPermissions() {
  await removeStorageItem(PERMISSIONS_KEY)
}

export async function savePostLoginRedirect(path: string) {
  const normalizedPath = normalizeInternalRoute(path)
  if (!normalizedPath) return
  await setStorageItem(POST_LOGIN_REDIRECT_KEY, normalizedPath)
}

export async function consumePostLoginRedirect(): Promise<string | null> {
  const storedPath = await getStorageItem(POST_LOGIN_REDIRECT_KEY)
  if (!storedPath) return null

  await removeStorageItem(POST_LOGIN_REDIRECT_KEY)
  return normalizeInternalRoute(storedPath)
}

export async function clearPostLoginRedirect() {
  await removeStorageItem(POST_LOGIN_REDIRECT_KEY)
}
