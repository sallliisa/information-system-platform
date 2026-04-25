import { ActivityIndicator, View } from 'react-native'
import { materialColors } from '../theme/material'

export function LoadingScreen() {
  return (
    <View className="flex-1 items-center justify-center" style={{ backgroundColor: materialColors.background }}>
      <ActivityIndicator size="large" color={materialColors.primary} />
    </View>
  )
}
