import { useState } from 'react'
import { Pressable, Text, View } from 'react-native'
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
    <View className="flex-1 justify-center">
      <Card className="w-full max-w-[440px] gap-3" type="filled" color="surfaceContainerLow">
        <Text className="text-[30px] font-bold" style={{ color: materialColors.onSurface }}>Profile</Text>
        <Text className="text-[15px]" style={{ color: materialColors.onSurfaceVariant }}>Phase 1 dummy profile tab.</Text>

        <Pressable className="mt-2.5 rounded-[10px] py-3 px-[18px]" style={{ backgroundColor: materialColors.error, opacity: loggingOut ? 0.7 : 1 }} onPress={handleLogout} disabled={loggingOut}>
          <Text className="text-sm font-semibold" style={{ color: materialColors.onError }}>{loggingOut ? 'Logging out...' : 'Log out'}</Text>
        </Pressable>
      </Card>
    </View>
  )
}
