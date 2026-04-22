import { StyleSheet, Text } from 'react-native'
import { Card } from '../../components/base'
import { materialColors } from '../../theme/material'

type ModelRouteForbiddenProps = {
  moduleSlug?: string
  modelSlug?: string
}

export function ModelRouteForbidden({ moduleSlug, modelSlug }: ModelRouteForbiddenProps) {
  return (
    <Card style={styles.card} color="errorContainer">
      <Text style={styles.title}>Access denied</Text>
      <Text style={styles.description}>
        {moduleSlug && modelSlug
          ? `You do not have permission to access ${moduleSlug}/${modelSlug}.`
          : 'You do not have permission to access this route.'}
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
    color: materialColors.onErrorContainer,
    fontSize: 16,
    fontWeight: '700',
  },
  description: {
    color: materialColors.onErrorContainer,
    fontSize: 14,
  },
})
