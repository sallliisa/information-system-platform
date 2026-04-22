import { Text, View } from 'react-native'
import { materialColors } from '../../../../src/theme/material'

export default function ProfileEditScreen() {
  return (
    <View className="items-center justify-center">
      <Text className="text-3xl font-bold" style={{ color: materialColors.onBackground }}>
        Edit Profile
      </Text>
      <Text className="mt-2 text-base" style={{ color: materialColors.onSurfaceVariant }}>
        Placeholder screen for future profile editing flow.
      </Text>
    </View>
  )
}
