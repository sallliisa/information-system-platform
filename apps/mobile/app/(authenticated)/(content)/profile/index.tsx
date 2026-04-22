import Icon from 'react-native-remix-icon'
import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'expo-router'
import { Image, Text, View } from 'react-native'
import { Card } from '../../../../src/components/base'
import { signOut } from '../../../../src/lib/auth'
import { getProfile } from '../../../../src/lib/storage'
import { materialColors } from '../../../../src/theme/material'

type StoredProfile = Record<string, any> | null

type ProfileAction = {
  key: 'profile' | 'settings' | 'logout'
  label: string
  description: string
  icon: string
  onPress: () => void | Promise<void>
}

function pickDisplayName(profile: StoredProfile): string {
  const fullname = String(profile?.fullname || '').trim()
  if (fullname) return fullname

  const username = String(profile?.username || '').trim()
  if (username) return username

  return 'Unknown User'
}

function pickEmail(profile: StoredProfile): string {
  return String(profile?.email || profile?.mail || '').trim()
}

function pickUsername(profile: StoredProfile): string {
  return String(profile?.username || '').trim()
}

function pickRole(profile: StoredProfile): string {
  return String(profile?.role_name || profile?.role || '').trim()
}

function pickAvatarUrl(profile: StoredProfile): string {
  const raw =
    profile?.img_photo_user?.tumbnail_url ||
    profile?.img_photo_user?.thumbnail_url ||
    profile?.img_photo_user?.url ||
    profile?.photo ||
    ''
  return String(raw || '').trim()
}

export default function ProfileScreen() {
  const router = useRouter()
  const [profile, setProfile] = useState<StoredProfile>(null)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      const stored = await getProfile<StoredProfile>()
      if (!mounted) return
      setProfile(stored)
    })()

    return () => {
      mounted = false
    }
  }, [])

  const displayName = useMemo(() => pickDisplayName(profile), [profile])
  const email = useMemo(() => pickEmail(profile), [profile])
  const username = useMemo(() => pickUsername(profile), [profile])
  const role = useMemo(() => pickRole(profile), [profile])
  const avatarUrl = useMemo(() => pickAvatarUrl(profile), [profile])
  const metadata = [email, username ? `@${username}` : '', role].filter(Boolean)

  const actions: ProfileAction[] = [
    {
      key: 'profile',
      label: 'Profile',
      description: 'Edit your account information',
      icon: 'user-settings-line',
      onPress: () => router.push('/profile/edit'),
    },
    {
      key: 'settings',
      label: 'Settings',
      description: 'Open application preferences',
      icon: 'settings-3-line',
      onPress: () => router.push('/profile/settings'),
    },
    {
      key: 'logout',
      label: loggingOut ? 'Logging out...' : 'Logout',
      description: 'Sign out from this device',
      icon: 'logout-box-r-line',
      onPress: async () => {
        if (loggingOut) return
        setLoggingOut(true)
        try {
          await signOut({ reason: 'manual' })
        } finally {
          setLoggingOut(false)
        }
      },
    },
  ]

  return (
    <View className="gap-6">
      <Card type="outlined" color="surfaceContainer" contentPadding={20} style={{ borderRadius: 24 }}>
        <View className="flex-row items-center gap-4">
          {avatarUrl ? (
            <Image
              source={{ uri: avatarUrl }}
              className="h-20 w-20 rounded-full"
              resizeMode="cover"
              accessibilityLabel="Profile photo"
            />
          ) : (
            <View
              className="h-20 w-20 items-center justify-center rounded-full"
              style={{ backgroundColor: materialColors.surfaceContainerHighest }}
            >
              <Icon name="user-3-line" size={34} color={materialColors.primary} fallback={null} />
            </View>
          )}
          <View className="flex-1 gap-1">
            <Text className="text-2xl font-bold" style={{ color: materialColors.onSurface }}>
              {displayName}
            </Text>
            {metadata.length > 0 ? (
              <Text className="text-sm" style={{ color: materialColors.onSurfaceVariant }}>
                {metadata.join(' • ')}
              </Text>
            ) : (
              <Text className="text-sm" style={{ color: materialColors.onSurfaceVariant }}>
                No profile metadata available
              </Text>
            )}
          </View>
        </View>
      </Card>

      <View className="gap-3">
        {actions.map((action) => (
          <Card
            key={action.key}
            type="outlined"
            color="surfaceContainerLow"
            style={{
              borderRadius: 16,
              opacity: action.key === 'logout' && loggingOut ? 0.7 : 1,
            }}
            disabled={action.key === 'logout' && loggingOut}
            onPress={() => void action.onPress()}
          >
            <View className="flex-row items-center">
              <View
                className="mr-3 h-10 w-10 items-center justify-center rounded-full"
                style={{ backgroundColor: materialColors.surfaceContainerHighest }}
              >
                <Icon name={action.icon as any} size={20} color={materialColors.primary} fallback={null} />
              </View>
              <View className="flex-1">
                <Text className="text-base font-semibold" style={{ color: materialColors.onSurface }}>
                  {action.label}
                </Text>
                <Text className="text-sm" style={{ color: materialColors.onSurfaceVariant }}>
                  {action.description}
                </Text>
              </View>
              <Icon
                name="arrow-right-s-line"
                size={20}
                color={materialColors.onSurfaceVariant}
                fallback={null}
              />
            </View>
          </Card>
        ))}
      </View>
    </View>
  )
}
