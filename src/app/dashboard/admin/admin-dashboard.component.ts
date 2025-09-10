import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.scss']
})
export class AdminDashboardComponent {
  // Dashboard stats
  courseCount: number = 12;
  studentCount: number = 48;
  lessonCount: number = 36;
  noteCount: number = 124;

  // Recent activities
  recentActivities = [
    { type: 'add', text: 'Yeni öğrenci eklendi: Ahmet Yılmaz', time: 'Bugün, 14:30' },
    { type: 'edit', text: 'Ders notu güncellendi: Matematik 101', time: 'Bugün, 11:15' },
    { type: 'create', text: 'Yeni kurs oluşturuldu: İngilizce Konuşma', time: 'Dün, 16:45' }
  ];
}
