import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { Course, CourseCreateRequest, CourseUpdateRequest } from '../models/course.models';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) { }

  getAllCourses(): Observable<Course[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Course[]>(this.apiUrl, { headers }).pipe(
      tap(
        data => console.log('Courses data received:', data),
        error => console.error('Error fetching courses:', error)
      )
    );
  }

  getAdminCourses(): Observable<Course[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Course[]>(`${this.apiUrl}/admin`, { headers }).pipe(
      tap(
        data => console.log('Admin courses data received:', data),
        error => console.error('Error fetching admin courses:', error)
      )
    );
  }

  getCourseById(id: number): Observable<Course> {
    const headers = this.getAuthHeaders();
    return this.http.get<Course>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(
        data => console.log('Course data received:', data),
        error => console.error('Error fetching course:', error)
      )
    );
  }

  createCourse(course: CourseCreateRequest): Observable<Course> {
    const headers = this.getAuthHeaders();
    return this.http.post<Course>(this.apiUrl, course, { headers }).pipe(
      tap(
        data => console.log('Course created:', data),
        error => console.error('Error creating course:', error)
      )
    );
  }

  updateCourse(id: number, course: CourseUpdateRequest): Observable<Course> {
    const headers = this.getAuthHeaders();
    return this.http.put<Course>(`${this.apiUrl}/${id}`, course, { headers }).pipe(
      tap(
        data => console.log('Course updated:', data),
        error => console.error('Error updating course:', error)
      )
    );
  }

  deleteCourse(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(
        () => console.log('Course deleted successfully'),
        error => console.error('Error deleting course:', error)
      )
    );
  }
  
  // Superadmin specific methods for multi-location operations
  
  /**
   * Get courses for a specific location
   */
  getCoursesByLocationId(locationId: number): Observable<Course[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Course[]>(`${this.apiUrl}/location/${locationId}`, { headers }).pipe(
      tap(
        data => console.log(`Courses for location ${locationId} received:`, data),
        error => console.error(`Error fetching courses for location ${locationId}:`, error)
      )
    );
  }
  
  /**
   * Add a course to a specific location
   */
  addCourseToLocation(courseId: number, locationId: number): Observable<Course> {
    const headers = this.getAuthHeaders();
    return this.http.post<Course>(`${this.apiUrl}/${courseId}/locations/${locationId}`, {}, { headers }).pipe(
      tap(
        data => console.log(`Course ${courseId} added to location ${locationId}:`, data),
        error => console.error(`Error adding course ${courseId} to location ${locationId}:`, error)
      )
    );
  }
  
  /**
   * Remove a course from a specific location
   */
  removeCourseFromLocation(courseId: number, locationId: number): Observable<Course> {
    const headers = this.getAuthHeaders();
    return this.http.delete<Course>(`${this.apiUrl}/${courseId}/locations/${locationId}`, { headers }).pipe(
      tap(
        data => console.log(`Course ${courseId} removed from location ${locationId}:`, data),
        error => console.error(`Error removing course ${courseId} from location ${locationId}:`, error)
      )
    );
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.tokenStorage.getToken()}`
    });
  }
}
