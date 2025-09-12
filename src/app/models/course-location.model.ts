import { User } from './user.model';
import { Course } from './course.model';

export interface CourseLocation {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  createdAt?: Date;
  updatedAt?: Date;
  admins?: User[];
  courses?: Course[];
}
