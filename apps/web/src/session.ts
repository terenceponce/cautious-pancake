import { useCallback, useState } from 'react'

// Client-side session only — presentation, not authentication.
// The API still takes a bare userId; see ADR-0009.
const KEY = 'flashsale.user'

export function useSession(): {
  user: string | null
  signIn: (email: string) => void
  signOut: () => void
} {
  const [user, setUser] = useState<string | null>(() => localStorage.getItem(KEY))

  const signIn = useCallback((email: string) => {
    localStorage.setItem(KEY, email)
    setUser(email)
  }, [])

  const signOut = useCallback(() => {
    localStorage.removeItem(KEY)
    setUser(null)
  }, [])

  return { user, signIn, signOut }
}
