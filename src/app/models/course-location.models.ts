import { UserSummary } from './user.models';

export interface CourseLocation {
  id: number;
  name: string;
  address: string;
  phone?: string;
  createdAt: string;
  updatedAt: string;
  admins: UserSummary[];
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
