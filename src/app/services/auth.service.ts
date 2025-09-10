import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { JwtAuthResponse, LoginRequest, UserRole } from '../models/auth.models';
import { TokenStorageService } from './token-storage.service';
import { environment } from '../../environments/environment';

const AUTH_API = `${environment.apiUrl}/auth/`;

const httpOptions = {
  headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorageService
  ) { }

  login(loginRequest: LoginRequest): Observable<JwtAuthResponse> {
    return this.http.post<JwtAuthResponse>(AUTH_API + 'login', loginRequest, httpOptions)
      .pipe(
        tap(response => {
          this.tokenStorage.saveToken(response.accessToken);
          this.tokenStorage.saveRefreshToken(response.refreshToken);
          this.tokenStorage.saveUser({
            id: response.userId,
            username: response.username,
            role: response.role
          });
        })
      );
  }

  register(username: string, password: string, role: UserRole): Observable<JwtAuthResponse> {
    return this.http.post<JwtAuthResponse>(AUTH_API + 'register', {
      username,
      password,
      role
    }, httpOptions);
  }

  refreshToken(token: string): Observable<JwtAuthResponse> {
    return this.http.post<JwtAuthResponse>(AUTH_API + 'refreshtoken', {
      refreshToken: token
    }, httpOptions);
  }

  isLoggedIn(): boolean {
    return !!this.tokenStorage.getToken();
  }

  logout(): void {
    this.tokenStorage.signOut();
  }

  isSuperAdmin(): boolean {
    const role = this.tokenStorage.getUserRole();
    return role === UserRole.SUPERADMIN;
  }

  isAdmin(): boolean {
    const role = this.tokenStorage.getUserRole();
    return role === UserRole.ADMIN;
  }

  isStudent(): boolean {
    const role = this.tokenStorage.getUserRole();
    return role === UserRole.STUDENT;
  }
  
  getUser(): any {
    return this.tokenStorage.getUser();
  }
}
