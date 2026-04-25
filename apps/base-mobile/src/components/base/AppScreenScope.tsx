import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  AppScreen,
  areAppScreenOptionsEqual,
  mergeAppScreenOptions,
  resolveAppScreenOptions,
  type AppScreenOptions,
} from './AppScreen'

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

export function AppScreenScope({ children, defaultOptions = EMPTY_OPTIONS }: AppScreenScopeProps) {
  const [overrideOptions, setOverrideOptions] = useState<AppScreenOptions | undefined>()

  const setOverrideOptionsSafely = useCallback((nextOptions: AppScreenOptions) => {
    setOverrideOptions((currentOptions) => {
      return areAppScreenOptionsEqual(currentOptions, nextOptions) ? currentOptions : nextOptions
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

  const mergedOptions = useMemo(
    () => resolveAppScreenOptions(mergeAppScreenOptions(defaultOptions, overrideOptions)),
    [defaultOptions, overrideOptions]
  )

  return (
    <AppScreenScopeContext.Provider value={contextValue}>
      <AppScreen options={mergedOptions}>{children}</AppScreen>
    </AppScreenScopeContext.Provider>
  )
}

export function useAppScreenOptions(options: AppScreenOptions) {
  const context = useContext(AppScreenScopeContext)
  const optionsRef = useRef<AppScreenOptions>(options)

  if (!areAppScreenOptionsEqual(optionsRef.current, options)) {
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
