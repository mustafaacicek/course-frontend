import {
  HttpRequest,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpErrorResponse
} from '@angular/common/http';
import { inject } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { TokenStorageService } from '../services/token-storage.service';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn) => {
  const tokenService = inject(TokenStorageService);
  const authService = inject(AuthService);
  
  let authReq = req;
  const token = tokenService.getToken();
  
  if (token != null) {
    authReq = addTokenHeader(req, token);
  }

  return next(authReq).pipe(
    catchError(error => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        return handle401Error(authReq, next, tokenService, authService);
      }
      return throwError(() => error);
    })
  );
};

// Use module-level variables to maintain state between requests
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>(null);

function handle401Error(
  request: HttpRequest<any>, 
  next: HttpHandlerFn,
  tokenService: TokenStorageService,
  authService: AuthService
): Observable<any> {
  if (!isRefreshing) {
    isRefreshing = true;
    refreshTokenSubject.next(null);

    const refreshToken = tokenService.getRefreshToken();

    if (refreshToken) {
      return authService.refreshToken(refreshToken).pipe(
        switchMap(token => {
          isRefreshing = false;
          tokenService.saveToken(token.accessToken);
          refreshTokenSubject.next(token.accessToken);
          
          return next(addTokenHeader(request, token.accessToken));
        }),
        catchError((err) => {
          isRefreshing = false;
          tokenService.signOut();
          return throwError(() => err);
        })
      );
    }
  }

  return refreshTokenSubject.pipe(
    filter(token => token !== null),
    take(1),
    switchMap(token => next(addTokenHeader(request, token)))
  );
}

function addTokenHeader(request: HttpRequest<any>, token: string) {
  return request.clone({
    headers: request.headers.set('Authorization', `Bearer ${token}`)
  });
}
