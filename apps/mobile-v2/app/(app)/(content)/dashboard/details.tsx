import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Card } from '../../../../src/components/base'
import { navigateBackOrFallback } from '../../../../src/features/routes/navigation.policy'
import { materialColors } from '../../../../src/theme/material'

export default function DashboardDetailsScreen() {
  const router = useRouter()

  return (
    <View style={styles.center}>
      <Card style={styles.card} type="outlined" color="surfaceContainerLow">
        <Text style={styles.title}>Dashboard Child Route</Text>
        <Text style={styles.description}>Opened via push from /dashboard to validate stack back behavior.</Text>

        <Pressable style={styles.secondaryButton} onPress={() => navigateBackOrFallback(router as any, '/dashboard')}>
          <Text style={styles.secondaryButtonLabel}>Back or Fallback to Dashboard</Text>
        </Pressable>
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
    fontSize: 24,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  description: {
    fontSize: 16,
    color: materialColors.onSurfaceVariant,
  },
  secondaryButton: {
    marginTop: 8,
    backgroundColor: materialColors.secondaryContainer,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  secondaryButtonLabel: {
    color: materialColors.onSecondaryContainer,
    fontSize: 15,
    fontWeight: '600',
  },
})
