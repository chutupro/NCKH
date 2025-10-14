/**
 * JWT payload structure
 */
export interface JwtPayload {
  readonly sub: number;
  readonly email: string;
  readonly role: string;
}

