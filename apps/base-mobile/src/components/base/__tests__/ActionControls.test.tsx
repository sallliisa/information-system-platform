import { act, fireEvent, render, screen } from '@testing-library/react-native'
import { StyleSheet, Text } from 'react-native'
import { screenPaddingBottom } from '../../../theme/layout'
import { AppScreen } from '../AppScreen'
import {
  ActionControl,
  ActionControlsHost,
  ActionControlsProvider,
  useActionControlsBottomInset,
} from '../ActionControls'

const mockUseIsFocused = jest.fn(() => true)

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockUseIsFocused(),
}))

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 10, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}))

function ActionControlsHarness({ children }: { children: React.ReactNode }) {
  return (
    <ActionControlsProvider>
      <ActionControlsHost />
      {children}
    </ActionControlsProvider>
  )
}

function BottomInsetProbe() {
  const inset = useActionControlsBottomInset()
  return <Text testID="bottom-inset-value">{String(inset)}</Text>
}

describe('ActionControls', () => {
  beforeEach(() => {
    mockUseIsFocused.mockReturnValue(true)
  })

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

  it('registered child appears in ActionControlsHost', () => {
    render(
      <ActionControlsHarness>
        <ActionControl>
          <Text>Verify Report</Text>
        </ActionControl>
      </ActionControlsHarness>
    )

    expect(screen.getByText('Verify Report')).toBeTruthy()
  })

  it('multiple controls render bottom-up with latest visually above earlier controls', () => {
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

  it('unmounting a registering component removes its control', () => {
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

  it('AppScreen includes action-control bottom inset in content padding', () => {
    render(
      <ActionControlsHarness>
        <ActionControl>
          <Text>Inset AppScreen Control</Text>
        </ActionControl>
        <AppScreen>
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

  it('focus gating only registers while focused', () => {
    function Harness() {
      return (
        <ActionControlsHarness>
          <ActionControl>
            <Text>Focused Control</Text>
          </ActionControl>
        </ActionControlsHarness>
      )
    }

    mockUseIsFocused.mockReturnValue(false)
    const { rerender } = render(<Harness />)
    expect(screen.queryByText('Focused Control')).toBeNull()

    mockUseIsFocused.mockReturnValue(true)
    act(() => {
      rerender(<Harness />)
    })
    expect(screen.getByText('Focused Control')).toBeTruthy()
  })
})
