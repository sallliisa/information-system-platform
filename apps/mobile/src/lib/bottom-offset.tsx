import type { ReactNode } from 'react'
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export const AUTHENTICATED_NAVBAR_HEIGHT = 72
export const AUTHENTICATED_NAVBAR_BOTTOM_PADDING = 8
export const AUTHENTICATED_CONTENT_BREATHING_ROOM = 12
export const DEFAULT_ACCESSORY_STACK_GAP = 10

type RouteExtraOffsets = Record<string, number>
type RouteAccessories = Record<string, Record<string, AccessoryRegistryItem>>

type AccessoryRegistryItem = {
  element: ReactNode
  explicitHeight?: number
  measuredHeight: number
  order: number
}

type UpsertAccessoryPayload = {
  element: ReactNode
  explicitHeight?: number
  order: number
}

export type RegisteredRouteAccessory = {
  accessoryId: string
  element: ReactNode
  explicitHeight?: number
  measuredHeight: number
  resolvedHeight: number
  order: number
}

type BottomOffsetContextValue = {
  baseOffset: number
  stackGap: number
  setRouteExtraOffset: (routeKey: string, offset: number) => void
  clearRouteExtraOffset: (routeKey: string) => void
  upsertRouteAccessory: (routeKey: string, accessoryId: string, payload: UpsertAccessoryPayload) => void
  unregisterRouteAccessory: (routeKey: string, accessoryId: string) => void
  updateRouteAccessoryMeasuredHeight: (routeKey: string, accessoryId: string, measuredHeight: number) => void
  getRouteAccessories: (routeKey: string) => RegisteredRouteAccessory[]
  getRouteAccessoryExtraOffset: (routeKey: string) => number
  getRouteManualExtraOffset: (routeKey: string) => number
}

const BottomOffsetContext = createContext<BottomOffsetContextValue | null>(null)

function normalizeOffset(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

export function AccessoryProvider({
  children,
  stackGap = DEFAULT_ACCESSORY_STACK_GAP,
}: {
  children: ReactNode
  stackGap?: number
}) {
  const insets = useSafeAreaInsets()
  const normalizedStackGap = normalizeOffset(stackGap)
  const [routeExtraOffsets, setRouteExtraOffsets] = useState<RouteExtraOffsets>({})
  const [routeAccessories, setRouteAccessories] = useState<RouteAccessories>({})

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

  const upsertRouteAccessory = useCallback((routeKey: string, accessoryId: string, payload: UpsertAccessoryPayload) => {
    const normalizedExplicitHeight =
      payload.explicitHeight === undefined ? undefined : normalizeOffset(payload.explicitHeight)

    setRouteAccessories((current) => {
      const currentRouteAccessories = current[routeKey] ?? {}
      const existingAccessory = currentRouteAccessories[accessoryId]
      const nextAccessory: AccessoryRegistryItem = {
        element: payload.element,
        explicitHeight: normalizedExplicitHeight,
        measuredHeight: existingAccessory?.measuredHeight ?? 0,
        order: existingAccessory?.order ?? payload.order,
      }

      if (
        existingAccessory &&
        existingAccessory.element === nextAccessory.element &&
        existingAccessory.explicitHeight === nextAccessory.explicitHeight &&
        existingAccessory.measuredHeight === nextAccessory.measuredHeight &&
        existingAccessory.order === nextAccessory.order
      ) {
        return current
      }

      return {
        ...current,
        [routeKey]: {
          ...currentRouteAccessories,
          [accessoryId]: nextAccessory,
        },
      }
    })
  }, [])

  const unregisterRouteAccessory = useCallback((routeKey: string, accessoryId: string) => {
    setRouteAccessories((current) => {
      const currentRouteAccessories = current[routeKey]
      if (!currentRouteAccessories || !(accessoryId in currentRouteAccessories)) return current

      const nextRouteAccessories = { ...currentRouteAccessories }
      delete nextRouteAccessories[accessoryId]

      const next = { ...current }
      if (Object.keys(nextRouteAccessories).length > 0) {
        next[routeKey] = nextRouteAccessories
      } else {
        delete next[routeKey]
      }
      return next
    })
  }, [])

  const updateRouteAccessoryMeasuredHeight = useCallback((routeKey: string, accessoryId: string, measuredHeight: number) => {
    const normalizedMeasuredHeight = normalizeOffset(measuredHeight)

    setRouteAccessories((current) => {
      const currentRouteAccessories = current[routeKey]
      if (!currentRouteAccessories) return current

      const existingAccessory = currentRouteAccessories[accessoryId]
      if (!existingAccessory || existingAccessory.measuredHeight === normalizedMeasuredHeight) return current

      return {
        ...current,
        [routeKey]: {
          ...currentRouteAccessories,
          [accessoryId]: {
            ...existingAccessory,
            measuredHeight: normalizedMeasuredHeight,
          },
        },
      }
    })
  }, [])

  const getRouteAccessories = useCallback(
    (routeKey: string) => {
      const currentRouteAccessories = routeAccessories[routeKey]
      if (!currentRouteAccessories) return []

      return Object.entries(currentRouteAccessories)
        .map(([accessoryId, accessory]) => ({
          accessoryId,
          element: accessory.element,
          explicitHeight: accessory.explicitHeight,
          measuredHeight: accessory.measuredHeight,
          resolvedHeight: accessory.explicitHeight ?? accessory.measuredHeight,
          order: accessory.order,
        }))
        .sort((left, right) => left.order - right.order)
    },
    [routeAccessories]
  )

  const getRouteAccessoryExtraOffset = useCallback(
    (routeKey: string) => {
      const accessories = getRouteAccessories(routeKey)
      if (accessories.length === 0) return 0
      return accessories.reduce((sum, accessory) => sum + accessory.resolvedHeight + normalizedStackGap, 0)
    },
    [getRouteAccessories, normalizedStackGap]
  )

  const getRouteManualExtraOffset = useCallback(
    (routeKey: string) => routeExtraOffsets[routeKey] ?? 0,
    [routeExtraOffsets]
  )

  const value = useMemo(
    () => ({
      baseOffset,
      stackGap: normalizedStackGap,
      setRouteExtraOffset,
      clearRouteExtraOffset,
      upsertRouteAccessory,
      unregisterRouteAccessory,
      updateRouteAccessoryMeasuredHeight,
      getRouteAccessories,
      getRouteAccessoryExtraOffset,
      getRouteManualExtraOffset,
    }),
    [
      baseOffset,
      clearRouteExtraOffset,
      getRouteAccessoryExtraOffset,
      getRouteAccessories,
      getRouteManualExtraOffset,
      normalizedStackGap,
      setRouteExtraOffset,
      unregisterRouteAccessory,
      updateRouteAccessoryMeasuredHeight,
      upsertRouteAccessory,
    ]
  )

  return <BottomOffsetContext.Provider value={value}>{children}</BottomOffsetContext.Provider>
}

export function useBottomOffsetContext() {
  return useContext(BottomOffsetContext)
}
