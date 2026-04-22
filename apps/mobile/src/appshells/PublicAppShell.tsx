import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { usePathname } from 'expo-router'
import { RefreshControl, ScrollView, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { PublicNavbar } from '../components/navigations/PublicNavbar'
import { buildRouteRefreshKeyId } from '../lib/route-refresh-key'
import { refreshKey } from '../stores/keyManager'
import { materialColors } from '../theme/material'

type PublicAppShellProps = {
  children: ReactNode
}

const MIN_REFRESH_INDICATOR_DURATION_MS = 300
const ROOT_SURFACE_STYLE = {
  flex: 1,
  backgroundColor: materialColors.background,
  color: materialColors.onSurface,
}

function waitFor(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function PublicAppShell({ children }: PublicAppShellProps) {
  const pathname = usePathname()
  const insets = useSafeAreaInsets()
  const [refreshing, setRefreshing] = useState(false)
  const routeRefreshKeyId = useMemo(() => buildRouteRefreshKeyId(pathname || '/'), [pathname])

  const handleRefresh = useCallback(() => {
    if (refreshing) return
    setRefreshing(true)

    void (async () => {
      const startedAt = Date.now()
      try {
        refreshKey(routeRefreshKeyId)
      } finally {
        const elapsedMs = Date.now() - startedAt
        if (elapsedMs < MIN_REFRESH_INDICATOR_DURATION_MS) {
          await waitFor(MIN_REFRESH_INDICATOR_DURATION_MS - elapsedMs)
        }
        setRefreshing(false)
      }
    })()
  }, [refreshing, routeRefreshKeyId])

  return (
    <View style={ROOT_SURFACE_STYLE as any}>
      <PublicNavbar />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 16, paddingBottom: insets.bottom }}
        keyboardShouldPersistTaps="handled"
        alwaysBounceVertical
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={{ flex: 1 }}>{children}</View>
      </ScrollView>
    </View>
  )
}
