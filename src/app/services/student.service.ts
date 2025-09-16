import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { Student, StudentCreateRequest, StudentUpdateRequest } from '../models/student.models';
import { StudentDetail } from '../models/student-detail.model';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = `${environment.apiUrl}/students`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) { }

  getAllStudents(): Observable<Student[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Student[]>(this.apiUrl, { headers }).pipe(
      tap(
        data => console.log('Students data received:', data),
        error => console.error('Error fetching students:', error)
      )
    );
  }

  getStudentById(id: number): Observable<Student> {
    const headers = this.getAuthHeaders();
    return this.http.get<Student>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(
        data => console.log('Student data received:', data),
        error => console.error('Error fetching student:', error)
      )
    );
  }

  getStudentByNationalId(nationalId: string): Observable<Student> {
    const headers = this.getAuthHeaders();
    return this.http.get<Student>(`${this.apiUrl}/national-id/${nationalId}`, { headers }).pipe(
      tap(
        data => console.log('Student data received:', data),
        error => console.error('Error fetching student by national ID:', error)
      )
    );
  }

  createStudent(student: StudentCreateRequest): Observable<Student> {
    const headers = this.getAuthHeaders();
    return this.http.post<Student>(this.apiUrl, student, { headers }).pipe(
      tap(
        data => console.log('Student created:', data),
        error => console.error('Error creating student:', error)
      )
    );
  }

  updateStudent(id: number, student: StudentUpdateRequest): Observable<Student> {
    const headers = this.getAuthHeaders();
    return this.http.put<Student>(`${this.apiUrl}/${id}`, student, { headers }).pipe(
      tap(
        data => console.log('Student updated:', data),
        error => console.error('Error updating student:', error)
      )
    );
  }

  deleteStudent(id: number): Observable<void> {
    const headers = this.getAuthHeaders();
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(
        () => console.log('Student deleted successfully'),
        error => console.error('Error deleting student:', error)
      )
    );
  }
  
  getStudentAdminId(studentId: number): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get<any>(`${this.apiUrl}/${studentId}/admin`, { headers }).pipe(
      tap(
        data => console.log('Student admin details received:', data),
        error => console.error('Error fetching student admin details:', error)
      )
    );
  }
  
  /**
   * Get detailed information about a student including courses, lesson notes, and statistics
   */
  getStudentDetails(studentId: number): Observable<StudentDetail> {
    const headers = this.getAuthHeaders();
    return this.http.get<StudentDetail>(`${environment.apiUrl}/admin/students/${studentId}/details`, { headers }).pipe(
      tap(
        data => console.log('Student details received:', data),
        error => console.error('Error fetching student details:', error)
      )
    );
  }
  
  /**
   * Update teacher comment for a student
   */
  updateTeacherComment(studentId: number, teacherComment: string): Observable<StudentDetail> {
    const headers = this.getAuthHeaders();
    return this.http.put<StudentDetail>(`${this.apiUrl}/${studentId}/teacher-comment`, teacherComment, { headers }).pipe(
      tap(
        data => console.log('Teacher comment updated:', data),
        error => console.error('Error updating teacher comment:', error)
      )
    );
  }
  
  /**
   * Get students by location ID
   */
  getStudentsByLocationId(locationId: number): Observable<Student[]> {
    const headers = this.getAuthHeaders();
    return this.http.get<Student[]>(`${environment.apiUrl}/course-locations/${locationId}/students`, { headers }).pipe(
      tap(
        data => console.log('Students by location received:', data),
        error => console.error('Error fetching students by location:', error)
      )
    );
  }

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.tokenStorage.getToken()}`
    });
  }
}
