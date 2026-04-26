import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { View, type ViewStyle } from 'react-native'
import { useIsFocused, useNavigation, useRoute } from '@react-navigation/native'

type HeaderActionEntry = {
  id: symbol
  routeKey: string
  sequence: number
  element: ReactNode
  testID?: string
}

type HeaderActionsContextValue = {
  register: (entry: Omit<HeaderActionEntry, 'sequence'>) => void
  update: (id: symbol, patch: Pick<HeaderActionEntry, 'element' | 'testID'>) => void
  unregister: (id: symbol) => void
  getActiveEntry: (routeKey: string) => HeaderActionEntry | undefined
}

export type HeaderActionProps = {
  children: ReactNode
  enabled?: boolean
  testID?: string
}

const HeaderActionsContext = createContext<HeaderActionsContextValue | null>(null)

export function HeaderActionsProvider({ children }: { children: ReactNode }) {
  const [entriesState, setEntriesState] = useState<HeaderActionEntry[]>([])
  const sequenceRef = useRef(0)

  const register = useCallback((entry: Omit<HeaderActionEntry, 'sequence'>) => {
    setEntriesState((currentEntries) => {
      if (currentEntries.some((currentEntry) => currentEntry.id === entry.id)) {
        return currentEntries
      }

      const nextSequence = sequenceRef.current
      sequenceRef.current += 1
      return [...currentEntries, { ...entry, sequence: nextSequence }]
    })
  }, [])

  const update = useCallback((id: symbol, patch: Pick<HeaderActionEntry, 'element' | 'testID'>) => {
    setEntriesState((currentEntries) => {
      let changed = false

      const nextEntries = currentEntries.map((currentEntry) => {
        if (currentEntry.id !== id) {
          return currentEntry
        }

        if (currentEntry.element === patch.element && currentEntry.testID === patch.testID) {
          return currentEntry
        }

        changed = true
        return {
          ...currentEntry,
          ...patch,
        }
      })

      return changed ? nextEntries : currentEntries
    })
  }, [])

  const unregister = useCallback((id: symbol) => {
    setEntriesState((currentEntries) => currentEntries.filter((entry) => entry.id !== id))
  }, [])

  const getActiveEntry = useCallback(
    (routeKey: string) =>
      entriesState.reduce<HeaderActionEntry | undefined>((currentActiveEntry, entry) => {
        if (entry.routeKey !== routeKey) {
          return currentActiveEntry
        }

        return !currentActiveEntry || entry.sequence > currentActiveEntry.sequence ? entry : currentActiveEntry
      }, undefined),
    [entriesState]
  )

  const contextValue = useMemo<HeaderActionsContextValue>(
    () => ({
      register,
      update,
      unregister,
      getActiveEntry,
    }),
    [getActiveEntry, register, unregister, update]
  )

  return <HeaderActionsContext.Provider value={contextValue}>{children}</HeaderActionsContext.Provider>
}

type HeaderActionHostProps = {
  routeKey: string
}

export function HeaderActionHost({ routeKey }: HeaderActionHostProps) {
  const context = useContext(HeaderActionsContext)
  const activeEntry = context?.getActiveEntry(routeKey)

  if (!activeEntry) {
    return null
  }

  return (
    <View
      testID={activeEntry.testID}
      style={
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'flex-end',
        } satisfies ViewStyle
      }
    >
      {activeEntry.element}
    </View>
  )
}

export function HeaderAction({ children, enabled = true, testID }: HeaderActionProps) {
  const context = useContext(HeaderActionsContext)
  const isFocused = useIsFocused()
  const navigation = useNavigation<any>()
  const route = useRoute()
  const routeKey = route.key
  const [isClosingTransition, setIsClosingTransition] = useState(false)
  const idRef = useRef(Symbol('header-action'))
  const hasRegisteredRef = useRef(false)
  const hasWarnedRef = useRef(false)

  useEffect(() => {
    if (context || !__DEV__ || hasWarnedRef.current) {
      return
    }

    hasWarnedRef.current = true
    console.warn('HeaderAction must be used inside HeaderActionsProvider. Registration is ignored.')
  }, [context])

  useEffect(() => {
    const unsubscribeTransitionStart = navigation.addListener(
      'transitionStart',
      (event: { data?: { closing?: boolean } }) => {
        setIsClosingTransition(Boolean(event.data?.closing))
      }
    )

    const unsubscribeGestureCancel = navigation.addListener('gestureCancel', () => {
      setIsClosingTransition(false)
    })

    return () => {
      unsubscribeTransitionStart()
      unsubscribeGestureCancel()
    }
  }, [navigation])

  const shouldRegister = Boolean(context && isFocused && enabled && !isClosingTransition)
  const register = context?.register
  const unregister = context?.unregister
  const update = context?.update

  useEffect(() => {
    if (!register || !unregister) {
      return
    }

    if (shouldRegister && !hasRegisteredRef.current) {
      register({
        id: idRef.current,
        routeKey,
        element: children,
        testID,
      })
      hasRegisteredRef.current = true
    }

    if (!shouldRegister && hasRegisteredRef.current) {
      unregister(idRef.current)
      hasRegisteredRef.current = false
    }
  }, [children, register, routeKey, shouldRegister, testID, unregister])

  useEffect(() => {
    if (!update || !shouldRegister || !hasRegisteredRef.current) {
      return
    }

    update(idRef.current, {
      element: children,
      testID,
    })
  }, [children, shouldRegister, testID, update])

  useEffect(
    () => () => {
      if (!unregister || !hasRegisteredRef.current) {
        return
      }

      unregister(idRef.current)
      hasRegisteredRef.current = false
    },
    [unregister]
  )

  return null
}
