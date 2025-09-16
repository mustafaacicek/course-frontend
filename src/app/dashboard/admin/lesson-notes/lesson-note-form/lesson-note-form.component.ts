import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LessonNote, LessonNoteCreateRequest, LessonNoteUpdateRequest } from '../../../../models/lesson-note.models';
import { Course } from '../../../../models/course.models';
import { Lesson } from '../../../../models/lesson.models';
import { Student } from '../../../../models/student.models';
import { LessonNoteService } from '../../../../services/lesson-note.service';
import { LessonService } from '../../../../services/lesson.service';

@Component({
  selector: 'app-lesson-note-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './lesson-note-form.component.html',
  styleUrls: ['./lesson-note-form.component.scss']
})
export class LessonNoteFormComponent implements OnInit, OnChanges {
  @Input() lessonNote: LessonNote | null = null;
  @Input() courses: Course[] = [];
  @Input() lessons: Lesson[] = [];
  @Input() students: Student[] = [];
  @Input() selectedCourseId: number | null = null;
  @Input() selectedLessonId: number | null = null;
  @Input() selectedStudentId: number | null = null;
  
  @Output() formSubmit = new EventEmitter<LessonNote>();
  @Output() formCancel = new EventEmitter<void>();
  
  lessonNoteForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  validationErrors: { [key: string]: string } = {};
  
  filteredLessons: Lesson[] = [];
  
  constructor(
    private fb: FormBuilder,
    private lessonNoteService: LessonNoteService,
    private lessonService: LessonService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    this.updateFilteredLessons();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lessonNote'] && this.lessonNoteForm) {
      this.initializeForm();
    }
    
    if ((changes['courses'] || changes['selectedCourseId']) && this.lessonNoteForm) {
      this.updateFilteredLessons();
    }
    
    if (changes['selectedLessonId'] && this.lessonNoteForm && !this.lessonNote) {
      this.lessonNoteForm.patchValue({
        lessonId: this.selectedLessonId
      });
    }
    
    if (changes['selectedStudentId'] && this.lessonNoteForm && !this.lessonNote) {
      this.lessonNoteForm.patchValue({
        studentId: this.selectedStudentId
      });
    }
  }
  
  private createForm(): void {
    this.lessonNoteForm = this.fb.group({
      courseId: [this.selectedCourseId || '', Validators.required],
      lessonId: [this.selectedLessonId || '', Validators.required],
      studentId: [this.selectedStudentId || '', Validators.required],
      score: [null, [Validators.min(0), Validators.max(100)]],
      passed: [null],
      remark: ['']
    });
    
    // Listen for course changes to update lessons
    this.lessonNoteForm.get('courseId')?.valueChanges.subscribe(courseId => {
      if (courseId) {
        this.loadLessonsByCourse(courseId);
        this.lessonNoteForm.patchValue({ lessonId: '' });
      } else {
        this.filteredLessons = [];
      }
    });
  }
  
  private initializeForm(): void {
    if (!this.lessonNoteForm) {
      this.createForm();
    }
    
    if (this.lessonNote) {
      this.lessonNoteForm.patchValue({
        courseId: this.lessonNote.lesson.course.id,
        lessonId: this.lessonNote.lesson.id,
        studentId: this.lessonNote.student.id,
        score: this.lessonNote.score,
        passed: this.lessonNote.passed,
        remark: this.lessonNote.remark
      });
      
      // Load lessons for the selected course
      this.loadLessonsByCourse(this.lessonNote.lesson.course.id);
    } else {
      this.lessonNoteForm.reset({
        courseId: this.selectedCourseId || '',
        lessonId: this.selectedLessonId || '',
        studentId: this.selectedStudentId || '',
        score: null,
        passed: null,
        remark: ''
      });
    }
  }
  
  private updateFilteredLessons(): void {
    if (this.selectedCourseId) {
      this.loadLessonsByCourse(this.selectedCourseId);
    } else if (this.lessonNote) {
      this.loadLessonsByCourse(this.lessonNote.lesson.course.id);
    } else {
      this.filteredLessons = [...this.lessons];
    }
  }
  
  private loadLessonsByCourse(courseId: number): void {
    this.lessonService.getLessonsByCourseId(courseId).subscribe({
      next: (data) => {
        this.filteredLessons = data;
      },
      error: (err) => {
        this.error = 'Dersler yüklenirken bir hata oluştu.';
        console.error('Error loading lessons:', err);
      }
    });
  }
  
  onSubmit(): void {
    this.error = null;
    this.validationErrors = {};
    
    if (this.lessonNoteForm.invalid) {
      this.markFormGroupTouched(this.lessonNoteForm);
      this.error = 'Lütfen tüm zorunlu alanları doldurun ve hataları düzeltin.';
      return;
    }
    
    this.isSubmitting = true;
    
    if (this.lessonNote) {
      // Update existing lesson note
      const updateRequest: LessonNoteUpdateRequest = {
        score: this.lessonNoteForm.value.score,
        passed: this.lessonNoteForm.value.passed,
        remark: this.lessonNoteForm.value.remark
      };
      
      this.lessonNoteService.updateLessonNote(this.lessonNote.id, updateRequest).subscribe({
        next: (updatedNote) => {
          this.isSubmitting = false;
          this.formSubmit.emit(updatedNote);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.handleError(err);
        }
      });
    } else {
      // Create new lesson note
      const createRequest: LessonNoteCreateRequest = {
        studentId: this.lessonNoteForm.value.studentId,
        lessonId: this.lessonNoteForm.value.lessonId,
        score: this.lessonNoteForm.value.score,
        passed: this.lessonNoteForm.value.passed,
        remark: this.lessonNoteForm.value.remark
      };
      
      this.lessonNoteService.createLessonNote(createRequest).subscribe({
        next: (createdNote) => {
          this.isSubmitting = false;
          this.formSubmit.emit(createdNote);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.handleError(err);
        }
      });
    }
  }
  
  cancel(): void {
    this.formCancel.emit();
  }
  
  // Helper method to mark all form controls as touched
  markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  // Handle API errors
  private handleError(err: any): void {
    console.error('API error:', err);
    
    if (err.error?.message) {
      this.error = err.error.message;
    } else if (err.error?.errors) {
      // Handle validation errors
      const validationErrors = err.error.errors;
      for (const key in validationErrors) {
        if (validationErrors.hasOwnProperty(key)) {
          const formKey = key.charAt(0).toLowerCase() + key.slice(1);
          if (this.lessonNoteForm.get(formKey)) {
            this.validationErrors[formKey] = validationErrors[key];
          }
        }
      }
      this.error = 'Lütfen form hatalarını düzeltin.';
    } else {
      this.error = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }
  
  // Check if a form control has an error
  hasError(controlName: string): boolean {
    const control = this.lessonNoteForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }
  
  // Get error message for a field
  getErrorMessage(controlName: string): string {
    const control = this.lessonNoteForm.get(controlName);
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Bu alan zorunludur.';
    if (control.errors['min']) return `En az ${control.errors['min'].min} olmalıdır.`;
    if (control.errors['max']) return `En fazla ${control.errors['max'].max} olmalıdır.`;
    
    return 'Geçersiz değer.';
  }
}
