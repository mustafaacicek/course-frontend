import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { RankingService, StudentRanking } from '../../services/ranking.service';

@Component({
  selector: 'app-student-rankings',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './student-rankings.component.html',
  styleUrls: ['./student-rankings.component.scss']
})
export class StudentRankingsComponent implements OnInit {
  topStudents: StudentRanking[] = [];
  locationStudents: StudentRanking[] = [];
  loading: boolean = false;
  locationLoading: boolean = false;
  error: string | null = null;
  locationError: string | null = null;
  selectedLocationId: number | null = null;
  locations: { id: number, name: string }[] = [
    { id: 1, name: 'İstanbul Merkez' },
    { id: 2, name: 'Ankara Merkez' },
    { id: 3, name: 'İzmir Merkez' }
  ];
  limit: number = 10;

  constructor(private rankingService: RankingService) { }

  ngOnInit(): void {
    this.loadTopStudents();
  }

  loadTopStudents(): void {
    this.loading = true;
    this.error = null;
    
    this.rankingService.getTopStudents(this.limit).subscribe({
      next: (data) => {
        this.topStudents = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Öğrenci sıralaması yüklenirken bir hata oluştu.';
        this.loading = false;
        console.error('Sıralama yükleme hatası:', err);
      }
    });
  }

  loadLocationStudents(): void {
    if (!this.selectedLocationId) return;
    
    this.locationLoading = true;
    this.locationError = null;
    
    this.rankingService.getTopStudentsByLocation(this.selectedLocationId, this.limit).subscribe({
      next: (data) => {
        this.locationStudents = data;
        this.locationLoading = false;
      },
      error: (err) => {
        this.locationError = 'Lokasyon bazlı öğrenci sıralaması yüklenirken bir hata oluştu.';
        this.locationLoading = false;
        console.error('Lokasyon sıralaması yükleme hatası:', err);
      }
    });
  }

  onLocationChange(): void {
    if (this.selectedLocationId) {
      this.loadLocationStudents();
    } else {
      this.locationStudents = [];
    }
  }

  onLimitChange(): void {
    this.loadTopStudents();
    if (this.selectedLocationId) {
      this.loadLocationStudents();
    }
  }

  getSelectedLocationName(): string {
    const location = this.locations.find(loc => loc.id === this.selectedLocationId);
    return location ? location.name : '';
  }
}
