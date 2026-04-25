import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AppScreen, type AppScreenOptions } from './AppScreen'

type AppScreenScopeProps = {
  children: ReactNode
  defaultOptions?: AppScreenOptions
}

type AppScreenScopeContextValue = {
  setOverrideOptions: (options: AppScreenOptions) => void
  clearOverrideOptions: () => void
}

const EMPTY_OPTIONS: AppScreenOptions = {}
const AppScreenScopeContext = createContext<AppScreenScopeContextValue | null>(null)

function shallowEqualObjects(
  left: Record<string, unknown>,
  right: Record<string, unknown>
) {
  const leftKeys = Object.keys(left)
  const rightKeys = Object.keys(right)
  if (leftKeys.length !== rightKeys.length) return false
  for (const key of leftKeys) {
    if (left[key] !== right[key]) return false
  }
  return true
}

export function AppScreenScope({ children, defaultOptions = EMPTY_OPTIONS }: AppScreenScopeProps) {
  const [overrideOptions, setOverrideOptions] = useState<AppScreenOptions | undefined>()

  const setOverrideOptionsSafely = useCallback((nextOptions: AppScreenOptions) => {
    setOverrideOptions((currentOptions) => {
      const current = (currentOptions || EMPTY_OPTIONS) as Record<string, unknown>
      const next = (nextOptions || EMPTY_OPTIONS) as Record<string, unknown>
      return shallowEqualObjects(current, next) ? currentOptions : nextOptions
    })
  }, [])

  const clearOverrideOptions = useCallback(() => {
    setOverrideOptions((currentOptions) => (currentOptions === undefined ? currentOptions : undefined))
  }, [])

  const contextValue = useMemo<AppScreenScopeContextValue>(
    () => ({
      setOverrideOptions: setOverrideOptionsSafely,
      clearOverrideOptions,
    }),
    [clearOverrideOptions, setOverrideOptionsSafely]
  )

  const mergedOptions = useMemo(() => ({ ...defaultOptions, ...overrideOptions }), [defaultOptions, overrideOptions])

  return (
    <AppScreenScopeContext.Provider value={contextValue}>
      <AppScreen {...mergedOptions}>{children}</AppScreen>
    </AppScreenScopeContext.Provider>
  )
}

export function useAppScreenOptions(options: AppScreenOptions) {
  const context = useContext(AppScreenScopeContext)
  const optionsRef = useRef<AppScreenOptions>(options)

  if (!shallowEqualObjects(optionsRef.current as Record<string, unknown>, options as Record<string, unknown>)) {
    optionsRef.current = options
  }
  const stableOptions = optionsRef.current

  useEffect(() => {
    if (!context) return

    context.setOverrideOptions(stableOptions)
    return () => {
      context.clearOverrideOptions()
    }
  }, [context, stableOptions])
}
