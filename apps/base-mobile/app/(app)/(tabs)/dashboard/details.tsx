import { Text, View } from 'react-native'
import { Card } from '../../../../src/components/base'
import { materialColors } from '../../../../src/theme/material'

export default function DashboardDetailsScreen() {
  return (
    <View className="flex-1 justify-center">
      <Card className="w-full max-w-[440px] gap-3" type="outlined" color="surfaceContainerLow">
        <Text className="text-[26px] font-bold" style={{ color: materialColors.onSurface }}>Dashboard Details</Text>
        <Text className="text-[15px]" style={{ color: materialColors.onSurfaceVariant }}>Swipe back (iOS) or use back navigation to return to Dashboard.</Text>
      </Card>
    </View>
  )
}
