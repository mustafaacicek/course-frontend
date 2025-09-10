import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CourseLocation, CourseLocationCreateRequest, CourseLocationUpdateRequest } from '../../../../models/course-location.models';
import { CourseLocationService } from '../../../../services/course-location.service';
import { UserSummary } from '../../../../models/user.models';

@Component({
  selector: 'app-location-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './location-form.component.html',
  styleUrl: './location-form.component.scss'
})
export class LocationFormComponent implements OnInit, OnChanges {
  @Input() location: CourseLocation | null = null;
  @Input() adminUsers: UserSummary[] = [];
  @Output() formSubmit = new EventEmitter<CourseLocation>();
  @Output() formCancel = new EventEmitter<void>();
  
  locationForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  validationErrors: { [key: string]: string } = {};
  Object = Object; // Make Object available to template
  
  // Form field getters for easier access in template
  get nameControl() { return this.locationForm.get('name'); }
  get addressControl() { return this.locationForm.get('address'); }
  get phoneControl() { return this.locationForm.get('phone'); }
  get adminIdsControl() { return this.locationForm.get('adminIds'); }
  
  constructor(
    private fb: FormBuilder,
    private locationService: CourseLocationService
  ) { }
  
  ngOnInit(): void {
    this.createForm();
    this.setupForm();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // When location input changes, update the form
    if (changes['location'] && changes['location'].currentValue) {
      console.log('Location input changed:', changes['location'].currentValue);
      this.setupForm();
    }
    
    // When adminUsers input changes, log it (might need to update UI)
    if (changes['adminUsers'] && changes['adminUsers'].currentValue) {
      console.log('Admin users input changed:', changes['adminUsers'].currentValue);
    }
  }
  
  private setupForm(): void {
    if (this.location) {
      console.log('Setting up form with location data:', this.location);
      console.log('Available admin users:', this.adminUsers);
      
      // Extract admin IDs from the location
      const adminIds = this.location.admins.map(admin => admin.id);
      console.log('Extracted admin IDs:', adminIds);
      
      // Reset form before patching to avoid any stale values
      this.locationForm.reset();
      
      // Set form values
      this.locationForm.patchValue({
        name: this.location.name,
        address: this.location.address,
        phone: this.location.phone,
        adminIds: adminIds
      });
      
      console.log('Form values after patch:', this.locationForm.value);
      console.log('Admin IDs in form:', this.locationForm.get('adminIds')?.value);
    }
  }
  
  // Create form with validators
  private createForm(): void {
    this.locationForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.maxLength(100)
      ]],
      address: ['', [
        Validators.required, 
        Validators.maxLength(255)
      ]],
      phone: ['', [
        Validators.maxLength(20)
      ]],
      adminIds: [[]]
    });
  }
  
  onSubmit(): void {
    // Reset errors
    this.error = null;
    this.validationErrors = {};
    
    if (this.locationForm.invalid) {
      this.markFormGroupTouched(this.locationForm);
      this.error = 'Lütfen tüm zorunlu alanları doldurun ve hataları düzeltin.';
      return;
    }
    
    this.isSubmitting = true;
    
    if (this.location) {
      // Update existing location
      const updateRequest: CourseLocationUpdateRequest = {
        name: this.locationForm.value.name,
        address: this.locationForm.value.address,
        phone: this.locationForm.value.phone,
        adminIds: this.locationForm.value.adminIds
      };
      
      this.locationService.updateLocation(this.location.id, updateRequest).subscribe({
        next: (updatedLocation) => {
          this.isSubmitting = false;
          this.formSubmit.emit(updatedLocation);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.handleError(err, 'Kurs lokasyonu güncellenirken bir hata oluştu.');
        }
      });
    } else {
      // Create new location
      const createRequest: CourseLocationCreateRequest = {
        name: this.locationForm.value.name,
        address: this.locationForm.value.address,
        phone: this.locationForm.value.phone,
        adminIds: this.locationForm.value.adminIds
      };
      
      this.locationService.createLocation(createRequest).subscribe({
        next: (newLocation) => {
          this.isSubmitting = false;
          this.formSubmit.emit(newLocation);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.handleError(err, 'Kurs lokasyonu oluşturulurken bir hata oluştu.');
        }
      });
    }
  }
  
  onCancel(): void {
    this.formCancel.emit();
  }
  
  toggleAdmin(adminId: number): void {
    const currentAdmins = this.locationForm.get('adminIds')?.value || [];
    
    if (this.isAdminSelected(adminId)) {
      // Remove admin if already selected
      const updatedAdmins = currentAdmins.filter((id: number) => id !== adminId);
      this.locationForm.get('adminIds')?.setValue(updatedAdmins);
    } else {
      // Add admin if not already selected
      const updatedAdmins = [...currentAdmins, adminId];
      this.locationForm.get('adminIds')?.setValue(updatedAdmins);
    }
  }
  
  isAdminSelected(adminId: number): boolean {
    const currentAdmins = this.locationForm.get('adminIds')?.value || [];
    return currentAdmins.some((id: number) => id === adminId);
  }
  
  // Helper method to mark all controls as touched
  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.values(formGroup.controls).forEach(control => {
      control.markAsTouched();
      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }
  
  // Handle API errors
  private handleError(err: any, defaultMessage: string): void {
    console.error('Error:', err);
    
    // Clear previous errors
    this.validationErrors = {};
    
    if (err.status === 409) {
      // Conflict error (e.g., duplicate name)
      this.error = err.error?.message || 'Bu isimle kayıtlı kurs lokasyonu zaten mevcut.';
      // Highlight the name field
      this.nameControl?.setErrors({ duplicate: true });
      this.nameControl?.markAsTouched();
    } else if (err.status === 400 && err.error?.errors) {
      // Validation errors
      this.error = 'Lütfen form alanlarını kontrol ediniz.';
      this.validationErrors = err.error.errors;
      
      // Mark fields with validation errors
      Object.keys(this.validationErrors).forEach(field => {
        const control = this.locationForm.get(field);
        if (control) {
          control.setErrors({ serverError: this.validationErrors[field] });
          control.markAsTouched();
        }
      });
    } else if (err.status === 401) {
      this.error = 'Oturum süreniz dolmuş olabilir. Lütfen tekrar giriş yapın.';
    } else {
      this.error = err.error?.message || defaultMessage;
    }
  }
  
  // Check if a field has errors and has been touched
  hasError(controlName: string): boolean {
    const control = this.locationForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }
  
  // Get error message for a field
  getErrorMessage(controlName: string): string {
    const control = this.locationForm.get(controlName);
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Bu alan zorunludur.';
    if (control.errors['maxlength']) return `En fazla ${control.errors['maxlength'].requiredLength} karakter olabilir.`;
    if (control.errors['duplicate']) return 'Bu isimle kayıtlı kurs lokasyonu zaten mevcut.';
    if (control.errors['serverError']) return control.errors['serverError'];
    
    return 'Geçersiz değer.';
  }
}
