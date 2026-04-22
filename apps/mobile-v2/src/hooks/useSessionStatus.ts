import { useEffect, useState } from 'react'
import { isAuthenticated } from '../lib/auth'

export type SessionStatus = 'checking' | 'authenticated' | 'unauthenticated'

export function useSessionStatus() {
  const [status, setStatus] = useState<SessionStatus>('checking')

  useEffect(() => {
    let mounted = true

    ;(async () => {
      const hasSession = await isAuthenticated()
      if (!mounted) return
      setStatus(hasSession ? 'authenticated' : 'unauthenticated')
    })()

    return () => {
      mounted = false
    }
  }, [])

  return status
}
