import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Course, CourseCreateRequest, CourseUpdateRequest } from '../../../../models/course.models';
import { CourseLocation } from '../../../../models/location.models';
import { CourseService } from '../../../../services/course.service';

@Component({
  selector: 'app-superadmin-course-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './superadmin-course-form.component.html',
  styleUrls: ['./superadmin-course-form.component.scss']
})
export class SuperadminCourseFormComponent implements OnInit, OnChanges {
  @Input() course: Course | null = null;
  @Input() allLocations: CourseLocation[] = [];
  @Output() formSubmit = new EventEmitter<Course>();
  @Output() formCancel = new EventEmitter<void>();
  
  courseForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  validationErrors: { [key: string]: string } = {};
  
  // Make Object available to the template
  Object = Object;
  
  // Location selection tracking
  selectedLocationIds: Set<number> = new Set();
  selectAllLocations = false;

  constructor(
    private fb: FormBuilder,
    private courseService: CourseService
  ) {
    this.createForm();
  }

  ngOnInit(): void {
    console.log('SuperadminCourseFormComponent ngOnInit - Course input:', this.course);
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('SuperadminCourseFormComponent ngOnChanges - changes:', changes);
    
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
      endDate: ['']
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
        courseLocations: this.course.courseLocations
      });
      
      // Force a setTimeout to ensure Angular's change detection cycle has a chance to run
      setTimeout(() => {
        // Patch form values - use non-null assertion since we've already checked this.course exists
        const formValues = {
          name: this.course!.name,
          description: this.course!.description || '',
          startDate: this.formatDateForInput(this.course!.startDate),
          endDate: this.course!.endDate ? this.formatDateForInput(this.course!.endDate) : ''
        };
        
        console.log('Patching form with values:', formValues);
        this.courseForm.patchValue(formValues);
        console.log('Form values after patch:', this.courseForm.value);
        
        // Initialize selected locations
        this.selectedLocationIds.clear();
        if (this.course && this.course.courseLocations && this.course.courseLocations.length > 0) {
          this.course.courseLocations.forEach(location => {
            this.selectedLocationIds.add(location.id);
          });
        } else if (this.course && this.course.courseLocation) {
          this.selectedLocationIds.add(this.course.courseLocation.id);
        }
        
        // Check if all locations are selected
        this.updateSelectAllState();
      }, 0);
    } else {
      console.log('No course data available - creating new course');
      this.selectedLocationIds.clear();
      this.selectAllLocations = false;
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
    
    // Check if at least one location is selected
    if (this.selectedLocationIds.size === 0) {
      this.error = 'En az bir lokasyon seçmelisiniz.';
      return;
    }
    
    this.isSubmitting = true;
    
    // Convert Set to Array for API request
    const locationIds = Array.from(this.selectedLocationIds);
    
    if (this.course) {
      // Update existing course
      const updateRequest: CourseUpdateRequest = {
        name: this.courseForm.value.name,
        description: this.courseForm.value.description,
        startDate: this.courseForm.value.startDate,
        endDate: this.courseForm.value.endDate,
        courseLocationIds: locationIds
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
        courseLocationIds: locationIds
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

  // Check if a form control has an error
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
    if (control.errors['maxlength']) return `En fazla ${control.errors['maxlength'].requiredLength} karakter olmalıdır.`;
    
    return 'Geçersiz değer.';
  }

  // Location selection methods
  toggleLocation(locationId: number): void {
    if (this.selectedLocationIds.has(locationId)) {
      this.selectedLocationIds.delete(locationId);
    } else {
      this.selectedLocationIds.add(locationId);
    }
    
    this.updateSelectAllState();
  }

  toggleSelectAll(): void {
    this.selectAllLocations = !this.selectAllLocations;
    
    if (this.selectAllLocations) {
      // Select all locations
      this.allLocations.forEach(location => {
        this.selectedLocationIds.add(location.id);
      });
    } else {
      // Deselect all locations
      this.selectedLocationIds.clear();
    }
  }

  isLocationSelected(locationId: number): boolean {
    return this.selectedLocationIds.has(locationId);
  }

  updateSelectAllState(): void {
    this.selectAllLocations = this.allLocations.length > 0 && 
                             this.selectedLocationIds.size === this.allLocations.length;
  }
}
