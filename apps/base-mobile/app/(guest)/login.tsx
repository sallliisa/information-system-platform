import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, Text, TextInput, View } from 'react-native'
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
    <View className="flex-1 justify-center items-center p-6" style={{ backgroundColor: materialColors.background }}>
      <Card type="outlined" color="surface" className="w-full max-w-[420px] rounded-[20px] gap-2.5" contentPadding={20}>
        <Text className="text-sm" style={{ color: materialColors.onSurfaceVariant }}>Welcome to</Text>
        <Text className="text-[28px] font-bold mb-2" style={{ color: materialColors.onSurface }}>Base Mobile</Text>

        <View className="gap-1.5">
          <Text className="text-sm font-semibold" style={{ color: materialColors.onSurface }}>Username</Text>
          <TextInput
            className="min-h-11 rounded-[10px] border px-3 py-2.5"
            style={{ borderColor: materialColors.outlineVariant, backgroundColor: materialColors.surfaceContainerHighest, color: materialColors.onSurface }}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
            editable={!submitting}
            placeholder="Username"
            placeholderTextColor={materialColors.onSurfaceVariant}
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-semibold" style={{ color: materialColors.onSurface }}>Password</Text>
          <TextInput
            className="min-h-11 rounded-[10px] border px-3 py-2.5"
            style={{ borderColor: materialColors.outlineVariant, backgroundColor: materialColors.surfaceContainerHighest, color: materialColors.onSurface }}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            editable={!submitting}
            placeholder="Password"
            placeholderTextColor={materialColors.onSurfaceVariant}
          />
        </View>

        {error ? (
          <View className="mt-1 rounded-[10px] px-2.5 py-2" style={{ backgroundColor: materialColors.errorContainer }}>
            <Text className="text-[13px]" style={{ color: materialColors.onErrorContainer }}>{error}</Text>
          </View>
        ) : null}

        <Pressable className="mt-1.5 rounded-[10px] items-center py-3" style={{ backgroundColor: materialColors.primary, opacity: submitting ? 0.7 : 1 }} onPress={handleLogin} disabled={submitting}>
          <Text className="text-[15px] font-semibold" style={{ color: materialColors.onPrimary }}>{submitting ? 'Signing in...' : 'Login'}</Text>
        </Pressable>
      </Card>
    </View>
  )
}
