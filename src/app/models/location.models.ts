import { User } from './user.models';

export interface CourseLocation {
  id: number;
  name: string;
  address: string;
  phone?: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  admins?: User[];
}

export interface CourseLocationCreateRequest {
  name: string;
  address: string;
  phone?: string;
  adminIds?: number[];
}

export interface CourseLocationUpdateRequest {
  name?: string;
  address?: string;
  phone?: string;
  adminIds?: number[];
}
