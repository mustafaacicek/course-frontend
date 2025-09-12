import { Lesson } from './lesson.models';
import { Student } from './student.models';
import { LessonNoteHistory } from './lesson-note-history.model';

export interface LessonNote {
  id: number;
  score: number | null;
  passed: boolean | null;
  remark: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  lesson?: Lesson;
  student?: Student;
  history?: LessonNoteHistory[];
}
