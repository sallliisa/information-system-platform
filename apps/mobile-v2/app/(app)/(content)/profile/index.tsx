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
        <Text style={styles.title}>Profile Settings</Text>
        <Text style={styles.description}>Dummy profile top-level route for Phase 3A.</Text>

        <Pressable
          style={[styles.logoutButton, loggingOut && styles.disabledButton]}
          onPress={handleLogout}
          disabled={loggingOut}
        >
          <Text style={styles.logoutButtonLabel}>{loggingOut ? 'Logging out...' : 'Logout'}</Text>
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
    fontSize: 26,
    fontWeight: '700',
    color: materialColors.onSurface,
  },
  description: {
    fontSize: 16,
    color: materialColors.onSurfaceVariant,
  },
  logoutButton: {
    marginTop: 8,
    backgroundColor: materialColors.error,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  logoutButtonLabel: {
    color: materialColors.onError,
    fontSize: 15,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.7,
  },
})
