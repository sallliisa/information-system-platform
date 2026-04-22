import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Card } from '../../../../src/components/base'
import { signOut } from '../../../../src/lib/auth'
import { materialColors } from '../../../../src/theme/material'

export default function ProfileScreen() {
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    try {
      await signOut({ reason: 'manual' })
    } finally {
      setLoggingOut(false)
    }
  }

  return (
    <View style={styles.center}>
      <Card style={styles.card} type="filled" color="surfaceContainerLow">
        <Text style={styles.title}>Profile</Text>
        <Text style={styles.description}>Phase 1 dummy profile tab.</Text>

        <Pressable style={[styles.logoutButton, loggingOut ? styles.disabledButton : null]} onPress={handleLogout} disabled={loggingOut}>
          <Text style={styles.logoutButtonLabel}>{loggingOut ? 'Logging out...' : 'Log out'}</Text>
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
    fontSize: 30,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  description: {
    fontSize: 15,
    color: materialColors.onSurfaceVariant,
  },
  logoutButton: {
    marginTop: 10,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: materialColors.error,
  },
  logoutButtonLabel: {
    color: materialColors.onError,
    fontSize: 14,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
})
