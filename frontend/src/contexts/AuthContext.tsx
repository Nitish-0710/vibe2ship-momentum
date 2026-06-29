import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth'
import { auth, googleProvider } from '@/config/firebase'
import { fetchUserProfile, syncUserProfile, updateUserProfile } from '@/services/auth.service'
import type { UserProfile } from '@/types/auth.types'

interface AuthContextValue {
  firebaseUser: FirebaseUser | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
  /** Non-null when Firestore profile sync failed but Firebase auth succeeded. */
  profileSyncError: string | null
  login: (email: string, password: string) => Promise<void>
  signup: (name: string, email: string, password: string) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => Promise<void>
  updateProfileSettings: (userData: Partial<UserProfile>) => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Patch 4: separate error surface for profile sync failures
  const [profileSyncError, setProfileSyncError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  /**
   * Patch 2 — Smart profile resolution.
   *
   * Existing users: GET /auth/profile only (no Firestore write).
   * New users:      GET returns USER_NOT_FOUND → POST /auth/login to create doc.
   *
   * Patch 4 — Failure isolation.
   * If both GET and POST fail, Firebase auth is preserved.
   * profileSyncError is set instead of crashing the provider.
   */
  const resolveUserProfile = useCallback(async (user: FirebaseUser) => {
    setProfileSyncError(null)
    try {
      // Optimistic path: existing user — read only, no write
      const profile = await fetchUserProfile()
      setUserProfile(profile)
    } catch (fetchErr) {
      const message = fetchErr instanceof Error ? fetchErr.message : String(fetchErr)
      const isNotFound =
        message.includes('USER_NOT_FOUND') ||
        message.includes('404') ||
        message.includes('not found')

      if (isNotFound) {
        // First-time user: create the Firestore document
        try {
          const profile = await syncUserProfile({
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email || '',
          })
          setUserProfile(profile)
        } catch (syncErr) {
          // Patch 4: sync failed — preserve auth, expose error, keep app stable
          const syncMessage =
            syncErr instanceof Error ? syncErr.message : 'Profile creation failed.'
          console.error('Failed to create user profile in Firestore:', syncMessage)
          setProfileSyncError(syncMessage)
          // userProfile remains null; Firebase session is intact
        }
      } else {
        // Unexpected fetch error — preserve auth, expose error
        console.error('Failed to fetch user profile:', message)
        setProfileSyncError(message)
      }
    }
  }, [])

  /**
   * Patch 3 — Reliable loading state.
   *
   * loading is reset in finally so it ALWAYS resolves, even if
   * resolveUserProfile throws unexpectedly. No indefinite spinner.
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user)
      try {
        if (user) {
          await resolveUserProfile(user)
        } else {
          setUserProfile(null)
          setProfileSyncError(null)
        }
      } finally {
        // Patch 3: always release loading, regardless of outcome above
        setLoading(false)
      }
    })
    return unsubscribe
  }, [resolveUserProfile])

  /**
   * login / signup / loginWithGoogle:
   * These fire the Firebase action; onAuthStateChanged handles the rest.
   * loading is NOT set to true here — the auth state listener owns that.
   * On failure, setLoading(false) ensures the spinner is released.
   */
  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setError(null)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: name })
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    setError(null)
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (err) {
      setError(getFirebaseErrorMessage(err))
    }
  }, [])

  const logout = useCallback(async () => {
    setError(null)
    await signOut(auth)
    setUserProfile(null)
    setProfileSyncError(null)
  }, [])

  const updateProfileSettings = useCallback(async (userData: Partial<UserProfile>) => {
    setError(null)
    try {
      const updated = await updateUserProfile(userData)
      setUserProfile(updated)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile settings.')
      throw err
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        userProfile,
        loading,
        error,
        profileSyncError,
        login,
        signup,
        loginWithGoogle,
        logout,
        updateProfileSettings,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuthContext must be used within AuthProvider')
  }
  return ctx
}

function getFirebaseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    const code = (error as { code?: string }).code
    const messages: Record<string, string> = {
      'auth/user-not-found': 'No account found with this email.',
      'auth/wrong-password': 'Incorrect password.',
      'auth/email-already-in-use': 'An account with this email already exists.',
      'auth/weak-password': 'Password must be at least 6 characters.',
      'auth/invalid-email': 'Please enter a valid email address.',
      'auth/too-many-requests': 'Too many attempts. Please try again later.',
      'auth/popup-closed-by-user': 'Sign-in was cancelled.',
    }
    return (code && messages[code]) || error.message || 'Authentication failed.'
  }
  return 'Authentication failed.'
}
