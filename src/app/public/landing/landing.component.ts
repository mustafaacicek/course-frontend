import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

interface NewsItem {
  id: number;
  title: string;
  date: string;
  summary: string;
  imageUrl: string;
}

interface GalleryItem {
  id: number;
  title: string;
  imageUrl: string;
  description: string;
}

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss']
})
export class LandingComponent {
  currentYear = new Date().getFullYear();
  mobileMenuOpen = false;
  
  // Dummy data for news
  newsItems: NewsItem[] = [
    {
      id: 1,
      title: 'Yaz Kuran Kursu Kayıtları Başladı',
      date: '10 Haziran 2025',
      summary: 'Yaz dönemi Kuran kurslarımız için kayıtlar başlamıştır. Çocuklarınızın dini eğitimlerini desteklemek için bu fırsatı kaçırmayın.',
      imageUrl: 'assets/images/news/news1.jpg'
    },
    {
      id: 2,
      title: 'Hafızlık Programı Mezuniyet Töreni',
      date: '5 Haziran 2025',
      summary: 'Hafızlık programımızı başarıyla tamamlayan öğrencilerimiz için düzenlenen mezuniyet töreni büyük bir coşkuyla gerçekleştirildi.',
      imageUrl: 'assets/images/news/news2.jpg'
    },
    {
      id: 3,
      title: 'Ramazan Ayı Etkinlikleri',
      date: '1 Haziran 2025',
      summary: 'Ramazan ayı boyunca kursumuzda gerçekleştirilecek olan iftar programları, mukabele ve teravih namazları hakkında bilgilendirme.',
      imageUrl: 'assets/images/news/news3.jpg'
    }
  ];
  
  // Dummy data for gallery
  galleryItems: GalleryItem[] = [
    {
      id: 1,
      title: 'İstanbul Merkez Kursumuz',
      imageUrl: 'assets/images/gallery/gallery1.jpg',
      description: 'Modern eğitim imkanları sunan İstanbul merkez kursumuz'
    },
    {
      id: 2,
      title: 'Ankara Kursumuz',
      imageUrl: 'assets/images/gallery/gallery2.jpg',
      description: 'Geniş bahçesi ve ferah sınıflarıyla Ankara kursumuz'
    },
    {
      id: 3,
      title: 'İzmir Kursumuz',
      imageUrl: 'assets/images/gallery/gallery3.jpg',
      description: 'Deniz manzaralı İzmir kursumuz'
    },
    {
      id: 4,
      title: 'Hafızlık Sınıfımız',
      imageUrl: 'assets/images/gallery/gallery4.jpg',
      description: 'Hafızlık eğitimi için özel olarak tasarlanmış sınıfımız'
    }
  ];
  
  // Testimonials
  testimonials = [
    {
      id: 1,
      name: 'Ahmet Yılmaz',
      role: 'Veli',
      comment: 'Çocuğumun aldığı eğitimden çok memnunum. Öğreticiler çok ilgili ve sabırlı.',
      imageUrl: 'assets/images/testimonials/testimonial1.jpg'
    },
    {
      id: 2,
      name: 'Ayşe Kaya',
      role: 'Veli',
      comment: 'Kursunuzun sunduğu imkanlar ve eğitim kalitesi gerçekten çok iyi. Teşekkür ederiz.',
      imageUrl: 'assets/images/testimonials/testimonial2.jpg'
    },
    {
      id: 3,
      name: 'Mehmet Demir',
      role: 'Öğrenci',
      comment: 'Burada aldığım eğitim hayatımı değiştirdi. Hocalarımıza minnettarım.',
      imageUrl: 'assets/images/testimonials/testimonial3.jpg'
    }
  ];
  
  // Features
  features = [
    {
      icon: 'fa-book-quran',
      title: 'Kuran-ı Kerim Eğitimi',
      description: 'Tecvid kurallarına uygun Kuran-ı Kerim okuma ve anlama eğitimi'
    },
    {
      icon: 'fa-pray',
      title: 'İbadet Eğitimi',
      description: 'Namaz, oruç ve diğer ibadetlerin uygulamalı eğitimi'
    },
    {
      icon: 'fa-mosque',
      title: 'Değerler Eğitimi',
      description: 'İslami ahlak ve değerler eğitimi'
    },
    {
      icon: 'fa-hands-helping',
      title: 'Sosyal Etkinlikler',
      description: 'Öğrencilerin sosyal gelişimini destekleyen etkinlikler'
    }
  ];
  
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      // Mobil menüyü kapat
      this.mobileMenuOpen = false;
    }
  }
  
  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
