import api from './api'
import type { UserProfile } from '@/types/auth.types'

/**
 * Authentication API service.
 * Communicates with the backend auth endpoints.
 */

interface AuthResponse {
  success: boolean
  token: string
  data: UserProfile
}

/**
 * Registers a new user via email and password credentials.
 */
export async function registerUser(userData: {
  name: string
  email: string
  password?: string
}): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/register', userData)
  return response.data
}

/**
 * Logins a user via email and password credentials.
 */
export async function loginUser(userData: {
  email: string
  password?: string
}): Promise<AuthResponse> {
  const response = await api.post<AuthResponse>('/auth/login', userData)
  return response.data
}

/**
 * Creates or retrieves the user document after external authentication (retained for fallback).
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
 * Retrieves the current authenticated user's profile.
 */
export async function fetchUserProfile(): Promise<UserProfile> {
  const response = await api.get<{ success: boolean; data: UserProfile }>(
    '/auth/profile',
  )
  return response.data.data
}

/**
 * Updates the user's settings profile.
 */
export async function updateUserProfile(userData: Partial<UserProfile>): Promise<UserProfile> {
  const response = await api.put<{ success: boolean; data: UserProfile }>(
    '/auth/profile',
    userData,
  )
  return response.data.data
}
