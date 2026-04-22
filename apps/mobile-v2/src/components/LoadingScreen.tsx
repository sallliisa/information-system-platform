import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { materialColors } from '../theme/material'

export function LoadingScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator color={materialColors.primary} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: materialColors.background,
  },
})
