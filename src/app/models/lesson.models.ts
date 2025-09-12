import { Course } from './course.models';

export interface Lesson {
  id: number;
  name: string;
  description?: string;
  date: string | Date;
  defaultScore?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  course: Course;
}

export interface LessonCreateRequest {
  name: string;
  description?: string;
  date: string;
  defaultScore?: number;
  courseId?: number;
  courseIds?: number[];
}

export interface LessonUpdateRequest {
  name?: string;
  description?: string;
  date?: string;
  defaultScore?: number;
  courseId?: number;
  courseIds?: number[];
}
