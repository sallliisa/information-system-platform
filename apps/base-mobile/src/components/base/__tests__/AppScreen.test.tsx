import { render, screen } from '@testing-library/react-native'
import { Text, StyleSheet } from 'react-native'
import {
  APP_SCREEN_DEFAULT_OPTIONS,
  AppScreen,
  areAppScreenOptionsEqual,
  resolveAppScreenOptions,
  resolveEdgePadding,
} from '../AppScreen'
import { AppScreenScope, useAppScreenOptions } from '../AppScreenScope'

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 10, right: 4, bottom: 6, left: 2 }),
  SafeAreaProvider: ({ children }: { children: any }) => children,
}))

function HookedScreen({ options }: { options: Parameters<typeof useAppScreenOptions>[0] }) {
  useAppScreenOptions(options)
  return <Text>Body</Text>
}

describe('AppScreen resolvers', () => {
  it('resolves to baseline defaults without overrides', () => {
    expect(resolveAppScreenOptions()).toEqual(APP_SCREEN_DEFAULT_OPTIONS)
  })

  it('scope-like partial options override baseline values', () => {
    const resolved = resolveAppScreenOptions({
      safeArea: { top: false },
      layout: { scrollable: false },
    })

    expect(resolved.safeArea.top).toBe(false)
    expect(resolved.layout.scrollable).toBe(false)
    expect(resolved.padding.bottom).toBe(APP_SCREEN_DEFAULT_OPTIONS.padding.bottom)
  })

  it('later layers deep-merge without removing sibling keys', () => {
    const resolved = resolveAppScreenOptions(
      {
        scrollView: {
          bounces: false,
          keyboardShouldPersistTaps: 'always',
        },
      },
      {
        scrollView: {
          showsVerticalScrollIndicator: false,
        },
      }
    )

    expect(resolved.scrollView.bounces).toBe(false)
    expect(resolved.scrollView.keyboardShouldPersistTaps).toBe('always')
    expect(resolved.scrollView.showsVerticalScrollIndicator).toBe(false)
    expect(resolved.scrollView.showsHorizontalScrollIndicator).toBe(true)
  })

  it('resolveEdgePadding follows per-edge safe-area and extra inset formula', () => {
    const options = resolveAppScreenOptions({
      safeArea: { top: true, right: true, bottom: false, left: false },
      padding: { top: 1, right: 2, bottom: 3, left: 4 },
      insets: {
        actionControlsBottom: true,
        extra: { top: 5, right: 6, bottom: 7, left: 8 },
      },
    })

    const edgePadding = resolveEdgePadding(
      options,
      { top: 10, right: 11, bottom: 12, left: 13 },
      9
    )

    expect(edgePadding).toEqual({
      top: 16,
      right: 19,
      bottom: 19,
      left: 12,
    })
  })

  it('areAppScreenOptionsEqual handles deep nested comparison', () => {
    expect(
      areAppScreenOptionsEqual(
        { scrollView: { bounces: false, keyboardDismissMode: 'interactive' } },
        { scrollView: { bounces: false, keyboardDismissMode: 'interactive' } }
      )
    ).toBe(true)

    expect(
      areAppScreenOptionsEqual(
        { scrollView: { bounces: false } },
        { scrollView: { bounces: true } }
      )
    ).toBe(false)
  })
})

describe('AppScreen rendering', () => {
  it('renders ScrollView by default', () => {
    render(
      <AppScreen>
        <Text>Body</Text>
      </AppScreen>
    )

    expect(screen.getByTestId('app-screen-scroll-view')).toBeTruthy()
    expect(screen.queryByTestId('app-screen-view')).toBeNull()
  })

  it('renders View when layout.scrollable is false', () => {
    render(
      <AppScreen options={{ layout: { scrollable: false } }}>
        <Text>Body</Text>
      </AppScreen>
    )

    expect(screen.getByTestId('app-screen-view')).toBeTruthy()
    expect(screen.queryByTestId('app-screen-scroll-view')).toBeNull()
  })

  it('applies per-edge padding and safe-area toggles', () => {
    render(
      <AppScreen
        options={{
          safeArea: { top: false, right: true, bottom: false, left: true },
          padding: { top: 100, right: 200, bottom: 300, left: 400 },
        }}
      >
        <Text>Body</Text>
      </AppScreen>
    )

    const contentStyle = StyleSheet.flatten(screen.getByTestId('app-screen-scroll-view').props.contentContainerStyle)
    expect(contentStyle.paddingTop).toBe(100)
    expect(contentStyle.paddingRight).toBe(204)
    expect(contentStyle.paddingBottom).toBe(300)
    expect(contentStyle.paddingLeft).toBe(402)
  })

  it('forwards ScrollView behavior options', () => {
    render(
      <AppScreen
        options={{
          scrollView: {
            keyboardShouldPersistTaps: 'always',
            keyboardDismissMode: 'on-drag',
            bounces: false,
            showsVerticalScrollIndicator: false,
            showsHorizontalScrollIndicator: false,
          },
        }}
      >
        <Text>Body</Text>
      </AppScreen>
    )

    const list = screen.getByTestId('app-screen-scroll-view')
    expect(list.props.keyboardShouldPersistTaps).toBe('always')
    expect(list.props.keyboardDismissMode).toBe('on-drag')
    expect(list.props.bounces).toBe(false)
    expect(list.props.showsVerticalScrollIndicator).toBe(false)
    expect(list.props.showsHorizontalScrollIndicator).toBe(false)
  })
})

describe('AppScreenScope and useAppScreenOptions', () => {
  it('uses scope defaults without hook override', () => {
    render(
      <AppScreenScope defaultOptions={{ layout: { scrollable: false } }}>
        <Text>Body</Text>
      </AppScreenScope>
    )

    expect(screen.getByTestId('app-screen-view')).toBeTruthy()
  })

  it('hook override wins over scope defaults', () => {
    render(
      <AppScreenScope defaultOptions={{ layout: { scrollable: true } }}>
        <HookedScreen options={{ layout: { scrollable: false } }} />
      </AppScreenScope>
    )

    expect(screen.getByTestId('app-screen-view')).toBeTruthy()
  })

  it('hook updates propagate for nested options changes', () => {
    const { rerender } = render(
      <AppScreenScope defaultOptions={{ scrollView: { bounces: true } }}>
        <HookedScreen options={{ scrollView: { bounces: false } }} />
      </AppScreenScope>
    )

    expect(screen.getByTestId('app-screen-scroll-view').props.bounces).toBe(false)

    rerender(
      <AppScreenScope defaultOptions={{ scrollView: { bounces: true } }}>
        <HookedScreen options={{ scrollView: { bounces: true } }} />
      </AppScreenScope>
    )

    expect(screen.getByTestId('app-screen-scroll-view').props.bounces).toBe(true)
  })

  it('resets override options after hook consumer unmounts', () => {
    const { rerender } = render(
      <AppScreenScope defaultOptions={{ layout: { scrollable: true } }}>
        <HookedScreen options={{ layout: { scrollable: false } }} />
      </AppScreenScope>
    )

    expect(screen.getByTestId('app-screen-view')).toBeTruthy()

    rerender(
      <AppScreenScope defaultOptions={{ layout: { scrollable: true } }}>
        <Text>Body</Text>
      </AppScreenScope>
    )

    expect(screen.getByTestId('app-screen-scroll-view')).toBeTruthy()
  })

  it('is safe when called outside AppScreenScope', () => {
    function OutsideScope() {
      useAppScreenOptions({ layout: { scrollable: false } })
      return <Text>Body</Text>
    }

    expect(() => render(<OutsideScope />)).not.toThrow()
    expect(screen.getByText('Body')).toBeTruthy()
  })
})
