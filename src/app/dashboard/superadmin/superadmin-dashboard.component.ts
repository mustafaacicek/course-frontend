import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-superadmin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './superadmin-dashboard.component.html',
  styleUrls: ['./superadmin-dashboard.component.scss']
})
export class SuperadminDashboardComponent {
  // Dashboard stats
  courseCount: number = 12;
  studentCount: number = 48;
  userCount: number = 8;
  lessonCount: number = 36;
}
