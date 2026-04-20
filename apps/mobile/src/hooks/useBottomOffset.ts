import { useEffect, useMemo } from 'react'
import { usePathname } from 'expo-router'
import { AUTHENTICATED_CONTENT_BREATHING_ROOM, useBottomOffsetContext } from '../lib/bottom-offset'
import { normalizeRoutePath } from '../lib/route-manifest'

type RegisterBottomOffsetResult = {
  baseOffset: number
  extraOffset: number
  totalOffset: number
}

type BottomOffsetContextValue = NonNullable<ReturnType<typeof useBottomOffsetContext>>

function normalizeOffset(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

function getRouteExtraOffset(context: BottomOffsetContextValue, routeKey: string): number {
  const manualOffset = context.getRouteManualExtraOffset(routeKey)
  const accessoryOffset = context.getRouteAccessoryExtraOffset(routeKey)
  return manualOffset + accessoryOffset
}

function getRouteTotalOffset(context: BottomOffsetContextValue, routeKey: string): number {
  const extraOffset = getRouteExtraOffset(context, routeKey)
  return context.baseOffset + extraOffset + AUTHENTICATED_CONTENT_BREATHING_ROOM
}

export function useRegisterBottomOffset(extraOffset: number = 0): RegisterBottomOffsetResult {
  const context = useBottomOffsetContext()
  const pathname = normalizeRoutePath(usePathname())
  const normalizedExtraOffset = useMemo(() => normalizeOffset(extraOffset), [extraOffset])

  useEffect(() => {
    if (!context) return
    context.setRouteExtraOffset(pathname, normalizedExtraOffset)

    return () => {
      context.clearRouteExtraOffset(pathname)
    }
  }, [context, normalizedExtraOffset, pathname])

  if (!context) {
    return {
      baseOffset: 0,
      extraOffset: normalizedExtraOffset,
      totalOffset: normalizedExtraOffset,
    }
  }

  const routeExtraOffset = getRouteExtraOffset(context, pathname)

  return {
    baseOffset: context.baseOffset,
    extraOffset: routeExtraOffset,
    totalOffset: getRouteTotalOffset(context, pathname),
  }
}

export function useBottomOffset() {
  const context = useBottomOffsetContext()
  const pathname = normalizeRoutePath(usePathname())
  if (!context) return 0
  return getRouteTotalOffset(context, pathname)
}
