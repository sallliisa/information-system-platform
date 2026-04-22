import { useState } from 'react'
import { Redirect, useRouter } from 'expo-router'
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { Card } from '../../src/components/base'
import { LoadingScreen } from '../../src/components/LoadingScreen'
import { login } from '../../src/lib/auth'
import { DEFAULT_AUTH_ROUTE } from '../../src/lib/routes'
import { useSessionStatus } from '../../src/hooks/useSessionStatus'
import { materialColors, mobileTextInputContentStyle } from '../../src/theme'

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
  const status = useSessionStatus()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setSubmitting(true)
    setError('')

    try {
      const result = await login({ username, password })
      if (result.ok === false) {
        setError(result.message)
        return
      }
      router.replace((result.route || DEFAULT_AUTH_ROUTE) as any)
    } catch (err: unknown) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  if (status === 'checking') {
    return <LoadingScreen />
  }

  if (status === 'authenticated') {
    return <Redirect href={DEFAULT_AUTH_ROUTE as any} />
  }

  return (
    <View style={styles.screen}>
      <Card type="outlined" color="surface" style={styles.card} contentPadding={20}>
        <View style={styles.header}>
          <Text style={styles.caption}>Welcome to</Text>
          <Text style={styles.title}>Mobile V2</Text>
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Username</Text>
          <TextInput
            style={[mobileTextInputContentStyle, styles.input]}
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            placeholder="Username"
            placeholderTextColor={materialColors.onSurfaceVariant}
            editable={!submitting}
          />
        </View>

        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Password</Text>
          <TextInput
            style={[mobileTextInputContentStyle, styles.input]}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={materialColors.onSurfaceVariant}
            editable={!submitting}
          />
        </View>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.error}>{error}</Text>
          </View>
        ) : null}

        <Pressable
          style={[styles.submit, submitting && styles.submitDisabled]}
          onPress={handleLogin}
          disabled={submitting}
        >
          <Text style={styles.submitLabel}>{submitting ? 'Signing in...' : 'Login'}</Text>
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
    gap: 12,
  },
  header: {
    gap: 2,
    marginBottom: 8,
  },
  caption: {
    color: materialColors.onSurfaceVariant,
    fontSize: 14,
  },
  title: {
    color: materialColors.onSurface,
    fontSize: 28,
    fontWeight: '700',
  },
  fieldGroup: {
    gap: 6,
  },
  label: {
    color: materialColors.onSurface,
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: materialColors.outlineVariant,
    borderRadius: 10,
    backgroundColor: materialColors.surfaceContainerHighest,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: materialColors.onSurface,
    fontSize: 14,
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
  submit: {
    marginTop: 8,
    backgroundColor: materialColors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitLabel: {
    color: materialColors.onPrimary,
    fontSize: 15,
    fontWeight: '600',
  },
})
