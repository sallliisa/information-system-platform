import { Redirect } from 'expo-router'
import { LEGACY_SETTINGS_REDIRECTS } from '../../../src/features/routes/legacy-redirects'

export default function TasksScreen() {
  return <Redirect href={LEGACY_SETTINGS_REDIRECTS['/settings/tasks'] as any} />
}
