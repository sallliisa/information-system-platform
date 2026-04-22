import { forwardRef, type ComponentRef } from 'react'
import { TabList, TabSlot, TabTrigger, type TabTriggerSlotProps, Tabs } from 'expo-router/ui'
import { Pressable, StyleSheet, Text } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { getMobileRouteCatalog } from '../../../src/features/routes/catalog.index'
import { materialColors } from '../../../src/theme/material'

type CustomTabButtonProps = TabTriggerSlotProps & {
  label: string
}

const CustomTabButton = forwardRef<ComponentRef<typeof Pressable>, CustomTabButtonProps>(function CustomTabButton(
  { label, isFocused, ...props },
  ref
) {
  return (
    <Pressable ref={ref} {...props} style={[styles.tabButton, isFocused ? styles.tabButtonActive : null]}>
      <Text style={[styles.tabButtonLabel, isFocused ? styles.tabButtonLabelActive : null]}>{label}</Text>
    </Pressable>
  )
})

export default function TabsLayout() {
  const insets = useSafeAreaInsets()
  const catalog = getMobileRouteCatalog()

  return (
    <Tabs>
      <TabSlot style={styles.slot} />
      <TabList style={[styles.tabList, { paddingBottom: Math.max(insets.bottom, 10) }]}>
        <TabTrigger name="dashboard" href="/dashboard" asChild>
          <CustomTabButton label="Dashboard" />
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <CustomTabButton label="Profile" />
        </TabTrigger>
        <TabTrigger name="menu" href="/menu" asChild>
          <CustomTabButton label="Menu" />
        </TabTrigger>
        {catalog.entries.map((entry) => (
          <TabTrigger
            key={entry.key}
            name={`model-${entry.moduleSlug}-${entry.modelSlug}`}
            href={entry.hrefs.list as any}
            asChild
          >
            <Pressable style={styles.hiddenTabTrigger} />
          </TabTrigger>
        ))}
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
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
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
  hiddenTabTrigger: {
    display: 'none',
    width: 0,
    height: 0,
  },
})
