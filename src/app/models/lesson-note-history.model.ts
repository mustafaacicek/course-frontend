import { User } from './user.models';

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
