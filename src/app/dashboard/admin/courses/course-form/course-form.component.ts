import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Course, CourseCreateRequest, CourseUpdateRequest } from '../../../../models/course.models';
import { CourseService } from '../../../../services/course.service';
import { CourseLocation } from '../../../../models/location.models';
import { HttpClientModule } from '@angular/common/http';

@Component({
  selector: 'app-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss']
})
export class CourseFormComponent implements OnInit, OnChanges {
  @Input() course: Course | null = null;
  @Input() adminLocations: CourseLocation[] = [];
  @Output() formSubmit = new EventEmitter<Course>();
  @Output() formCancel = new EventEmitter<void>();
  
  courseForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  validationErrors: { [key: string]: string } = {};
  
  // Make Object available to the template
  Object = Object;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    console.log('CourseFormComponent ngOnInit - Course input:', this.course);
    console.log('Admin locations:', this.adminLocations);
    
    // Initialize the form
    this.initializeForm();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log('CourseFormComponent ngOnChanges - changes:', changes);
    
    // Check if course input has changed
    if (changes['course'] && this.courseForm) {
      console.log('Course input changed:', changes['course'].currentValue);
      this.initializeForm();
    }
  }

  private createForm(): void {
    this.courseForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: [''],
      startDate: ['', [Validators.required]],
      endDate: [''],
      courseLocationId: [null, [Validators.required]]
    });
  }

  // Initialize form based on whether we're editing or creating
  private initializeForm(): void {
    // Make sure the form is created first
    if (!this.courseForm) {
      this.createForm();
    }
    
    console.log('initializeForm called, course:', this.course);
    
    if (this.course) {
      console.log('Course data available for form initialization:', {
        id: this.course.id,
        name: this.course.name,
        description: this.course.description,
        startDate: this.course.startDate,
        endDate: this.course.endDate,
        courseLocationId: this.course.courseLocation?.id
      });
      
      // Force a setTimeout to ensure Angular's change detection cycle has a chance to run
      setTimeout(() => {
        // Patch form values - use non-null assertion since we've already checked this.course exists
        const formValues = {
          name: this.course!.name,
          description: this.course!.description || '',
          startDate: this.formatDateForInput(this.course!.startDate),
          endDate: this.course!.endDate ? this.formatDateForInput(this.course!.endDate) : '',
          courseLocationId: this.course!.courseLocation?.id
        };
        
        console.log('Patching form with values:', formValues);
        this.courseForm.patchValue(formValues);
        console.log('Form values after patch:', this.courseForm.value);
      }, 0);
    } else {
      console.log('No course data available - creating new course');
      
      // If there's only one location, select it by default
      if (this.adminLocations.length === 1) {
        this.courseForm.patchValue({
          courseLocationId: this.adminLocations[0].id
        });
      }
    }
  }

  onSubmit(): void {
    // Reset errors
    this.error = null;
    this.validationErrors = {};
    
    if (this.courseForm.invalid) {
      this.markFormGroupTouched(this.courseForm);
      this.error = 'Lütfen tüm zorunlu alanları doldurun ve hataları düzeltin.';
      return;
    }
    
    this.isSubmitting = true;
    
    if (this.course) {
      // Update existing course
      const updateRequest: CourseUpdateRequest = {
        name: this.courseForm.value.name,
        description: this.courseForm.value.description,
        startDate: this.courseForm.value.startDate,
        endDate: this.courseForm.value.endDate,
        courseLocationId: this.courseForm.value.courseLocationId
      };
      
      this.courseService.updateCourse(this.course.id, updateRequest).subscribe({
        next: (updatedCourse) => {
          this.isSubmitting = false;
          this.formSubmit.emit(updatedCourse);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.handleError(err);
        }
      });
    } else {
      // Create new course
      const createRequest: CourseCreateRequest = {
        name: this.courseForm.value.name,
        description: this.courseForm.value.description,
        startDate: this.courseForm.value.startDate,
        endDate: this.courseForm.value.endDate,
        courseLocationId: this.courseForm.value.courseLocationId
      };
      
      this.courseService.createCourse(createRequest).subscribe({
        next: (createdCourse) => {
          this.isSubmitting = false;
          this.formSubmit.emit(createdCourse);
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

  // Helper method to check if a form control has an error
  hasError(controlName: string): boolean {
    const control = this.courseForm.get(controlName);
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
          if (this.courseForm.get(formKey)) {
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
    const control = this.courseForm.get(controlName);
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Bu alan zorunludur.';
    if (control.errors['minlength']) return `En az ${control.errors['minlength'].requiredLength} karakter olmalıdır.`;
    if (control.errors['maxlength']) return `En fazla ${control.errors['maxlength'].requiredLength} karakter olabilir.`;
    if (control.errors['serverError']) return control.errors['serverError'];
    
    return 'Geçersiz değer.';
  }
}
