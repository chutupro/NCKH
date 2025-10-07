export const MESSAGES = {
  SUCCESS: {
    USER_CREATED: 'User created successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    USERS_FETCHED: 'Users fetched successfully'
  },
  ERROR: {
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_EXISTS: 'User already exists',
    INVALID_CREDENTIALS: 'Invalid credentials',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Forbidden access',
    VALIDATION_ERROR: 'Validation error',
    INTERNAL_SERVER_ERROR: 'Internal server error'
  }
} as const
