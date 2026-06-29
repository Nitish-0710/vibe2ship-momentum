import api from './api'
import type { UserProfile } from '@/types/auth.types'

/**
 * Authentication API service.
 * Communicates with the backend auth endpoints.
 */

/**
 * Creates or retrieves the Firestore user document.
 * Called automatically after first sign-in.
 */
export async function syncUserProfile(userData: {
  name: string
  email: string
}): Promise<UserProfile> {
  const response = await api.post<{ success: boolean; data: UserProfile }>(
    '/auth/login',
    userData,
  )
  return response.data.data
}

/**
 * Retrieves the current authenticated user's profile from Firestore.
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await api.get<{ success: boolean; data: UserProfile }>(
    '/auth/profile',
  )
  return response.data.data
}

/**
 * Updates the user's Firestore profile settings.
 */
export async function updateUserProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
  const response = await api.put<{ success: boolean; data: UserProfile }>(
    '/auth/profile',
    userData,
  )
  return response.data.data
}
