import {
  Animated,
  Modal as ReactNativeModal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import {
  Children,
  createContext,
  isValidElement,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

export type PopoverSide = 'top' | 'bottom' | 'left' | 'right'
export type PopoverAlign = 'start' | 'center' | 'end'
export type PopoverWidth = 'fit-content' | 'full'

type PopoverRect = {
  x: number
  y: number
  width: number
  height: number
}

type PopoverSize = {
  width: number
  height: number
}

type PopoverWindowSize = {
  width: number
  height: number
}

type PopoverInsets = {
  top: number
  right: number
  bottom: number
  left: number
}

type PopoverPosition = {
  top: number
  left: number
  resolvedSide: PopoverSide
}

export type PopoverSlotContext = {
  open: boolean
  setOpen: (next: boolean) => void
  disabled: boolean
}

type PopoverRenderable<TContext> = ReactNode | ((context: TContext) => ReactNode)

type PopoverSlotProps<TContext = PopoverSlotContext> = {
  children?: PopoverRenderable<TContext>
}

type PopoverMarkerProps = {
  children?: ReactNode
}

type PopoverSlotName = 'trigger' | 'content'

type SlotTaggedComponent = {
  __slot?: PopoverSlotName
}

type PopoverComponent = ((props: PopoverProps) => ReactElement) & {
  Trigger: typeof PopoverTrigger
  Content: typeof PopoverContent
}

export type PopoverProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (next: boolean) => void
  onOpen?: () => void
  onClose?: () => void
  disabled?: boolean
  side?: PopoverSide
  align?: PopoverAlign
  sideOffset?: number
  alignOffset?: number
  screenPadding?: number
  maxHeight?: number
  width?: PopoverWidth
  contentContainerStyle?: StyleProp<ViewStyle>
  overlayStyle?: StyleProp<ViewStyle>
  children: ReactNode
}

type PopoverPositionInput = {
  triggerRect: PopoverRect
  contentSize: PopoverSize
  windowSize: PopoverWindowSize
  insets: PopoverInsets
  side: PopoverSide
  align: PopoverAlign
  sideOffset: number
  alignOffset: number
  screenPadding: number
}

const ANIMATION_OPEN_MS = 130
const ANIMATION_CLOSE_MS = 100

const PopoverSlotContextValue = createContext<PopoverSlotContext | null>(null)

function usePopoverSlotContext() {
  const context = useContext(PopoverSlotContextValue)
  if (!context) {
    throw new Error('Popover slot components must be used inside <Popover>.')
  }
  return context
}

function renderSlot<TContext>(slot: PopoverRenderable<TContext> | undefined, context: TContext): ReactNode {
  if (typeof slot === 'function') {
    return (slot as (value: TContext) => ReactNode)(context)
  }
  return slot ?? null
}

function PopoverSlotMarker({ children }: PopoverSlotProps): ReactElement {
  return <>{children ?? null}</>
}

export const PopoverTrigger = Object.assign(
  function PopoverTrigger(props: PopoverSlotProps): ReactElement {
    return <PopoverSlotMarker {...props} />
  },
  { __slot: 'trigger' as const }
)

export const PopoverContent = Object.assign(
  function PopoverContent(props: PopoverSlotProps): ReactElement {
    return <PopoverSlotMarker {...props} />
  },
  { __slot: 'content' as const }
)

function parseSlots(children: ReactNode) {
  let trigger: PopoverRenderable<PopoverSlotContext> | undefined
  let content: PopoverRenderable<PopoverSlotContext> | undefined

  Children.forEach(children, (child) => {
    const maybeElement = child as ReactElement<PopoverMarkerProps>
    if (!isValidElement<PopoverMarkerProps>(maybeElement)) return

    const slotChildren = maybeElement.props.children as PopoverRenderable<PopoverSlotContext>
    const taggedType = maybeElement.type as SlotTaggedComponent
    const slot = taggedType.__slot

    if (slot === 'trigger') {
      trigger = slotChildren
      return
    }
    if (slot === 'content') {
      content = slotChildren
      return
    }

    if (maybeElement.type === PopoverTrigger) trigger = slotChildren
    if (maybeElement.type === PopoverContent) content = slotChildren
  })

  return { trigger, content }
}

function clamp(value: number, min: number, max: number) {
  if (max < min) return min
  return Math.min(Math.max(value, min), max)
}

function shouldFlipSide(
  side: PopoverSide,
  contentSize: PopoverSize,
  sideOffset: number,
  rooms: { top: number; right: number; bottom: number; left: number }
): PopoverSide {
  if (side === 'bottom') {
    const needed = contentSize.height + sideOffset
    if (rooms.bottom < needed && rooms.top > rooms.bottom) return 'top'
    return side
  }

  if (side === 'top') {
    const needed = contentSize.height + sideOffset
    if (rooms.top < needed && rooms.bottom > rooms.top) return 'bottom'
    return side
  }

  if (side === 'right') {
    const needed = contentSize.width + sideOffset
    if (rooms.right < needed && rooms.left > rooms.right) return 'left'
    return side
  }

  const needed = contentSize.width + sideOffset
  if (rooms.left < needed && rooms.right > rooms.left) return 'right'
  return side
}

function getAlignedLeft(triggerRect: PopoverRect, contentSize: PopoverSize, align: PopoverAlign, alignOffset: number) {
  if (align === 'center') {
    return triggerRect.x + (triggerRect.width - contentSize.width) / 2 + alignOffset
  }
  if (align === 'end') {
    return triggerRect.x + triggerRect.width - contentSize.width + alignOffset
  }
  return triggerRect.x + alignOffset
}

function getAlignedTop(triggerRect: PopoverRect, contentSize: PopoverSize, align: PopoverAlign, alignOffset: number) {
  if (align === 'center') {
    return triggerRect.y + (triggerRect.height - contentSize.height) / 2 + alignOffset
  }
  if (align === 'end') {
    return triggerRect.y + triggerRect.height - contentSize.height + alignOffset
  }
  return triggerRect.y + alignOffset
}

export function computePopoverPosition({
  triggerRect,
  contentSize,
  windowSize,
  insets,
  side,
  align,
  sideOffset,
  alignOffset,
  screenPadding,
}: PopoverPositionInput): PopoverPosition {
  const minX = insets.left + screenPadding
  const minY = insets.top + screenPadding
  const maxX = windowSize.width - insets.right - screenPadding
  const maxY = windowSize.height - insets.bottom - screenPadding

  const triggerBottom = triggerRect.y + triggerRect.height
  const triggerRight = triggerRect.x + triggerRect.width

  const rooms = {
    top: triggerRect.y - minY,
    right: maxX - triggerRight,
    bottom: maxY - triggerBottom,
    left: triggerRect.x - minX,
  }

  const resolvedSide = shouldFlipSide(side, contentSize, sideOffset, rooms)

  let top = 0
  let left = 0

  if (resolvedSide === 'bottom') {
    top = triggerBottom + sideOffset
    left = getAlignedLeft(triggerRect, contentSize, align, alignOffset)
  } else if (resolvedSide === 'top') {
    top = triggerRect.y - contentSize.height - sideOffset
    left = getAlignedLeft(triggerRect, contentSize, align, alignOffset)
  } else if (resolvedSide === 'right') {
    top = getAlignedTop(triggerRect, contentSize, align, alignOffset)
    left = triggerRight + sideOffset
  } else {
    top = getAlignedTop(triggerRect, contentSize, align, alignOffset)
    left = triggerRect.x - contentSize.width - sideOffset
  }

  const maxLeft = maxX - contentSize.width
  const maxTop = maxY - contentSize.height

  return {
    top: Math.round(clamp(top, minY, maxTop)),
    left: Math.round(clamp(left, minX, maxLeft)),
    resolvedSide,
  }
}

const PopoverBase = ({
  open,
  defaultOpen = false,
  onOpenChange,
  onOpen,
  onClose,
  disabled = false,
  side = 'bottom',
  align = 'start',
  sideOffset = 4,
  alignOffset = 0,
  screenPadding = 16,
  maxHeight,
  width = 'fit-content',
  contentContainerStyle,
  overlayStyle,
  children,
}: PopoverProps) => {
  const isControlled = typeof open === 'boolean'
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const resolvedOpen = isControlled ? Boolean(open) : uncontrolledOpen
  const visibilityRef = useRef(resolvedOpen)

  const insets = useSafeAreaInsets()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const windowSize = useMemo(() => ({ width: windowWidth, height: windowHeight }), [windowHeight, windowWidth])
  const fullWidth = Math.max(0, windowWidth - insets.left - insets.right - screenPadding * 2)
  const viewportMaxContentHeight = Math.max(0, windowHeight - insets.top - insets.bottom - screenPadding * 2)
  const resolvedMaxContentHeight =
    typeof maxHeight === 'number' ? Math.max(0, Math.min(maxHeight, viewportMaxContentHeight)) : viewportMaxContentHeight

  const triggerRef = useRef<View>(null)
  const triggerLayoutRef = useRef<PopoverRect | null>(null)

  const [isRendered, setIsRendered] = useState(resolvedOpen)
  const [triggerRect, setTriggerRect] = useState<PopoverRect | null>(null)
  const [contentSize, setContentSize] = useState<PopoverSize | null>(null)
  const [position, setPosition] = useState<PopoverPosition | null>(null)

  const animation = useRef(new Animated.Value(0)).current
  const hasAnimatedOpenRef = useRef(false)

  const updateVisibility = useCallback(
    (next: boolean, emitOpenChange: boolean) => {
      if (visibilityRef.current === next) return

      visibilityRef.current = next
      if (emitOpenChange) {
        onOpenChange?.(next)
      }
      if (next) {
        onOpen?.()
      } else {
        onClose?.()
      }
    },
    [onClose, onOpen, onOpenChange]
  )

  const setOpen = useCallback(
    (next: boolean) => {
      if (next && disabled) return

      if (!isControlled) {
        setUncontrolledOpen(next)
      }

      updateVisibility(next, true)
    },
    [disabled, isControlled, updateVisibility]
  )

  const measureTrigger = useCallback(() => {
    const current = triggerRef.current as View & {
      measureInWindow?: (callback: (x: number, y: number, width: number, height: number) => void) => void
    }

    if (current?.measureInWindow) {
      current.measureInWindow((x, y, width, height) => {
        if (width <= 0 && height <= 0 && triggerLayoutRef.current) {
          setTriggerRect(triggerLayoutRef.current)
          return
        }
        setTriggerRect({ x, y, width, height })
      })
      return
    }

    if (triggerLayoutRef.current) {
      setTriggerRect(triggerLayoutRef.current)
    }
  }, [])

  useEffect(() => {
    updateVisibility(resolvedOpen, false)
  }, [resolvedOpen, updateVisibility])

  useEffect(() => {
    if (resolvedOpen) {
      hasAnimatedOpenRef.current = false
      animation.setValue(0)
      setIsRendered(true)
      setPosition(null)
      setContentSize(null)
      requestAnimationFrame(() => {
        measureTrigger()
      })
      return
    }

    hasAnimatedOpenRef.current = false
    Animated.timing(animation, {
      toValue: 0,
      duration: ANIMATION_CLOSE_MS,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (!finished) return
      setIsRendered(false)
      setPosition(null)
      setContentSize(null)
      setTriggerRect(null)
    })
  }, [animation, measureTrigger, resolvedOpen])

  useEffect(() => {
    if (!resolvedOpen || !isRendered || !position || hasAnimatedOpenRef.current) return

    hasAnimatedOpenRef.current = true
    Animated.timing(animation, {
      toValue: 1,
      duration: ANIMATION_OPEN_MS,
      useNativeDriver: true,
    }).start()
  }, [animation, isRendered, position, resolvedOpen])

  useEffect(() => {
    if (!isRendered) return
    requestAnimationFrame(() => {
      measureTrigger()
    })
  }, [isRendered, measureTrigger, windowHeight, windowWidth])

  useEffect(() => {
    if (!isRendered || !contentSize) return

    const anchorRect =
      triggerRect ??
      ({
        x: windowSize.width / 2,
        y: windowSize.height / 2,
        width: 0,
        height: 0,
      } as PopoverRect)

    const nextPosition = computePopoverPosition({
      triggerRect: anchorRect,
      contentSize,
      windowSize,
      insets,
      side,
      align,
      sideOffset,
      alignOffset,
      screenPadding,
    })

    setPosition((prev) => {
      if (
        prev &&
        prev.top === nextPosition.top &&
        prev.left === nextPosition.left &&
        prev.resolvedSide === nextPosition.resolvedSide
      ) {
        return prev
      }
      return nextPosition
    })
  }, [align, alignOffset, contentSize, insets, isRendered, screenPadding, side, sideOffset, triggerRect, windowSize])

  const handleTriggerLayout = useCallback(
    (event: LayoutChangeEvent) => {
      const { x, y, width, height } = event.nativeEvent.layout
      const nextRect = { x, y, width, height }
      triggerLayoutRef.current = nextRect

      if (resolvedOpen) {
        measureTrigger()
      }
    },
    [measureTrigger, resolvedOpen]
  )

  const handleContentLayout = useCallback((event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout
    setContentSize((prev) => {
      if (prev && prev.width === width && prev.height === height) return prev
      return { width, height }
    })
  }, [])

  const slotContext = useMemo<PopoverSlotContext>(
    () => ({
      open: resolvedOpen,
      setOpen,
      disabled,
    }),
    [disabled, resolvedOpen, setOpen]
  )

  const { trigger, content } = parseSlots(children)
  const triggerNode = renderSlot(trigger, slotContext)
  const contentNode = renderSlot(content, slotContext)

  const contentVisible = Boolean(position)

  return (
    <PopoverSlotContextValue.Provider value={slotContext}>
      {triggerNode ? (
        <View testID="popover-trigger-anchor" ref={triggerRef} collapsable={false} onLayout={handleTriggerLayout}>
          {typeof trigger === 'function' ? (
            triggerNode
          ) : (
            <Pressable disabled={disabled} onPress={() => setOpen(true)}>
              {triggerNode}
            </Pressable>
          )}
        </View>
      ) : null}

      <ReactNativeModal
        testID="popover-modal"
        transparent
        visible={isRendered}
        onRequestClose={() => setOpen(false)}
        animationType="none"
        statusBarTranslucent
      >
        <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
          <Pressable testID="popover-backdrop" style={[styles.backdrop, overlayStyle]} onPress={() => setOpen(false)} />
          <Animated.View
            testID="popover-content"
            onLayout={handleContentLayout}
            pointerEvents={contentVisible ? 'auto' : 'none'}
            style={[
              styles.content,
              width === 'full' ? { width: fullWidth } : null,
              position ? { top: position.top, left: position.left } : styles.contentHidden,
              contentContainerStyle,
              { maxHeight: resolvedMaxContentHeight },
              {
                opacity: contentVisible ? animation : 0,
                transform: [
                  {
                    scale: animation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.96, 1],
                    }),
                  },
                ],
              },
            ]}
          >
            <ScrollView bounces={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.scrollContentContainer}>
              {contentNode}
            </ScrollView>
          </Animated.View>
        </View>
      </ReactNativeModal>
    </PopoverSlotContextValue.Provider>
  )
}

export const Popover = Object.assign(PopoverBase, {
  Trigger: PopoverTrigger,
  Content: PopoverContent,
}) as PopoverComponent

export function usePopoverContext() {
  return usePopoverSlotContext()
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    position: 'absolute',
    overflow: 'hidden',
  },
  contentHidden: {
    left: -9999,
    top: -9999,
  },
  scrollContentContainer: {
    flexGrow: 1,
  },
})
