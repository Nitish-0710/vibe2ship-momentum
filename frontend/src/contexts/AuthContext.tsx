import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { fetchUserProfile, registerUser, loginUser, updateUserProfile } from '@/services/auth.service'
import type { UserProfile } from '@/types/auth.types'

export interface FirebaseUser {
  uid: string
  email: string | null
  displayName: string | null
}

interface AuthContextValue {
  firebaseUser: FirebaseUser | null
  userProfile: UserProfile | null
  loading: boolean
  error: string | null
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
  const [profileSyncError, setProfileSyncError] = useState<string | null>(null)

  const clearError = useCallback(() => setError(null), [])

  // Startup: verify existing JWT token
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem('token')
      if (token) {
        try {
          const profile = await fetchUserProfile()
          setUserProfile(profile)
          setFirebaseUser({
            uid: profile.uid,
            email: profile.email,
            displayName: profile.name,
          })
        } catch (err) {
          console.error('Failed to restore JWT session:', err)
          localStorage.removeItem('token')
          setUserProfile(null)
          setFirebaseUser(null)
        }
      }
      setLoading(false)
    }
    initAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const res = await loginUser({ email, password })
      localStorage.setItem('token', res.token)
      setUserProfile(res.data)
      setFirebaseUser({
        uid: res.data.uid,
        email: res.data.email,
        displayName: res.data.name,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid credentials.')
    } finally {
      setLoading(false)
    }
  }, [])

  const signup = useCallback(async (name: string, email: string, password: string) => {
    setError(null)
    setLoading(true)
    try {
      const res = await registerUser({ name, email, password })
      localStorage.setItem('token', res.token)
      setUserProfile(res.data)
      setFirebaseUser({
        uid: res.data.uid,
        email: res.data.email,
        displayName: res.data.name,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed.')
    } finally {
      setLoading(false)
    }
  }, [])

  const loginWithGoogle = useCallback(async () => {
    // Disabled per migration requirements. Keep stub signature.
    console.warn('Google Sign-In is disabled in self-hosted configuration.')
  }, [])

  const logout = useCallback(async () => {
    setError(null)
    localStorage.removeItem('token')
    setFirebaseUser(null)
    setUserProfile(null)
    setProfileSyncError(null)
  }, [])

  const updateProfileSettings = useCallback(async (userData: Partial<UserProfile>) => {
    setError(null)
    try {
      const updated = await updateUserProfile(userData)
      setUserProfile(updated)
      setFirebaseUser((prev) =>
        prev
          ? {
              ...prev,
              displayName: updated.name,
            }
          : null
      )
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
