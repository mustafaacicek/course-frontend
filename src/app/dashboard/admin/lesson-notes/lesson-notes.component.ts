import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LessonNote } from '../../../models/lesson-note.models';
import { LessonNoteService } from '../../../services/lesson-note.service';
import { CourseService } from '../../../services/course.service';
import { LessonService } from '../../../services/lesson.service';
import { StudentService } from '../../../services/student.service';
import { Course } from '../../../models/course.models';
import { Lesson } from '../../../models/lesson.models';
import { Student } from '../../../models/student.models';
import { LessonNoteFormComponent } from './lesson-note-form/lesson-note-form.component';

@Component({
  selector: 'app-lesson-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, LessonNoteFormComponent],
  templateUrl: './lesson-notes.component.html',
  styleUrls: ['./lesson-notes.component.scss']
})
export class LessonNotesComponent implements OnInit {
  lessonNotes: LessonNote[] = [];
  filteredLessonNotes: LessonNote[] = [];
  courses: Course[] = [];
  lessons: Lesson[] = [];
  students: Student[] = [];
  
  selectedCourseId: number | null = null;
  selectedLessonId: number | null = null;
  selectedStudentId: number | null = null;
  
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  
  showFormModal = false;
  editingLessonNote: LessonNote | null = null;
  
  showHistoryModal = false;
  selectedLessonNoteForHistory: LessonNote | null = null;
  
  constructor(
    private lessonNoteService: LessonNoteService,
    private courseService: CourseService,
    private lessonService: LessonService,
    private studentService: StudentService
  ) { }

  ngOnInit(): void {
    this.loadAllCourses();
    this.loadAllStudents();
    this.loadAllLessonNotes();
  }
  
  loadAllCourses(): void {
    this.isLoading = true;
    this.courseService.getAllCourses().subscribe({
      next: (data) => {
        this.courses = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Kurslar yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading courses:', err);
      }
    });
  }
  
  loadAllStudents(): void {
    this.isLoading = true;
    this.studentService.getAllStudents().subscribe({
      next: (data) => {
        this.students = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Öğrenciler yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading students:', err);
      }
    });
  }
  
  loadLessonsByCourse(courseId: number): void {
    this.isLoading = true;
    this.lessonService.getLessonsByCourseId(courseId).subscribe({
      next: (data) => {
        this.lessons = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Dersler yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading lessons:', err);
      }
    });
  }
  
  loadAllLessonNotes(): void {
    this.isLoading = true;
    this.error = null;
    
    this.lessonNoteService.getAllLessonNotes().subscribe({
      next: (data) => {
        console.log('Raw lesson notes data:', data);
        
        // Convert date arrays to Date objects
        this.lessonNotes = data.map(note => this.convertDates(note));
        this.filteredLessonNotes = [...this.lessonNotes];
        
        console.log('Converted lesson notes:', this.lessonNotes);
        console.log('Number of lesson notes:', this.lessonNotes.length);
        
        this.isLoading = false;
      },
      error: (err) => {
        this.error = 'Ders notları yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading lesson notes:', err);
      }
    });
  }
  
  onCourseSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const courseId = selectElement.value ? +selectElement.value : null;
    
    this.selectedCourseId = courseId;
    this.selectedLessonId = null;
    this.lessons = [];
    
    if (courseId) {
      this.loadLessonsByCourse(courseId);
      this.filterLessonNotes();
    } else {
      this.filterLessonNotes();
    }
  }
  
  onLessonSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedLessonId = selectElement.value ? +selectElement.value : null;
    this.filterLessonNotes();
  }
  
  onStudentSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedStudentId = selectElement.value ? +selectElement.value : null;
    this.filterLessonNotes();
  }
  
  filterLessonNotes(): void {
    this.filteredLessonNotes = this.lessonNotes.filter(note => {
      let matchesCourse = true;
      let matchesLesson = true;
      let matchesStudent = true;
      
      if (this.selectedCourseId) {
        matchesCourse = note.lesson.course.id === this.selectedCourseId;
      }
      
      if (this.selectedLessonId) {
        matchesLesson = note.lesson.id === this.selectedLessonId;
      }
      
      if (this.selectedStudentId) {
        matchesStudent = note.student.id === this.selectedStudentId;
      }
      
      return matchesCourse && matchesLesson && matchesStudent;
    });
  }
  
  clearFilters(): void {
    this.selectedCourseId = null;
    this.selectedLessonId = null;
    this.selectedStudentId = null;
    this.filteredLessonNotes = [...this.lessonNotes];
  }
  
  openAddLessonNoteModal(): void {
    this.editingLessonNote = null;
    this.showFormModal = true;
  }
  
  openEditLessonNoteModal(lessonNote: LessonNote): void {
    this.editingLessonNote = lessonNote;
    this.showFormModal = true;
  }
  
  closeFormModal(): void {
    this.showFormModal = false;
    this.editingLessonNote = null;
  }
  
  openHistoryModal(lessonNote: LessonNote): void {
    this.selectedLessonNoteForHistory = lessonNote;
    this.showHistoryModal = true;
    console.log('Opening history modal for lesson note:', lessonNote);
    
    // Load history data
    this.lessonNoteService.getLessonNoteHistory(lessonNote.id).subscribe({
      next: (data) => {
        console.log('Raw history data received:', data);
        
        if (this.selectedLessonNoteForHistory) {
          // Initialize history array if it doesn't exist
          if (!this.selectedLessonNoteForHistory.history) {
            this.selectedLessonNoteForHistory.history = [];
          }
          
          // Use the convertDates method to handle all date conversions
          const convertedData = data.map(history => this.convertDates(history));
          
          this.selectedLessonNoteForHistory.history = convertedData;
          console.log('Converted history data:', convertedData);
          console.log('History length:', convertedData.length);
        }
      },
      error: (err) => {
        this.error = 'Not geçmişi yüklenirken bir hata oluştu.';
        console.error('Error loading lesson note history:', err);
      }
    });
  }
  
  closeHistoryModal(): void {
    this.showHistoryModal = false;
    this.selectedLessonNoteForHistory = null;
  }
  
  onLessonNoteSubmit(lessonNote: LessonNote): void {
    this.closeFormModal();
    this.loadAllLessonNotes();
    this.success = lessonNote.id ? 'Ders notu başarıyla güncellendi.' : 'Ders notu başarıyla eklendi.';
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      this.success = null;
    }, 3000);
  }
  
  deleteLessonNote(id: number): void {
    if (confirm('Bu ders notunu silmek istediğinizden emin misiniz?')) {
      this.isLoading = true;
      this.error = null;
      
      this.lessonNoteService.deleteLessonNote(id).subscribe({
        next: () => {
          this.success = 'Ders notu başarıyla silindi.';
          this.loadAllLessonNotes();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.success = null;
          }, 3000);
        },
        error: (err) => {
          this.error = 'Ders notu silinirken bir hata oluştu.';
          this.isLoading = false;
          console.error('Error deleting lesson note:', err);
        }
      });
    }
  }
  
  getPassStatusClass(passed: boolean | null): string {
    if (passed === null) return 'status-unknown';
    return passed ? 'status-passed' : 'status-failed';
  }
  
  getPassStatusText(passed: boolean | null): string {
    if (passed === null) return 'Belirlenmedi';
    return passed ? 'Geçti' : 'Kaldı';
  }
  
  // Helper method to safely check if history exists and has items
  hasHistory(): boolean {
    return !!this.selectedLessonNoteForHistory?.history && this.selectedLessonNoteForHistory.history.length > 0;
  }
  
  // Helper method to safely check if history is empty
  hasEmptyHistory(): boolean {
    return !this.selectedLessonNoteForHistory?.history || this.selectedLessonNoteForHistory.history.length === 0;
  }
  
  /**
   * Recursively converts date arrays to Date objects
   * @param obj The object to convert dates in
   * @returns The object with converted dates
   */
  convertDates(obj: any): any {
    if (!obj) return obj;
    
    if (Array.isArray(obj)) {
      // If it's a date array (length 3 or 7 with numbers)
      if ((obj.length === 3 || obj.length === 7) && obj.every(item => typeof item === 'number')) {
        // It's likely a date array [year, month, day] or [year, month, day, hour, minute, second, nano]
        const [year, month, day, hour = 0, minute = 0, second = 0] = obj;
        return new Date(year, month - 1, day, hour, minute, second);
      }
      
      // If it's a regular array, convert each item
      return obj.map(item => this.convertDates(item));
    }
    
    if (typeof obj === 'object') {
      const result = {...obj};
      
      for (const key in result) {
        if (result.hasOwnProperty(key)) {
          result[key] = this.convertDates(result[key]);
        }
      }
      
      return result;
    }
    
    return obj;
  }
}
