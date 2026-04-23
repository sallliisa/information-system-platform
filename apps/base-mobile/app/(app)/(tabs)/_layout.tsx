import { forwardRef, type ComponentRef } from 'react'
import { TabList, TabSlot, TabTrigger, type TabTriggerSlotProps, Tabs } from 'expo-router/ui'
import { Pressable, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Icon } from '../../../src/components/base'
import { materialColors } from '../../../src/theme/material'

type CustomTabButtonProps = TabTriggerSlotProps & {
  label: string
  icon: string
}

const CustomTabButton = forwardRef<ComponentRef<typeof Pressable>, CustomTabButtonProps>(function CustomTabButton(
  { label, icon, isFocused, ...props },
  ref
) {
  const foregroundColor = isFocused ? materialColors.onPrimaryContainer : materialColors.onSurfaceVariant

  return (
    <Pressable ref={ref} {...props} style={[styles.tabButton, isFocused ? styles.tabButtonActive : null]}>
      <Icon name={icon} size={18} color={foregroundColor} />
      <Text style={[styles.tabButtonLabel, isFocused ? styles.tabButtonLabelActive : null]}>{label}</Text>
    </Pressable>
  )
})

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList style={[styles.tabList, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TabTrigger name="dashboard" href="/dashboard" asChild>
          <CustomTabButton label="Dashboard" icon="home-5-line" />
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <CustomTabButton label="Profile" icon="user-3-line" />
        </TabTrigger>
        <TabTrigger name="menu" href="/menu" asChild>
          <CustomTabButton label="Menu" icon="apps-2-line" />
        </TabTrigger>
      </TabList>
    </Tabs>
  )
}

const styles = StyleSheet.create({
  slot: {
    flex: 1,
    backgroundColor: materialColors.background,
  },
  tabList: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: materialColors.outlineVariant,
    backgroundColor: materialColors.surface,
  },
  tabButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    backgroundColor: materialColors.surfaceContainerHigh,
  },
  tabButtonActive: {
    backgroundColor: materialColors.primaryContainer,
  },
  tabButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: materialColors.onSurfaceVariant,
  },
  tabButtonLabelActive: {
    color: materialColors.onPrimaryContainer,
  },
})
