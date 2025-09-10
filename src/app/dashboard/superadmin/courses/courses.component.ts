import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Course } from '../../../models/course.models';
import { CourseService } from '../../../services/course.service';
import { LocationService } from '../../../services/location.service';
import { CourseLocation } from '../../../models/location.models';
import { SuperadminCourseFormComponent } from './course-form/superadmin-course-form.component';

@Component({
  selector: 'app-superadmin-courses',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, SuperadminCourseFormComponent],
  providers: [CourseService, LocationService],
  templateUrl: './courses.component.html',
  styleUrls: ['./courses.component.scss']
})
export class SuperadminCoursesComponent implements OnInit {
  courses: Course[] = [];
  allLocations: CourseLocation[] = [];
  selectedLocation: CourseLocation | null = null;
  filteredCourses: Course[] = [];
  
  isLoading = false;
  error: string | null = null;
  successMessage: string = '';
  
  showAddForm = false;
  editingCourse: Course | null = null;
  
  // For location assignment
  showLocationAssignmentModal = false;
  selectedCourse: Course | null = null;
  availableLocations: CourseLocation[] = [];
  assignedLocations: CourseLocation[] = [];

  constructor(
    private courseService: CourseService,
    private locationService: LocationService
  ) { }

  ngOnInit(): void {
    this.loadAllCourses();
    this.loadAllLocations();
  }

  loadAllCourses(): void {
    this.isLoading = true;
    this.error = null;
    
    this.courseService.getAllCourses().subscribe({
      next: (data: Course[]) => {
        this.courses = data;
        this.filteredCourses = [...this.courses];
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Kurslar yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading courses:', err);
      }
    });
  }

  loadAllLocations(): void {
    this.locationService.getAllLocations().subscribe({
      next: (data: CourseLocation[]) => {
        this.allLocations = data;
      },
      error: (err: any) => {
        console.error('Error loading locations:', err);
      }
    });
  }

  filterCoursesByLocation(): void {
    if (!this.selectedLocation) {
      this.filteredCourses = [...this.courses];
      return;
    }
    
    this.isLoading = true;
    this.courseService.getCoursesByLocationId(this.selectedLocation.id).subscribe({
      next: (data: Course[]) => {
        this.filteredCourses = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.error = err.error?.message || `Lokasyon ${this.selectedLocation?.name} için kurslar yüklenirken bir hata oluştu.`;
        this.isLoading = false;
        console.error('Error loading courses by location:', err);
      }
    });
  }

  onLocationChange(): void {
    this.filterCoursesByLocation();
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
      this.courseService.deleteCourse(id).subscribe({
        next: () => {
          this.successMessage = 'Kurs başarıyla silindi.';
          this.loadAllCourses();
          
          // Clear success message after 3 seconds
          setTimeout(() => {
            this.successMessage = '';
          }, 3000);
        },
        error: (err: any) => {
          this.error = err.error?.message || 'Kurs silinirken bir hata oluştu.';
          console.error('Error deleting course:', err);
        }
      });
    }
  }

  onCourseSaved(course: Course): void {
    this.successMessage = `Kurs başarıyla ${this.editingCourse ? 'güncellendi' : 'oluşturuldu'}.`;
    this.closeForm();
    this.loadAllCourses();
    
    // Clear success message after 3 seconds
    setTimeout(() => {
      this.successMessage = '';
    }, 3000);
  }

  closeForm(): void {
    this.showAddForm = false;
    this.editingCourse = null;
  }

  // Location assignment methods
  openLocationAssignment(course: Course): void {
    this.selectedCourse = course;
    this.showLocationAssignmentModal = true;
    
    // Get the full course details to see all assigned locations
    this.courseService.getCourseById(course.id).subscribe({
      next: (fullCourseData: Course) => {
        this.selectedCourse = fullCourseData;
        
        // Determine which locations are assigned and which are available
        this.updateLocationLists();
      },
      error: (err: any) => {
        console.error('Error loading full course data for location assignment:', err);
        this.error = 'Kurs bilgileri yüklenirken bir hata oluştu.';
      }
    });
  }

  updateLocationLists(): void {
    if (!this.selectedCourse || !this.selectedCourse.courseLocations) {
      this.assignedLocations = [];
      this.availableLocations = [...this.allLocations];
      return;
    }
    
    // Get IDs of assigned locations
    const assignedLocationIds = this.selectedCourse.courseLocations.map(loc => loc.id);
    
    // Filter assigned and available locations
    this.assignedLocations = this.allLocations.filter(loc => 
      assignedLocationIds.includes(loc.id)
    );
    
    this.availableLocations = this.allLocations.filter(loc => 
      !assignedLocationIds.includes(loc.id)
    );
  }

  assignLocation(location: CourseLocation): void {
    if (!this.selectedCourse) return;
    
    this.courseService.addCourseToLocation(this.selectedCourse.id, location.id).subscribe({
      next: (updatedCourse: Course) => {
        this.selectedCourse = updatedCourse;
        this.updateLocationLists();
        this.successMessage = `${location.name} lokasyonu kursa başarıyla eklendi.`;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Lokasyon eklenirken bir hata oluştu.';
        console.error('Error assigning location:', err);
      }
    });
  }

  removeLocation(location: CourseLocation): void {
    if (!this.selectedCourse) return;
    
    this.courseService.removeCourseFromLocation(this.selectedCourse.id, location.id).subscribe({
      next: (updatedCourse: Course) => {
        this.selectedCourse = updatedCourse;
        this.updateLocationLists();
        this.successMessage = `${location.name} lokasyonu kurstan başarıyla kaldırıldı.`;
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err: any) => {
        this.error = err.error?.message || 'Lokasyon kaldırılırken bir hata oluştu.';
        console.error('Error removing location:', err);
      }
    });
  }

  closeLocationAssignmentModal(): void {
    this.showLocationAssignmentModal = false;
    this.selectedCourse = null;
    this.assignedLocations = [];
    this.availableLocations = [];
    
    // Reload courses to reflect any changes
    this.loadAllCourses();
  }
}
