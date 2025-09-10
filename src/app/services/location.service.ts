import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { CourseLocation, CourseLocationCreateRequest, CourseLocationUpdateRequest } from '../models/location.models';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = `${environment.apiUrl}/locations`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) { }

  getAllLocations(): Observable<CourseLocation[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<CourseLocation[]>(this.apiUrl, { headers }).pipe(
      tap(
        data => console.log('Locations data received:', data),
        error => console.error('Error fetching locations:', error)
      )
    );
  }

  getAdminLocations(): Observable<CourseLocation[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<CourseLocation[]>(`${this.apiUrl}/admin`, { headers }).pipe(
      tap(
        data => console.log('Admin locations data received:', data),
        error => console.error('Error fetching admin locations:', error)
      )
    );
  }

  getLocationById(id: number): Observable<CourseLocation> {
    const headers = this.getAuthHeaders();
    return this.http.get<CourseLocation>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(
        data => console.log('Location data received:', data),
        error => console.error('Error fetching location:', error)
      )
    );
  }

  createLocation(location: CourseLocationCreateRequest): Observable<CourseLocation> {
    const headers = this.getAuthHeaders();
    return this.http.post<CourseLocation>(this.apiUrl, location, { headers }).pipe(
      tap(
        data => console.log('Location created:', data),
        error => console.error('Error creating location:', error)
      )
    );
  }

  updateLocation(id: number, location: CourseLocationUpdateRequest): Observable<CourseLocation> {
    const headers = this.getAuthHeaders();
    return this.http.put<CourseLocation>(`${this.apiUrl}/${id}`, location, { headers }).pipe(
      tap(
        data => console.log('Location updated:', data),
        error => console.error('Error updating location:', error)
      )
    );
  }

  deleteLocation(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(
        () => console.log('Location deleted successfully'),
        error => console.error('Error deleting location:', error)
      )
    );
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.tokenStorage.getToken()}`
    });
  }
}
