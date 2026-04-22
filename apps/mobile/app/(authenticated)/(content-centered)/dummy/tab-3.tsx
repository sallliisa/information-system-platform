import { Text, View } from 'react-native'
import { materialColors } from '../../../../src/theme/material'

export default function DummyTab3Screen() {
  return (
    <View className="items-center justify-center">
      <Text className="text-3xl font-bold" style={{ color: materialColors.onBackground }}>
        Tab 3
      </Text>
      <Text className="mt-2 text-base" style={{ color: materialColors.onSurfaceVariant }}>
        Placeholder authenticated route for phase 1.
      </Text>
    </View>
  )
}
