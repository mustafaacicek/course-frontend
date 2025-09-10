import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CourseLocation } from '../../../models/course-location.models';
import { CourseLocationService } from '../../../services/course-location.service';
import { LocationFormComponent } from './location-form/location-form.component';
import { UserService, User as ServiceUser } from '../../../services/user.service';
import { UserSummary, Role } from '../../../models/user.models';

@Component({
  selector: 'app-locations',
  standalone: true,
  imports: [CommonModule, LocationFormComponent],
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit {
  locations: CourseLocation[] = [];
  isLoading = false;
  error: string | null = null;
  successMessage: string = '';
  showAddForm = false;
  editingLocation: CourseLocation | null = null;
  adminUsers: UserSummary[] = [];

  constructor(
    private locationService: CourseLocationService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadLocations();
    this.loadAdminUsers();
  }

  loadLocations(): void {
    this.isLoading = true;
    this.error = null;
    
    this.locationService.getAllLocations().subscribe({
      next: (data) => {
        this.locations = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.error = err.error?.message || 'Kurs lokasyonları yüklenirken bir hata oluştu.';
        this.isLoading = false;
        console.error('Error loading locations:', err);
      }
    });
  }

  loadAdminUsers(): void {
    this.userService.getAdminUsers().subscribe({
      next: (data) => {
        // Map the User type from service to UserSummary type
        this.adminUsers = data.map(user => ({
          id: user.id,
          username: user.username,
          role: this.mapStringToRoleEnum(user.role),
          firstName: user.firstName,
          lastName: user.lastName
        }));
      },
      error: (err) => {
        console.error('Error loading admin users:', err);
      }
    });
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

  openAddForm(): void {
    this.editingLocation = null;
    this.showAddForm = true;
  }

  editLocation(location: CourseLocation): void {
    // First, get fresh location data to ensure we have the latest information
    this.locationService.getLocationById(location.id).subscribe({
      next: (freshLocationData) => {
        console.log('Fresh location data loaded:', freshLocationData);
        
        // Now make sure admin users are loaded before opening the form
        this.userService.getAdminUsers().subscribe({
          next: (data) => {
            // Map the User type from service to UserSummary type
            this.adminUsers = data.map(user => ({
              id: user.id,
              username: user.username,
              role: this.mapStringToRoleEnum(user.role),
              firstName: user.firstName,
              lastName: user.lastName
            }));
            
            // Now that we have admin users and fresh location data, set the editing location and show the form
            this.editingLocation = freshLocationData;
            this.showAddForm = true;
          },
          error: (err) => {
            console.error('Error loading admin users:', err);
            this.error = 'Yönetici listesi yüklenirken bir hata oluştu.';
          }
        });
      },
      error: (err) => {
        console.error('Error loading location details:', err);
        this.error = 'Lokasyon bilgileri yüklenirken bir hata oluştu.';
      }
    });
  }

  deleteLocation(id: number): void {
    if (confirm('Bu kurs lokasyonunu silmek istediğinizden emin misiniz?')) {
      this.isLoading = true;
      this.error = null;
      this.successMessage = '';
      
      this.locationService.deleteLocation(id).subscribe({
        next: () => {
          this.successMessage = 'Kurs lokasyonu başarıyla silindi.';
          this.loadLocations();
          this.isLoading = false;
        },
        error: (err) => {
          this.error = err.error?.message || 'Kurs lokasyonu silinirken bir hata oluştu.';
          this.isLoading = false;
          console.error('Error deleting location:', err);
        }
      });
    }
  }

  onLocationSaved(location: CourseLocation): void {
    this.showAddForm = false;
    this.successMessage = this.editingLocation ? 'Kurs lokasyonu başarıyla güncellendi.' : 'Yeni kurs lokasyonu başarıyla eklendi.';
    this.loadLocations();
  }

  closeForm(): void {
    this.showAddForm = false;
    this.editingLocation = null;
  }
}
