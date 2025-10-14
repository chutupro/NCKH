import { SetMetadata } from '@nestjs/common';
import { RoleName } from '../../shared/constants/roles.constant';

export const ROLES_KEY = 'roles';

/**
 * Decorator to specify required roles for route access
 */
export function Roles(...roles: RoleName[]): ReturnType<typeof SetMetadata> {
  return SetMetadata(ROLES_KEY, roles);
}

