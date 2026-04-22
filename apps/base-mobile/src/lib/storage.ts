import AsyncStorage from '@react-native-async-storage/async-storage'
import * as SecureStore from 'expo-secure-store'
import { Platform } from 'react-native'

const TOKEN_KEY = 'token'

function getWebStorage() {
  if (typeof window === 'undefined' || !window.localStorage) return null
  return window.localStorage
}

async function getFallbackStorageItem(key: string) {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(key) ?? null
  }

  try {
    return await AsyncStorage.getItem(key)
  } catch {
    return getWebStorage()?.getItem(key) ?? null
  }
}

async function setFallbackStorageItem(key: string, value: string) {
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

async function removeFallbackStorageItem(key: string) {
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

export async function getAuthToken() {
  if (Platform.OS === 'web') {
    return getWebStorage()?.getItem(TOKEN_KEY) ?? null
  }

  try {
    return await SecureStore.getItemAsync(TOKEN_KEY)
  } catch {
    return getFallbackStorageItem(TOKEN_KEY)
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
    await setFallbackStorageItem(TOKEN_KEY, token)
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
    await removeFallbackStorageItem(TOKEN_KEY)
  }
}
