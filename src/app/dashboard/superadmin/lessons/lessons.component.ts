import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Lesson } from '../../../models/lesson.models';
import { Course } from '../../../models/course.models';
import { LessonService } from '../../../services/lesson.service';
import { CourseService } from '../../../services/course.service';
import { LessonFormComponent } from './lesson-form/lesson-form.component';

@Component({
  selector: 'app-superadmin-lessons',
  standalone: true,
  imports: [CommonModule, FormsModule, LessonFormComponent],
  providers: [LessonService, CourseService],
  templateUrl: './lessons.component.html',
  styleUrls: ['./lessons.component.scss']
})
export class SuperadminLessonsComponent implements OnInit {
  lessons: Lesson[] = [];
  allLessons: Lesson[] = [];
  courses: Course[] = [];
  selectedCourse: Course | null = null;
  
  isLoading = false;
  error: string | null = null;
  successMessage: string = '';
  
  showAddForm = false;
  editingLesson: Lesson | null = null;
  
  // Bulk operations
  selectedLessons: Set<number> = new Set();
  selectAllChecked = false;
  bulkActionInProgress = false;
  showBulkConfirmModal = false;
  bulkAction: 'delete' | 'move' | null = null;
  targetCourseId: number | null = null;

  constructor(
    private lessonService: LessonService,
    private courseService: CourseService
  ) { }

  ngOnInit(): void {
    this.loadAllCourses();
    this.loadAllLessons();
  }

  loadAllCourses(): void {
    this.isLoading = true;
    this.error = null;
    
    this.courseService.getAllCourses().subscribe({
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
  
  loadAllLessons(): void {
    this.isLoading = true;
    this.error = null;
    
    this.lessonService.getAllLessons().subscribe({
      next: (data: Lesson[]) => {
        // Convert date arrays to Date objects
        this.allLessons = data.map(lesson => this.convertLessonDateArrays(lesson));
        this.lessons = [...this.allLessons];
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Dersler yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading lessons:', err);
      }
    });
  }

  onCourseSelect(course: Course | null): void {
    this.selectedCourse = course;
    this.resetSelection();
    
    if (course) {
      this.loadLessonsForCourse(course.id);
    } else {
      this.lessons = [...this.allLessons];
    }
  }
  
  onCourseSelectById(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const courseId = selectElement.value;
    
    if (courseId) {
      // Find the course by ID
      const selectedCourse = this.courses.find(c => c.id === +courseId);
      if (selectedCourse) {
        this.onCourseSelect(selectedCourse);
      }
    } else {
      // No course selected ("All Courses" option)
      this.onCourseSelect(null);
    }
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
          } else {
            this.loadAllLessons();
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
    } else {
      this.loadAllLessons();
    }
  }

  closeForm(): void {
    this.showAddForm = false;
    this.editingLesson = null;
  }
  
  // Bulk operations
  toggleSelectAll(): void {
    if (this.selectAllChecked) {
      // Select all lessons
      this.lessons.forEach(lesson => {
        this.selectedLessons.add(lesson.id);
      });
    } else {
      // Deselect all lessons
      this.selectedLessons.clear();
    }
  }
  
  toggleLessonSelection(lessonId: number): void {
    if (this.selectedLessons.has(lessonId)) {
      this.selectedLessons.delete(lessonId);
      this.selectAllChecked = false;
    } else {
      this.selectedLessons.add(lessonId);
      // Check if all lessons are selected
      this.selectAllChecked = this.lessons.every(lesson => this.selectedLessons.has(lesson.id));
    }
  }
  
  isLessonSelected(lessonId: number): boolean {
    return this.selectedLessons.has(lessonId);
  }
  
  resetSelection(): void {
    this.selectedLessons.clear();
    this.selectAllChecked = false;
  }
  
  openBulkActionConfirm(action: 'delete' | 'move'): void {
    if (this.selectedLessons.size === 0) {
      this.error = 'Lütfen en az bir ders seçin.';
      return;
    }
    
    this.bulkAction = action;
    this.showBulkConfirmModal = true;
  }
  
  closeBulkActionConfirm(): void {
    this.showBulkConfirmModal = false;
    this.bulkAction = null;
    this.targetCourseId = null;
  }
  
  executeBulkAction(): void {
    if (!this.bulkAction) return;
    
    this.bulkActionInProgress = true;
    
    if (this.bulkAction === 'delete') {
      this.bulkDeleteLessons();
    } else if (this.bulkAction === 'move' && this.targetCourseId) {
      this.bulkMoveLessons();
    }
  }
  
  bulkDeleteLessons(): void {
    const lessonIds = Array.from(this.selectedLessons);
    let deletedCount = 0;
    let errorCount = 0;
    
    lessonIds.forEach(id => {
      this.lessonService.deleteLesson(id).subscribe({
        next: () => {
          deletedCount++;
          if (deletedCount + errorCount === lessonIds.length) {
            this.finishBulkAction(`${deletedCount} ders başarıyla silindi.${errorCount > 0 ? ` ${errorCount} ders silinirken hata oluştu.` : ''}`);
          }
        },
        error: (err) => {
          console.error(`Error deleting lesson ${id}:`, err);
          errorCount++;
          if (deletedCount + errorCount === lessonIds.length) {
            this.finishBulkAction(`${deletedCount} ders başarıyla silindi.${errorCount > 0 ? ` ${errorCount} ders silinirken hata oluştu.` : ''}`);
          }
        }
      });
    });
  }
  
  bulkMoveLessons(): void {
    if (!this.targetCourseId) return;
    
    const lessonIds = Array.from(this.selectedLessons);
    let movedCount = 0;
    let errorCount = 0;
    
    lessonIds.forEach(id => {
      // Ensure courseId is a number, not null
      const updateRequest = {
        courseId: this.targetCourseId as number
      };
      
      this.lessonService.updateLesson(id, updateRequest).subscribe({
        next: () => {
          movedCount++;
          if (movedCount + errorCount === lessonIds.length) {
            this.finishBulkAction(`${movedCount} ders başarıyla taşındı.${errorCount > 0 ? ` ${errorCount} ders taşınırken hata oluştu.` : ''}`);
          }
        },
        error: (err) => {
          console.error(`Error moving lesson ${id}:`, err);
          errorCount++;
          if (movedCount + errorCount === lessonIds.length) {
            this.finishBulkAction(`${movedCount} ders başarıyla taşındı.${errorCount > 0 ? ` ${errorCount} ders taşınırken hata oluştu.` : ''}`);
          }
        }
      });
    });
  }
  
  finishBulkAction(message: string): void {
    this.bulkActionInProgress = false;
    this.showBulkConfirmModal = false;
    this.successMessage = message;
    this.resetSelection();
    
    // Reload lessons
    if (this.selectedCourse) {
      this.loadLessonsForCourse(this.selectedCourse.id);
    } else {
      this.loadAllLessons();
    }
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
