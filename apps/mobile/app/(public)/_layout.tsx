import { Slot } from 'expo-router'
import { LoadingScreen } from '../../src/appshells/LoadingScreen'
import { PublicAppShell } from '../../src/appshells/PublicAppShell'
import { useSessionStatus } from '../../src/hooks/useSessionStatus'

export default function PublicLayout() {
  const status = useSessionStatus()

  if (status === 'checking') {
    return <LoadingScreen />
  }

  return (
    <PublicAppShell>
      <Slot />
    </PublicAppShell>
  )
}
