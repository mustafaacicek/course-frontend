import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { LessonNote, LessonNoteCreateRequest, LessonNoteHistory, LessonNoteUpdateRequest } from '../models/lesson-note.models';

@Injectable({
  providedIn: 'root'
})
export class LessonNoteService {
  private apiUrl = `${environment.apiUrl}/admin/lesson-notes`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) { }

  getAllLessonNotes(): Observable<LessonNote[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<LessonNote[]>(this.apiUrl, { headers }).pipe(
      tap(
        data => console.log('Lesson notes data received:', data),
        error => console.error('Error fetching lesson notes:', error)
      )
    );
  }

  getLessonNotesByLessonId(lessonId: number): Observable<LessonNote[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<LessonNote[]>(`${this.apiUrl}/lesson/${lessonId}`, { headers }).pipe(
      tap(
        data => console.log(`Lesson notes for lesson ${lessonId}:`, data),
        error => console.error(`Error fetching lesson notes for lesson ${lessonId}:`, error)
      )
    );
  }

  getLessonNotesByStudentId(studentId: number): Observable<LessonNote[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<LessonNote[]>(`${this.apiUrl}/student/${studentId}`, { headers }).pipe(
      tap(
        data => console.log(`Lesson notes for student ${studentId}:`, data),
        error => console.error(`Error fetching lesson notes for student ${studentId}:`, error)
      )
    );
  }

  getLessonNotesByCourseId(courseId: number): Observable<LessonNote[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<LessonNote[]>(`${this.apiUrl}/course/${courseId}`, { headers }).pipe(
      tap(
        data => console.log(`Lesson notes for course ${courseId}:`, data),
        error => console.error(`Error fetching lesson notes for course ${courseId}:`, error)
      )
    );
  }

  getPassedLessonNotesByStudentId(studentId: number): Observable<LessonNote[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<LessonNote[]>(`${this.apiUrl}/student/${studentId}/passed`, { headers }).pipe(
      tap(
        data => console.log(`Passed lesson notes for student ${studentId}:`, data),
        error => console.error(`Error fetching passed lesson notes for student ${studentId}:`, error)
      )
    );
  }

  getFailedLessonNotesByStudentId(studentId: number): Observable<LessonNote[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<LessonNote[]>(`${this.apiUrl}/student/${studentId}/failed`, { headers }).pipe(
      tap(
        data => console.log(`Failed lesson notes for student ${studentId}:`, data),
        error => console.error(`Error fetching failed lesson notes for student ${studentId}:`, error)
      )
    );
  }

  getLessonNoteById(id: number): Observable<LessonNote> {
    const headers = this.getAuthHeaders();
    return this.http.get<LessonNote>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(
        data => console.log('Lesson note data received:', data),
        error => console.error('Error fetching lesson note:', error)
      )
    );
  }

  createLessonNote(request: LessonNoteCreateRequest): Observable<LessonNote> {
    const headers = this.getAuthHeaders();
    return this.http.post<LessonNote>(this.apiUrl, request, { headers }).pipe(
      tap(
        data => console.log('Created lesson note:', data),
        error => console.error('Error creating lesson note:', error)
      )
    );
  }

  updateLessonNote(id: number, request: LessonNoteUpdateRequest): Observable<LessonNote> {
    const headers = this.getAuthHeaders();
    return this.http.put<LessonNote>(`${this.apiUrl}/${id}`, request, { headers }).pipe(
      tap(
        data => console.log('Lesson note updated:', data),
        error => console.error('Error updating lesson note:', error)
      )
    );
  }

  deleteLessonNote(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(
        () => console.log(`Lesson note ${id} deleted`),
        error => console.error(`Error deleting lesson note ${id}:`, error)
      )
    );
  }

  getLessonNoteHistory(id: number): Observable<LessonNoteHistory[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<LessonNoteHistory[]>(`${this.apiUrl}/${id}/history`, { headers }).pipe(
      tap(
        data => console.log(`History for lesson note ${id}:`, data),
        error => console.error(`Error fetching history for lesson note ${id}:`, error)
      )
    );
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.tokenStorage.getToken()}`
    });
  }
}
