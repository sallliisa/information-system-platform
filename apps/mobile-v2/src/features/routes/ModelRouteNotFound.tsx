import { StyleSheet, Text } from 'react-native'
import { Card } from '../../components/base'
import { materialColors } from '../../theme/material'

type ModelRouteNotFoundProps = {
  moduleSlug?: string
  modelSlug?: string
}

export function ModelRouteNotFound({ moduleSlug, modelSlug }: ModelRouteNotFoundProps) {
  return (
    <Card style={styles.card} color="surfaceContainerLow">
      <Text style={styles.title}>Route not found</Text>
      <Text style={styles.description}>
        {moduleSlug && modelSlug
          ? `No route configuration found for ${moduleSlug}/${modelSlug}.`
          : 'Module and model parameters are required.'}
      </Text>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    borderRadius: 14,
    gap: 6,
  },
  title: {
    color: materialColors.onSurface,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: materialColors.onSurfaceVariant,
    fontSize: 14,
  },
})
