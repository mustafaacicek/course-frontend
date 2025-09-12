import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LessonNote } from '../../../models/lesson-note.models';
import { CourseService } from '../../../services/course.service';
import { LessonService } from '../../../services/lesson.service';
import { LessonNoteService } from '../../../services/lesson-note.service';
import { StudentLessonNoteService } from '../../../services/student-lesson-note.service';
import { Course } from '../../../models/course.models';
import { Lesson } from '../../../models/lesson.models';
import { LessonNoteBatchUpdateRequest, LessonNoteUpdateItem, StudentLessonNote } from '../../../models/student-lesson-note.model';

@Component({
  selector: 'app-student-lesson-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './student-lesson-notes.component.html',
  styleUrls: ['./student-lesson-notes.component.scss']
})
export class StudentLessonNotesComponent implements OnInit {
  // Course and lesson selection
  courses: Course[] = [];
  lessons: Lesson[] = [];
  
  // Student data with lesson notes
  students: StudentLessonNote[] = [];
  
  // Form for batch editing
  studentNotesForm: FormGroup;
  
  // Selection state
  selectedCourseId: number | null = null;
  selectedLessonId: number | null = null;
  
  // UI state
  isLoading = false;
  error: string | null = null;
  success: string | null = null;
  
  // History modal state
  showHistoryModal = false;
  selectedLessonNoteForHistory: LessonNote | null = null;
  
  constructor(
    private fb: FormBuilder,
    private courseService: CourseService,
    private lessonService: LessonService,
    private lessonNoteService: LessonNoteService,
    private studentLessonNoteService: StudentLessonNoteService
  ) { 
    // Initialize the form
    this.studentNotesForm = this.fb.group({
      students: this.fb.array([])
    });
  }

  ngOnInit(): void {
    this.loadAllCourses();
  }
  
  // Get the students form array
  get studentsArray(): FormArray {
    return this.studentNotesForm.get('students') as FormArray;
  }
  
  // Load all courses
  loadAllCourses(): void {
    this.isLoading = true;
    this.courseService.getAllCourses().subscribe({
      next: (data: Course[]) => {
        this.courses = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Kurslar yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading courses:', err);
      }
    });
  }
  
  // Load lessons by course
  loadLessonsByCourse(courseId: number): void {
    this.isLoading = true;
    this.lessonService.getLessonsByCourseId(courseId).subscribe({
      next: (data: Lesson[]) => {
        this.lessons = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Dersler yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading lessons:', err);
      }
    });
  }
  
  // Load students with lesson notes
  loadStudentsWithLessonNotes(): void {
    if (!this.selectedCourseId || !this.selectedLessonId) {
      return;
    }
    
    this.isLoading = true;
    this.studentLessonNoteService.getStudentsWithLessonNotes(
      this.selectedCourseId, 
      this.selectedLessonId
    ).subscribe({
      next: (data: StudentLessonNote[]) => {
        this.students = this.convertDates(data);
        this.initializeStudentForms();
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Öğrenci notları yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading student notes:', err);
      }
    });
  }
  
  // Initialize student forms based on loaded students
  initializeStudentForms(): void {
    // Clear existing form array
    while (this.studentsArray.length) {
      this.studentsArray.removeAt(0);
    }
    
    // Add a form group for each student
    this.students.forEach(student => {
      const studentForm = this.fb.group({
        studentId: [student.id],
        lessonId: [this.selectedLessonId],
        score: [student.lessonNote?.score || null],
        passed: [student.lessonNote?.passed !== undefined ? student.lessonNote.passed : null],
        remark: [student.lessonNote?.remark || ''],
        changed: [false] // Track if this student's note has been changed
      });
      
      // Listen for changes to mark the form as changed
      studentForm.valueChanges.subscribe(() => {
        studentForm.get('changed')?.setValue(true);
      });
      
      this.studentsArray.push(studentForm);
    });
  }
  
  // Handle course selection change
  onCourseSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    const courseId = selectElement.value ? +selectElement.value : null;
    
    this.selectedCourseId = courseId;
    this.selectedLessonId = null;
    this.lessons = [];
    this.students = [];
    
    // Clear the form
    while (this.studentsArray.length) {
      this.studentsArray.removeAt(0);
    }
    
    if (courseId) {
      this.loadLessonsByCourse(courseId);
    }
  }
  
  // Handle lesson selection change
  onLessonSelect(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedLessonId = selectElement.value ? +selectElement.value : null;
    
    if (this.selectedLessonId) {
      this.loadStudentsWithLessonNotes();
    } else {
      this.students = [];
      
      // Clear the form
      while (this.studentsArray.length) {
        this.studentsArray.removeAt(0);
      }
    }
  }
  
  // Save a single student's note
  saveStudentNote(index: number): void {
    const studentForm = this.studentsArray.at(index) as FormGroup;
    
    if (!studentForm.get('changed')?.value) {
      // No changes, no need to save
      return;
    }
    
    // Ensure we have valid IDs
    const studentId = Number(studentForm.value.studentId);
    const lessonId = Number(studentForm.value.lessonId);
    
    if (isNaN(studentId) || isNaN(lessonId) || studentId <= 0 || lessonId <= 0) {
      this.error = 'Öğrenci veya ders bilgisi eksik veya geçersiz.';
      setTimeout(() => this.error = null, 3000);
      return;
    }
    
    // Create a clean object with only the required fields
    const noteData: LessonNoteUpdateItem = {
      studentId: studentId,
      lessonId: lessonId,
      score: studentForm.value.score !== '' && studentForm.value.score !== null ? Number(studentForm.value.score) : undefined,
      passed: studentForm.value.passed,
      remark: studentForm.value.remark || ''
    };
    
    console.log('Sending note data:', noteData);
    
    this.isLoading = true;
    // Clear any existing messages before making the request
    this.success = null;
    this.error = null;
    
    this.studentLessonNoteService.updateStudentLessonNote(
      studentId, 
      lessonId, 
      noteData
    ).subscribe({
      next: (data: LessonNote) => {
        // Update the student's lesson note in the UI
        this.students[index].lessonNote = data;
        
        // Reset the changed flag
        studentForm.get('changed')?.setValue(false);
        
        this.success = 'Not başarıyla kaydedildi.';
        setTimeout(() => this.success = null, 3000);
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Not kaydedilirken bir hata oluştu: ' + (err.error?.message || err.message || 'Bilinmeyen hata');
        this.isLoading = false;
        console.error('Error saving note:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  // Save all changed student notes
  saveAllChanges(): void {
    const changedForms = this.studentsArray.controls.filter(
      control => control.get('changed')?.value === true
    );
    
    if (changedForms.length === 0) {
      this.success = 'Değişiklik yapılmadı.';
      setTimeout(() => this.success = null, 3000);
      return;
    }
    
    // Filter out forms with missing IDs
    const validForms = changedForms.filter(form => {
      const studentId = Number(form.get('studentId')?.value);
      const lessonId = Number(form.get('lessonId')?.value);
      return !isNaN(studentId) && !isNaN(lessonId) && studentId > 0 && lessonId > 0;
    });
    
    if (validForms.length === 0) {
      this.error = 'Geçerli öğrenci veya ders bilgisi bulunamadı.';
      setTimeout(() => this.error = null, 3000);
      return;
    }
    
    const updateRequest: LessonNoteBatchUpdateRequest = {
      notes: validForms.map(form => {
        const studentId = Number(form.get('studentId')?.value);
        const lessonId = Number(form.get('lessonId')?.value);
        const scoreValue = form.get('score')?.value;
        
        return {
          studentId: studentId,
          lessonId: lessonId,
          score: scoreValue !== '' && scoreValue !== null ? Number(scoreValue) : undefined,
          passed: form.get('passed')?.value,
          remark: form.get('remark')?.value || ''
        };
      })
    };
    
    console.log('Sending batch update request:', updateRequest);
    
    this.isLoading = true;
    // Clear any existing messages before making the request
    this.success = null;
    this.error = null;
    
    this.studentLessonNoteService.batchUpdateLessonNotes(updateRequest).subscribe({
      next: (data: LessonNote[]) => {
        // Update the students' lesson notes in the UI
        data.forEach(updatedNote => {
          const studentIndex = this.students.findIndex(
            s => s.id === updatedNote.student.id
          );
          if (studentIndex !== -1) {
            this.students[studentIndex].lessonNote = updatedNote;
            
            // Reset the changed flag
            const form = this.studentsArray.at(studentIndex) as FormGroup;
            form.get('changed')?.setValue(false);
          }
        });
        
        this.success = `${data.length} öğrenci notu başarıyla kaydedildi.`;
        setTimeout(() => this.success = null, 3000);
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = 'Notlar kaydedilirken bir hata oluştu: ' + (err.error?.message || err.message || 'Bilinmeyen hata');
        this.isLoading = false;
        console.error('Error saving notes:', err);
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
  
  // Set pass status for a student
  setPassStatus(index: number, passed: boolean): void {
    const studentForm = this.studentsArray.at(index) as FormGroup;
    studentForm.get('passed')?.setValue(passed);
    studentForm.get('changed')?.setValue(true);
  }
  
  // Open history modal for a student's note
  openHistoryModal(student: StudentLessonNote): void {
    if (!student.lessonNote) {
      return; // No note to show history for
    }
    
    this.selectedLessonNoteForHistory = student.lessonNote;
    this.showHistoryModal = true;
    
    // Load history data
    this.lessonNoteService.getLessonNoteHistory(student.lessonNote.id).subscribe({
      next: (data: any[]) => {
        if (this.selectedLessonNoteForHistory) {
          // Initialize history array if it doesn't exist
          if (!this.selectedLessonNoteForHistory.history) {
            this.selectedLessonNoteForHistory.history = [];
          }
          
          // Convert date arrays to Date objects
          const convertedData = data.map(history => this.convertDates(history));
          
          this.selectedLessonNoteForHistory.history = convertedData;
        }
      },
      error: (err: any) => {
        this.error = 'Not geçmişi yüklenirken bir hata oluştu.';
        console.error('Error loading lesson note history:', err);
      }
    });
  }
  
  // Close history modal
  closeHistoryModal(): void {
    this.showHistoryModal = false;
    this.selectedLessonNoteForHistory = null;
  }
  
  // Get CSS class for pass status
  getPassStatusClass(passed: boolean | null | undefined): string {
    if (passed === null || passed === undefined) return 'status-unknown';
    return passed ? 'status-passed' : 'status-failed';
  }
  
  // Get text for pass status
  getPassStatusText(passed: boolean | null | undefined): string {
    if (passed === null || passed === undefined) return 'Belirlenmedi';
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
  
  // Recursively converts date arrays to Date objects
  convertDates(obj: any): any {
    if (!obj) return obj;
    
    if (Array.isArray(obj)) {
      // If it's a date array (length 3 or 7 with numbers)
      if ((obj.length === 3 || obj.length === 7) && obj.every((item: any) => typeof item === 'number')) {
        // It's likely a date array [year, month, day] or [year, month, day, hour, minute, second, nano]
        const [year, month, day, hour = 0, minute = 0, second = 0] = obj;
        return new Date(year, month - 1, day, hour, minute, second);
      }
      
      // If it's a regular array, convert each item
      return obj.map((item: any) => this.convertDates(item));
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
