import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Lesson, LessonCreateRequest, LessonUpdateRequest } from '../../../../models/lesson.models';
import { Course } from '../../../../models/course.models';
import { LessonService } from '../../../../services/lesson.service';

@Component({
  selector: 'app-lesson-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './lesson-form.component.html',
  styleUrls: ['./lesson-form.component.scss']
})
export class LessonFormComponent implements OnInit, OnChanges {
  @Input() lesson: Lesson | null = null;
  @Input() course: Course | null = null;
  @Input() allCourses: Course[] = [];
  @Input() isSuperadmin = false;
  
  @Output() formSubmit = new EventEmitter<Lesson>();
  @Output() formCancel = new EventEmitter<void>();
  
  lessonForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  validationErrors: { [key: string]: string } = {};
  
  // Make Object available to the template
  Object = Object;

  constructor(
    private fb: FormBuilder,
    private lessonService: LessonService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    console.log('LessonFormComponent ngOnInit - Lesson input:', this.lesson);
    console.log('LessonFormComponent ngOnInit - Course input:', this.course);
    console.log('LessonFormComponent ngOnInit - All courses:', this.allCourses);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('LessonFormComponent ngOnChanges - changes:', changes);
    
    // Check if lesson input has changed
    if (changes['lesson'] && this.lessonForm) {
      console.log('Lesson input changed:', changes['lesson'].currentValue);
      this.initializeForm();
    }
    
    // Check if course input has changed
    if (changes['course'] && this.lessonForm && !this.lesson) {
      console.log('Course input changed:', changes['course'].currentValue);
      // Only update the course ID if we're creating a new lesson
      if (this.course) {
        this.lessonForm.patchValue({
          courseId: this.course.id
        });
      }
    }
    
    // Check if allCourses input has changed
    if (changes['allCourses'] && this.allCourses.length > 0) {
      console.log('All courses changed:', this.allCourses);
    }
  }

  private createForm(): void {
    this.lessonForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [''],
      date: ['', [Validators.required]],
      defaultScore: [null],
      courseId: [this.course?.id || ''],
      courseIds: [[]]
    });
    
    // If superadmin, make courseIds required, otherwise make courseId required
    if (this.isSuperadmin) {
      // Use a custom validator that checks if the array is not empty
      this.lessonForm.get('courseIds')?.setValidators([(control) => {
        const value = control.value;
        return Array.isArray(value) && value.length > 0 ? null : { required: true };
      }]);
      this.lessonForm.get('courseId')?.clearValidators();
    } else {
      this.lessonForm.get('courseId')?.setValidators([Validators.required]);
      this.lessonForm.get('courseIds')?.clearValidators();
    }
    
    this.lessonForm.get('courseId')?.updateValueAndValidity();
    this.lessonForm.get('courseIds')?.updateValueAndValidity();
  }

  // Initialize form based on whether we're editing or creating
  private initializeForm(): void {
    // Make sure the form is created first
    if (!this.lessonForm) {
      this.createForm();
    }
    
    console.log('initializeForm called, lesson:', this.lesson);
    
    if (this.lesson) {
      console.log('Lesson data available for form initialization:', {
        id: this.lesson.id,
        name: this.lesson.name,
        description: this.lesson.description,
        date: this.lesson.date,
        courseId: this.lesson.course?.id
      });
      
      // Force a setTimeout to ensure Angular's change detection cycle has a chance to run
      setTimeout(() => {
        // Patch form values - use non-null assertion since we've already checked this.lesson exists
        const formValues = {
          name: this.lesson!.name,
          description: this.lesson!.description || '',
          date: this.formatDateForInput(this.lesson!.date),
          defaultScore: this.lesson!.defaultScore || null,
          courseId: this.lesson!.course?.id || this.course?.id || ''
        };
        
        console.log('Patching form with values:', formValues);
        this.lessonForm.patchValue(formValues);
        console.log('Form values after patch:', this.lessonForm.value);
      }, 0);
    } else if (this.course) {
      // If we're creating a new lesson and have a course selected
      this.lessonForm.patchValue({
        courseId: this.course.id
      });
    }
  }

  onSubmit(): void {
    // Reset errors
    this.error = null;
    this.validationErrors = {};
    
    // Manual validation
    const name = this.lessonForm.get('name')?.value;
    const date = this.lessonForm.get('date')?.value;
    const courseIds = this.lessonForm.get('courseIds')?.value;
    const courseId = this.lessonForm.get('courseId')?.value;
    
    // Check required fields
    let hasErrors = false;
    
    if (!name || name.length < 3) {
      this.validationErrors['name'] = 'Ders adı en az 3 karakter olmalıdır.';
      hasErrors = true;
    }
    
    if (!date) {
      this.validationErrors['date'] = 'Ders tarihi zorunludur.';
      hasErrors = true;
    }
    
    // Check course selection based on user role
    if (this.isSuperadmin) {
      if (!courseIds || !Array.isArray(courseIds) || courseIds.length === 0) {
        this.validationErrors['courseIds'] = 'En az bir kurs seçmelisiniz.';
        hasErrors = true;
      }
    } else {
      if (!courseId) {
        this.validationErrors['courseId'] = 'Kurs seçimi zorunludur.';
        hasErrors = true;
      }
    }
    
    if (hasErrors) {
      this.error = 'Lütfen tüm zorunlu alanları doldurun ve hataları düzeltin.';
      return;
    }
    
    this.isSubmitting = true;
    
    if (this.lesson) {
      // Update existing lesson
      const updateRequest: LessonUpdateRequest = {
        name: this.lessonForm.value.name,
        description: this.lessonForm.value.description,
        date: this.lessonForm.value.date,
        defaultScore: this.lessonForm.value.defaultScore
      };
      
      // Add course information based on whether we're using single or multiple courses
      if (this.isSuperadmin && this.lessonForm.value.courseIds?.length > 0) {
        updateRequest.courseIds = this.lessonForm.value.courseIds;
      } else if (this.lessonForm.value.courseId) {
        updateRequest.courseId = this.lessonForm.value.courseId;
      }
      
      this.lessonService.updateLesson(this.lesson.id, updateRequest).subscribe({
        next: (updatedLesson) => {
          this.isSubmitting = false;
          this.formSubmit.emit(updatedLesson);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.handleError(err);
        }
      });
    } else {
      // Create new lesson
      const createRequest: LessonCreateRequest = {
        name: this.lessonForm.value.name,
        description: this.lessonForm.value.description,
        date: this.lessonForm.value.date,
        defaultScore: this.lessonForm.value.defaultScore
      };
      
      // Add course information based on whether we're using single or multiple courses
      if (this.isSuperadmin && this.lessonForm.value.courseIds?.length > 0) {
        createRequest.courseIds = this.lessonForm.value.courseIds;
      } else if (this.lessonForm.value.courseId) {
        createRequest.courseId = this.lessonForm.value.courseId;
      }
      
      this.lessonService.createLesson(createRequest).subscribe({
        next: (createdLesson) => {
          this.isSubmitting = false;
          this.formSubmit.emit(createdLesson);
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
  
  toggleCourseSelection(event: Event, courseId: number): void {
    const checkbox = event.target as HTMLInputElement;
    // Create a new array to ensure change detection works properly
    const courseIds = [...(this.lessonForm.get('courseIds')?.value || [])];
    
    if (checkbox.checked) {
      // Add course ID if not already in the array
      if (!courseIds.includes(courseId)) {
        courseIds.push(courseId);
      }
    } else {
      // Remove course ID if it exists in the array
      const index = courseIds.indexOf(courseId);
      if (index !== -1) {
        courseIds.splice(index, 1);
      }
    }
    
    // Update form value
    this.lessonForm.patchValue({ courseIds });
    
    // Mark as touched and dirty to trigger validation
    this.lessonForm.get('courseIds')?.markAsTouched();
    this.lessonForm.get('courseIds')?.markAsDirty();
    this.lessonForm.get('courseIds')?.updateValueAndValidity();
    
    // Log form status for debugging
    console.log('Form valid:', this.lessonForm.valid);
    console.log('CourseIds valid:', this.lessonForm.get('courseIds')?.valid);
    console.log('CourseIds value:', courseIds);
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

  // Check if a form control has an error
  hasError(controlName: string): boolean {
    const control = this.lessonForm.get(controlName);
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  // Format date for input field
  formatDateForInput(date: string | Date): string {
    if (!date) return '';
    
    let dateObj: Date;
    if (typeof date === 'string') {
      dateObj = new Date(date);
    } else if (date instanceof Date) {
      dateObj = date;
    } else {
      return '';
    }
    
    // Format as YYYY-MM-DD for HTML date input
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    
    return `${year}-${month}-${day}`;
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
          if (this.lessonForm.get(formKey)) {
            this.validationErrors[formKey] = validationErrors[key];
          }
        }
      }
      this.error = 'Lütfen form hatalarını düzeltin.';
    } else {
      this.error = 'Bir hata oluştu. Lütfen tekrar deneyin.';
    }
  }

  // Get error message for a field
  getErrorMessage(controlName: string): string {
    const control = this.lessonForm.get(controlName);
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Bu alan zorunludur.';
    if (control.errors['minlength']) return `En az ${control.errors['minlength'].requiredLength} karakter olmalıdır.`;
    if (control.errors['maxlength']) return `En fazla ${control.errors['maxlength'].requiredLength} karakter olmalıdır.`;
    
    return 'Geçersiz değer.';
  }
}
