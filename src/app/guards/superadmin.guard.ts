import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const superadminGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn() && authService.isSuperAdmin()) {
    return true;
  }

  // Redirect to login if not logged in, or to appropriate dashboard if logged in but wrong role
  if (!authService.isLoggedIn()) {
    router.navigate(['/login']);
  } else if (authService.isAdmin()) {
    router.navigate(['/admin']);
  } else {
    router.navigate(['/']);
  }
  
  return false;
};
