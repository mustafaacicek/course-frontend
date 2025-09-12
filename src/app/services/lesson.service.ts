import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { Lesson, LessonCreateRequest, LessonUpdateRequest } from '../models/lesson.models';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class LessonService {
  private apiUrl = `${environment.apiUrl}/lessons`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService,
    private authService: AuthService
  ) { }

  getAllLessons(): Observable<Lesson[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Lesson[]>(this.apiUrl, { headers }).pipe(
      tap(
        data => console.log('Lessons data received:', data),
        error => console.error('Error fetching lessons:', error)
      )
    );
  }

  getLessonsByCourseId(courseId: number): Observable<Lesson[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Lesson[]>(`${this.apiUrl}/course/${courseId}`, { headers }).pipe(
      tap(
        data => console.log(`Lessons for course ${courseId} received:`, data),
        error => console.error(`Error fetching lessons for course ${courseId}:`, error)
      )
    );
  }

  getLessonById(id: number): Observable<Lesson> {
    const headers = this.getAuthHeaders();
    return this.http.get<Lesson>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(
        data => console.log('Lesson data received:', data),
        error => console.error('Error fetching lesson:', error)
      )
    );
  }

  createLesson(request: LessonCreateRequest): Observable<Lesson> {
    const headers = this.getAuthHeaders();
    
    // If courseIds is provided, use the multiple courses endpoint
    if (request.courseIds && request.courseIds.length > 0) {
      return this.createLessonForMultipleCourses(request);
    }
    
    return this.http.post<Lesson>(this.apiUrl, request, { headers }).pipe(
      tap(
        data => console.log('Created lesson:', data),
        error => console.error('Error creating lesson:', error)
      )
    );
  }
  
  /**
   * Create a lesson and assign it to multiple courses (superadmin only)
   */
  createLessonForMultipleCourses(request: LessonCreateRequest): Observable<Lesson> {
    if (!this.isSuperadmin()) {
      console.error('Unauthorized: Only superadmins can create lessons for multiple courses');
      throw new Error('Unauthorized operation');
    }
    
    const headers = this.getAuthHeaders();
    const superadminUrl = `${environment.apiUrl}/superadmin/lessons/multiple-courses`;
    
    return this.http.post<Lesson>(superadminUrl, request, { headers }).pipe(
      tap(
        data => console.log('Created lesson for multiple courses:', data),
        error => console.error('Error creating lesson for multiple courses:', error)
      )
    );
  }

  updateLesson(id: number, lesson: LessonUpdateRequest): Observable<Lesson> {
    const headers = this.getAuthHeaders();
    return this.http.put<Lesson>(`${this.apiUrl}/${id}`, lesson, { headers }).pipe(
      tap(
        data => console.log('Lesson updated:', data),
        error => console.error('Error updating lesson:', error)
      )
    );
  }

  deleteLesson(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(
        () => console.log('Lesson deleted successfully'),
        error => console.error('Error deleting lesson:', error)
      )
    );
  }

  countLessonsByCourseId(courseId: number): Observable<number> {
    const headers = this.getAuthHeaders();
    return this.http.get<number>(`${this.apiUrl}/course/${courseId}/count`, { headers }).pipe(
      tap(
        data => console.log(`Lesson count for course ${courseId}:`, data),
        error => console.error(`Error fetching lesson count for course ${courseId}:`, error)
      )
    );
  }

  // Superadmin-specific methods
  bulkDeleteLessons(lessonIds: number[]): Observable<any> {
    if (!this.isSuperadmin()) {
      console.error('Unauthorized: Only superadmins can perform bulk delete operations');
      throw new Error('Unauthorized operation');
    }
    
    const headers = this.getAuthHeaders();
    const superadminUrl = `${environment.apiUrl}/superadmin/lessons/bulk`;
    
    return this.http.delete<any>(superadminUrl, { 
      headers, 
      body: lessonIds 
    }).pipe(
      tap(
        data => console.log('Bulk delete response:', data),
        error => console.error('Error in bulk delete operation:', error)
      )
    );
  }

  bulkMoveLessons(lessonIds: number[], targetCourseId: number): Observable<any> {
    if (!this.isSuperadmin()) {
      console.error('Unauthorized: Only superadmins can perform bulk move operations');
      throw new Error('Unauthorized operation');
    }
    
    const headers = this.getAuthHeaders();
    const superadminUrl = `${environment.apiUrl}/superadmin/lessons/bulk/move`;
    const payload = {
      lessonIds: lessonIds,
      targetCourseId: targetCourseId
    };
    
    return this.http.put<any>(superadminUrl, payload, { headers }).pipe(
      tap(
        data => console.log('Bulk move response:', data),
        error => console.error('Error in bulk move operation:', error)
      )
    );
  }

  // Helper method to check if current user is superadmin
  private isSuperadmin(): boolean {
    return this.authService.getUserRole() === 'SUPERADMIN';
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.tokenStorage.getToken()}`
    });
  }
}
