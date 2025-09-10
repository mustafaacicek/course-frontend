export enum Role {
  SUPERADMIN = 'SUPERADMIN',
  ADMIN = 'ADMIN',
  STUDENT = 'STUDENT'
}

export interface User {
  id: number;
  username: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSummary {
  id: number;
  username: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

export interface UserCreateRequest {
  username: string;
  password: string;
  role: Role;
  firstName?: string;
  lastName?: string;
}

export interface UserUpdateRequest {
  firstName?: string;
  lastName?: string;
  password?: string;
  role?: Role;
}
