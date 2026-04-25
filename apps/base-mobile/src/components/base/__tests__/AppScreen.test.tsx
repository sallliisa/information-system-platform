import { render, screen } from '@testing-library/react-native'
import { Text, StyleSheet } from 'react-native'
import { screenPaddingTop } from '../../../theme/layout'
import { AppScreen } from '../AppScreen'
import { AppScreenScope, useAppScreenOptions } from '../AppScreenScope'

jest.mock('react-native-safe-area-context', () => ({
  useSafeAreaInsets: () => ({ top: 10, right: 0, bottom: 0, left: 0 }),
  SafeAreaProvider: ({ children }: { children: any }) => children,
}))

function HookedScreen({ scrollable }: { scrollable: boolean }) {
  useAppScreenOptions({ scrollable })
  return <Text>Body</Text>
}

describe('AppScreen', () => {
  it('renders ScrollView by default', () => {
    render(
      <AppScreen>
        <Text>Body</Text>
      </AppScreen>
    )

    expect(screen.getByTestId('app-screen-scroll-view')).toBeTruthy()
    expect(screen.queryByTestId('app-screen-view')).toBeNull()
  })

  it('renders View when scrollable is false', () => {
    render(
      <AppScreen scrollable={false}>
        <Text>Body</Text>
      </AppScreen>
    )

    expect(screen.getByTestId('app-screen-view')).toBeTruthy()
    expect(screen.queryByTestId('app-screen-scroll-view')).toBeNull()
  })

  it('applies inset and padding options', () => {
    render(
      <AppScreen includeTopInset={false} includeHorizontalPadding={false} includeBottomPadding={false}>
        <Text>Body</Text>
      </AppScreen>
    )

    const contentStyle = StyleSheet.flatten(screen.getByTestId('app-screen-scroll-view').props.contentContainerStyle)
    expect(contentStyle.paddingTop).toBe(screenPaddingTop)
    expect(contentStyle.paddingBottom).toBe(0)
    expect(contentStyle.paddingHorizontal).toBe(0)
  })

  it('adds top safe area inset when includeTopInset is true', () => {
    render(
      <AppScreen includeTopInset>
        <Text>Body</Text>
      </AppScreen>
    )

    const contentStyle = StyleSheet.flatten(screen.getByTestId('app-screen-scroll-view').props.contentContainerStyle)
    expect(contentStyle.paddingTop).toBe(screenPaddingTop + 10)
  })
})

describe('AppScreenScope and useAppScreenOptions', () => {
  it('uses default options without hook override', () => {
    render(
      <AppScreenScope defaultOptions={{ scrollable: false }}>
        <Text>Body</Text>
      </AppScreenScope>
    )

    expect(screen.getByTestId('app-screen-view')).toBeTruthy()
  })

  it('applies hook override options', () => {
    render(
      <AppScreenScope defaultOptions={{ scrollable: true }}>
        <HookedScreen scrollable={false} />
      </AppScreenScope>
    )

    expect(screen.getByTestId('app-screen-view')).toBeTruthy()
  })

  it('resets override options after hook consumer unmounts', () => {
    const { rerender } = render(
      <AppScreenScope defaultOptions={{ scrollable: true }}>
        <HookedScreen scrollable={false} />
      </AppScreenScope>
    )

    expect(screen.getByTestId('app-screen-view')).toBeTruthy()

    rerender(
      <AppScreenScope defaultOptions={{ scrollable: true }}>
        <Text>Body</Text>
      </AppScreenScope>
    )

    expect(screen.getByTestId('app-screen-scroll-view')).toBeTruthy()
  })

  it('updates override when hook options change', () => {
    const { rerender } = render(
      <AppScreenScope defaultOptions={{ scrollable: true }}>
        <HookedScreen scrollable={false} />
      </AppScreenScope>
    )

    expect(screen.getByTestId('app-screen-view')).toBeTruthy()

    rerender(
      <AppScreenScope defaultOptions={{ scrollable: true }}>
        <HookedScreen scrollable />
      </AppScreenScope>
    )

    expect(screen.getByTestId('app-screen-scroll-view')).toBeTruthy()
  })

  it('is safe when called outside AppScreenScope', () => {
    function OutsideScope() {
      useAppScreenOptions({ scrollable: false })
      return <Text>Body</Text>
    }

    expect(() => render(<OutsideScope />)).not.toThrow()
    expect(screen.getByText('Body')).toBeTruthy()
  })
})
