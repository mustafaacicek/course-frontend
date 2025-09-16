import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CourseLocation, CourseLocationCreateRequest, CourseLocationUpdateRequest } from '../models/course-location.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CourseLocationService {
  private apiUrl = `${environment.apiUrl}/locations`;

  constructor(private http: HttpClient) { }

  getAllLocations(): Observable<CourseLocation[]> {
    return this.http.get<CourseLocation[]>(this.apiUrl);
  }

  getLocationById(id: number): Observable<CourseLocation> {
    return this.http.get<CourseLocation>(`${this.apiUrl}/${id}`);
  }

  createLocation(request: CourseLocationCreateRequest): Observable<CourseLocation> {
    return this.http.post<CourseLocation>(this.apiUrl, request);
  }

  updateLocation(id: number, request: CourseLocationUpdateRequest): Observable<CourseLocation> {
    return this.http.put<CourseLocation>(`${this.apiUrl}/${id}`, request);
  }

  deleteLocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  assignAdmins(locationId: number, adminIds: number[]): Observable<CourseLocation> {
    return this.http.post<CourseLocation>(`${this.apiUrl}/${locationId}/admins`, adminIds);
  }

  getLocationsByAdminId(adminId: number): Observable<CourseLocation[]> {
    return this.http.get<CourseLocation[]>(`${this.apiUrl}/admin/${adminId}`);
  }
  
  getLocationsForCurrentAdmin(): Observable<CourseLocation[]> {
    return this.http.get<CourseLocation[]>(`${this.apiUrl}/admin`);
  }
}
