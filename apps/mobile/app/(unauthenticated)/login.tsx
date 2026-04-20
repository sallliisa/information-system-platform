import { useState } from 'react'
import { useRouter } from 'expo-router'
import { Pressable, Text, TextInput, View } from 'react-native'
import { login } from '../../src/lib/auth'

function extractErrorMessage(error: any): string {
  return String(error?.message?.message || error?.message || error?.error || error?.statusText || 'Terjadi kesalahan')
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
      if (result.ok === false) {
        setError(result.message)
        return
      }
      router.replace(result.route as any)
    } catch (err: any) {
      setError(extractErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <View className="w-full rounded-2xl border border-border bg-white p-6">
      <View className="mb-6 gap-1">
        <Text className="text-base text-slate-600">Welcome to</Text>
        <Text className="text-3xl font-bold text-text">Demo App</Text>
      </View>

      <View className="gap-3">
        <View className="gap-1">
          <Text className="text-sm font-medium text-text">Email</Text>
          <TextInput
            className="rounded-xl border border-border bg-slate-50 px-3 py-2 text-text"
            autoCapitalize="none"
            value={username}
            onChangeText={setUsername}
            placeholder="Email"
          />
        </View>

        <View className="gap-1">
          <Text className="text-sm font-medium text-text">Password</Text>
          <TextInput
            className="rounded-xl border border-border bg-slate-50 px-3 py-2 text-text"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
          />
        </View>

        {error ? <Text className="mt-1 text-sm text-red-600">{error}</Text> : null}

        <Pressable
          className={`mt-3 items-center rounded-xl px-4 py-3 ${submitting ? 'bg-slate-400' : 'bg-primary'}`}
          onPress={handleLogin}
          disabled={submitting}
        >
          <Text className="font-semibold text-white">{submitting ? 'Memproses...' : 'Login'}</Text>
        </Pressable>
      </View>

      <Text className="mt-6 text-center text-sm text-slate-500">Company Ltd.</Text>
    </View>
  )
}
