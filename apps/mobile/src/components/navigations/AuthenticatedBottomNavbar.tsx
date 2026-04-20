import Icon from 'react-native-remix-icon'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { AUTHENTICATED_NAV_CONFIG } from '../../lib/authenticated-nav.config'
import { AUTHENTICATED_NAVBAR_BOTTOM_PADDING, AUTHENTICATED_NAVBAR_HEIGHT } from '../../lib/bottom-offset'
import { hasPrivateRoutePermission } from '../../lib/route-access'
import { getRouteById, normalizeRoutePath } from '../../lib/route-manifest'
import { getPermissions } from '../../lib/storage'
import { materialColors } from '../../theme/material'

export function AuthenticatedBottomNavbar() {
  const router = useRouter()
  const pathname = normalizeRoutePath(usePathname())
  const [permissionPayload, setPermissionPayload] = useState<unknown>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const permissions = await getPermissions()
      if (!mounted) return
      setPermissionPayload(permissions)
    })()

    return () => {
      mounted = false
    }
  }, [])

  const regularItems = useMemo(() => {
    return AUTHENTICATED_NAV_CONFIG.regular.filter((item) => {
      const route = getRouteById(item.routeId)
      return hasPrivateRoutePermission(route, permissionPayload)
    })
  }, [permissionPayload])

  const navItems = useMemo(() => [...regularItems, AUTHENTICATED_NAV_CONFIG.special], [regularItems])

  return (
    <View pointerEvents="box-none" className="absolute bottom-0 left-0 right-0 bg-transparent" style={{ backgroundColor: 'transparent' }}>
      <SafeAreaView
        edges={['bottom']}
        className="bg-transparent px-4"
        style={{ paddingHorizontal: 16, paddingBottom: AUTHENTICATED_NAVBAR_BOTTOM_PADDING, backgroundColor: 'transparent' }}
      >
        <View
          className="flex-row items-center rounded-full border py-2"
          style={{
            minHeight: AUTHENTICATED_NAVBAR_HEIGHT,
            backgroundColor: materialColors.surfaceContainer,
            borderColor: materialColors.outlineVariant,
            paddingHorizontal: 6,
          }}
        >
          {navItems.map((item) => {
            const route = getRouteById(item.routeId)
            const isActive = pathname === normalizeRoutePath(route.href)

            return (
              <Pressable
                key={item.routeId}
                onPress={() => router.push(route.href as any)}
                className={`min-h-[56px] flex-1 items-center justify-center rounded-full ${item.kind === 'special' ? 'border border-transparent' : ''}`}
                style={[
                  { rowGap: 2 },
                  isActive ? { backgroundColor: materialColors.surfaceContainerHighest } : null,
                  item.kind === 'special' ? { borderWidth: 1, borderColor: 'transparent' } : null,
                ]}
              >
                <Icon
                  name={item.icon as any}
                  size={20}
                  color={isActive ? materialColors.primary : materialColors.onSurfaceVariant}
                  fallback={null}
                />
                <Text className="text-[11px] font-medium" style={{ color: isActive ? materialColors.primary : materialColors.onSurfaceVariant }}>
                  {item.label}
                </Text>
              </Pressable>
            )
          })}
        </View>
      </SafeAreaView>
    </View>
  )
}
