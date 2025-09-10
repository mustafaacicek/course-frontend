import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/auth.models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isSubmitting = false;
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Redirect if already logged in
    if (this.authService.isLoggedIn()) {
      this.redirectBasedOnRole();
    }

    this.loginForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isSubmitting = true;
      this.errorMessage = '';
      
      const loginRequest: LoginRequest = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      };
      
      this.authService.login(loginRequest).subscribe({
        next: (response) => {
          // Redirect to the dashboard route which will use the shared layout
          if (response.role === 'SUPERADMIN') {
            this.router.navigate(['/superadmin/dashboard']);
          } else if (response.role === 'ADMIN') {
            this.router.navigate(['/admin/dashboard']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          if (error.status === 401) {
            this.errorMessage = 'Kullanıcı adı veya şifre hatalı.';
          } else {
            this.errorMessage = 'Giriş yapılırken bir hata oluştu. Lütfen tekrar deneyin.';
          }
        }
      });
    } else {
      this.loginForm.markAllAsTouched();
    }
  }

  private redirectBasedOnRole(): void {
    if (this.authService.isSuperAdmin()) {
      this.router.navigate(['/superadmin/dashboard']);
    } else if (this.authService.isAdmin()) {
      this.router.navigate(['/admin/dashboard']);
    } else {
      // Default route for other roles if needed
      this.router.navigate(['/dashboard']);
    }
  }
}
