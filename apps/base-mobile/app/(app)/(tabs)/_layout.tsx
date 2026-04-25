import { forwardRef, type ComponentRef } from 'react'
import { TabList, TabSlot, TabTrigger, type TabTriggerSlotProps, Tabs } from 'expo-router/ui'
import { Pressable, Text } from 'react-native'
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
    <Pressable
      ref={ref}
      {...props}
      className="flex-1 flex flex-col min-h-14 items-center justify-center gap-0.5 rounded-full"
      style={{ backgroundColor: isFocused ? materialColors.primaryContainer : undefined }}
    >
      <Icon name={icon} size={18} color={foregroundColor} />
      <Text className="text-[13px] font-semibold" style={{ color: isFocused ? materialColors.onPrimaryContainer : materialColors.onSurfaceVariant }}>
        {label}
      </Text>
    </Pressable>
  )
})

export default function TabsLayout() {
  const insets = useSafeAreaInsets()

  return (
    <Tabs>
      <TabSlot className="flex-1" style={{ backgroundColor: materialColors.background }} />
      <TabList
        className="flex-row gap-2 px-4 pt-2.5 border-t"
        style={{
          paddingBottom: Math.max(insets.bottom, 10),
          borderTopColor: materialColors.outlineVariant,
          backgroundColor: materialColors.surfaceContainer,
        }}
      >
        <TabTrigger name="dashboard" href="/dashboard" asChild>
          <CustomTabButton label="Dashboard" icon="home-5" />
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <CustomTabButton label="Profile" icon="user-3" />
        </TabTrigger>
        <TabTrigger name="menu" href="/menu" asChild>
          <CustomTabButton label="Menu" icon="apps-2" />
        </TabTrigger>
      </TabList>
    </Tabs>
  )
}
