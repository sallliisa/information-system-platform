import { act, render, screen } from '@testing-library/react-native'
import type { ReactNode } from 'react'
import { Text } from 'react-native'
import { HeaderAction, HeaderActionHost, HeaderActionsProvider } from '../HeaderActions'

type NavigationEventName = 'transitionStart' | 'gestureCancel'
type TransitionStartEvent = { data?: { closing?: boolean } }

type NavigationListenerMap = {
  transitionStart: Set<(event: TransitionStartEvent) => void>
  gestureCancel: Set<() => void>
}

const mockUseIsFocused = jest.fn(() => true)
const mockRouteKey = jest.fn(() => 'route-a')

const navigationListeners: NavigationListenerMap = {
  transitionStart: new Set(),
  gestureCancel: new Set(),
}

const mockNavigation = {
  addListener: jest.fn((eventName: NavigationEventName, callback: ((event: TransitionStartEvent) => void) | (() => void)) => {
    const listenerSet = navigationListeners[eventName]
    listenerSet.add(callback as never)

    return () => {
      listenerSet.delete(callback as never)
    }
  }),
}

jest.mock('@react-navigation/native', () => ({
  useIsFocused: () => mockUseIsFocused(),
  useNavigation: () => mockNavigation,
  useRoute: () => ({ key: mockRouteKey() }),
}))

function emitTransitionStart(event?: TransitionStartEvent) {
  act(() => {
    navigationListeners.transitionStart.forEach((listener) => {
      listener(event || {})
    })
  })
}

function emitGestureCancel() {
  act(() => {
    navigationListeners.gestureCancel.forEach((listener) => {
      listener()
    })
  })
}

function HeaderActionsHarness({
  children,
  hostRouteKey = 'route-a',
}: {
  children: ReactNode
  hostRouteKey?: string
}) {
  return (
    <HeaderActionsProvider>
      <HeaderActionHost routeKey={hostRouteKey} />
      {children}
    </HeaderActionsProvider>
  )
}

describe('HeaderActions', () => {
  beforeEach(() => {
    mockUseIsFocused.mockReturnValue(true)
    mockRouteKey.mockReset()
    mockRouteKey.mockReturnValue('route-a')
    mockNavigation.addListener.mockClear()
    navigationListeners.transitionStart.clear()
    navigationListeners.gestureCancel.clear()
  })

  it('HeaderAction renders nothing inline', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const { toJSON } = render(
      <HeaderAction>
        <Text>Inline</Text>
      </HeaderAction>
    )

    expect(toJSON()).toBeNull()
    warnSpy.mockRestore()
  })

  it('host renders matching route action', () => {
    mockRouteKey.mockReturnValue('detail-route')

    render(
      <HeaderActionsHarness hostRouteKey="detail-route">
        <HeaderAction>
          <Text>Edit</Text>
        </HeaderAction>
      </HeaderActionsHarness>
    )

    expect(screen.getByText('Edit')).toBeTruthy()
  })

  it('host does not render different route action', () => {
    mockRouteKey.mockReturnValue('detail-route')

    render(
      <HeaderActionsHarness hostRouteKey="list-route">
        <HeaderAction>
          <Text>Edit</Text>
        </HeaderAction>
      </HeaderActionsHarness>
    )

    expect(screen.queryByText('Edit')).toBeNull()
  })

  it('latest registration wins only within same route', () => {
    mockRouteKey.mockReturnValue('detail-route')

    render(
      <HeaderActionsHarness hostRouteKey="detail-route">
        <HeaderAction>
          <Text>First</Text>
        </HeaderAction>
        <HeaderAction>
          <Text>Second</Text>
        </HeaderAction>
      </HeaderActionsHarness>
    )

    expect(screen.queryByText('First')).toBeNull()
    expect(screen.getByText('Second')).toBeTruthy()
  })

  it('different route registrations do not compete', () => {
    mockRouteKey
      .mockReturnValueOnce('list-route')
      .mockReturnValueOnce('detail-route')
      .mockReturnValue('detail-route')

    render(
      <HeaderActionsProvider>
        <HeaderActionHost routeKey="list-route" />
        <HeaderActionHost routeKey="detail-route" />
        <HeaderAction>
          <Text>List Action</Text>
        </HeaderAction>
        <HeaderAction>
          <Text>Detail Action</Text>
        </HeaderAction>
      </HeaderActionsProvider>
    )

    expect(screen.getByText('List Action')).toBeTruthy()
    expect(screen.getByText('Detail Action')).toBeTruthy()
  })

  it('push transition bug regression: list host does not render detail action', () => {
    mockRouteKey.mockReturnValue('detail-route')

    render(
      <HeaderActionsHarness hostRouteKey="list-route">
        <HeaderAction>
          <Text>Edit</Text>
        </HeaderAction>
      </HeaderActionsHarness>
    )

    expect(screen.queryByText('Edit')).toBeNull()
  })

  it('swipe-back bug regression: list host never renders detail action', () => {
    mockRouteKey.mockReturnValue('detail-route')

    render(
      <HeaderActionsHarness hostRouteKey="list-route">
        <HeaderAction>
          <Text>Edit</Text>
        </HeaderAction>
      </HeaderActionsHarness>
    )

    expect(screen.queryByText('Edit')).toBeNull()
  })

  it('when latest registration unmounts, previous registration becomes active', () => {
    mockRouteKey.mockReturnValue('detail-route')

    function Harness({ showLatest }: { showLatest: boolean }) {
      return (
        <HeaderActionsHarness hostRouteKey="detail-route">
          <HeaderAction>
            <Text>First</Text>
          </HeaderAction>
          {showLatest ? (
            <HeaderAction>
              <Text>Second</Text>
            </HeaderAction>
          ) : null}
        </HeaderActionsHarness>
      )
    }

    const { rerender } = render(<Harness showLatest />)
    expect(screen.getByText('Second')).toBeTruthy()

    rerender(<Harness showLatest={false} />)
    expect(screen.getByText('First')).toBeTruthy()
    expect(screen.queryByText('Second')).toBeNull()
  })

  it('updating children changes content without changing active order', () => {
    mockRouteKey.mockReturnValue('detail-route')

    function Harness({ label }: { label: string }) {
      return (
        <HeaderActionsHarness hostRouteKey="detail-route">
          <HeaderAction>
            <Text>First</Text>
          </HeaderAction>
          <HeaderAction>
            <Text>{label}</Text>
          </HeaderAction>
        </HeaderActionsHarness>
      )
    }

    const { rerender } = render(<Harness label="Second A" />)
    expect(screen.getByText('Second A')).toBeTruthy()

    rerender(<Harness label="Second B" />)
    expect(screen.getByText('Second B')).toBeTruthy()
    expect(screen.queryByText('First')).toBeNull()
  })

  it('enabled={false} prevents registration', () => {
    mockRouteKey.mockReturnValue('detail-route')

    render(
      <HeaderActionsHarness hostRouteKey="detail-route">
        <HeaderAction enabled={false}>
          <Text>Disabled</Text>
        </HeaderAction>
      </HeaderActionsHarness>
    )

    expect(screen.queryByText('Disabled')).toBeNull()
  })

  it('toggling enabled removes and re-adds as latest', () => {
    mockRouteKey.mockReturnValue('detail-route')

    function Harness({ latestEnabled }: { latestEnabled: boolean }) {
      return (
        <HeaderActionsHarness hostRouteKey="detail-route">
          <HeaderAction>
            <Text>First</Text>
          </HeaderAction>
          <HeaderAction enabled={latestEnabled}>
            <Text>Second</Text>
          </HeaderAction>
        </HeaderActionsHarness>
      )
    }

    const { rerender } = render(<Harness latestEnabled />)
    expect(screen.getByText('Second')).toBeTruthy()

    rerender(<Harness latestEnabled={false} />)
    expect(screen.getByText('First')).toBeTruthy()

    rerender(<Harness latestEnabled />)
    expect(screen.getByText('Second')).toBeTruthy()
    expect(screen.queryByText('First')).toBeNull()
  })

  it('unfocused route does not register', () => {
    mockRouteKey.mockReturnValue('detail-route')

    function Harness() {
      return (
        <HeaderActionsHarness hostRouteKey="detail-route">
          <HeaderAction>
            <Text>Focused Action</Text>
          </HeaderAction>
        </HeaderActionsHarness>
      )
    }

    mockUseIsFocused.mockReturnValue(false)
    const { rerender } = render(<Harness />)
    expect(screen.queryByText('Focused Action')).toBeNull()

    mockUseIsFocused.mockReturnValue(true)
    rerender(<Harness />)
    expect(screen.getByText('Focused Action')).toBeTruthy()
  })

  it('outside-provider usage does not throw', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})

    expect(() =>
      render(
        <HeaderAction>
          <Text>Outside Provider</Text>
        </HeaderAction>
      )
    ).not.toThrow()

    warnSpy.mockRestore()
  })

  it('host renders null when no active registration', () => {
    const { toJSON } = render(
      <HeaderActionsProvider>
        <HeaderActionHost routeKey="route-a" />
      </HeaderActionsProvider>
    )

    expect(toJSON()).toBeNull()
  })

  it('closing transition still unregisters own route action', () => {
    mockRouteKey.mockReturnValue('detail-route')

    render(
      <HeaderActionsHarness hostRouteKey="detail-route">
        <HeaderAction>
          <Text>Edit</Text>
        </HeaderAction>
      </HeaderActionsHarness>
    )

    expect(screen.getByText('Edit')).toBeTruthy()

    emitTransitionStart({ data: { closing: true } })
    expect(screen.queryByText('Edit')).toBeNull()
  })

  it('cancelled gesture restores own route action', () => {
    mockRouteKey.mockReturnValue('detail-route')

    render(
      <HeaderActionsHarness hostRouteKey="detail-route">
        <HeaderAction>
          <Text>Edit</Text>
        </HeaderAction>
      </HeaderActionsHarness>
    )

    emitTransitionStart({ data: { closing: true } })
    expect(screen.queryByText('Edit')).toBeNull()

    emitGestureCancel()
    expect(screen.getByText('Edit')).toBeTruthy()
  })

  it('non-closing transition restores the action', () => {
    mockRouteKey.mockReturnValue('detail-route')

    render(
      <HeaderActionsHarness hostRouteKey="detail-route">
        <HeaderAction>
          <Text>Edit</Text>
        </HeaderAction>
      </HeaderActionsHarness>
    )

    emitTransitionStart({ data: { closing: true } })
    expect(screen.queryByText('Edit')).toBeNull()

    emitTransitionStart({ data: { closing: false } })
    expect(screen.getByText('Edit')).toBeTruthy()
  })

  it('cancelled swipe-back does not restore if focus is false', () => {
    mockRouteKey.mockReturnValue('detail-route')

    function Harness() {
      return (
        <HeaderActionsHarness hostRouteKey="detail-route">
          <HeaderAction>
            <Text>Edit</Text>
          </HeaderAction>
        </HeaderActionsHarness>
      )
    }

    const { rerender } = render(<Harness />)
    expect(screen.getByText('Edit')).toBeTruthy()

    emitTransitionStart({ data: { closing: true } })
    expect(screen.queryByText('Edit')).toBeNull()

    mockUseIsFocused.mockReturnValue(false)
    rerender(<Harness />)

    emitGestureCancel()
    expect(screen.queryByText('Edit')).toBeNull()
  })
})
