import { LessonNote } from './lesson-note.models';

export interface StudentLessonNote {
  id: number;
  nationalId: string;
  firstName: string;
  lastName: string;
  motherName?: string;
  fatherName?: string;
  address?: string;
  phone?: string;
  birthDate?: string | Date;
  userId: number;
  username: string;
  lessonNote?: LessonNote; // Current lesson note for the specified lesson, if exists
}

export interface LessonNoteBatchUpdateRequest {
  notes: LessonNoteUpdateItem[];
}

export interface LessonNoteUpdateItem {
  studentId: number;
  lessonId: number;
  score?: number;
  passed?: boolean;
  remark?: string;
}
