import { CourseLocation } from './course-location.models';
import { Course } from './course.models';
import { LessonNote } from './lesson-note.models';

export interface StudentDetail {
  id: number;
  nationalId: string;
  firstName: string;
  lastName: string;
  motherName?: string;
  fatherName?: string;
  address?: string;
  phone?: string;
  birthDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  
  // User account information
  userId?: number;
  username?: string;
  
  // Course locations with their admins
  courseLocations?: CourseLocation[];
  
  // Courses the student is enrolled in
  courses?: Course[];
  
  // Lesson notes for the student
  lessonNotes?: LessonNote[];
  
  // Summary statistics
  totalCourses: number;
  totalLessons: number;
  passedLessons: number;
  failedLessons: number;
  averageScore: number;
  totalScore?: number;
  teacherComment?: string;
}
