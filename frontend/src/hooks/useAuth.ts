import { useAuthContext } from '@/contexts/AuthContext'

/**
 * Thin hook to consume AuthContext.
 * Provides a stable import path so consumers don't import directly from context file.
 */
export function useAuth() {
  return useAuthContext()
}
