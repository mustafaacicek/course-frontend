import { Lesson } from './lesson.model';

export interface Course {
  id: number;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  lessons?: Lesson[];
}
