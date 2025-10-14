/**
 * Authentication response structure
 */
export interface AuthResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly user: {
    readonly userId: number;
    readonly email: string;
    readonly fullName: string;
    readonly role: string;
  };
}

