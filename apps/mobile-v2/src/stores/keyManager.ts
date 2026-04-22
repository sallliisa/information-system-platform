import { Fragment, createElement, type ReactNode, useSyncExternalStore } from 'react'

const keyVersions = new Map<string, number>()
const keyListeners = new Map<string, Set<() => void>>()

function notifyKeyListeners(keyId: string) {
  const listeners = keyListeners.get(keyId)
  if (!listeners) return
  for (const listener of listeners) {
    listener()
  }
}

function subscribeKey(keyId: string, listener: () => void) {
  let listeners = keyListeners.get(keyId)
  if (!listeners) {
    listeners = new Set()
    keyListeners.set(keyId, listeners)
  }

  listeners.add(listener)

  return () => {
    const current = keyListeners.get(keyId)
    if (!current) return
    current.delete(listener)
    if (current.size === 0) {
      keyListeners.delete(keyId)
    }
  }
}

function useRefreshKeyValue(keyId: string) {
  return useSyncExternalStore(
    (listener) => subscribeKey(keyId, listener),
    () => getRefreshKey(keyId),
    () => getRefreshKey(keyId)
  )
}

export function getRefreshKey(keyId: string) {
  return keyVersions.get(keyId) ?? 0
}

export function refreshKey(keyId: string) {
  const next = getRefreshKey(keyId) + 1
  keyVersions.set(keyId, next)
  notifyKeyListeners(keyId)
  return next
}

export function removeRefreshKey(keyId: string) {
  const hadValue = keyVersions.delete(keyId)
  if (hadValue || keyListeners.has(keyId)) {
    notifyKeyListeners(keyId)
  }
}

export function removeAllRefreshKeys() {
  if (keyVersions.size === 0) return

  keyVersions.clear()
  for (const listeners of keyListeners.values()) {
    for (const listener of listeners) {
      listener()
    }
  }
}

type RefreshBoundaryProps = {
  keyId: string
  children: ReactNode
}

export function RefreshBoundary({ keyId, children }: RefreshBoundaryProps) {
  const version = useRefreshKeyValue(keyId)
  return createElement(Fragment, { key: String(version) }, children)
}
