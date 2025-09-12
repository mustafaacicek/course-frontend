import { CourseLocation } from './course-location.models';

export interface Student {
  id: number;
  nationalId: string;
  firstName: string;
  lastName: string;
  motherName?: string;
  fatherName?: string;
  address?: string;
  phone?: string;
  birthDate?: string;
  userId: number;
  username: string;
  createdAt?: string;
  updatedAt?: string;
  courseLocations?: CourseLocation[];
}

export interface StudentCreateRequest {
  nationalId: string;
  firstName: string;
  lastName: string;
  motherName?: string;
  fatherName?: string;
  address?: string;
  phone?: string;
  birthDate?: string;
  username?: string; // Now optional
  password?: string; // Now optional
  adminId?: number; // Admin ID for automatic course location assignment
  locationId?: number; // Course location ID for student assignment
}

export interface StudentUpdateRequest {
  nationalId?: string;
  firstName?: string;
  lastName?: string;
  motherName?: string;
  fatherName?: string;
  address?: string;
  phone?: string;
  birthDate?: string;
  password?: string;
  adminId?: number | null;
}
