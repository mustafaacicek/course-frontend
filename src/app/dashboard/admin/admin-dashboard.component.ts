import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardService, AdminDashboard } from '../../services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent implements OnInit {
  // Dashboard stats
  courseCount: number = 0;
  studentCount: number = 0;
  lessonCount: number = 0;
  noteCount: number = 0;
  
  // Admin info
  adminName: string = '';
  
  // Locations
  locations: any[] = [];

  // Recent activities
  recentActivities: any[] = [];
  
  // Loading state
  isLoading: boolean = false;
  error: string | null = null;
  
  constructor(private dashboardService: DashboardService) {}
  
  ngOnInit(): void {
    this.loadDashboardData();
  }
  
  loadDashboardData(): void {
    this.isLoading = true;
    this.error = null;
    
    this.dashboardService.getAdminDashboard().subscribe({
      next: (data: AdminDashboard) => {
        this.courseCount = data.courseCount;
        this.studentCount = data.studentCount;
        this.lessonCount = data.lessonCount;
        this.noteCount = data.noteCount;
        
        // Set admin name
        this.adminName = data.admin.firstName && data.admin.lastName ? 
          `${data.admin.firstName} ${data.admin.lastName}` : 
          data.admin.username;
        
        // Set locations
        this.locations = data.locations;
        
        // Map activities to the format expected by the template
        this.recentActivities = data.recentActivities.map(activity => ({
          type: activity.type,
          text: activity.text,
          time: activity.formattedTime
        }));
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading dashboard data:', err);
        this.error = 'Dashboard verisi yüklenirken bir hata oluştu.';
        this.isLoading = false;
      }
    });
  }
}
