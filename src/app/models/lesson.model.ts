import { Course } from './course.models';

export interface Lesson {
  id: number;
  name: string;
  description?: string;
  date: string | Date;
  defaultScore?: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  course?: Course;
}
