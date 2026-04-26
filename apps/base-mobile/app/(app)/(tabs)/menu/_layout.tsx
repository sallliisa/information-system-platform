import { Stack, useRouter } from 'expo-router'
import { useMemo } from 'react'
import { Platform, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ActionControlsRouteScope, AppScreenScope, HeaderActionHost, HeaderActionsProvider } from '../../../../src/components/base'
import { CRUDRouteHeader } from '../../../../src/components/composites/CRUD'
import { getCatalogEntry, getMobileRouteCatalog } from '../../../../src/features/routes/catalog.index'
import { navigateBackOrFallback } from '../../../../src/features/routes/navigation.policy'
import { pickRouteParam } from '../../../../src/features/routes/route-params'
import { MENU_ROUTE } from '../../../../src/lib/routes'
import { materialColors } from '../../../../src/theme/material'

function resolveMenuHeader(routeName: string, modelTitle?: string, listHref?: string) {
  const finalModelTitle = modelTitle || 'Model'
  const fallbackListHref = listHref || MENU_ROUTE

  switch (routeName) {
    case '[module]/[model]/index': {
      return { title: finalModelTitle, fallbackHref: MENU_ROUTE, showBack: true }
    }
    case '[module]/[model]/create':
      return { title: `Create ${finalModelTitle}`, fallbackHref: fallbackListHref, showBack: true }
    case '[module]/[model]/detail/[id]':
      return { title: `Detail ${finalModelTitle}`, fallbackHref: fallbackListHref, showBack: true }
    case '[module]/[model]/update/[id]':
      return { title: `Update ${finalModelTitle}`, fallbackHref: fallbackListHref, showBack: true }
    default:
      return { title: 'Menu', fallbackHref: MENU_ROUTE, showBack: false }
  }
}

export default function MenuStackLayout() {
  const router = useRouter()
  const catalog = useMemo(() => getMobileRouteCatalog(), [])
  const insets = useSafeAreaInsets()

  return (
    <HeaderActionsProvider>
      <Stack
        screenLayout={({ children }) => (
          <ActionControlsRouteScope>
            <AppScreenScope defaultOptions={{ safeArea: { top: false }, layout: { scrollable: true } }}>
              {children}
            </AppScreenScope>
          </ActionControlsRouteScope>
        )}
        screenOptions={({ route }) => {
          const routeParams = (route.params || {}) as Record<string, string | string[] | undefined>
          const moduleSlug = pickRouteParam(routeParams, 'module')
          const modelSlug = pickRouteParam(routeParams, 'model')
          const entry = moduleSlug && modelSlug ? getCatalogEntry(catalog, moduleSlug, modelSlug) : undefined
          const { title, fallbackHref, showBack } = resolveMenuHeader(route.name, entry?.config.title, entry?.hrefs.list)

          return {
            header: () => (
              <View className="px-4 pb-2" style={{ paddingTop: insets.top + 6, backgroundColor: materialColors.background, borderBottomColor: materialColors.outlineVariant, borderBottomWidth: 1 }}>
                <CRUDRouteHeader
                  title={title}
                  onBack={showBack ? () => navigateBackOrFallback(router, fallbackHref) : undefined}
                  actions={<HeaderActionHost routeKey={route.key} />}
                />
              </View>
            ),
            headerStatusBarHeight: 0,
            headerStyle: { backgroundColor: materialColors.background },
            headerShadowVisible: false,
            headerTitleAlign: 'center',
            gestureEnabled: true,
            animation: Platform.OS === 'ios' ? 'default' : 'fade',
            ...(Platform.OS === 'ios' ? { fullScreenGestureEnabled: false } : {}),
          }
        }}
      >
        <Stack.Screen name="index" options={{ animation: 'none' }} />
        <Stack.Screen name="[module]/[model]/index" />
        <Stack.Screen name="[module]/[model]/create" />
        <Stack.Screen name="[module]/[model]/detail/[id]" />
        <Stack.Screen name="[module]/[model]/update/[id]" />
      </Stack>
    </HeaderActionsProvider>
  )
}
