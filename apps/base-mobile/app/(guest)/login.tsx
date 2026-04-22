import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Card } from '../../src/components/base'
import { login } from '../../src/lib/auth'
import { DEFAULT_AUTH_ROUTE } from '../../src/lib/routes'
import { materialColors } from '../../src/theme/material'

function extractErrorMessage(error: unknown): string {
  const candidate = error as { message?: unknown; error?: unknown; statusText?: unknown }

  if (candidate?.message && typeof candidate.message === 'object') {
    const nested = candidate.message as { message?: unknown }
    if (nested.message) return String(nested.message)
  }

  return String(candidate?.message || candidate?.error || candidate?.statusText || 'An unexpected error occurred.')
}

export default function LoginScreen() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setSubmitting(true)
    setError('')

    try {
      const result = await login({ username, password })
      if (!result.ok) {
        setError(result.message)
        return
      }
      router.replace((result.route || DEFAULT_AUTH_ROUTE) as any)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View style={styles.screen}>
      <Card type="outlined" color="surface" style={styles.card} contentPadding={20}>
        <Text style={styles.caption}>Welcome to</Text>
        <Text style={styles.title}>Base Mobile</Text>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={styles.input}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
            placeholder="Username"
            placeholderTextColor={materialColors.onSurfaceVariant}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!submitting}
            placeholder="Password"
            placeholderTextColor={materialColors.onSurfaceVariant}
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <Pressable style={[styles.loginButton, submitting && styles.loginButtonDisabled]} onPress={handleLogin} disabled={submitting}>
          <Text style={styles.loginButtonLabel}>{submitting ? 'Signing in...' : 'Login'}</Text>
        </Pressable>
      </Card>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: materialColors.background,
  },
  card: {
    width: '100%',
    maxWidth: 420,
    borderRadius: 20,
    gap: 10,
  },
  caption: {
    fontSize: 14,
    color: materialColors.onSurfaceVariant,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: materialColors.onSurface,
    marginBottom: 8,
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    fontSize: 14,
    color: materialColors.onSurface,
    fontWeight: '600',
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
    backgroundColor: materialColors.surfaceContainerHighest,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: materialColors.onSurface,
  },
  errorBox: {
    marginTop: 4,
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: materialColors.errorContainer,
  },
  error: {
    color: materialColors.onErrorContainer,
    fontSize: 13,
  },
  loginButton: {
    marginTop: 6,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: materialColors.primary,
  },
  loginButtonDisabled: {
    opacity: 0.7,
  },
  loginButtonLabel: {
    color: materialColors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
})
