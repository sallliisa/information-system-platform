import { fireEvent, render, screen, waitFor } from '@testing-library/react-native'
import { useState } from 'react'
import { Animated, Dimensions, Pressable, StyleSheet, Text, UIManager } from 'react-native'
import { Popover, computePopoverPosition } from '../Popover'

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }: { children: any }) => children,
}))

describe('Popover', () => {
  let measuredRect = { x: 0, y: 0, width: 0, height: 0 }

  beforeEach(() => {
    measuredRect = { x: 0, y: 0, width: 0, height: 0 }

    jest.spyOn(Animated, 'timing').mockImplementation((value: any, config: any) => {
      return {
        start: (callback?: (result: { finished: boolean }) => void) => {
          value.setValue(config.toValue)
          callback?.({ finished: true })
        },
        stop: jest.fn(),
        reset: jest.fn(),
      } as any
    })

    ;(UIManager as any).measureInWindow = jest.fn((_node: number, callback: any) => {
      callback(measuredRect.x, measuredRect.y, measuredRect.width, measuredRect.height)
    })
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  async function openWithLayout(layout: { x: number; y: number; width: number; height: number }, size = { width: 140, height: 80 }) {
    measuredRect = layout
    fireEvent.press(screen.getByText('Open'))

    await waitFor(() => {
      expect(screen.getByTestId('popover-content')).toBeTruthy()
    })

    fireEvent(screen.getByTestId('popover-trigger-anchor'), 'layout', {
      nativeEvent: { layout },
    })

    fireEvent(screen.getByTestId('popover-content'), 'layout', {
      nativeEvent: { layout: size },
    })
  }

  it('opens and closes in uncontrolled mode using trigger and setOpen', async () => {
    const onOpenChange = jest.fn()

    render(
      <Popover onOpenChange={onOpenChange}>
        <Popover.Trigger>
          <Text>Open</Text>
        </Popover.Trigger>
        <Popover.Content>
          {({ setOpen }) => (
            <Pressable onPress={() => setOpen(false)}>
              <Text>Close From Content</Text>
            </Pressable>
          )}
        </Popover.Content>
      </Popover>
    )

    await openWithLayout({ x: 40, y: 120, width: 70, height: 30 })

    expect(onOpenChange).toHaveBeenCalledWith(true)
    expect(screen.getByText('Close From Content')).toBeTruthy()

    fireEvent.press(screen.getByText('Close From Content'))

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('syncs controlled open and emits onOpenChange, onOpen, and onClose', async () => {
    const onOpen = jest.fn()
    const onClose = jest.fn()

    function ControlledHarness() {
      const [open, setOpen] = useState(false)
      return (
        <Popover open={open} onOpenChange={setOpen} onOpen={onOpen} onClose={onClose}>
          <Popover.Trigger>
            <Text>Open</Text>
          </Popover.Trigger>
          <Popover.Content>
            <Text>Body</Text>
          </Popover.Content>
        </Popover>
      )
    }

    render(<ControlledHarness />)

    await openWithLayout({ x: 20, y: 80, width: 50, height: 24 })

    expect(onOpen).toHaveBeenCalledTimes(1)

    fireEvent.press(screen.getByTestId('popover-backdrop'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('does not open when disabled', () => {
    const onOpenChange = jest.fn()

    render(
      <Popover disabled onOpenChange={onOpenChange}>
        <Popover.Trigger>
          <Text>Open</Text>
        </Popover.Trigger>
        <Popover.Content>
          <Text>Body</Text>
        </Popover.Content>
      </Popover>
    )

    fireEvent.press(screen.getByText('Open'))

    expect(onOpenChange).not.toHaveBeenCalled()
    expect(screen.queryByTestId('popover-content')).toBeNull()
  })

  it('passes setOpen to render-prop trigger', async () => {
    render(
      <Popover>
        <Popover.Trigger>
          {({ setOpen }) => (
            <Pressable testID="open-from-render-prop" onPress={() => setOpen(true)}>
              <Text>Open</Text>
            </Pressable>
          )}
        </Popover.Trigger>
        <Popover.Content>
          <Text>Body</Text>
        </Popover.Content>
      </Popover>
    )

    fireEvent.press(screen.getByTestId('open-from-render-prop'))

    await waitFor(() => {
      expect(screen.getByTestId('popover-content')).toBeTruthy()
    })
  })

  it('closes on outside press and Android onRequestClose', async () => {
    const onOpenChange = jest.fn()

    render(
      <Popover onOpenChange={onOpenChange}>
        <Popover.Trigger>
          <Text>Open</Text>
        </Popover.Trigger>
        <Popover.Content>
          <Text>Body</Text>
        </Popover.Content>
      </Popover>
    )

    await openWithLayout({ x: 20, y: 100, width: 60, height: 28 })

    fireEvent.press(screen.getByTestId('popover-backdrop'))
    expect(onOpenChange).toHaveBeenLastCalledWith(false)

    await openWithLayout({ x: 20, y: 100, width: 60, height: 28 })

    fireEvent(screen.getByTestId('popover-modal'), 'onRequestClose')
    expect(onOpenChange).toHaveBeenLastCalledWith(false)
  })

  it('computePopoverPosition returns expected bottom/start placement', () => {
    const position = computePopoverPosition({
      triggerRect: { x: 40, y: 120, width: 70, height: 30 },
      contentSize: { width: 140, height: 80 },
      windowSize: { width: 360, height: 640 },
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
      side: 'bottom',
      align: 'start',
      sideOffset: 4,
      alignOffset: 0,
      screenPadding: 8,
    })

    expect(position.resolvedSide).toBe('bottom')
    expect(position.top).toBe(154)
    expect(position.left).toBe(40)
  })

  it('computePopoverPosition returns expected top/end placement', () => {
    const position = computePopoverPosition({
      triggerRect: { x: 140, y: 180, width: 60, height: 30 },
      contentSize: { width: 110, height: 70 },
      windowSize: { width: 360, height: 640 },
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
      side: 'top',
      align: 'end',
      sideOffset: 4,
      alignOffset: 0,
      screenPadding: 8,
    })

    expect(position.resolvedSide).toBe('top')
    expect(position.top).toBe(106)
    expect(position.left).toBe(90)
  })

  it('computePopoverPosition flips and clamps when preferred side overflows', () => {
    const position = computePopoverPosition({
      triggerRect: { x: 340, y: 610, width: 18, height: 20 },
      contentSize: { width: 140, height: 120 },
      windowSize: { width: 360, height: 640 },
      insets: { top: 0, right: 0, bottom: 0, left: 0 },
      side: 'bottom',
      align: 'start',
      sideOffset: 4,
      alignOffset: 0,
      screenPadding: 8,
    })

    expect(position.resolvedSide).toBe('top')
    expect(position.top).toBe(486)
    expect(position.left).toBe(212)
  })

  it('applies full width mode with screen padding', async () => {
    render(
      <Popover width="full" screenPadding={12}>
        <Popover.Trigger>
          <Text>Open</Text>
        </Popover.Trigger>
        <Popover.Content>
          <Text>Body</Text>
        </Popover.Content>
      </Popover>
    )

    await openWithLayout({ x: 40, y: 120, width: 70, height: 30 }, { width: 140, height: 80 })

    const expectedWidth = Math.max(0, Dimensions.get('window').width - 24)
    const flattened = StyleSheet.flatten(screen.getByTestId('popover-content').props.style) as { width?: number }

    expect(flattened.width).toBe(expectedWidth)
  })

  it('applies custom maxHeight when provided', async () => {
    render(
      <Popover maxHeight={180}>
        <Popover.Trigger>
          <Text>Open</Text>
        </Popover.Trigger>
        <Popover.Content>
          <Text>Body</Text>
        </Popover.Content>
      </Popover>
    )

    await openWithLayout({ x: 40, y: 120, width: 70, height: 30 }, { width: 140, height: 80 })

    const flattened = StyleSheet.flatten(screen.getByTestId('popover-content').props.style) as { maxHeight?: number }
    expect(flattened.maxHeight).toBe(180)
  })

  it('clamps custom maxHeight to viewport limit', async () => {
    render(
      <Popover maxHeight={2000} screenPadding={16}>
        <Popover.Trigger>
          <Text>Open</Text>
        </Popover.Trigger>
        <Popover.Content>
          <Text>Body</Text>
        </Popover.Content>
      </Popover>
    )

    await openWithLayout({ x: 40, y: 120, width: 70, height: 30 }, { width: 140, height: 80 })

    const flattened = StyleSheet.flatten(screen.getByTestId('popover-content').props.style) as { maxHeight?: number }
    const expectedViewportMax = Math.max(0, Dimensions.get('window').height - 32)
    expect(flattened.maxHeight).toBe(expectedViewportMax)
  })
})
