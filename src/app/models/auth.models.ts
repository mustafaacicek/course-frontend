export interface LoginRequest {
  username: string;
  password: string;
}

export interface JwtAuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  userId: number;
  username: string;
  role: UserRole;
}

export enum UserRole {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}
