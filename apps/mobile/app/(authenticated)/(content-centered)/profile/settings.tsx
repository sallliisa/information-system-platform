import { Text, View } from 'react-native'
import { materialColors } from '../../../../src/theme/material'

export default function ProfileSettingsScreen() {
  return (
    <View className="items-center justify-center">
      <Text className="text-3xl font-bold" style={{ color: materialColors.onBackground }}>
        Settings
      </Text>
      <Text className="mt-2 text-base" style={{ color: materialColors.onSurfaceVariant }}>
        Placeholder settings page for profile-related preferences.
      </Text>
    </View>
  )
}
