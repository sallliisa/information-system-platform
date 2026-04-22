import Icon from 'react-native-remix-icon'
import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { AUTHENTICATED_NAV_CONFIG } from '../../lib/authenticated-nav.config'
import {
  AUTHENTICATED_NAVBAR_HORIZONTAL_PADDING,
  AUTHENTICATED_NAVBAR_HEIGHT,
  resolveAuthenticatedNavbarBottomPadding,
} from '../../lib/authenticated-layout'
import { hasPrivateRoutePermission } from '../../lib/route-access'
import { getRouteById, normalizeRoutePath } from '../../lib/route-manifest'
import { getPermissions } from '../../lib/storage'
import { materialColors } from '../../theme/material'
import { navigateAsSwitch } from '../../features/routes/navigation.policy'

export function AuthenticatedBottomNavbar() {
  const router = useRouter()
  const pathname = normalizeRoutePath(usePathname())
  const insets = useSafeAreaInsets()
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

  const navItems = useMemo(() => [...regularItems, ...AUTHENTICATED_NAV_CONFIG.specials], [regularItems])
  const resolvedNavbarBottomPadding = resolveAuthenticatedNavbarBottomPadding(insets.bottom)

  return (
    <View
      className="bg-transparent"
      style={{
        paddingHorizontal: AUTHENTICATED_NAVBAR_HORIZONTAL_PADDING,
        paddingBottom: resolvedNavbarBottomPadding,
        backgroundColor: 'transparent',
      }}
    >
      <View
        className="flex-row items-center rounded-full border"
        style={{
          minHeight: AUTHENTICATED_NAVBAR_HEIGHT,
          backgroundColor: materialColors.surfaceContainer,
          borderColor: materialColors.outlineVariant,
          paddingHorizontal: 4,
        }}
      >
        {navItems.map((item) => {
          const route = getRouteById(item.routeId)
          const isActive = pathname === normalizeRoutePath(route.href)

          return (
            <Pressable
              key={item.routeId}
              onPress={() => {
                navigateAsSwitch(router, pathname, route.href)
              }}
              className={`min-h-[48px] flex-1 items-center justify-center rounded-full ${item.kind === 'special' ? 'border border-transparent' : ''}`}
              style={[
                { rowGap: 1 },
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
    </View>
  )
}
