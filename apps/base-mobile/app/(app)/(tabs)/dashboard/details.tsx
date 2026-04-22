import { StyleSheet, Text, View } from 'react-native'
import { Card } from '../../../../src/components/base'
import { materialColors } from '../../../../src/theme/material'

export default function DashboardDetailsScreen() {
  return (
    <View style={styles.center}>
      <Card style={styles.card} type="outlined" color="surfaceContainerLow">
        <Text style={styles.title}>Dashboard Details</Text>
        <Text style={styles.description}>Swipe back (iOS) or use back navigation to return to Dashboard.</Text>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    gap: 12,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  description: {
    fontSize: 15,
    color: materialColors.onSurfaceVariant,
  },
})
