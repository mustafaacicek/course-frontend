import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Attendance, AttendanceRequest, AttendanceStats } from '../models/attendance.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AttendanceService {
  private apiUrl = `${environment.apiUrl}/attendance`;

  constructor(private http: HttpClient) { }

  saveAttendanceRecords(request: AttendanceRequest): Observable<Attendance[]> {
    return this.http.post<Attendance[]>(this.apiUrl, request);
  }

  getAttendanceByLocationAndDate(locationId: number, date: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/location/${locationId}/date/${date}`);
  }

  getAttendanceByUserLocationsAndDate(date: string): Observable<Attendance[]> {
    return this.http.get<Attendance[]>(`${this.apiUrl}/my-locations/date/${date}`);
  }

  getAttendanceDatesByUserLocations(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/my-locations/dates`);
  }

  getStudentAttendanceStats(studentId: number): Observable<AttendanceStats> {
    return this.http.get<AttendanceStats>(`${this.apiUrl}/student/${studentId}/stats`);
  }
}
