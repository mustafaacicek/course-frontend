import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { LessonNoteBatchUpdateRequest, LessonNoteUpdateItem, StudentLessonNote } from '../models/student-lesson-note.model';
import { LessonNote } from '../models/lesson-note.models';

@Injectable({
  providedIn: 'root'
})
export class StudentLessonNoteService {
  private apiUrl = `${environment.apiUrl}/admin/student-lesson-notes`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) { }

  /**
   * Get students with their lesson notes for a specific course and lesson
   */
  getStudentsWithLessonNotes(courseId: number, lessonId: number): Observable<StudentLessonNote[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<StudentLessonNote[]>(`${this.apiUrl}/course/${courseId}/lesson/${lessonId}`, { headers }).pipe(
      tap(
        data => console.log(`Students with lesson notes for course ${courseId} and lesson ${lessonId}:`, data),
        error => console.error(`Error fetching students with lesson notes for course ${courseId} and lesson ${lessonId}:`, error)
      )
    );
  }

  /**
   * Update a single student's lesson note
   */
  updateStudentLessonNote(studentId: number, lessonId: number, noteData: LessonNoteUpdateItem): Observable<LessonNote> {
    const headers = this.getAuthHeaders();
    return this.http.put<LessonNote>(`${this.apiUrl}/student/${studentId}/lesson/${lessonId}`, noteData, { headers }).pipe(
      tap(
        data => console.log(`Updated note for student ${studentId} and lesson ${lessonId}:`, data),
        error => console.error(`Error updating note for student ${studentId} and lesson ${lessonId}:`, error)
      )
    );
  }

  /**
   * Batch update lesson notes
   */
  batchUpdateLessonNotes(request: LessonNoteBatchUpdateRequest): Observable<LessonNote[]> {
    const headers = this.getAuthHeaders();
    return this.http.post<LessonNote[]>(`${this.apiUrl}/batch-update`, request, { headers }).pipe(
      tap(
        data => console.log('Batch updated lesson notes:', data),
        error => console.error('Error batch updating lesson notes:', error)
      )
    );
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.tokenStorage.getToken()}`
    });
  }
}
