import { Redirect } from 'expo-router'
import { DEFAULT_AUTH_ROUTE } from '../../src/lib/routes'

export default function AppIndex() {
  return <Redirect href={DEFAULT_AUTH_ROUTE as any} />
}
