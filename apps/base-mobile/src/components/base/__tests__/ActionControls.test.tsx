import { fireEvent, render, screen } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { StyleSheet, Text } from 'react-native'
import { screenPaddingBottom } from '../../../theme/layout'
import { AppScreen } from '../AppScreen'
import {
  ActionControl,
  ActionControlsHost,
  ActionControlsProvider,
  ActionControlsRouteScope,
  useActionControlsBottomInset,
} from '../ActionControls'

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 10, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }: { children: ReactNode }) => children,
}))

function ActionControlsHarness({ children }: { children: ReactNode }) {
  return <ActionControlsRouteScope>{children}</ActionControlsRouteScope>
}

function BottomInsetProbe({ testID = 'bottom-inset-value' }: { testID?: string }) {
  const inset = useActionControlsBottomInset()
  return <Text testID={testID}>{String(inset)}</Text>
}

describe('ActionControls', () => {
  it('ActionControl renders nothing inline', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const { toJSON } = render(
      <ActionControl>
        <Text>Inline</Text>
      </ActionControl>
    )

    expect(toJSON()).toBeNull()
    warnSpy.mockRestore()
  })

  it('ActionControlsRouteScope provides host and renders registered controls', () => {
    render(
      <ActionControlsHarness>
        <ActionControl>
          <Text>Verify Report</Text>
        </ActionControl>
      </ActionControlsHarness>
    )

    expect(screen.getByTestId('action-controls-host')).toBeTruthy()
    expect(screen.getByText('Verify Report')).toBeTruthy()
  })

  it('multiple controls preserve sequence order', () => {
    render(
      <ActionControlsHarness>
        <ActionControl testID="first-control">
          <Text>First</Text>
        </ActionControl>
        <ActionControl testID="second-control">
          <Text>Second</Text>
        </ActionControl>
      </ActionControlsHarness>
    )

    const controls = screen.getAllByTestId(/-control$/)
    expect(controls[0].props.testID).toBe('first-control')
    expect(controls[1].props.testID).toBe('second-control')

    const stackStyle = StyleSheet.flatten(screen.getByTestId('action-controls-stack').props.style)
    expect(stackStyle.flexDirection).toBe('column-reverse')
  })

  it('unmount removes a control', () => {
    function Harness({ visible }: { visible: boolean }) {
      return (
        <ActionControlsHarness>
          {visible ? (
            <ActionControl>
              <Text>Visible Control</Text>
            </ActionControl>
          ) : null}
        </ActionControlsHarness>
      )
    }

    const { rerender } = render(<Harness visible />)
    expect(screen.getByText('Visible Control')).toBeTruthy()

    rerender(<Harness visible={false} />)
    expect(screen.queryByText('Visible Control')).toBeNull()
  })

  it('updating children changes rendered content without changing order', () => {
    function Harness({ label }: { label: string }) {
      return (
        <ActionControlsHarness>
          <ActionControl testID="first-control">
            <Text>{label}</Text>
          </ActionControl>
          <ActionControl testID="second-control">
            <Text>Second</Text>
          </ActionControl>
        </ActionControlsHarness>
      )
    }

    const { rerender } = render(<Harness label="First A" />)
    expect(screen.getByText('First A')).toBeTruthy()

    rerender(<Harness label="First B" />)
    expect(screen.getByText('First B')).toBeTruthy()

    const controls = screen.getAllByTestId(/-control$/)
    expect(controls[0].props.testID).toBe('first-control')
    expect(controls[1].props.testID).toBe('second-control')
  })

  it('enabled={false} prevents registration', () => {
    render(
      <ActionControlsHarness>
        <ActionControl enabled={false}>
          <Text>Disabled Control</Text>
        </ActionControl>
      </ActionControlsHarness>
    )

    expect(screen.queryByText('Disabled Control')).toBeNull()
  })

  it('toggling enabled removes and re-adds the control', () => {
    function Harness({ enabled }: { enabled: boolean }) {
      return (
        <ActionControlsHarness>
          <ActionControl enabled={enabled}>
            <Text>Toggle Control</Text>
          </ActionControl>
        </ActionControlsHarness>
      )
    }

    const { rerender } = render(<Harness enabled />)
    expect(screen.getByText('Toggle Control')).toBeTruthy()

    rerender(<Harness enabled={false} />)
    expect(screen.queryByText('Toggle Control')).toBeNull()

    rerender(<Harness enabled />)
    expect(screen.getByText('Toggle Control')).toBeTruthy()
  })

  it('outside-provider usage does not throw', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    expect(() =>
      render(
        <ActionControl>
          <Text>Outside Provider</Text>
        </ActionControl>
      )
    ).not.toThrow()

    warnSpy.mockRestore()
  })

  it('host onLayout updates bottom inset', () => {
    render(
      <ActionControlsHarness>
        <BottomInsetProbe />
        <ActionControl>
          <Text>Inset Control</Text>
        </ActionControl>
      </ActionControlsHarness>
    )

    expect(screen.getByTestId('bottom-inset-value').props.children).toBe('0')

    fireEvent(screen.getByTestId('action-controls-host'), 'layout', {
      nativeEvent: { layout: { height: 40 } },
    })

    expect(screen.getByTestId('bottom-inset-value').props.children).toBe('48')
  })

  it('AppScreen includes action-control bottom inset within same route scope', () => {
    render(
      <ActionControlsHarness>
        <ActionControl>
          <Text>Inset AppScreen Control</Text>
        </ActionControl>
        <AppScreen options={{ insets: { actionControlsBottom: true } }}>
          <Text>Body</Text>
        </AppScreen>
      </ActionControlsHarness>
    )

    fireEvent(screen.getByTestId('action-controls-host'), 'layout', {
      nativeEvent: { layout: { height: 40 } },
    })

    const contentStyle = StyleSheet.flatten(screen.getByTestId('app-screen-scroll-view').props.contentContainerStyle)
    expect(contentStyle.paddingBottom).toBe(screenPaddingBottom + 48)
  })

  it('two independent providers do not share controls or bottom inset', () => {
    render(
      <>
        <ActionControlsProvider>
          <BottomInsetProbe testID="inset-a" />
          <ActionControlsHost />
          <ActionControl>
            <Text>Scope A</Text>
          </ActionControl>
        </ActionControlsProvider>

        <ActionControlsProvider>
          <BottomInsetProbe testID="inset-b" />
          <ActionControlsHost />
          <ActionControl>
            <Text>Scope B</Text>
          </ActionControl>
        </ActionControlsProvider>
      </>
    )

    const hosts = screen.getAllByTestId('action-controls-host')

    fireEvent(hosts[0], 'layout', { nativeEvent: { layout: { height: 30 } } })
    expect(screen.getByTestId('inset-a').props.children).toBe('38')
    expect(screen.getByTestId('inset-b').props.children).toBe('0')

    fireEvent(hosts[1], 'layout', { nativeEvent: { layout: { height: 10 } } })
    expect(screen.getByTestId('inset-a').props.children).toBe('38')
    expect(screen.getByTestId('inset-b').props.children).toBe('18')

    expect(screen.getByText('Scope A')).toBeTruthy()
    expect(screen.getByText('Scope B')).toBeTruthy()
  })

  it('control remains registered while route scope stays mounted', () => {
    function Harness({ label }: { label: string }) {
      return (
        <ActionControlsHarness>
          <ActionControl>
            <Text>Persistent Control</Text>
          </ActionControl>
          <Text>{label}</Text>
        </ActionControlsHarness>
      )
    }

    const { rerender } = render(<Harness label="state-a" />)
    expect(screen.getByText('Persistent Control')).toBeTruthy()

    rerender(<Harness label="state-b" />)
    expect(screen.getByText('Persistent Control')).toBeTruthy()
    expect(screen.getByText('state-b')).toBeTruthy()
  })
})
