/**
 * Role name constants
 */
export const ROLES = {
  ADMIN: 'Admin',
  MODERATOR: 'Moderator',
  USER: 'User',
} as const;

export type RoleName = typeof ROLES[keyof typeof ROLES];

