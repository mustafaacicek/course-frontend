import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserRole } from '../models/auth.models';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(requiredRole: UserRole): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    switch(requiredRole) {
      case UserRole.SUPERADMIN:
        if (this.authService.isSuperAdmin()) {
          return true;
        }
        break;
      case UserRole.ADMIN:
        if (this.authService.isAdmin() || this.authService.isSuperAdmin()) {
          return true;
        }
        break;
      case UserRole.STUDENT:
        if (this.authService.isStudent()) {
          return true;
        }
        break;
    }

    // Redirect to appropriate dashboard based on role
    if (this.authService.isSuperAdmin()) {
      this.router.navigate(['/superadmin']);
    } else if (this.authService.isAdmin()) {
      this.router.navigate(['/admin']);
    } else {
      this.router.navigate(['/']);
    }
    
    return false;
  }
}
