import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Student, StudentCreateRequest, StudentUpdateRequest } from '../../../../models/student.models';
import { StudentService } from '../../../../services/student.service';
import { UserService } from '../../../../services/user.service';
import { UserSummary, Role } from '../../../../models/user.models';
import { HttpClientModule } from '@angular/common/http';
import { TokenStorageService } from '../../../../services/token-storage.service';
import { LocationService } from '../../../../services/location.service';
import { CourseLocation } from '../../../../models/location.models';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-student-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, HttpClientModule],
  providers: [UserService, TokenStorageService],
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss']
})
export class StudentFormComponent implements OnInit, OnChanges {
  @Input() student: Student | null = null;
  @Output() formSubmit = new EventEmitter<Student>();
  @Output() formCancel = new EventEmitter<void>();
  
  adminUsers: UserSummary[] = [];
  isLoadingAdmins = false;
  
  // Current admin user
  currentAdmin: any = null;
  
  // Admin's course locations
  courseLocations: CourseLocation[] = [];
  isLoadingLocations = false;
  
  studentForm!: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  validationErrors: { [key: string]: string } = {};
  Object = Object; // Make Object available to template
  
  // Form field getters for easier access in template
  get nationalIdControl() { return this.studentForm.get('nationalId'); }
  get firstNameControl() { return this.studentForm.get('firstName'); }
  get lastNameControl() { return this.studentForm.get('lastName'); }
  get locationIdControl() { return this.studentForm.get('locationId'); }
  
  constructor(
    private fb: FormBuilder,
    private studentService: StudentService,
    private userService: UserService,
    private tokenStorage: TokenStorageService,
    private locationService: LocationService,
    private authService: AuthService
  ) {
    this.createForm();
    this.currentAdmin = this.authService.getUser();
  }
  
  // Create form with validators
  private createForm(): void {
    this.studentForm = this.fb.group({
      nationalId: ['', [
        Validators.required, 
        Validators.minLength(11), 
        Validators.maxLength(11), 
        Validators.pattern('^[0-9]{11}$')
      ]],
      firstName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50)
      ]],
      lastName: ['', [
        Validators.required, 
        Validators.minLength(2), 
        Validators.maxLength(50)
      ]],
      motherName: ['', [Validators.maxLength(50)]],
      fatherName: ['', [Validators.maxLength(50)]],
      address: ['', [Validators.maxLength(255)]],
      phone: ['', [Validators.pattern('^[0-9]{10,11}$|^$')]],
      birthDate: [''],
      locationId: [null, Validators.required],
      adminId: [this.currentAdmin?.id || null]
    });
  }
  
  ngOnInit(): void {
    console.log('StudentFormComponent ngOnInit - Student input:', this.student);
    console.log('Current admin:', this.currentAdmin);
    
    // Load admin's course locations
    this.loadAdminLocations();
    
    // Initialize the form
    this.initializeForm();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    console.log('StudentFormComponent ngOnChanges - changes:', changes);
    
    // Check if student input has changed
    if (changes['student'] && this.studentForm) {
      console.log('Student input changed:', changes['student'].currentValue);
      this.initializeForm();
    }
  }
  
  // Initialize form based on whether we're editing or creating
  private initializeForm(): void {
    // Make sure the form is created first
    if (!this.studentForm) {
      this.createForm();
    }
    
    console.log('initializeForm called, student:', this.student);
    
    if (this.student) {
      console.log('Student data available for form initialization:', {
        id: this.student.id,
        nationalId: this.student.nationalId,
        firstName: this.student.firstName,
        lastName: this.student.lastName,
        birthDate: this.student.birthDate
      });
      
      // Get the student's admin ID if available
      if (this.student.id) {
        console.log('Getting admin ID for student:', this.student.id);
        this.getStudentAdminId(this.student.id);
      } else {
        console.error('Student ID is missing!');
      }
      
      // Force a setTimeout to ensure Angular's change detection cycle has a chance to run
      setTimeout(() => {
        // Patch form values - use non-null assertion since we've already checked this.student exists
        const formValues = {
          nationalId: this.student!.nationalId,
          firstName: this.student!.firstName,
          lastName: this.student!.lastName,
          motherName: this.student!.motherName,
          fatherName: this.student!.fatherName,
          address: this.student!.address,
          phone: this.student!.phone,
          birthDate: this.student!.birthDate ? this.formatDateForInput(this.student!.birthDate) : ''
        };
        
        console.log('Patching form with values:', formValues);
        this.studentForm.patchValue(formValues);
        
        // Eğer öğrencinin course location'ları varsa, ilk location'ı seç
        if (this.student!.courseLocations && this.student!.courseLocations.length > 0) {
          const locationId = this.student!.courseLocations[0].id;
          console.log('Setting locationId from student data:', locationId);
          this.studentForm.patchValue({ locationId: locationId });
        }
        
        console.log('Form values after patch:', this.studentForm.value);
      }, 0);
    } else {
      console.log('No student data available - creating new student');
      // For new students, auto-assign the current admin
      if (this.currentAdmin) {
        this.studentForm.patchValue({ adminId: this.currentAdmin.id });
      }
    }
  }
  
  onSubmit(): void {
    // Reset errors
    this.error = null;
    this.validationErrors = {};
    
    if (this.studentForm.invalid) {
      this.markFormGroupTouched(this.studentForm);
      this.error = 'Lütfen tüm zorunlu alanları doldurun ve hataları düzeltin.';
      return;
    }
    
    this.isSubmitting = true;
    
    if (this.student) {
      // Update existing student
      const updateRequest: StudentUpdateRequest = {
        nationalId: this.studentForm.value.nationalId,
        firstName: this.studentForm.value.firstName,
        lastName: this.studentForm.value.lastName,
        motherName: this.studentForm.value.motherName,
        fatherName: this.studentForm.value.fatherName,
        address: this.studentForm.value.address,
        phone: this.studentForm.value.phone,
        birthDate: this.studentForm.value.birthDate ? new Date(this.studentForm.value.birthDate).toISOString().split('T')[0] : undefined,
        adminId: this.studentForm.value.adminId || this.currentAdmin?.id || null
      };
      
      this.studentService.updateStudent(this.student.id, updateRequest).subscribe({
        next: (updatedStudent) => {
          this.isSubmitting = false;
          this.formSubmit.emit(updatedStudent);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.handleError(err, 'Öğrenci güncellenirken bir hata oluştu.');
        }
      });
    } else {
      // Create new student
      const createRequest: StudentCreateRequest = {
        nationalId: this.studentForm.value.nationalId,
        firstName: this.studentForm.value.firstName,
        lastName: this.studentForm.value.lastName,
        motherName: this.studentForm.value.motherName,
        fatherName: this.studentForm.value.fatherName,
        address: this.studentForm.value.address,
        phone: this.studentForm.value.phone,
        birthDate: this.studentForm.value.birthDate ? new Date(this.studentForm.value.birthDate).toISOString().split('T')[0] : undefined,
        locationId: this.studentForm.value.locationId,
        adminId: this.studentForm.value.adminId || this.currentAdmin?.id
      };
      
      this.studentService.createStudent(createRequest).subscribe({
        next: (newStudent) => {
          this.isSubmitting = false;
          this.formSubmit.emit(newStudent);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.handleError(err, 'Öğrenci oluşturulurken bir hata oluştu.');
        }
      });
    }
  }
  
  onCancel(): void {
    this.formCancel.emit();
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
  
  // Format date from ISO string to YYYY-MM-DD for input
  private formatDateForInput(dateString: string): string {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  }
  
  // Handle API errors
  private handleError(err: any, defaultMessage: string): void {
    console.error('Error:', err);
    
    // Clear previous errors
    this.validationErrors = {};
    
    if (err.status === 409) {
      // Conflict error (e.g., duplicate nationalId)
      this.error = err.error?.message || 'Bu TC Kimlik No ile kayıtlı öğrenci zaten mevcut.';
      // Highlight the nationalId field
      this.nationalIdControl?.setErrors({ duplicate: true });
      this.nationalIdControl?.markAsTouched();
    } else if (err.status === 400 && err.error?.errors) {
      // Validation errors
      this.error = 'Lütfen form alanlarını kontrol ediniz.';
      this.validationErrors = err.error.errors;
      
      // Mark fields with validation errors
      Object.keys(this.validationErrors).forEach(field => {
        const control = this.studentForm.get(field);
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
    const control = this.studentForm.get(controlName);
    return control ? control.invalid && control.touched : false;
  }
  
  // Load admin's course locations
  loadAdminLocations(): void {
    this.isLoadingLocations = true;
    
    // Check if token exists
    const token = this.tokenStorage.getToken();
    if (!token) {
      console.error('No authentication token available');
      this.error = 'Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapın.';
      this.isLoadingLocations = false;
      return;
    }
    
    // Get admin's course locations from the API
    this.locationService.getAdminLocations().subscribe({
      next: (data) => {
        console.log('Admin locations loaded successfully:', data);
        this.courseLocations = data;
        this.isLoadingLocations = false;
      },
      error: (err) => {
        console.error('Error loading admin locations:', err);
        this.error = 'Lokasyon listesi yüklenirken bir hata oluştu.';
        this.isLoadingLocations = false;
      }
    });
  }
  
  // Load admin users for selection (not needed anymore but kept for reference)
  loadAdminUsers(): void {
    // This method is no longer used as we're auto-assigning the current admin
    console.log('Admin users loading skipped - using current admin');
  }
  
  // Helper method to map string role to Role enum
  private mapStringToRoleEnum(role: string): Role {
    switch(role) {
      case 'SUPERADMIN': return Role.SUPERADMIN;
      case 'ADMIN': return Role.ADMIN;
      case 'STUDENT': return Role.STUDENT;
      default: return Role.ADMIN; // Default fallback
    }
  }
  
  // Get the admin ID for a student
  private getStudentAdminId(studentId: number): void {
    this.studentService.getStudentAdminId(studentId).subscribe({
      next: (adminData) => {
        if (adminData) {
          // Handle both old format (just ID) and new format (full admin object)
          const adminId = typeof adminData === 'number' ? adminData : adminData.id;
          console.log('Setting admin ID in form:', adminId);
          this.studentForm.patchValue({ adminId });
        }
      },
      error: (err) => {
        console.error('Error fetching student admin ID:', err);
      }
    });
  }
  
  // Get error message for a field
  getErrorMessage(controlName: string): string {
    const control = this.studentForm.get(controlName);
    if (!control || !control.errors) return '';
    
    if (control.errors['required']) return 'Bu alan zorunludur.';
    if (control.errors['minlength']) return `En az ${control.errors['minlength'].requiredLength} karakter olmalıdır.`;
    if (control.errors['maxlength']) return `En fazla ${control.errors['maxlength'].requiredLength} karakter olabilir.`;
    if (control.errors['pattern']) {
      if (controlName === 'nationalId') return 'TC Kimlik No 11 haneli ve sadece rakamlardan oluşmalıdır.';
      if (controlName === 'phone') return 'Geçerli bir telefon numarası giriniz.';
    }
    if (control.errors['duplicate']) return 'Bu TC Kimlik No ile kayıtlı öğrenci zaten mevcut.';
    if (control.errors['serverError']) return control.errors['serverError'];
    
    return 'Geçersiz değer.';
  }
}
