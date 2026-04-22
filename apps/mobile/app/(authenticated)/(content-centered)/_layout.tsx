import { Slot } from 'expo-router'
import { AuthenticatedContent } from '../../../src/components/layouts/AuthenticatedContent'

export default function AuthenticatedCenteredContentLayout() {
  return (
    <AuthenticatedContent centered>
      <Slot />
    </AuthenticatedContent>
  )
}
