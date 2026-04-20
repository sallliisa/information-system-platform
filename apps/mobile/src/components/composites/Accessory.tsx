import type { ReactNode } from 'react'
import { useEffect, useMemo, useRef } from 'react'
import { usePathname } from 'expo-router'
import { useBottomOffsetContext } from '../../lib/bottom-offset'
import { normalizeRoutePath } from '../../lib/route-manifest'

type AccessoryProps = {
  children: ReactNode
  height?: number
}

let accessoryIdSequence = 0
let accessoryMountOrderSequence = 0

function normalizeOffset(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0
  return value
}

function hasRenderableChildren(children: ReactNode): boolean {
  return children !== null && children !== false && children !== undefined
}

export function Accessory({ children, height }: AccessoryProps) {
  const context = useBottomOffsetContext()
  const routeKey = normalizeRoutePath(usePathname())
  const accessoryIdRef = useRef<string | null>(null)
  const accessoryOrderRef = useRef<number | null>(null)
  const hasChildren = useMemo(() => hasRenderableChildren(children), [children])
  const explicitHeight = useMemo(() => {
    if (height === undefined) return undefined
    return normalizeOffset(height)
  }, [height])

  if (!accessoryIdRef.current) {
    accessoryIdSequence += 1
    accessoryIdRef.current = `accessory-${accessoryIdSequence}`
  }

  if (accessoryOrderRef.current === null) {
    accessoryMountOrderSequence += 1
    accessoryOrderRef.current = accessoryMountOrderSequence
  }

  useEffect(() => {
    if (!context || !hasChildren) return

    const accessoryId = accessoryIdRef.current as string
    const accessoryOrder = accessoryOrderRef.current as number

    context.upsertRouteAccessory(routeKey, accessoryId, {
      element: children,
      explicitHeight,
      order: accessoryOrder,
    })

    return () => {
      context.unregisterRouteAccessory(routeKey, accessoryId)
    }
  }, [children, context, explicitHeight, hasChildren, routeKey])

  return null
}
