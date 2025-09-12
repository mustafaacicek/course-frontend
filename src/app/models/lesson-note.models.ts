import { Lesson } from './lesson.models';
import { Student } from './student.models';
import { User } from './user.models';

export interface LessonNote {
  id: number;
  score: number | null;
  passed: boolean | null;
  remark: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  student: Student;
  lesson: Lesson;
  history?: LessonNoteHistory[];
}

export interface LessonNoteHistory {
  id: number;
  oldScore: number | null;
  oldPassed: boolean | null;
  oldRemark: string | null;
  changeDate: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;
  modifiedBy: User;
}

export interface LessonNoteCreateRequest {
  score?: number;
  passed?: boolean;
  remark?: string;
  studentId: number;
  lessonId: number;
}

export interface LessonNoteUpdateRequest {
  score?: number;
  passed?: boolean;
  remark?: string;
}
