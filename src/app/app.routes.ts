import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { superadminGuard } from './guards/superadmin.guard';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  {
    path: '',
    loadComponent: () => import('./shared/layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    canActivate: [AuthGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
      },
      // Redirect to appropriate dashboard based on role
      {
        path: 'admin/dashboard',
        loadComponent: () => import('./dashboard/admin/admin-dashboard.component').then(m => m.AdminDashboardComponent),
        canActivate: [adminGuard]
      },
      {
        path: 'superadmin/dashboard',
        loadComponent: () => import('./dashboard/superadmin/superadmin-dashboard.component').then(m => m.SuperadminDashboardComponent),
        canActivate: [superadminGuard]
      },
      // Admin specific routes
      {
        path: 'admin',
        canActivate: [adminGuard],
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'students',
            loadComponent: () => import('./dashboard/admin/students/students.component').then(m => m.StudentsComponent)
          },
          {
            path: 'courses',
            loadComponent: () => import('./dashboard/admin/courses/courses.component').then(m => m.CoursesComponent)
          }
        ]
      },
      // Superadmin specific routes
      {
        path: 'superadmin',
        canActivate: [superadminGuard],
        children: [
          {
            path: '',
            redirectTo: 'dashboard',
            pathMatch: 'full'
          },
          {
            path: 'users',
            loadComponent: () => import('./dashboard/superadmin/users/users.component').then(m => m.UsersComponent)
          },
          {
            path: 'locations',
            loadComponent: () => import('./dashboard/superadmin/locations/locations.component').then(m => m.LocationsComponent)
          },
          {
            path: 'courses',
            loadComponent: () => import('./dashboard/superadmin/courses/courses.component').then(m => m.SuperadminCoursesComponent)
          },
          {
            path: 'students',
            loadComponent: () => import('./dashboard/admin/students/students.component').then(m => m.StudentsComponent)
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '/login' }
];
