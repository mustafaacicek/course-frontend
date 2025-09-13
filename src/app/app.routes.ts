import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin.guard';
import { superadminGuard } from './guards/superadmin.guard';
import { AuthGuard } from './guards/auth.guard';
import { PUBLIC_ROUTES } from './public/public.routes';

export const routes: Routes = [
  { path: 'auth/login', loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent) },
  ...PUBLIC_ROUTES,
  {
    path: 'auth',
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
            path: 'students/:id/details',
            loadComponent: () => import('./dashboard/admin/students/student-detail/student-detail.component').then(m => m.StudentDetailComponent)
          },
          {
            path: 'courses',
            loadComponent: () => import('./dashboard/admin/courses/courses.component').then(m => m.CoursesComponent)
          },
          {
            path: 'lessons',
            loadComponent: () => import('./dashboard/admin/lessons/lessons.component').then(m => m.LessonsComponent)
          },
          {
            path: 'lesson-notes',
            loadComponent: () => import('./dashboard/admin/lesson-notes/lesson-notes.component').then(m => m.LessonNotesComponent)
          },
          {
            path: 'student-lesson-notes',
            loadComponent: () => import('./dashboard/admin/student-lesson-notes/student-lesson-notes.component').then(m => m.StudentLessonNotesComponent)
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
          },
          {
            path: 'students/:id/details',
            loadComponent: () => import('./dashboard/admin/students/student-detail/student-detail.component').then(m => m.StudentDetailComponent)
          },
          {
            path: 'lessons',
            loadComponent: () => import('./dashboard/superadmin/lessons/lessons.component').then(m => m.SuperadminLessonsComponent)
          }
        ]
      }
    ]
  },
  { path: '**', redirectTo: '/' }
];
