import { useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'expo-router'
import { Pressable, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { getPrivateMenuRoutes, normalizeRoutePath } from '../../lib/route-manifest'
import { getPermissions } from '../../lib/storage'

export function DummyNavbar() {
  const router = useRouter()
  const pathname = normalizeRoutePath(usePathname())
  const [permissionPayload, setPermissionPayload] = useState<unknown>([])

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const permissions = await getPermissions()
      if (!mounted) return
      setPermissionPayload(permissions)
    })()
    return () => {
      mounted = false
    }
  }, [])

  const routes = useMemo(() => getPrivateMenuRoutes(permissionPayload), [permissionPayload])

  return (
    <SafeAreaView edges={['top']} className="border-b border-border bg-white">
      <View className="flex-row items-center justify-between px-4 py-3">
        <Text className="text-base font-semibold text-text">Private App</Text>
        <View className="flex-row items-center gap-2">
          {routes.map((route) => {
            const isActive = pathname === normalizeRoutePath(route.href)
            return (
              <Pressable
                key={route.id}
                className={`rounded-lg border px-3 py-1.5 ${isActive ? 'border-primary bg-primary' : 'border-border bg-white'}`}
                onPress={() => router.push(route.href as any)}
              >
                <Text className={`text-xs font-medium ${isActive ? 'text-white' : 'text-text'}`}>{route.title}</Text>
              </Pressable>
            )
          })}
        </View>
      </View>
    </SafeAreaView>
  )
}
