import { CourseLocation } from './course-location.models';
import { Student } from './student.models';

export interface StudentCourseLocation {
  id: number;
  student: Student;
  courseLocation: CourseLocation;
  createdAt: string;
  updatedAt: string;
}

export interface StudentCourseLocationCreateRequest {
  studentId: number;
  courseLocationId: number;
}
