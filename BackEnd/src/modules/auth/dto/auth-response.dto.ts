export class AuthResponseDto {
  access_token: string;
  user: {
    UserID: number;
    Email: string;
    FullName: string;
    RoleID: number;
    CreatedAt: Date;
  };
}
