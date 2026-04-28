import { fireEvent, render, screen } from '@testing-library/react-native'
import { Pressable, StyleSheet, Text, View } from 'react-native'
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

    const backdrop = props.backdropComponent?.({
      animatedIndex: { value: 0 },
      animatedPosition: { value: 0 },
      style: {},
    })

    return (
      <View testID="bottom-sheet-modal">
        {backdrop}
        {props.children}
        <RNPressable testID="mock-dismiss" onPress={() => props.onDismiss?.()}>
          <RNText>Mock Dismiss</RNText>
        </RNPressable>
      </View>
    )
  })

  function BottomSheetScrollView({ children, contentContainerStyle, style, ...rest }: any) {
    latestScrollViewProps = {
      ...rest,
      style,
      contentContainerStyle,
    }

    return (
      <View testID="bottom-sheet-scroll-view">
        <View testID="bottom-sheet-scroll-content" style={contentContainerStyle}>
          {children}
        </View>
      </View>
    )
  }

  function BottomSheetView({ children, style }: any) {
    return (
      <View testID="bottom-sheet-view" style={style}>
        {children}
      </View>
    )
  }

  function BottomSheetBackdrop(props: any) {
    return <View testID="bottom-sheet-backdrop" {...props} />
  }

  return {
    __esModule: true,
    BottomSheetModal,
    BottomSheetScrollView,
    BottomSheetView,
    BottomSheetBackdrop,
  }
})

describe('Modal', () => {
  beforeEach(() => {
    mockPresent.mockClear()
    mockDismiss.mockClear()
    latestModalProps = null
    latestScrollViewProps = null
  })

  it('renders all slots and receives slot context in render functions', () => {
    const states: Array<{ open: boolean; disabled: boolean }> = []

    render(
      <Modal>
        <Modal.Trigger>{({ open, disabled }) => <Text>{`trigger:${open}:${disabled}`}</Text>}</Modal.Trigger>
        <Modal.Header>{({ open }) => <Text>{`header:${open}`}</Text>}</Modal.Header>
        <Modal.Content>{({ open }) => <Text>{`content:${open}`}</Text>}</Modal.Content>
        <Modal.Footer>{({ open }) => <Text>{`footer:${open}`}</Text>}</Modal.Footer>
      </Modal>
    )

    states.push({
      open: screen.getByText('trigger:false:false') != null,
      disabled: true,
    })

    expect(screen.getByText('trigger:false:false')).toBeTruthy()
    expect(screen.getByText('header:false')).toBeTruthy()
    expect(screen.getByText('content:false')).toBeTruthy()
    expect(screen.getByText('footer:false')).toBeTruthy()
    expect(screen.getByTestId('modal-header')).toBeTruthy()
    expect(screen.getByTestId('modal-footer')).toBeTruthy()
    expect(states).toHaveLength(1)
  })

  it('wraps plain trigger in Pressable and opens modal', () => {
    render(
      <Modal>
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
    expect(mockPresent).toHaveBeenCalledTimes(1)
  })

  it('render-prop trigger can call setOpen(true)', () => {
    render(
      <Modal>
        <Modal.Trigger>
          {({ setOpen }) => (
            <Pressable onPress={() => setOpen(true)}>
              <Text>Open Via Render Prop</Text>
            </Pressable>
          )}
        </Modal.Trigger>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    mockPresent.mockClear()
    fireEvent.press(screen.getByText('Open Via Render Prop'))
    expect(mockPresent).toHaveBeenCalledTimes(1)
  })

  it('disabled modal does not open via trigger or setOpen(true)', () => {
    render(
      <Modal disabled>
        <Modal.Trigger>
          <Text>Open Modal</Text>
        </Modal.Trigger>
        <Modal.Content>
          {({ setOpen }) => (
            <Pressable onPress={() => setOpen(true)}>
              <Text>Try Open</Text>
            </Pressable>
          )}
        </Modal.Content>
      </Modal>
    )

    mockPresent.mockClear()
    fireEvent.press(screen.getByText('Open Modal'))
    fireEvent.press(screen.getByText('Try Open'))
    expect(mockPresent).not.toHaveBeenCalled()
  })

  it('footer/content render props can close using setOpen(false)', () => {
    render(
      <Modal defaultOpen>
        <Modal.Content>
          {({ setOpen }) => (
            <Pressable onPress={() => setOpen(false)}>
              <Text>Close Content</Text>
            </Pressable>
          )}
        </Modal.Content>
        <Modal.Footer>
          {({ setOpen }) => (
            <Pressable onPress={() => setOpen(false)}>
              <Text>Close Footer</Text>
            </Pressable>
          )}
        </Modal.Footer>
      </Modal>
    )

    mockDismiss.mockClear()
    fireEvent.press(screen.getByText('Close Content'))
    fireEvent.press(screen.getByText('Close Footer'))
    expect(mockDismiss).toHaveBeenCalledTimes(1)
  })

  it('uncontrolled trigger opens and setOpen(false) dismisses', () => {
    render(
      <Modal>
        <Modal.Trigger>
          <Text>Open Modal</Text>
        </Modal.Trigger>
        <Modal.Content>
          {({ setOpen }) => (
            <Pressable onPress={() => setOpen(false)}>
              <Text>Close Modal</Text>
            </Pressable>
          )}
        </Modal.Content>
      </Modal>
    )

    mockPresent.mockClear()
    mockDismiss.mockClear()

    fireEvent.press(screen.getByText('Open Modal'))
    fireEvent.press(screen.getByText('Close Modal'))

    expect(mockPresent).toHaveBeenCalledTimes(1)
    expect(mockDismiss).toHaveBeenCalledTimes(1)
  })

  it('controlled open=false->true calls present and true->false calls dismiss', () => {
    const { rerender } = render(
      <Modal open={false}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    mockPresent.mockClear()
    mockDismiss.mockClear()

    rerender(
      <Modal open>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )
    expect(mockPresent).toHaveBeenCalledTimes(1)

    rerender(
      <Modal open={false}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )
    expect(mockDismiss).toHaveBeenCalledTimes(1)
  })

  it('fires onOpenChange/onOpen/onClose once per transition and onDismiss syncs close', () => {
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
    expect(onOpenChange).toHaveBeenCalledTimes(2)
  })

  it('default mode uses dynamic sizing with 95% max height and no snapPoints', () => {
    render(
      <Modal>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    const maxHeight = Math.round(ReactNative.Dimensions.get('window').height * 0.95)
    expect(latestModalProps?.enableDynamicSizing).toBe(true)
    expect(latestModalProps?.maxDynamicContentSize).toBe(maxHeight)
    expect(latestModalProps?.snapPoints).toBeUndefined()
  })

  it('renders default dynamic content in a measured view', () => {
    render(
      <Modal contentContainerStyle={{ paddingBottom: 40 }}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    expect(screen.getByTestId('bottom-sheet-view')).toBeTruthy()
    expect(screen.queryByTestId('bottom-sheet-scroll-view')).toBeNull()

    const flattenedStyle = StyleSheet.flatten(screen.getByTestId('modal-content').props.style as any)
    expect(flattenedStyle.paddingBottom).toBe(40)
    expect(flattenedStyle.padding).toBe(16)
  })

  it('renders snap-point content inside BottomSheetScrollView and forwards content scroll props', () => {
    const onScroll = jest.fn()

    render(
      <Modal
        snapPoints={['65%']}
        contentScrollProps={{
          onScroll,
          scrollEventThrottle: 24,
          keyboardShouldPersistTaps: 'always',
          bounces: true,
          nestedScrollEnabled: false,
        }}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    expect(screen.getByTestId('bottom-sheet-scroll-view')).toBeTruthy()
    expect(screen.queryByTestId('bottom-sheet-view')).toBeNull()
    expect(latestScrollViewProps?.onScroll).toBe(onScroll)
    expect(latestScrollViewProps?.scrollEventThrottle).toBe(24)
    expect(latestScrollViewProps?.keyboardShouldPersistTaps).toBe('always')
    expect(latestScrollViewProps?.bounces).toBe(true)
    expect(latestScrollViewProps?.nestedScrollEnabled).toBe(false)

    const flattenedStyle = StyleSheet.flatten(latestScrollViewProps?.contentContainerStyle as any)
    expect(flattenedStyle.paddingBottom).toBe(40)
    expect(flattenedStyle.padding).toBe(16)
  })

  it('fixed snap-point layout stretches content so footer stays at the sheet bottom', () => {
    render(
      <Modal snapPoints={['95%']}>
        <Modal.Header>
          <Text>Header</Text>
        </Modal.Header>
        <Modal.Content>
          <Text>Short Body</Text>
        </Modal.Content>
        <Modal.Footer>
          <Text>Footer</Text>
        </Modal.Footer>
      </Modal>
    )

    const flattenedContainerStyle = StyleSheet.flatten(screen.getByTestId('modal-fixed-container').props.style as any)
    const flattenedScrollStyle = StyleSheet.flatten(latestScrollViewProps?.style as any)

    expect(flattenedContainerStyle.flex).toBe(1)
    expect(flattenedScrollStyle.flex).toBe(1)
  })

  it('backdrop is configured with close-on-press behavior', () => {
    render(
      <Modal>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    expect(latestModalProps?.backdropComponent).toBeDefined()

    const backdrop = render((latestModalProps?.backdropComponent as any)({ animatedIndex: { value: 0 }, animatedPosition: { value: 0 }, style: {} }))
    const backdropNode = backdrop.getByTestId('bottom-sheet-backdrop')
    expect(backdropNode.props.appearsOnIndex).toBe(0)
    expect(backdropNode.props.disappearsOnIndex).toBe(-1)
    expect(backdropNode.props.pressBehavior).toBe('close')
  })

  it('provided snapPoints disable dynamic sizing and are normalized/clamped/sorted/deduped', () => {
    render(
      <Modal snapPoints={['120%', 300, '80%', 300, -10, 'abc']}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    const h = ReactNative.Dimensions.get('window').height
    const maxHeight = Math.round(h * 0.95)
    const eighty = Math.round(h * 0.8)

    expect(latestModalProps?.enableDynamicSizing).toBe(false)
    expect(latestModalProps?.snapPoints).toEqual([1, 300, eighty, maxHeight].sort((a, b) => a - b).filter((v, i, arr) => i === 0 || v !== arr[i - 1]))
  })

  it('all-invalid snapPoints fall back to 95% max height', () => {
    render(
      <Modal snapPoints={['abc', Number.NaN]}>
        <Modal.Content>
          <Text>Body</Text>
        </Modal.Content>
      </Modal>
    )

    const maxHeight = Math.round(ReactNative.Dimensions.get('window').height * 0.95)
    expect(latestModalProps?.enableDynamicSizing).toBe(false)
    expect(latestModalProps?.snapPoints).toEqual([maxHeight])
  })
})
