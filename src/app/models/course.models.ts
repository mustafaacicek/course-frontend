import { CourseLocation } from './location.models';
import { User } from './user.models';
import { Lesson } from './lesson.models';

export interface Course {
  id: number;
  name: string;
  description?: string;
  startDate: string | Date;
  endDate?: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  courseLocation?: CourseLocation; // For backward compatibility
  courseLocations?: CourseLocation[]; // For multi-location support
  createdBy: User;
  lessons?: Lesson[];
}

export interface CourseCreateRequest {
  name: string;
  description?: string;
  startDate: string;
  endDate?: string;
  courseLocationId?: number; // For admin operations
  courseLocationIds?: number[]; // For superadmin operations
}

export interface CourseUpdateRequest {
  name?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  courseLocationId?: number; // For admin operations
  courseLocationIds?: number[]; // For superadmin operations
}
