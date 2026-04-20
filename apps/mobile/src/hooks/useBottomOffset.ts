import type { ReactNode } from 'react'
import { useEffect, useMemo } from 'react'
import { usePathname } from 'expo-router'
import { useBottomOffsetContext } from '../lib/bottom-offset'

type RegisterBottomOffsetResult = {
  baseOffset: number
  extraOffset: number
  totalOffset: number
}

type RegisterBottomAccessoryOptions = {
  height: number
  gapFromNavbar?: number
  element: ReactNode
}

type BottomAccessoryResult = {
  bottom: number
  element: ReactNode
}

function normalizeOffset(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

export function useRegisterBottomOffset(extraOffset: number = 0): RegisterBottomOffsetResult {
  const context = useBottomOffsetContext()
  const pathname = usePathname()
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

  return {
    baseOffset: context.baseOffset,
    extraOffset: normalizedExtraOffset,
    totalOffset: context.totalOffset,
  }
}

export function useBottomOffset() {
  const context = useBottomOffsetContext()
  return context?.totalOffset ?? 0
}

export function useRegisterBottomAccessory({
  height,
  gapFromNavbar = 0,
  element,
}: RegisterBottomAccessoryOptions): RegisterBottomOffsetResult {
  const context = useBottomOffsetContext()
  const pathname = usePathname()
  const normalizedHeight = useMemo(() => normalizeOffset(height), [height])
  const normalizedGapFromNavbar = useMemo(() => normalizeOffset(gapFromNavbar), [gapFromNavbar])
  const registeredOffset = normalizedHeight + normalizedGapFromNavbar

  useEffect(() => {
    if (!context) return

    return () => {
      context.clearRouteBottomAccessory(pathname)
      context.clearRouteExtraOffset(pathname)
    }
  }, [context, pathname])

  useEffect(() => {
    if (!context) return
    context.setRouteExtraOffset(pathname, registeredOffset)
  }, [context, pathname, registeredOffset])

  useEffect(() => {
    if (!context) return
    context.setRouteBottomAccessory(pathname, {
      element,
      gapFromNavbar: normalizedGapFromNavbar,
    })
  }, [context, element, normalizedGapFromNavbar, pathname])

  if (!context) {
    return {
      baseOffset: 0,
      extraOffset: registeredOffset,
      totalOffset: registeredOffset,
    }
  }

  return {
    baseOffset: context.baseOffset,
    extraOffset: registeredOffset,
    totalOffset: context.totalOffset,
  }
}

export function useBottomAccessory(): BottomAccessoryResult | null {
  const context = useBottomOffsetContext()
  const pathname = usePathname()

  return useMemo(() => {
    if (!context) return null

    const accessory = context.getRouteBottomAccessory(pathname)
    if (!accessory) return null

    return {
      bottom: context.baseOffset + accessory.gapFromNavbar,
      element: accessory.element,
    }
  }, [context, pathname])
}
