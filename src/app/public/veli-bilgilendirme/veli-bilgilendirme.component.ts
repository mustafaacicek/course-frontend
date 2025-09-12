import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-veli-bilgilendirme',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './veli-bilgilendirme.component.html',
  styleUrls: ['./veli-bilgilendirme.component.scss']
})
export class VeliBilgilendirmeComponent implements OnInit {
  nationalId: string = '';
  studentPerformance: any = null;
  loading: boolean = false;
  error: string | null = null;
  showResults: boolean = false;
  currentYear: number = new Date().getFullYear();
  activeTab: string = 'courses';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
  }

  searchStudent(): void {
    if (!this.nationalId || this.nationalId.length < 5) {
      this.error = 'Lütfen geçerli bir TC Kimlik Numarası giriniz.';
      return;
    }

    this.loading = true;
    this.error = null;
    this.showResults = false;

    this.http.get(`${environment.apiUrl}/public/students/performance/${this.nationalId}`)
      .subscribe({
        next: (data) => {
          this.studentPerformance = data;
          this.loading = false;
          this.showResults = true;
          console.log('Student performance data:', data);
        },
        error: (err) => {
          this.loading = false;
          this.error = 'Öğrenci bilgileri bulunamadı veya bir hata oluştu.';
          console.error('Error fetching student data:', err);
        }
      });
  }

  getPerformanceClass(level: string): string {
    switch (level) {
      case 'Mükemmel':
        return 'excellent';
      case 'Çok İyi':
        return 'very-good';
      case 'İyi':
        return 'good';
      case 'Orta':
        return 'average';
      default:
        return 'needs-improvement';
    }
  }

  getAttendanceClass(rate: number): string {
    if (rate >= 90) return 'excellent';
    if (rate >= 75) return 'very-good';
    if (rate >= 60) return 'good';
    if (rate >= 50) return 'average';
    return 'needs-improvement';
  }
  
  showTab(tabId: string): void {
    this.activeTab = tabId;
  }
}
