import { useMemo } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon } from '../base'
import { AUTHENTICATED_NAV_CONFIG } from '../../lib/authenticated-nav.config'
import {
  AUTHENTICATED_NAVBAR_HEIGHT,
  AUTHENTICATED_NAVBAR_HORIZONTAL_PADDING,
  resolveAuthenticatedNavbarBottomPadding,
} from '../../lib/authenticated-layout'
import { getActiveTopLevelPath, isDynamicCatalogPath, navigateAsSwitch } from '../../features/routes/navigation.policy'
import { materialColors } from '../../theme/material'

export function AuthenticatedBottomNavbar() {
  const router = useRouter()
  const pathname = usePathname()
  const insets = useSafeAreaInsets()

  const topLevelPaths = useMemo(
    () => [...AUTHENTICATED_NAV_CONFIG.left.map((item) => item.href), AUTHENTICATED_NAV_CONFIG.rightLauncher.href],
    []
  )

  const activeTopLevelPath = isDynamicCatalogPath(pathname)
    ? AUTHENTICATED_NAV_CONFIG.rightLauncher.href
    : getActiveTopLevelPath(pathname, topLevelPaths, '/dashboard')
  const bottomPadding = resolveAuthenticatedNavbarBottomPadding(insets.bottom)

  return (
    <View style={[styles.outer, { paddingHorizontal: AUTHENTICATED_NAVBAR_HORIZONTAL_PADDING, paddingBottom: bottomPadding }]}>
      <View style={[styles.inner, { minHeight: AUTHENTICATED_NAVBAR_HEIGHT }]}>
        <View style={styles.leftZone}>
          {AUTHENTICATED_NAV_CONFIG.left.map((item) => {
            const active = activeTopLevelPath === item.href

            return (
              <Pressable
                key={item.id}
                onPress={() => navigateAsSwitch(router as any, activeTopLevelPath, item.href)}
                style={[styles.leftItem, active && styles.leftItemActive]}
              >
                <Icon name={item.icon} size={18} color={active ? materialColors.primary : materialColors.onSurfaceVariant} />
                <Text style={[styles.leftItemLabel, active && styles.leftItemLabelActive]}>{item.label}</Text>
              </Pressable>
            )
          })}
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open menu launcher"
          onPress={() => navigateAsSwitch(router as any, activeTopLevelPath, AUTHENTICATED_NAV_CONFIG.rightLauncher.href)}
          style={[styles.menuButton, activeTopLevelPath === AUTHENTICATED_NAV_CONFIG.rightLauncher.href && styles.menuButtonActive]}
        >
          <Icon
            name={AUTHENTICATED_NAV_CONFIG.rightLauncher.icon}
            size={20}
            color={
              activeTopLevelPath === AUTHENTICATED_NAV_CONFIG.rightLauncher.href
                ? materialColors.onPrimary
                : materialColors.onSecondaryContainer
            }
          />
        </Pressable>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  outer: {
    backgroundColor: 'transparent',
  },
  inner: {
    borderRadius: 999,
    backgroundColor: materialColors.surfaceContainer,
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
    padding: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    columnGap: 8,
  },
  leftZone: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 6,
    flexShrink: 1,
  },
  leftItem: {
    minHeight: 44,
    paddingHorizontal: 14,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialColors.surfaceContainerHighest,
    gap: 3,
  },
  leftItemActive: {
    backgroundColor: materialColors.primaryContainer,
  },
  leftItemLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: materialColors.onSurfaceVariant,
  },
  leftItemLabelActive: {
    color: materialColors.primary,
  },
  menuButton: {
    width: 46,
    height: 46,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialColors.secondaryContainer,
  },
  menuButtonActive: {
    backgroundColor: materialColors.primary,
  },
})
