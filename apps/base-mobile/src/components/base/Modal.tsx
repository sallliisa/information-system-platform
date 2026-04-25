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
import { Pressable, StyleSheet, Text, useWindowDimensions, View, type StyleProp, type ViewStyle } from 'react-native'
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
      sheetRef.current?.present()
    } else {
      sheetRef.current?.dismiss()
    }
  }, [resolvedOpen, updateVisibility])

  const handleDismiss = useCallback(() => {
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
  const maxDynamicContentSize = Math.round(height * 0.95)

  const triggerNode = renderSlot(trigger, slotContext)
  const headerNode = renderSlot(header, slotContext)
  const contentNode = renderSlot(content, slotContext)
  const footerNode = renderSlot(footer, slotContext)
  const isFixedHeight = hasSnapPoints

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
        {...(hasSnapPoints
          ? {
              snapPoints,
              enableDynamicSizing: false as const,
            }
          : {
              enableDynamicSizing: true as const,
              maxDynamicContentSize,
            })}
      >
        <BottomSheetView style={styles.container}>
          {headerNode ? (
            <View style={styles.header}>
              <View style={styles.headerText}>{headerNode}</View>
              {/* <Pressable
                accessibilityRole="button"
                accessibilityLabel="Close modal"
                onPress={() => setOpen(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>Close</Text>
              </Pressable> */}
            </View>
          ) : null}

          {isFixedHeight ? (
            <BottomSheetScrollView
              bounces={false}
              keyboardShouldPersistTaps="handled"
              style={styles.scrollView}
              contentContainerStyle={[styles.contentContainer, contentContainerStyle]}
            >
              {contentNode}
            </BottomSheetScrollView>
          ) : (
            <View style={[styles.contentContainer, contentContainerStyle]}>{contentNode}</View>
          )}

          {footerNode ? <View style={[styles.footer, { paddingBottom: insets.bottom }]}>{footerNode}</View> : null}
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
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
    paddingTop: 6,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: materialColors.outlineVariant,
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
