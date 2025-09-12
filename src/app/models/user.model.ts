export interface User {
  id: number;
  username: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date;
}
