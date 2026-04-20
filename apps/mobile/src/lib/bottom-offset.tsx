import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const AUTHENTICATED_NAVBAR_HEIGHT = 72
export const AUTHENTICATED_NAVBAR_BOTTOM_PADDING = 8
export const AUTHENTICATED_CONTENT_BREATHING_ROOM = 12

type RouteExtraOffsets = Record<string, number>
type RouteBottomAccessories = Record<string, RegisteredBottomAccessory>

export type RegisteredBottomAccessory = {
  element: ReactNode
  gapFromNavbar: number
}

type BottomOffsetContextValue = {
  baseOffset: number
  extraOffset: number
  totalOffset: number
  setRouteExtraOffset: (routeKey: string, offset: number) => void
  clearRouteExtraOffset: (routeKey: string) => void
  setRouteBottomAccessory: (routeKey: string, accessory: RegisteredBottomAccessory) => void
  clearRouteBottomAccessory: (routeKey: string) => void
  getRouteBottomAccessory: (routeKey: string) => RegisteredBottomAccessory | null
}

const BottomOffsetContext = createContext<BottomOffsetContextValue | null>(null)

function normalizeOffset(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

export function BottomOffsetProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets()
  const [routeExtraOffsets, setRouteExtraOffsets] = useState<RouteExtraOffsets>({})
  const [routeBottomAccessories, setRouteBottomAccessories] = useState<RouteBottomAccessories>({})

  const baseOffset = AUTHENTICATED_NAVBAR_HEIGHT + AUTHENTICATED_NAVBAR_BOTTOM_PADDING + insets.bottom

  const setRouteExtraOffset = useCallback((routeKey: string, offset: number) => {
    const normalizedOffset = normalizeOffset(offset)
    setRouteExtraOffsets((current) => {
      if (current[routeKey] === normalizedOffset) return current
      return { ...current, [routeKey]: normalizedOffset }
    })
  }, [])

  const clearRouteExtraOffset = useCallback((routeKey: string) => {
    setRouteExtraOffsets((current) => {
      if (!(routeKey in current)) return current
      const next = { ...current }
      delete next[routeKey]
      return next
    })
  }, [])

  const setRouteBottomAccessory = useCallback((routeKey: string, accessory: RegisteredBottomAccessory) => {
    const normalizedAccessory = {
      ...accessory,
      gapFromNavbar: normalizeOffset(accessory.gapFromNavbar),
    }

    setRouteBottomAccessories((current) => {
      const existingAccessory = current[routeKey]
      if (
        existingAccessory?.element === normalizedAccessory.element &&
        existingAccessory.gapFromNavbar === normalizedAccessory.gapFromNavbar
      ) {
        return current
      }

      return { ...current, [routeKey]: normalizedAccessory }
    })
  }, [])

  const clearRouteBottomAccessory = useCallback((routeKey: string) => {
    setRouteBottomAccessories((current) => {
      if (!(routeKey in current)) return current
      const next = { ...current }
      delete next[routeKey]
      return next
    })
  }, [])

  const getRouteBottomAccessory = useCallback(
    (routeKey: string) => routeBottomAccessories[routeKey] ?? null,
    [routeBottomAccessories]
  )

  const extraOffset = useMemo(
    () => Object.values(routeExtraOffsets).reduce((sum, value) => sum + value, 0),
    [routeExtraOffsets]
  )

  const value = useMemo(
    () => ({
      baseOffset,
      extraOffset,
      totalOffset: baseOffset + extraOffset + AUTHENTICATED_CONTENT_BREATHING_ROOM,
      setRouteExtraOffset,
      clearRouteExtraOffset,
      setRouteBottomAccessory,
      clearRouteBottomAccessory,
      getRouteBottomAccessory,
    }),
    [
      baseOffset,
      clearRouteBottomAccessory,
      clearRouteExtraOffset,
      extraOffset,
      getRouteBottomAccessory,
      setRouteBottomAccessory,
      setRouteExtraOffset,
    ]
  )

  return <BottomOffsetContext.Provider value={value}>{children}</BottomOffsetContext.Provider>
}

export function useBottomOffsetContext() {
  return useContext(BottomOffsetContext)
}
