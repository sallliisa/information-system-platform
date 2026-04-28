import {
  BottomSheetBackdrop,
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
  View,
  useWindowDimensions,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { materialColors } from '../../theme/material'

const MAX_HEIGHT_RATIO = 0.95
const SNAP_DEDUPE_EPSILON = 1

type ModalSlotName = 'trigger' | 'header' | 'content' | 'footer'

type SlotTaggedComponent = {
  __slot?: ModalSlotName
}

type ModalRenderable<TContext> = ReactNode | ((context: TContext) => ReactNode)

type ModalSlotProps<TContext = ModalSlotContext> = {
  children?: ModalRenderable<TContext>
}

type ModalMarkerProps = {
  children?: ReactNode
}

export type ModalSlotContext = {
  open: boolean
  setOpen: (next: boolean) => void
  disabled: boolean
}

export type ModalScrollViewProps = {
  onScroll?: (event: NativeSyntheticEvent<NativeScrollEvent>) => void
  scrollEventThrottle?: number
  keyboardShouldPersistTaps?: 'always' | 'never' | 'handled' | boolean
  bounces?: boolean
  nestedScrollEnabled?: boolean
}

export type ModalProps = {
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (next: boolean) => void
  onOpen?: () => void
  onClose?: () => void
  disabled?: boolean
  snapPoints?: Array<string | number>
  contentContainerStyle?: StyleProp<ViewStyle>
  contentScrollProps?: ModalScrollViewProps
  children: ReactNode
}

type ModalComponent = ((props: ModalProps) => ReactElement) & {
  Trigger: typeof ModalTrigger
  Header: typeof ModalHeader
  Content: typeof ModalContent
  Footer: typeof ModalFooter
}

const ModalSlotContextValue = createContext<ModalSlotContext | null>(null)

function useModalSlotContext() {
  const context = useContext(ModalSlotContextValue)
  if (!context) {
    throw new Error('Modal slot components must be used inside <Modal>.')
  }
  return context
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

function resolveSnapPoint(snapPoint: string | number, windowHeight: number): number | null {
  if (typeof snapPoint === 'number') {
    return Number.isFinite(snapPoint) ? snapPoint : null
  }

  const trimmed = snapPoint.trim()
  if (!trimmed) return null

  if (trimmed.endsWith('%')) {
    const percentage = Number.parseFloat(trimmed.slice(0, -1))
    return Number.isFinite(percentage) ? (percentage / 100) * windowHeight : null
  }

  const parsed = Number.parseFloat(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function normalizeSnapPoints(snapPoints: Array<string | number>, windowHeight: number, maxHeight: number): number[] {
  const values = snapPoints
    .map((value) => resolveSnapPoint(value, windowHeight))
    .filter((value): value is number => value !== null)
    .map((value) => Math.min(Math.max(Math.round(value), 1), maxHeight))
    .sort((a, b) => a - b)

  return values.filter((value, index) => index === 0 || Math.abs(value - values[index - 1]) > SNAP_DEDUPE_EPSILON)
}

function parseSlots(children: ReactNode) {
  let trigger: ModalRenderable<ModalSlotContext> | undefined
  let header: ModalRenderable<ModalSlotContext> | undefined
  let content: ModalRenderable<ModalSlotContext> | undefined
  let footer: ModalRenderable<ModalSlotContext> | undefined

  Children.forEach(children, (child) => {
    if (!isValidElement<ModalMarkerProps>(child)) return

    const slotChildren = child.props.children as ModalRenderable<ModalSlotContext>
    const slot = (child.type as SlotTaggedComponent).__slot

    if (slot === 'trigger') trigger = slotChildren
    if (slot === 'header') header = slotChildren
    if (slot === 'content') content = slotChildren
    if (slot === 'footer') footer = slotChildren
  })

  return { trigger, header, content, footer }
}

function renderSlot<TContext>(slot: ModalRenderable<TContext> | undefined, context: TContext): ReactNode {
  if (typeof slot === 'function') {
    return (slot as (ctx: TContext) => ReactNode)(context)
  }
  return slot ?? null
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
  contentScrollProps,
  children,
}: ModalProps) => {
  const isControlled = typeof open === 'boolean'
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen)
  const resolvedOpen = isControlled ? Boolean(open) : uncontrolledOpen

  const { height: windowHeight } = useWindowDimensions()
  const maxHeight = Math.round(windowHeight * MAX_HEIGHT_RATIO)

  const sheetRef = useRef<BottomSheetModal>(null)
  const visibleRef = useRef(resolvedOpen)
  const sheetPresentedRef = useRef(false)
  const insets = useSafeAreaInsets()

  const openSheet = useCallback(() => {
    if (sheetPresentedRef.current) return
    sheetPresentedRef.current = true
    sheetRef.current?.present()
  }, [])

  const closeSheet = useCallback(() => {
    if (!sheetPresentedRef.current) return
    sheetPresentedRef.current = false
    sheetRef.current?.dismiss()
  }, [])

  const emitVisibility = useCallback(
    (next: boolean, emitOpenChange: boolean) => {
      if (visibleRef.current === next) return

      visibleRef.current = next
      if (emitOpenChange) onOpenChange?.(next)
      if (next) onOpen?.()
      else onClose?.()
    },
    [onClose, onOpen, onOpenChange]
  )

  const setOpen = useCallback(
    (next: boolean) => {
      if (next && disabled) return

      if (!isControlled) {
        setUncontrolledOpen(next)
      }

      if (next) openSheet()
      else closeSheet()

      emitVisibility(next, true)
    },
    [closeSheet, disabled, emitVisibility, isControlled, openSheet]
  )

  useEffect(() => {
    if (resolvedOpen) openSheet()
    else closeSheet()

    emitVisibility(resolvedOpen, true)
  }, [closeSheet, emitVisibility, openSheet, resolvedOpen])

  const handleDismiss = useCallback(() => {
    sheetPresentedRef.current = false
    if (!isControlled) {
      setUncontrolledOpen(false)
    }
    emitVisibility(false, true)
  }, [emitVisibility, isControlled])

  const slotContext = useMemo<ModalSlotContext>(
    () => ({
      open: resolvedOpen,
      setOpen,
      disabled,
    }),
    [disabled, resolvedOpen, setOpen]
  )

  const { trigger, header, content, footer } = parseSlots(children)
  const triggerNode = renderSlot(trigger, slotContext)
  const headerNode = renderSlot(header, slotContext)
  const contentNode = renderSlot(content, slotContext)
  const footerNode = renderSlot(footer, slotContext)

  const hasSnapPoints = Array.isArray(snapPoints) && snapPoints.length > 0
  const normalizedSnapPoints = useMemo(() => {
    if (!hasSnapPoints || !snapPoints) return undefined
    const normalized = normalizeSnapPoints(snapPoints, windowHeight, maxHeight)
    return normalized.length > 0 ? normalized : [maxHeight]
  }, [hasSnapPoints, maxHeight, snapPoints, windowHeight])

  const renderBackdrop = useCallback(
    (backdropProps: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...backdropProps} appearsOnIndex={0} disappearsOnIndex={-1} pressBehavior="close" />
    ),
    []
  )

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
        backdropComponent={renderBackdrop}
        enablePanDownToClose
        enableDismissOnClose
        backgroundStyle={styles.sheetBackground}
        handleIndicatorStyle={styles.handleIndicator}
        {...(normalizedSnapPoints
          ? {
              snapPoints: normalizedSnapPoints,
              enableDynamicSizing: false as const,
            }
          : {
              enableDynamicSizing: true as const,
              maxDynamicContentSize: maxHeight,
            })}
      >
        {hasSnapPoints ? (
          <View testID="modal-fixed-container" style={styles.fixedContainer}>
            {headerNode ? (
              <View testID="modal-header" style={styles.header}>
                {headerNode}
              </View>
            ) : null}

            <BottomSheetScrollView
              bounces={contentScrollProps?.bounces ?? false}
              nestedScrollEnabled={contentScrollProps?.nestedScrollEnabled ?? true}
              keyboardShouldPersistTaps={contentScrollProps?.keyboardShouldPersistTaps ?? 'handled'}
              onScroll={contentScrollProps?.onScroll}
              {...(contentScrollProps?.scrollEventThrottle !== undefined
                ? ({ scrollEventThrottle: contentScrollProps.scrollEventThrottle } as any)
                : {})}
              style={styles.scrollView}
              contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
            >
              {contentNode}
            </BottomSheetScrollView>

            {footerNode ? (
              <View testID="modal-footer" style={[styles.footer, { paddingBottom: insets.bottom }]}>
                {footerNode}
              </View>
            ) : null}
          </View>
        ) : (
          <BottomSheetView style={styles.container}>
            {headerNode ? (
              <View testID="modal-header" style={styles.header}>
                {headerNode}
              </View>
            ) : null}

            <View testID="modal-content" style={[styles.contentContainer, contentContainerStyle]}>
              {contentNode}
            </View>

            {footerNode ? (
              <View testID="modal-footer" style={[styles.footer, { paddingBottom: insets.bottom }]}>
                {footerNode}
              </View>
            ) : null}
          </BottomSheetView>
        )}
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

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: materialColors.surface,
  },
  handleIndicator: {
    backgroundColor: materialColors.onSurfaceVariant,
    opacity: 0.45,
  },
  container: {
    flexShrink: 1,
  },
  fixedContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    paddingTop: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: materialColors.outlineVariant,
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
