import { Slot } from 'expo-router'
import { AuthenticatedContent } from '../../../src/components/layouts/AuthenticatedContent'

export default function AuthenticatedContentLayout() {
  return (
    <AuthenticatedContent>
      <Slot />
    </AuthenticatedContent>
  )
}
