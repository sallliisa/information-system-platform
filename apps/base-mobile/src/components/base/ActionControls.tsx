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
import {
  Keyboard,
  Platform,
  View,
  type KeyboardEvent,
  type LayoutChangeEvent,
  type ViewStyle,
} from 'react-native'
import { useIsFocused } from '@react-navigation/native'

const HOST_GAP = 8

type ActionControlEntry = {
  id: symbol
  sequence: number
  element: ReactNode
  testID?: string
}

type ActionControlsContextValue = {
  register: (entry: Omit<ActionControlEntry, 'sequence'>) => void
  update: (id: symbol, patch: Pick<ActionControlEntry, 'element' | 'testID'>) => void
  unregister: (id: symbol) => void
  setHostHeight: (height: number) => void
  bottomInset: number
  entries: ActionControlEntry[]
}

export type ActionControlProps = {
  children: ReactNode
  enabled?: boolean
  testID?: string
}

type ActionControlsHostProps = {
  bottomOffset?: number
}

const ActionControlsContext = createContext<ActionControlsContextValue | null>(null)

function useKeyboardHeight() {
  const [keyboardHeight, setKeyboardHeight] = useState(0)

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'

    const showSubscription = Keyboard.addListener(showEvent, (event: KeyboardEvent) => {
      setKeyboardHeight(event.endCoordinates.height || 0)
    })

    const hideSubscription = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0)
    })

    return () => {
      showSubscription.remove()
      hideSubscription.remove()
    }
  }, [])

  return keyboardHeight
}

export function ActionControlsProvider({ children }: { children: ReactNode }) {
  const [entriesState, setEntriesState] = useState<ActionControlEntry[]>([])
  const [hostHeight, setHostHeightState] = useState(0)
  const sequenceRef = useRef(0)

  const register = useCallback((entry: Omit<ActionControlEntry, 'sequence'>) => {
    setEntriesState((currentEntries) => {
      if (currentEntries.some((currentEntry) => currentEntry.id === entry.id)) {
        return currentEntries
      }

      const nextSequence = sequenceRef.current
      sequenceRef.current += 1
      return [...currentEntries, { ...entry, sequence: nextSequence }]
    })
  }, [])

  const update = useCallback((id: symbol, patch: Pick<ActionControlEntry, 'element' | 'testID'>) => {
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

  const setHostHeight = useCallback((height: number) => {
    setHostHeightState((currentHeight) => (currentHeight === height ? currentHeight : height))
  }, [])

  const entries = useMemo(
    () => [...entriesState].sort((leftEntry, rightEntry) => leftEntry.sequence - rightEntry.sequence),
    [entriesState]
  )

  const bottomInset = hostHeight > 0 ? hostHeight + HOST_GAP : 0

  const contextValue = useMemo<ActionControlsContextValue>(
    () => ({
      register,
      update,
      unregister,
      setHostHeight,
      bottomInset,
      entries,
    }),
    [bottomInset, entries, register, setHostHeight, unregister, update]
  )

  return <ActionControlsContext.Provider value={contextValue}>{children}</ActionControlsContext.Provider>
}

export function ActionControlsHost({ bottomOffset = 0 }: ActionControlsHostProps) {
  const context = useContext(ActionControlsContext)
  const keyboardHeight = useKeyboardHeight()

  useEffect(() => {
    if (!context?.entries.length) {
      context?.setHostHeight(0)
    }
  }, [context])

  if (!context?.entries.length) {
    return null
  }

  const hostBottomOffset = Math.max(bottomOffset, keyboardHeight) + HOST_GAP

  const onHostLayout = (event: LayoutChangeEvent) => {
    context.setHostHeight(event.nativeEvent.layout.height)
  }

  return (
    <View
      testID="action-controls-host"
      pointerEvents="box-none"
      onLayout={onHostLayout}
      style={
        {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: hostBottomOffset,
          paddingHorizontal: 16,
        } satisfies ViewStyle
      }
    >
      <View
        testID="action-controls-stack"
        pointerEvents="box-none"
        style={
          {
            flexDirection: 'column-reverse',
            gap: HOST_GAP,
          } satisfies ViewStyle
        }
      >
        {context.entries.map((entry) => (
          <View key={entry.sequence} testID={entry.testID} pointerEvents="box-none">
            {entry.element}
          </View>
        ))}
      </View>
    </View>
  )
}

export function ActionControl({ children, enabled = true, testID }: ActionControlProps) {
  const context = useContext(ActionControlsContext)
  const isFocused = useIsFocused()
  const idRef = useRef(Symbol('action-control'))
  const hasRegisteredRef = useRef(false)
  const hasWarnedRef = useRef(false)

  useEffect(() => {
    if (context || !__DEV__ || hasWarnedRef.current) {
      return
    }

    hasWarnedRef.current = true
    console.warn('ActionControl must be used inside ActionControlsProvider. Registration is ignored.')
  }, [context])

  const shouldRegister = Boolean(context && isFocused && enabled)
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
        element: children,
        testID,
      })
      hasRegisteredRef.current = true
    }

    if (!shouldRegister && hasRegisteredRef.current) {
      unregister(idRef.current)
      hasRegisteredRef.current = false
    }
  }, [children, register, shouldRegister, testID, unregister])

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

export function useActionControlsBottomInset() {
  const context = useContext(ActionControlsContext)
  return context?.bottomInset || 0
}
