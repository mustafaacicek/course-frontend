import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) { }

  /**
   * Get attendance details for a student
   * @param studentId The student ID
   * @returns Observable with attendance details
   */
  getStudentAttendanceDetails(studentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/students/${studentId}/attendance`);
  }
}
