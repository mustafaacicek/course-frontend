import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { TokenStorageService } from './token-storage.service';

export interface AdminDashboard {
  admin: {
    id: number;
    username: string;
    role: string;
    firstName: string;
    lastName: string;
    phone: string;
  };
  courseCount: number;
  studentCount: number;
  lessonCount: number;
  noteCount: number;
  locations: {
    id: number;
    name: string;
    address: string;
    phone: string;
    studentCount: number;
  }[];
  recentActivities: {
    type: string;
    text: string;
    timestamp: string;
    formattedTime: string;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private apiUrl = `${environment.apiUrl}/admin/dashboard`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) { }

  /**
   * Get admin dashboard data
   */
  getAdminDashboard(): Observable<AdminDashboard> {
    const headers = this.getAuthHeaders();
    return this.http.get<AdminDashboard>(this.apiUrl, { headers });
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.tokenStorage.getToken()}`
    });
  }
}
