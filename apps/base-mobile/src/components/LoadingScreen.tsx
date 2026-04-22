import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { materialColors } from '../theme/material'

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={materialColors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: materialColors.background,
  },
})
