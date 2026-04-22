import { useEffect, useMemo, useRef, useState } from 'react'
import { usePathname, useRootNavigationState } from 'expo-router'
import { Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

type NavigationStateLike = {
  index?: number
  routes?: Array<{
    name?: string
    key?: string
    state?: NavigationStateLike
  }>
}

type NavigatorSnapshot = {
  level: number
  index: number
  length: number
  keys: string[]
  names: string[]
}

function readRouteNames(state: NavigationStateLike | undefined): string[] {
  if (!state?.routes?.length) return []
  return state.routes.map((route, index) => {
    const isActive = index === (state.index ?? 0)
    return `${isActive ? '>' : ' '} ${route.name || '(unknown)'}`
  })
}

function readActiveChain(state: NavigationStateLike | undefined): string[] {
  const chain: string[] = []
  let current: NavigationStateLike | undefined = state

  while (current?.routes?.length) {
    const activeIndex = current.index ?? 0
    const route = current.routes[activeIndex]
    if (!route) break
    chain.push(route.name || '(unknown)')
    current = route.state
  }

  return chain
}

function readNavigatorSnapshots(state: NavigationStateLike | undefined): NavigatorSnapshot[] {
  const snapshots: NavigatorSnapshot[] = []
  let current: NavigationStateLike | undefined = state
  let level = 0

  while (current?.routes?.length) {
    const routes = current.routes || []
    snapshots.push({
      level,
      index: current.index ?? 0,
      length: routes.length,
      keys: routes.map((route) => route.key || route.name || '(unknown)'),
      names: routes.map((route) => route.name || '(unknown)'),
    })

    const activeIndex = current.index ?? 0
    current = routes[activeIndex]?.state
    level += 1
  }

  return snapshots
}

function readRootSnapshot(state: NavigationStateLike | undefined) {
  const routes = state?.routes || []
  return {
    index: state?.index ?? 0,
    length: routes.length,
    keys: routes.map((route) => route.key || route.name || '(unknown)'),
    names: routes.map((route) => route.name || '(unknown)'),
  }
}

function classifyTransition(
  previous: NavigatorSnapshot[] | null,
  current: NavigatorSnapshot[]
): string {
  if (!previous) return 'initial'

  const maxDepth = Math.max(previous.length, current.length)
  for (let offset = 1; offset <= maxDepth; offset += 1) {
    const previousSnapshot = previous[previous.length - offset]
    const currentSnapshot = current[current.length - offset]

    if (!previousSnapshot && currentSnapshot) return `push@L${currentSnapshot.level}`
    if (previousSnapshot && !currentSnapshot) return `pop@L${previousSnapshot.level}`
    if (!previousSnapshot || !currentSnapshot) continue

    if (currentSnapshot.length > previousSnapshot.length) return `push@L${currentSnapshot.level}`
    if (currentSnapshot.length < previousSnapshot.length) return `pop@L${currentSnapshot.level}`

    if (currentSnapshot.index !== previousSnapshot.index) {
      return `index-change@L${currentSnapshot.level}`
    }

    const changed = currentSnapshot.keys.some((key, index) => key !== previousSnapshot.keys[index])
    if (changed) return `replace@L${currentSnapshot.level}`
  }

  return 'no-change'
}

function formatNavigatorSnapshot(snapshot: NavigatorSnapshot): string {
  return `L${snapshot.level} idx ${snapshot.index} / len ${snapshot.length} :: ${snapshot.names.join(' | ')}`
}

export function RouteStackDebugOverlay() {
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const state = useRootNavigationState() as NavigationStateLike | undefined
  const previousSnapshotsRef = useRef<NavigatorSnapshot[] | null>(null)
  const [transitionType, setTransitionType] = useState('initial')

  const rootRoutes = useMemo(() => readRouteNames(state), [state])
  const activeChain = useMemo(() => readActiveChain(state), [state])
  const rootSnapshot = useMemo(() => readRootSnapshot(state), [state])
  const navigatorSnapshots = useMemo(() => readNavigatorSnapshots(state), [state])

  useEffect(() => {
    const nextTransitionType = classifyTransition(previousSnapshotsRef.current, navigatorSnapshots)
    setTransitionType(nextTransitionType)
    previousSnapshotsRef.current = navigatorSnapshots
  }, [navigatorSnapshots])

  if (!__DEV__) return null

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        paddingTop: insets.top,
        paddingHorizontal: 8,
        paddingBottom: 6,
        backgroundColor: 'rgba(0,0,0,0.78)',
      }}
    >
      <Text style={{ color: '#7CFFB2', fontSize: 11, fontWeight: '700' }}>ROUTE STACK DEBUG</Text>
      <Text style={{ color: '#FFFFFF', fontSize: 10 }}>path: {pathname || '/'}</Text>
      <Text style={{ color: '#FF9F9F', fontSize: 10 }}>
        nav: {transitionType} | idx {rootSnapshot.index} / len {rootSnapshot.length}
      </Text>
      <Text style={{ color: '#C6D4FF', fontSize: 10 }}>root: {rootRoutes.join(' | ') || '(empty)'}</Text>
      <Text style={{ color: '#FFD68A', fontSize: 10 }}>active: {activeChain.join(' -> ') || '(empty)'}</Text>
      {navigatorSnapshots.map((snapshot) => (
        <Text key={snapshot.level} style={{ color: '#9FEAF9', fontSize: 10 }}>
          {formatNavigatorSnapshot(snapshot)}
        </Text>
      ))}
    </View>
  )
}
