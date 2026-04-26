import {
  BottomSheetBackdrop,
  type BottomSheetHandleProps,
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetView,
  type BottomSheetBackdropProps,
} from '@gorhom/bottom-sheet'
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
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type LayoutChangeEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { materialColors } from '../../theme/material'

type ModalSlotContext = {
  open: boolean
  setOpen: (next: boolean) => void
  disabled: boolean
}

type ModalRenderable<TContext> = ReactNode | ((context: TContext) => ReactNode)

type ModalSlotProps<TContext = ModalSlotContext> = {
  children?: ModalRenderable<TContext>
}

type ModalMarkerProps = {
  children?: ReactNode
}

type ModalSlotName = 'trigger' | 'header' | 'content' | 'footer'

type SlotTaggedComponent = {
  __slot?: ModalSlotName
}

type ModalComponent = ((props: ModalProps) => ReactElement) & {
  Trigger: typeof ModalTrigger
  Header: typeof ModalHeader
  Content: typeof ModalContent
  Footer: typeof ModalFooter
}

const MAX_SNAP_RATIO = 0.95
const DEFAULT_HANDLE_HEIGHT = 24
const SNAP_DEDUPE_EPSILON = 1

function resolveSnapPoint(snapPoint: string | number, windowHeight: number): number | null {
  if (typeof snapPoint === 'number') {
    return Number.isFinite(snapPoint) ? snapPoint : null
  }

  const trimmed = snapPoint.trim()

  if (trimmed.endsWith('%')) {
    const percentage = Number.parseFloat(trimmed.slice(0, -1))
    return Number.isFinite(percentage) ? (percentage / 100) * windowHeight : null
  }

  const parsed = Number.parseFloat(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function dedupeSortedSnapPoints(snapPoints: number[]): number[] {
  return snapPoints
    .sort((a, b) => a - b)
    .filter((snapPoint, index, all) => index === 0 || Math.abs(snapPoint - all[index - 1]) > SNAP_DEDUPE_EPSILON)
}

function normalizeSnapPoints(snapPoints: Array<string | number>, windowHeight: number, maxSnapHeight: number): number[] {
  return dedupeSortedSnapPoints(
    snapPoints
      .map((snapPoint) => resolveSnapPoint(snapPoint, windowHeight))
      .filter((snapPoint): snapPoint is number => snapPoint !== null)
      .map((snapPoint) => Math.min(Math.max(Math.round(snapPoint), 1), maxSnapHeight))
  )
}

const ModalSlotContextValue = createContext<ModalSlotContext | null>(null)

function useModalSlotContext() {
  const context = useContext(ModalSlotContextValue)
  if (!context) {
    throw new Error('Modal slot components must be used inside <Modal>.')
  }
  return context
}

function renderSlot<TContext>(slot: ModalRenderable<TContext> | undefined, context: TContext): ReactNode {
  if (typeof slot === 'function') {
    return (slot as (value: TContext) => ReactNode)(context)
  }
  return slot ?? null
}

function ModalSlotMarker({ children }: ModalSlotProps): ReactElement {
  return <>{children ?? null}</>
}

export const ModalTrigger = Object.assign(
  function ModalTrigger(props: ModalSlotProps): ReactElement {
    return <ModalSlotMarker {...props} />
  },
  { __slot: 'trigger' as const }
)

export const ModalHeader = Object.assign(
  function ModalHeader(props: ModalSlotProps): ReactElement {
    return <ModalSlotMarker {...props} />
  },
  { __slot: 'header' as const }
)

export const ModalContent = Object.assign(
  function ModalContent(props: ModalSlotProps): ReactElement {
    return <ModalSlotMarker {...props} />
  },
  { __slot: 'content' as const }
)

export const ModalFooter = Object.assign(
  function ModalFooter(props: ModalSlotProps): ReactElement {
    return <ModalSlotMarker {...props} />
  },
  { __slot: 'footer' as const }
)

export type ModalProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (next: boolean) => void
  onOpen?: () => void
  onClose?: () => void
  disabled?: boolean
  snapPoints?: Array<string | number>
  contentContainerStyle?: StyleProp<ViewStyle>
  children: ReactNode
}

function parseSlots(children: ReactNode) {
  let trigger: ModalRenderable<ModalSlotContext> | undefined
  let header: ModalRenderable<ModalSlotContext> | undefined
  let content: ModalRenderable<ModalSlotContext> | undefined
  let footer: ModalRenderable<ModalSlotContext> | undefined

  Children.forEach(children, (child) => {
    if (!isValidElement<ModalMarkerProps>(child)) return

    const slotChildren = child.props.children as ModalRenderable<ModalSlotContext>
    const taggedType = child.type as SlotTaggedComponent
    const slot = taggedType.__slot

    // Prefer stable slot markers for Fast Refresh safety.
    if (slot === 'trigger') {
      trigger = slotChildren
      return
    }
    if (slot === 'header') {
      header = slotChildren
      return
    }
    if (slot === 'content') {
      content = slotChildren
      return
    }
    if (slot === 'footer') {
      footer = slotChildren
      return
    }

    // Fallback for edge cases where slot marker is missing.
    if (child.type === ModalTrigger) trigger = slotChildren
    if (child.type === ModalHeader) header = slotChildren
    if (child.type === ModalContent) content = slotChildren
    if (child.type === ModalFooter) footer = slotChildren
  })

  return { trigger, header, content, footer }
}

const ModalBase = ({
  open,
  defaultOpen = false,
  onOpenChange,
  onOpen,
  onClose,
  disabled = false,
  snapPoints,
  contentContainerStyle,
  children,
}: ModalProps) => {
  const isControlled = typeof open === 'boolean'
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const resolvedOpen = isControlled ? Boolean(open) : uncontrolledOpen
  const sheetRef = useRef<BottomSheetModal>(null)
  const visibilityRef = useRef(resolvedOpen)
  const { height } = useWindowDimensions()
  const insets = useSafeAreaInsets()
  const [headerHeight, setHeaderHeight] = useState(0)
  const [footerHeight, setFooterHeight] = useState(0)
  const [contentHeight, setContentHeight] = useState(0)
  const [currentSheetIndex, setCurrentSheetIndex] = useState(0)

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

      if (next) {
        setCurrentSheetIndex(0)
      }

      if (!isControlled) {
        setUncontrolledOpen(next)
      } else if (next) {
        sheetRef.current?.present()
      } else {
        sheetRef.current?.dismiss()
      }

      updateVisibility(next, true)
    },
    [disabled, isControlled, updateVisibility]
  )

  useEffect(() => {
    updateVisibility(resolvedOpen, false)
    if (resolvedOpen) {
      setCurrentSheetIndex(0)
      sheetRef.current?.present()
    } else {
      sheetRef.current?.dismiss()
    }
  }, [resolvedOpen, updateVisibility])

  const handleDismiss = useCallback(() => {
    setCurrentSheetIndex(0)

    if (!isControlled) {
      setUncontrolledOpen(false)
    }
    updateVisibility(false, true)
  }, [isControlled, updateVisibility])

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...backdropProps} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  )

  const slotContext = useMemo<ModalSlotContext>(
    () => ({
      open: resolvedOpen,
      setOpen,
      disabled,
    }),
    [disabled, resolvedOpen, setOpen]
  )

  const { trigger, header, content, footer } = parseSlots(children)
  const hasSnapPoints = Array.isArray(snapPoints) && snapPoints.length > 0
  const maxSnapHeight = Math.round(height * MAX_SNAP_RATIO)
  const maxDynamicContentSize = maxSnapHeight
  const modalChromeHeight = Math.round(headerHeight + footerHeight + DEFAULT_HANDLE_HEIGHT)
  const measuredRequiredHeight = Math.round(modalChromeHeight + contentHeight)
  const maxScrollableContentHeight = Math.max(maxSnapHeight - modalChromeHeight, 1)
  const contentOverflowsAtMaxSnap = contentHeight > maxScrollableContentHeight + SNAP_DEDUPE_EPSILON

  const effectiveSnapPoints = useMemo(() => {
    if (!hasSnapPoints || !snapPoints) return undefined

    const normalizedSnapPoints = normalizeSnapPoints(snapPoints, height, maxSnapHeight)
    const baseSnapPoints = normalizedSnapPoints.length > 0 ? normalizedSnapPoints : [maxSnapHeight]

    if (contentHeight <= 0) {
      return baseSnapPoints
    }

    const expansionSnapPoint = Math.min(measuredRequiredHeight, maxSnapHeight)
    const firstSnapPoint = baseSnapPoints[0]
    if (expansionSnapPoint <= firstSnapPoint + SNAP_DEDUPE_EPSILON) {
      return baseSnapPoints
    }

    return dedupeSortedSnapPoints([...baseSnapPoints, expansionSnapPoint])
  }, [contentHeight, hasSnapPoints, height, maxSnapHeight, measuredRequiredHeight, snapPoints])

  const largestEffectiveSnapIndex =
    hasSnapPoints && effectiveSnapPoints && effectiveSnapPoints.length > 0 ? effectiveSnapPoints.length - 1 : null
  const isAtLargestEffectiveSnap = largestEffectiveSnapIndex !== null && currentSheetIndex === largestEffectiveSnapIndex
  const shouldEnableFixedScroll = Boolean(hasSnapPoints && isAtLargestEffectiveSnap && contentOverflowsAtMaxSnap)
  const shouldLetContentOwnPanGesture = shouldEnableFixedScroll
  const shouldEnableContentPanningGesture = !shouldLetContentOwnPanGesture
  const fixedScrollViewStyle = useMemo(
    () => [styles.scrollView, contentOverflowsAtMaxSnap ? { maxHeight: maxScrollableContentHeight } : null],
    [contentOverflowsAtMaxSnap, maxScrollableContentHeight]
  )

  const triggerNode = renderSlot(trigger, slotContext)
  const headerNode = renderSlot(header, slotContext)
  const contentNode = renderSlot(content, slotContext)
  const footerNode = renderSlot(footer, slotContext)
  const isFixedHeight = hasSnapPoints

  const handleHeaderLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height)
    setHeaderHeight((previousHeight) =>
      Math.abs(previousHeight - nextHeight) <= SNAP_DEDUPE_EPSILON ? previousHeight : nextHeight
    )
  }, [])

  const handleFooterLayout = useCallback((event: LayoutChangeEvent) => {
    const nextHeight = Math.round(event.nativeEvent.layout.height)
    setFooterHeight((previousHeight) =>
      Math.abs(previousHeight - nextHeight) <= SNAP_DEDUPE_EPSILON ? previousHeight : nextHeight
    )
  }, [])

  const renderHandle = useCallback(
    (_handleProps: BottomSheetHandleProps) => {
      if (!headerNode) return null

      return (
        <View testID="modal-header" style={styles.handleContainer} onLayout={handleHeaderLayout}>
          <View style={styles.handleGrip} />
          <View style={styles.headerText}>{headerNode}</View>
        </View>
      )
    },
    [handleHeaderLayout, headerNode]
  )

  const handleScrollContentSizeChange = useCallback((_: number, nextHeight: number) => {
    const roundedHeight = Math.round(nextHeight)
    setContentHeight((previousHeight) =>
      Math.abs(previousHeight - roundedHeight) <= SNAP_DEDUPE_EPSILON ? previousHeight : roundedHeight
    )
  }, [])

  const handleSheetChange = useCallback((nextIndex: number) => {
    setCurrentSheetIndex(nextIndex < 0 ? 0 : nextIndex)
  }, [])

  return (
    <ModalSlotContextValue.Provider value={slotContext}>
      {triggerNode ? (
        typeof trigger === 'function' ? (
          triggerNode
        ) : (
          <Pressable disabled={disabled} onPress={() => setOpen(true)}>
            {triggerNode}
          </Pressable>
        )
      ) : null}

      <BottomSheetModal
        ref={sheetRef}
        index={0}
        onDismiss={handleDismiss}
        onChange={handleSheetChange}
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        enableDismissOnClose
        enableHandlePanningGesture
        enableContentPanningGesture={shouldEnableContentPanningGesture}
        handleComponent={headerNode ? renderHandle : undefined}
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        {...(hasSnapPoints
          ? {
              snapPoints: effectiveSnapPoints,
              enableDynamicSizing: false as const,
            }
          : {
              enableDynamicSizing: true as const,
              maxDynamicContentSize,
            })}
      >
        <BottomSheetView style={styles.container}>
          {isFixedHeight ? (
            <BottomSheetScrollView
              bounces={false}
              nestedScrollEnabled
              keyboardShouldPersistTaps="handled"
              scrollEnabled={shouldEnableFixedScroll}
              onContentSizeChange={handleScrollContentSizeChange}
              style={fixedScrollViewStyle}
              contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
            >
              {contentNode}
            </BottomSheetScrollView>
          ) : (
            <View style={[styles.contentContainer, contentContainerStyle]}>{contentNode}</View>
          )}

          {footerNode ? (
            <View testID="modal-footer" style={[styles.footer, { paddingBottom: insets.bottom }]} onLayout={handleFooterLayout}>
              {footerNode}
            </View>
          ) : null}
        </BottomSheetView>
      </BottomSheetModal>
    </ModalSlotContextValue.Provider>
  )
}

export const Modal = Object.assign(ModalBase, {
  Trigger: ModalTrigger,
  Header: ModalHeader,
  Content: ModalContent,
  Footer: ModalFooter,
}) as ModalComponent

export function useModalContext() {
  return useModalSlotContext()
}

export type { ModalSlotContext }

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: materialColors.surface,
  },
  handleIndicator: {
    backgroundColor: materialColors.onSurfaceVariant,
    opacity: 0.45,
  },
  container: {},
  handleContainer: {
    paddingTop: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: materialColors.outlineVariant,
  },
  handleGrip: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: materialColors.onSurfaceVariant,
    opacity: 0.45,
  },
  headerText: {
    flex: 1,
    gap: 6,
  },
  title: {
    color: materialColors.onSurface,
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
  },
  description: {
    color: materialColors.onSurfaceVariant,
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: materialColors.surfaceContainerHigh,
  },
  closeButtonText: {
    color: materialColors.onSurfaceVariant,
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  contentContainer: {
    padding: 16,
    gap: 12,
  },
  footer: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: materialColors.outlineVariant,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
})
