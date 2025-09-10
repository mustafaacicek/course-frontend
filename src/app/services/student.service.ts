import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';
import { Student, StudentCreateRequest, StudentUpdateRequest } from '../models/student.models';

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

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.tokenStorage.getToken()}`
    });
  }
}
