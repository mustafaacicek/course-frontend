import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lesson } from '../../../models/lesson.models';
import { Course } from '../../../models/course.models';
import { LessonService } from '../../../services/lesson.service';
import { CourseService } from '../../../services/course.service';
import { LessonFormComponent } from './lesson-form/lesson-form.component';

@Component({
  selector: 'app-lessons',
  standalone: true,
  imports: [CommonModule, FormsModule, LessonFormComponent],
  providers: [LessonService, CourseService],
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.scss']
})
export class LessonsComponent implements OnInit {
  lessons: Lesson[] = [];
  courses: Course[] = [];
  selectedCourse: Course | null = null;
  
  isLoading = false;
  error: string | null = null;
  successMessage: string = '';
  
  showAddForm = false;
  editingLesson: Lesson | null = null;

  constructor(
    private lessonService: LessonService,
    private courseService: CourseService
  ) { }

  ngOnInit(): void {
    this.loadAdminCourses();
  }

  loadAdminCourses(): void {
    this.isLoading = true;
    this.error = null;
    
    this.courseService.getAdminCourses().subscribe({
      next: (data: Course[]) => {
        // Convert date arrays to Date objects
        this.courses = data.map(course => this.convertDateArrays(course));
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Kurslar yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading courses:', err);
      }
    });
  }

  onCourseSelect(course: Course): void {
    this.selectedCourse = course;
    this.loadLessonsForCourse(course.id);
  }

  loadLessonsForCourse(courseId: number): void {
    this.isLoading = true;
    this.error = null;
    
    this.lessonService.getLessonsByCourseId(courseId).subscribe({
      next: (data: Lesson[]) => {
        // Convert date arrays to Date objects
        this.lessons = data.map(lesson => this.convertLessonDateArrays(lesson));
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Dersler yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading lessons:', err);
      }
    });
  }

  openAddForm(): void {
    if (!this.selectedCourse) {
      this.error = 'Lütfen önce bir kurs seçin.';
      return;
    }
    
    this.editingLesson = null;
    this.showAddForm = true;
  }

  editLesson(lesson: Lesson): void {
    console.log('Editing lesson:', lesson);
    
    // Get the full lesson details before opening the form
    this.lessonService.getLessonById(lesson.id).subscribe({
      next: (fullLessonData: Lesson) => {
        console.log('Full lesson data loaded:', fullLessonData);
        // Convert date arrays to Date objects
        this.editingLesson = this.convertLessonDateArrays(fullLessonData);
        this.showAddForm = true;
      },
      error: (err: any) => {
        console.error('Error loading full lesson data:', err);
        this.error = 'Ders bilgileri yüklenirken bir hata oluştu.';
        // Fallback to using the basic lesson data
        this.editingLesson = this.convertLessonDateArrays(lesson);
        this.showAddForm = true;
      }
    });
  }

  deleteLesson(id: number): void {
    if (confirm('Bu dersi silmek istediğinizden emin misiniz?')) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = '';
      
      this.lessonService.deleteLesson(id).subscribe({
        next: () => {
          this.successMessage = 'Ders başarıyla silindi.';
          if (this.selectedCourse) {
            this.loadLessonsForCourse(this.selectedCourse.id);
          }
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Ders silinirken bir hata oluştu.';
          this.isLoading = false;
          console.error('Error deleting lesson:', err);
        }
      });
    }
  }

  onLessonSaved(lesson: Lesson): void {
    this.showAddForm = false;
    this.successMessage = this.editingLesson ? 'Ders başarıyla güncellendi.' : 'Yeni ders başarıyla eklendi.';
    if (this.selectedCourse) {
      this.loadLessonsForCourse(this.selectedCourse.id);
    }
  }

  closeForm(): void {
    this.showAddForm = false;
    this.editingLesson = null;
  }
  
  /**
   * Converts date arrays from API to proper Date objects for courses
   */
  private convertDateArrays(course: Course): Course {
    // Create a copy of the course to avoid modifying the original
    const result = { ...course };
    
    // Convert startDate if it's an array
    if (Array.isArray(result.startDate)) {
      // Format: [year, month, day]
      const [year, month, day] = result.startDate;
      result.startDate = new Date(year, month - 1, day); // Month is 0-indexed in JS Date
    }
    
    // Convert endDate if it exists and is an array
    if (result.endDate && Array.isArray(result.endDate)) {
      const [year, month, day] = result.endDate;
      result.endDate = new Date(year, month - 1, day);
    }
    
    // Convert createdAt if it's an array
    if (Array.isArray(result.createdAt)) {
      // Format: [year, month, day, hour, minute, second, nano]
      const [year, month, day, hour = 0, minute = 0, second = 0] = result.createdAt;
      result.createdAt = new Date(year, month - 1, day, hour, minute, second);
    }
    
    // Convert updatedAt if it exists and is an array
    if (result.updatedAt && Array.isArray(result.updatedAt)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = result.updatedAt;
      result.updatedAt = new Date(year, month - 1, day, hour, minute, second);
    }
    
    return result;
  }
  
  /**
   * Converts date arrays from API to proper Date objects for lessons
   */
  private convertLessonDateArrays(lesson: Lesson): Lesson {
    // Create a copy of the lesson to avoid modifying the original
    const result = { ...lesson };
    
    // Convert date if it's an array
    if (Array.isArray(result.date)) {
      // Format: [year, month, day]
      const [year, month, day] = result.date;
      result.date = new Date(year, month - 1, day);
    }
    
    // Convert createdAt if it's an array
    if (Array.isArray(result.createdAt)) {
      // Format: [year, month, day, hour, minute, second, nano]
      const [year, month, day, hour = 0, minute = 0, second = 0] = result.createdAt;
      result.createdAt = new Date(year, month - 1, day, hour, minute, second);
    }
    
    // Convert updatedAt if it exists and is an array
    if (result.updatedAt && Array.isArray(result.updatedAt)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = result.updatedAt;
      result.updatedAt = new Date(year, month - 1, day, hour, minute, second);
    }
    
    // Convert course dates if needed
    if (result.course) {
      result.course = this.convertDateArrays(result.course);
    }
    
    return result;
  }
}
