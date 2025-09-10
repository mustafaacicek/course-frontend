import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Course } from '../../../models/course.models';
import { CourseService } from '../../../services/course.service';
import { CourseFormComponent } from './course-form/course-form.component';
import { LocationService } from '../../../services/location.service';
import { CourseLocation } from '../../../models/location.models';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [CommonModule, CourseFormComponent],
  providers: [CourseService, LocationService],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class CoursesComponent implements OnInit {
  courses: Course[] = [];
  adminLocations: CourseLocation[] = [];
  isLoading = false;
  error: string | null = null;
  successMessage: string = '';
  showAddForm = false;
  editingCourse: Course | null = null;

  constructor(
    private courseService: CourseService,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {
    this.loadCourses();
    this.loadAdminLocations();
  }

  loadCourses(): void {
    this.isLoading = true;
    this.error = null;
    
    this.courseService.getAdminCourses().subscribe({
      next: (data: Course[]) => {
        this.courses = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Kurslar yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading courses:', err);
      }
    });
  }

  loadAdminLocations(): void {
    this.locationService.getAdminLocations().subscribe({
      next: (data: CourseLocation[]) => {
        this.adminLocations = data;
        console.log('Admin locations loaded:', this.adminLocations);
      },
      error: (err: any) => {
        console.error('Error loading admin locations:', err);
      }
    });
  }

  openAddForm(): void {
    this.editingCourse = null;
    this.showAddForm = true;
  }

  editCourse(course: Course): void {
    console.log('Editing course:', course);
    
    // Get the full course details before opening the form
    this.courseService.getCourseById(course.id).subscribe({
      next: (fullCourseData: Course) => {
        console.log('Full course data loaded:', fullCourseData);
        this.editingCourse = fullCourseData;
        this.showAddForm = true;
      },
      error: (err: any) => {
        console.error('Error loading full course data:', err);
        this.error = 'Kurs bilgileri yüklenirken bir hata oluştu.';
        // Fallback to using the basic course data
        this.editingCourse = course;
        this.showAddForm = true;
      }
    });
  }

  deleteCourse(id: number): void {
    if (confirm('Bu kursu silmek istediğinizden emin misiniz?')) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = '';
      
      this.courseService.deleteCourse(id).subscribe({
        next: () => {
          this.successMessage = 'Kurs başarıyla silindi.';
          this.loadCourses();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Kurs silinirken bir hata oluştu.';
          this.isLoading = false;
          console.error('Error deleting course:', err);
        }
      });
    }
  }

  onCourseSaved(course: Course): void {
    this.showAddForm = false;
    this.successMessage = this.editingCourse ? 'Kurs başarıyla güncellendi.' : 'Yeni kurs başarıyla eklendi.';
    this.loadCourses();
  }

  closeForm(): void {
    this.showAddForm = false;
    this.editingCourse = null;
  }
}
