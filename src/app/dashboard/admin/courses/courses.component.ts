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
        // Convert date arrays to Date objects
        this.courses = data.map(course => this.convertDateArrays(course));
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
        // Convert date arrays to Date objects
        this.editingCourse = this.convertDateArrays(fullCourseData);
        this.showAddForm = true;
      },
      error: (err: any) => {
        console.error('Error loading full course data:', err);
        this.error = 'Kurs bilgileri yüklenirken bir hata oluştu.';
        // Fallback to using the basic course data
        this.editingCourse = this.convertDateArrays(course);
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
  
  /**
   * Converts date arrays from API to proper Date objects
   * API returns dates in format [year, month, day] or [year, month, day, hour, minute, second, nano]
   */
  private convertDateArrays(course: Course): Course {
    // Create a copy of the course to avoid modifying the original
    const result = { ...course };
    
    // Convert startDate if it's an array
    if (Array.isArray(result.startDate)) {
      // Format: [year, month, day]
      const [year, month, day] = result.startDate;
      result.startDate = new Date(year, month - 1, day); // Month is 0-indexed in JS Date
    }
    
    // Convert endDate if it exists and is an array
    if (result.endDate && Array.isArray(result.endDate)) {
      const [year, month, day] = result.endDate;
      result.endDate = new Date(year, month - 1, day);
    }
    
    // Convert createdAt if it's an array
    if (Array.isArray(result.createdAt)) {
      // Format: [year, month, day, hour, minute, second, nano]
      const [year, month, day, hour = 0, minute = 0, second = 0] = result.createdAt;
      result.createdAt = new Date(year, month - 1, day, hour, minute, second);
    }
    
    // Convert updatedAt if it exists and is an array
    if (result.updatedAt && Array.isArray(result.updatedAt)) {
      const [year, month, day, hour = 0, minute = 0, second = 0] = result.updatedAt;
      result.updatedAt = new Date(year, month - 1, day, hour, minute, second);
    }
    
    return result;
  }
}
