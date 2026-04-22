import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Card } from '../../../../src/components/base'
import { materialColors } from '../../../../src/theme/material'

export default function DashboardScreen() {
  const router = useRouter()

  return (
    <View style={styles.center}>
      <Card style={styles.card} type="filled" color="surfaceContainerLow">
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.description}>Dummy top-level dashboard route for Phase 3A.</Text>

        <Pressable style={styles.primaryButton} onPress={() => router.push('/dashboard/details' as any)}>
          <Text style={styles.primaryButtonLabel}>Open Dashboard Child (push)</Text>
        </Pressable>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    maxWidth: 440,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  description: {
    fontSize: 16,
    color: materialColors.onSurfaceVariant,
  },
  primaryButton: {
    marginTop: 8,
    backgroundColor: materialColors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  primaryButtonLabel: {
    color: materialColors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
})
