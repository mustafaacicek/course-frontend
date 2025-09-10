import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { User, UserCreateRequest, UserService, UserUpdateRequest } from '../../../../services/user.service';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit, OnChanges {
  @Input() user: User | null = null;
  @Output() formSubmit = new EventEmitter<User>();
  @Output() formCancel = new EventEmitter<void>();
  
  userForm: FormGroup;
  isSubmitting = false;
  error: string | null = null;
  
  constructor(
    private fb: FormBuilder,
    private userService: UserService
  ) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(50)]],
      password: ['', [Validators.minLength(6)]],
      firstName: ['', [Validators.maxLength(50)]],
      lastName: ['', [Validators.maxLength(50)]],
      phone: ['', [Validators.maxLength(20)]],
      role: ['ADMIN', [Validators.required]]
    });
  }
  
  ngOnInit(): void {
    this.setupForm();
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    // When user input changes, update the form
    if (changes['user'] && changes['user'].currentValue) {
      console.log('User input changed:', changes['user'].currentValue);
      this.setupForm();
    }
  }
  
  private setupForm(): void {
    if (this.user) {
      console.log('Setting up form with user data:', this.user);
      // If editing, remove password validator since it's optional on update
      this.userForm.get('password')?.clearValidators();
      this.userForm.get('password')?.updateValueAndValidity();
      
      // Reset form before patching to avoid any stale values
      this.userForm.reset();
      
      this.userForm.patchValue({
        username: this.user.username,
        firstName: this.user.firstName,
        lastName: this.user.lastName,
        phone: this.user.phone,
        role: this.user.role
      });
      
      console.log('Form values after patch:', this.userForm.value);
    } else {
      // If creating new user, password is required
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
      this.userForm.get('password')?.updateValueAndValidity();
    }
  }
  
  onSubmit(): void {
    if (this.userForm.invalid) {
      this.markFormGroupTouched(this.userForm);
      return;
    }
    
    this.isSubmitting = true;
    this.error = null;
    
    if (this.user) {
      // Update existing user
      const updateRequest: UserUpdateRequest = {
        username: this.userForm.value.username,
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        phone: this.userForm.value.phone,
        role: this.userForm.value.role
      };
      
      // Only include password if provided
      if (this.userForm.value.password) {
        updateRequest.password = this.userForm.value.password;
      }
      
      this.userService.updateUser(this.user.id, updateRequest).subscribe({
        next: (updatedUser) => {
          this.isSubmitting = false;
          this.formSubmit.emit(updatedUser);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error = err.error?.message || 'Kullanıcı güncellenirken bir hata oluştu.';
          console.error('Error updating user:', err);
        }
      });
    } else {
      // Create new user
      const createRequest: UserCreateRequest = {
        username: this.userForm.value.username,
        password: this.userForm.value.password,
        firstName: this.userForm.value.firstName,
        lastName: this.userForm.value.lastName,
        phone: this.userForm.value.phone,
        role: this.userForm.value.role
      };
      
      this.userService.createUser(createRequest).subscribe({
        next: (newUser) => {
          this.isSubmitting = false;
          this.formSubmit.emit(newUser);
        },
        error: (err) => {
          this.isSubmitting = false;
          this.error = err.error?.message || 'Kullanıcı oluşturulurken bir hata oluştu.';
          console.error('Error creating user:', err);
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
}
