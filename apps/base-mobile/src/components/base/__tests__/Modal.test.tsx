import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { Pressable, StyleSheet, Text } from 'react-native'
import * as ReactNative from 'react-native'
import { Modal } from '../Modal'

const mockPresent = jest.fn()
const mockDismiss = jest.fn()
let latestModalProps: Record<string, unknown> | null = null
let latestScrollViewProps: Record<string, unknown> | null = null

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }: { children: any }) => children,
}))

jest.mock('@gorhom/bottom-sheet', () => {
  const React = require('react')
  const { Pressable: RNPressable, Text: RNText, View } = require('react-native')

  const BottomSheetModal = React.forwardRef(function BottomSheetModalMock(props: any, ref: any) {
    latestModalProps = props
    React.useImperativeHandle(ref, () => ({
      present: mockPresent,
      dismiss: mockDismiss,
    }))

    const handleNode = props.handleComponent?.({})

    return (
      <View testID="bottom-sheet-modal">
        {handleNode}
        {props.children}
        <RNPressable testID="mock-dismiss" onPress={() => props.onDismiss?.()}>
          <RNText>Mock Dismiss</RNText>
        </RNPressable>
      </View>
    )
  })

  function BottomSheetView({ children, style }: { children: React.ReactNode; style?: any }) {
    return (
      <View testID="bottom-sheet-view" style={style}>
        {children}
      </View>
    )
  }

  function BottomSheetScrollView({
    children,
    style,
    contentContainerStyle,
    onContentSizeChange,
    scrollEnabled,
    nestedScrollEnabled,
  }: {
    children: React.ReactNode
    style?: any
    contentContainerStyle?: any
    onContentSizeChange?: (width: number, height: number) => void
    scrollEnabled?: boolean
    nestedScrollEnabled?: boolean
  }) {
    latestScrollViewProps = {
      onContentSizeChange,
      scrollEnabled,
      style,
      contentContainerStyle,
      nestedScrollEnabled,
    }

    return (
      <View testID="bottom-sheet-scroll-view" style={style}>
        <View testID="bottom-sheet-scroll-content" style={contentContainerStyle}>
          {children}
        </View>
      </View>
    )
  }

  function BottomSheetBackdrop() {
    return <View testID="bottom-sheet-backdrop" />
  }

  function BottomSheetModalProvider({ children }: { children: React.ReactNode }) {
    return <View>{children}</View>
  }

  return {
    __esModule: true,
    BottomSheetModal,
    BottomSheetView,
    BottomSheetScrollView,
    BottomSheetBackdrop,
    BottomSheetModalProvider,
  }
})

describe('Modal', () => {
  beforeEach(() => {
    mockPresent.mockClear()
    mockDismiss.mockClear()
    latestModalProps = null
    latestScrollViewProps = null
  })

  it('opens and closes in uncontrolled mode using trigger and setOpen', () => {
    render(
      <Modal>
        <Modal.Trigger>
          <Text>Open Modal</Text>
        </Modal.Trigger>
        <Modal.Content>
          {({ setOpen }) => (
            <Pressable onPress={() => setOpen(false)}>
              <Text>Close From Content</Text>
            </Pressable>
          )}
        </Modal.Content>
      </Modal>
    )

    mockPresent.mockClear()
    mockDismiss.mockClear()

    fireEvent.press(screen.getByText('Open Modal'))
    expect(mockPresent).toHaveBeenCalledTimes(1)

    fireEvent.press(screen.getByText('Close From Content'))
    expect(mockDismiss).toHaveBeenCalledTimes(1)
  })

  it('passes setOpen to footer slot', () => {
    render(
      <Modal>
        <Modal.Trigger>
          <Text>Open Modal</Text>
        </Modal.Trigger>
        <Modal.Header>{() => <Text>Header</Text>}</Modal.Header>
        <Modal.Content>{() => <Text>Body</Text>}</Modal.Content>
        <Modal.Footer>
          {({ setOpen }) => (
            <Pressable onPress={() => setOpen(false)}>
              <Text>Close From Footer</Text>
            </Pressable>
          )}
        </Modal.Footer>
      </Modal>
    )

    mockPresent.mockClear()
    mockDismiss.mockClear()

    fireEvent.press(screen.getByText('Open Modal'))
    fireEvent.press(screen.getByText('Close From Footer'))
    expect(mockDismiss).toHaveBeenCalledTimes(1)
  })

  it('syncs with controlled open changes', () => {
    const onOpenChange = jest.fn()
    const { rerender } = render(
      <Modal open={false} onOpenChange={onOpenChange}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    mockPresent.mockClear()
    mockDismiss.mockClear()

    rerender(
      <Modal open onOpenChange={onOpenChange}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )
    expect(mockPresent).toHaveBeenCalledTimes(1)

    rerender(
      <Modal open={false} onOpenChange={onOpenChange}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )
    expect(mockDismiss).toHaveBeenCalledTimes(1)
  })

  it('emits open and close callbacks', () => {
    const onOpenChange = jest.fn()
    const onOpen = jest.fn()
    const onClose = jest.fn()

    render(
      <Modal onOpenChange={onOpenChange} onOpen={onOpen} onClose={onClose}>
        <Modal.Trigger>
          <Text>Open</Text>
        </Modal.Trigger>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    fireEvent.press(screen.getByText('Open'))
    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(onOpen).toHaveBeenCalledTimes(1)

    fireEvent.press(screen.getByTestId('mock-dismiss'))
    expect(onOpenChange).toHaveBeenCalledWith(false)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('uses dynamic sizing with 95 percent max content height by default', () => {
    render(
      <Modal>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    const expectedMaxDynamicContentSize = Math.round(ReactNative.Dimensions.get('window').height * 0.95)

    expect(latestModalProps?.enableDynamicSizing).toBe(true)
    expect(latestModalProps?.maxDynamicContentSize).toBe(expectedMaxDynamicContentSize)
    expect(latestModalProps?.snapPoints).toBeUndefined()
    expect(latestModalProps?.enablePanDownToClose).toBe(true)
    expect(latestModalProps?.enableContentPanningGesture).toBe(true)
  })

  it('renders dynamic body content inside a plain View without nested BottomSheetView', () => {
    render(
      <Modal>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    expect(screen.getAllByTestId('bottom-sheet-view')).toHaveLength(1)
    expect(screen.queryByTestId('bottom-sheet-scroll-view')).toBeNull()
  })

  it('uses provided snapPoints and disables default dynamic sizing', () => {
    render(
      <Modal snapPoints={[300, '80%']}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    expect(latestModalProps?.snapPoints).toEqual([300, Math.round(ReactNative.Dimensions.get('window').height * 0.8)])
    expect(latestModalProps?.enableDynamicSizing).toBe(false)
    expect(latestModalProps?.maxDynamicContentSize).toBeUndefined()
    expect(latestScrollViewProps?.nestedScrollEnabled).toBe(true)
    expect(latestModalProps?.enableContentPanningGesture).toBe(true)
  })

  it('clamps provided snap points to 95 percent max height', () => {
    render(
      <Modal snapPoints={[300, '120%']}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    const maxSnapHeight = Math.round(ReactNative.Dimensions.get('window').height * 0.95)
    expect(latestModalProps?.snapPoints).toEqual([300, maxSnapHeight])
    expect(latestModalProps?.enableDynamicSizing).toBe(false)
  })

  it('inserts fit-content snap and keeps scroll disabled when content fits after expansion', () => {
    render(
      <Modal snapPoints={[300, '80%']}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    act(() => {
      ;(latestScrollViewProps?.onContentSizeChange as ((width: number, height: number) => void) | undefined)?.(100, 520)
    })

    const expectedFitContentSnap = 520 + 24
    const snapPoints = latestModalProps?.snapPoints as number[] | undefined

    expect(snapPoints).toBeDefined()
    expect(snapPoints).toContain(expectedFitContentSnap)
    expect(snapPoints?.[0]).toBe(300)
    expect(latestScrollViewProps?.scrollEnabled).toBe(false)

    act(() => {
      ;(latestModalProps?.onChange as ((index: number) => void) | undefined)?.(1)
    })

    expect(latestScrollViewProps?.scrollEnabled).toBe(false)
  })

  it('enables scroll only at largest snap when content still exceeds 95 percent cap', () => {
    render(
      <Modal snapPoints={[300, 500]}>
        <Modal.Header>
          <Text>Header</Text>
        </Modal.Header>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
        <Modal.Footer>
          <Text>Footer</Text>
        </Modal.Footer>
      </Modal>
    )

    fireEvent(screen.getByTestId('modal-header'), 'layout', { nativeEvent: { layout: { height: 120 } } })
    fireEvent(screen.getByTestId('modal-footer'), 'layout', { nativeEvent: { layout: { height: 80 } } })

    const maxSnapHeight = Math.round(ReactNative.Dimensions.get('window').height * 0.95)
    act(() => {
      ;(latestScrollViewProps?.onContentSizeChange as ((width: number, height: number) => void) | undefined)?.(
        100,
        maxSnapHeight + 300
      )
    })

    expect(latestModalProps?.snapPoints).toContain(maxSnapHeight)
    expect(latestScrollViewProps?.scrollEnabled).toBe(false)
    expect(latestModalProps?.enableContentPanningGesture).toBe(true)

    const largestIndex = (latestModalProps?.snapPoints as number[]).length - 1
    act(() => {
      ;(latestModalProps?.onChange as ((index: number) => void) | undefined)?.(largestIndex)
    })

    expect(latestScrollViewProps?.scrollEnabled).toBe(true)
    expect(latestModalProps?.enableContentPanningGesture).toBe(false)
  })

  it('sets max scroll viewport height by subtracting header/footer/handle when content overflows', () => {
    render(
      <Modal snapPoints={[300, 500]}>
        <Modal.Header>
          <Text>Header</Text>
        </Modal.Header>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
        <Modal.Footer>
          <Text>Footer</Text>
        </Modal.Footer>
      </Modal>
    )

    fireEvent(screen.getByTestId('modal-header'), 'layout', { nativeEvent: { layout: { height: 120 } } })
    fireEvent(screen.getByTestId('modal-footer'), 'layout', { nativeEvent: { layout: { height: 80 } } })

    const maxSnapHeight = Math.round(ReactNative.Dimensions.get('window').height * 0.95)
    act(() => {
      ;(latestScrollViewProps?.onContentSizeChange as ((width: number, height: number) => void) | undefined)?.(
        100,
        maxSnapHeight + 300
      )
    })

    const flattenedStyle = StyleSheet.flatten(latestScrollViewProps?.style as any)
    expect(flattenedStyle?.maxHeight).toBe(maxSnapHeight - 120 - 80 - 24)
  })

  it('does not set maxHeight style when content fits', () => {
    render(
      <Modal snapPoints={[300]}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    act(() => {
      ;(latestScrollViewProps?.onContentSizeChange as ((width: number, height: number) => void) | undefined)?.(100, 520)
    })

    const flattenedStyle = StyleSheet.flatten(latestScrollViewProps?.style as any)
    expect(flattenedStyle?.maxHeight).toBeUndefined()
    expect(latestScrollViewProps?.scrollEnabled).toBe(false)
  })

  it('does not insert a smaller fit-content snap when content is shorter than initial snap', () => {
    render(
      <Modal snapPoints={[300, '80%']}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    act(() => {
      ;(latestScrollViewProps?.onContentSizeChange as ((width: number, height: number) => void) | undefined)?.(100, 200)
    })

    expect(latestModalProps?.snapPoints).toEqual([300, Math.round(ReactNative.Dimensions.get('window').height * 0.8)])
  })

  it('resets current sheet index after dismiss', () => {
    render(
      <Modal snapPoints={[300, 500]}>
        <Modal.Header>
          <Text>Header</Text>
        </Modal.Header>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
        <Modal.Footer>
          <Text>Footer</Text>
        </Modal.Footer>
      </Modal>
    )

    fireEvent(screen.getByTestId('modal-header'), 'layout', { nativeEvent: { layout: { height: 120 } } })
    fireEvent(screen.getByTestId('modal-footer'), 'layout', { nativeEvent: { layout: { height: 80 } } })

    const maxSnapHeight = Math.round(ReactNative.Dimensions.get('window').height * 0.95)
    act(() => {
      ;(latestScrollViewProps?.onContentSizeChange as ((width: number, height: number) => void) | undefined)?.(
        100,
        maxSnapHeight + 300
      )
    })

    const largestIndex = (latestModalProps?.snapPoints as number[]).length - 1
    act(() => {
      ;(latestModalProps?.onChange as ((index: number) => void) | undefined)?.(largestIndex)
    })
    expect(latestScrollViewProps?.scrollEnabled).toBe(true)
    expect(latestModalProps?.enableContentPanningGesture).toBe(false)

    fireEvent.press(screen.getByTestId('mock-dismiss'))
    expect(latestScrollViewProps?.scrollEnabled).toBe(false)
    expect(latestModalProps?.enableContentPanningGesture).toBe(true)
  })

  it('keeps content panning enabled before largest snap even when content overflows', () => {
    render(
      <Modal snapPoints={['65%']}>
        <Modal.Header>
          <Text>Header</Text>
        </Modal.Header>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
        <Modal.Footer>
          <Text>Footer</Text>
        </Modal.Footer>
      </Modal>
    )

    const maxSnapHeight = Math.round(ReactNative.Dimensions.get('window').height * 0.95)
    act(() => {
      ;(latestScrollViewProps?.onContentSizeChange as ((width: number, height: number) => void) | undefined)?.(
        100,
        maxSnapHeight + 300
      )
    })

    expect(latestScrollViewProps?.scrollEnabled).toBe(false)
    expect(latestModalProps?.enableContentPanningGesture).toBe(true)
  })

  it('keeps content panning enabled at largest snap when content fits', () => {
    render(
      <Modal snapPoints={[300]}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    act(() => {
      ;(latestScrollViewProps?.onContentSizeChange as ((width: number, height: number) => void) | undefined)?.(100, 520)
    })

    const largestIndex = (latestModalProps?.snapPoints as number[]).length - 1
    act(() => {
      ;(latestModalProps?.onChange as ((index: number) => void) | undefined)?.(largestIndex)
    })

    expect(latestScrollViewProps?.scrollEnabled).toBe(false)
    expect(latestModalProps?.enableContentPanningGesture).toBe(true)
  })

  it('ignores invalid snap points and falls back to max height when all are invalid', () => {
    const maxSnapHeight = Math.round(ReactNative.Dimensions.get('window').height * 0.95)

    const { rerender } = render(
      <Modal snapPoints={['abc', 300]}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    expect(latestModalProps?.snapPoints).toEqual([300])

    rerender(
      <Modal snapPoints={['abc']}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    expect(latestModalProps?.snapPoints).toEqual([maxSnapHeight])
  })

  it('dedupes generated fit-content snap when it matches a provided snap', () => {
    render(
      <Modal snapPoints={[300, 544]}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    act(() => {
      ;(latestScrollViewProps?.onContentSizeChange as ((width: number, height: number) => void) | undefined)?.(100, 520)
    })

    expect(latestModalProps?.snapPoints).toEqual([300, 544])
  })

  it('does not open when disabled trigger is pressed', () => {
    render(
      <Modal disabled>
        <Modal.Trigger>
          <Text>Open Modal</Text>
        </Modal.Trigger>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    mockPresent.mockClear()
    fireEvent.press(screen.getByText('Open Modal'))

    expect(mockPresent).not.toHaveBeenCalled()
  })
})
