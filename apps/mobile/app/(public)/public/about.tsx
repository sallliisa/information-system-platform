import { Text, View } from 'react-native'

export default function PublicAboutScreen() {
  return (
    <View className="flex-1 justify-center">
      <View className="rounded-2xl border border-border bg-white p-6">
        <Text className="text-sm font-medium uppercase tracking-wide text-slate-500">Public</Text>
        <Text className="mt-2 text-2xl font-bold text-text">About This App</Text>
        <Text className="mt-3 text-base text-slate-600">
          This is a starter public route wired through the unified mobile route manifest.
        </Text>
      </View>
    </View>
  )
}
