/**
 * Application route constants.
 * Single source of truth for all route paths.
 */
export const ROUTES = {
  LOGIN: '/login',
  SIGNUP: '/signup',
  DASHBOARD: '/dashboard',
  TASKS: '/dashboard/tasks',
  PLANNER: '/planner',
  ANALYTICS: '/analytics',
  REFLECTION: '/reflection',
  SETTINGS: '/settings',
} as const

export type RouteKey = keyof typeof ROUTES
