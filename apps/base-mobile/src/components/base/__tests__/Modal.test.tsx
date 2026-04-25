import { fireEvent, render, screen } from '@testing-library/react-native'
import { Pressable, Text } from 'react-native'
import * as ReactNative from 'react-native'
import { Modal } from '../Modal'

const mockPresent = jest.fn()
const mockDismiss = jest.fn()
let latestModalProps: Record<string, unknown> | null = null

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

    return (
      <View testID="bottom-sheet-modal">
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
  }: {
    children: React.ReactNode
    style?: any
    contentContainerStyle?: any
  }) {
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

    expect(latestModalProps?.snapPoints).toEqual([300, '80%'])
    expect(latestModalProps?.enableDynamicSizing).toBe(false)
    expect(latestModalProps?.maxDynamicContentSize).toBeUndefined()
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
