import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';

export interface User {
  id: number;
  username: string;
  role: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  createdAt: string | Date | any[];
  updatedAt: string | Date | any[];
  lastLoginAt?: string | Date | any[];
}

export interface UserCreateRequest {
  username: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'STUDENT';
}

export interface UserUpdateRequest {
  username?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: 'SUPERADMIN' | 'ADMIN' | 'STUDENT';
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) { }

  getAllUsers(): Observable<User[]> {
    console.log('Getting all users with token:', this.tokenStorage.getToken());
    const headers = this.getAuthHeaders();
    
    return this.http.get<User[]>(this.apiUrl, { headers }).pipe(
      tap(
        data => console.log('Users data received:', data),
        error => console.error('Error fetching users:', error)
      )
    );
  }

  getUserById(id: number): Observable<User> {
    console.log('Getting user by ID with token:', this.tokenStorage.getToken());
    const headers = this.getAuthHeaders();
    
    return this.http.get<User>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(
        data => console.log('User data received:', data),
        error => console.error('Error fetching user:', error)
      )
    );
  }

  createUser(user: UserCreateRequest): Observable<User> {
    console.log('Creating user with token:', this.tokenStorage.getToken());
    const headers = this.getAuthHeaders();
    
    return this.http.post<User>(this.apiUrl, user, { headers }).pipe(
      tap(
        data => console.log('User created:', data),
        error => console.error('Error creating user:', error)
      )
    );
  }

  updateUser(id: number, user: UserUpdateRequest): Observable<User> {
    console.log('Updating user with token:', this.tokenStorage.getToken());
    const headers = this.getAuthHeaders();
    
    return this.http.put<User>(`${this.apiUrl}/${id}`, user, { headers }).pipe(
      tap(
        data => console.log('User updated:', data),
        error => console.error('Error updating user:', error)
      )
    );
  }

  deleteUser(id: number): Observable<void> {
    console.log('Deleting user with token:', this.tokenStorage.getToken());
    const headers = this.getAuthHeaders();
    
    return this.http.delete<void>(`${this.apiUrl}/${id}`, { headers }).pipe(
      tap(
        () => console.log('User deleted successfully'),
        error => console.error('Error deleting user:', error)
      )
    );
  }
  
  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Authorization': `Bearer ${this.tokenStorage.getToken()}`
    });
  }
  
  getAdminUsers(): Observable<User[]> {
    const token = this.tokenStorage.getToken();
    console.log('Getting admin users with token:', token);
    
    if (!token) {
      console.error('No token available for admin users request');
      return new Observable(observer => {
        observer.error('No authentication token available');
      });
    }
    
    const headers = this.getAuthHeaders();
    console.log('Request headers:', headers);
    console.log('Request URL:', `${this.apiUrl}/admins`);
    
    return this.http.get<User[]>(`${this.apiUrl}/admins`, { headers }).pipe(
      tap(
        data => {
          console.log('Admin users data received:', data);
          if (data && data.length === 0) {
            console.warn('No admin users returned from API');
          }
        },
        error => {
          console.error('Error fetching admin users:', error);
          console.error('Error details:', error?.message, error?.status);
        }
      )
    );
  }
}
