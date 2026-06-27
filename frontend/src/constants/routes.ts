/**
 * Application route constants.
 * Single source of truth for all route paths.
 */
export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
} as const

export type RouteKey = keyof typeof ROUTES
