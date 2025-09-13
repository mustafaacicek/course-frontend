import { Routes } from '@angular/router';
import { VeliBilgilendirmeComponent } from './veli-bilgilendirme/veli-bilgilendirme.component';
import { StudentRankingsComponent } from './student-rankings/student-rankings.component';
import { LandingComponent } from './landing/landing.component';

export const PUBLIC_ROUTES: Routes = [
  {
    path: '',
    component: LandingComponent,
    title: 'Kuran Kursu'
  },
  {
    path: 'veli-bilgilendirme',
    component: VeliBilgilendirmeComponent,
    title: 'Veli Bilgilendirme Sistemi'
  },
  {
    path: 'ogrenci-siralamasi',
    component: StudentRankingsComponent,
    title: 'Öğrenci Başarı Sıralaması'
  }
];
