import { Routes } from '@angular/router';
import { VeliBilgilendirmeComponent } from './veli-bilgilendirme/veli-bilgilendirme.component';

export const PUBLIC_ROUTES: Routes = [
  {
    path: 'veli-bilgilendirme',
    component: VeliBilgilendirmeComponent,
    title: 'Veli Bilgilendirme Sistemi'
  }
];
