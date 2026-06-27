/**
 * TypeScript types for authentication domain.
 */

export interface UserProfile {
  uid: string
  name: string
  email: string
  occupation: string
  timezone: string
  wakeTime: string
  sleepTime: string
  preferences: Record<string, unknown>
  createdAt: string
  updatedAt: string
}

export interface AuthState {
  user: UserProfile | null
  loading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials {
  name: string
  email: string
  password: string
}
