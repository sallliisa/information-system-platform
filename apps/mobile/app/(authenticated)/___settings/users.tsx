import { Redirect } from 'expo-router'
import { LEGACY_SETTINGS_REDIRECTS } from '../../../src/features/routes/legacy-redirects'

export default function UsersScreen() {
  return <Redirect href={LEGACY_SETTINGS_REDIRECTS['/settings/users'] as any} />
}
