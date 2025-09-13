import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StudentRanking {
  id: number;
  firstName: string;
  lastName: string;
  nationalId: string;
  totalScore: number;
  averageScore: number;
  rank: number;
  courseLocationId?: number;
  courseLocationName?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RankingService {
  private apiUrl = `${environment.apiUrl}/public/rankings`;

  constructor(private http: HttpClient) { }

  getTopStudents(limit: number = 10): Observable<StudentRanking[]> {
    return this.http.get<StudentRanking[]>(`${this.apiUrl}/top-students?limit=${limit}`);
  }

  getTopStudentsByLocation(locationId: number, limit: number = 10): Observable<StudentRanking[]> {
    return this.http.get<StudentRanking[]>(`${this.apiUrl}/top-students/location/${locationId}?limit=${limit}`);
  }
}
