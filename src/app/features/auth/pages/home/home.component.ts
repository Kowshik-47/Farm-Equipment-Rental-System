import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class HomeComponent implements OnInit, OnDestroy {
  slides = [
    '/assets/Images/Slide-1.jpg',
    '/assets/Images/Slide-2.jpg',
    '/assets/Images/Slide-3.jpg',
    '/assets/Images/Slide-4.jpg'
  ];
  quotes = [
    'Take Your Machine any Time',
    'Get Machine on Time',
    'Genuine rent for Machine',
    'Ready Go'
  ];
  count = 0;
  tabs = ['Home', 'Machineries', 'Pricing', 'About'];
  activePane = 'Home';
  images = [
    { name: 'Sower', link: '/assets/Images/Equipments/Sower.png', desc: 'No-till seeder designed for planting a variety of crops with minimal soil disturbance.', price: 1200, index: 0 },
    { name: 'Fertilizer Sprayer', link: '/assets/Images/Equipments/FertilizerSprayer.png', desc: 'High-capacity self-propelled sprayer for efficient crop protection.', price: 1500, index: 1 },
    { name: 'Plougher', link: '/assets/Images/Equipments/plougher.png', desc: 'Heavy-duty plow designed for deep tillage and soil preparation.', price: 800, index: 2 },
    { name: 'Wheat Harvester', link: '/assets/Images/Equipments/wheat-harvester.png', desc: 'High-capacity combine harvester designed for efficient Wheat harvesting.', price: 3000, index: 3 },
    { name: 'Bale Lifter', link: '/assets/Images/Equipments/bale-lifter.png', desc: 'Equipment to lift and load bales efficiently and easily.', price: 2000, index: 4 },
    { name: 'Bale Loader', link: '/assets/Images/Equipments/bale-loader.png', desc: 'Huge Capacity Bale Loader for Loading Bales for your Farm', price: 1700, index: 5 },
    { name: 'Corn Chopper', link: '/assets/Images/Equipments/corn-chopper.png', desc: 'Latest Technology Integrated Corn Chopper for Better Corn Sileage', price: 5000, index: 6 },
    { name: 'Cotton Harvester', link: '/assets/Images/Equipments/cotton-harvester.png', desc: 'High Performance Harvester for perfect cotton harvesting', price: 4600, index: 7 },
    { name: 'Loader Wagon', link: '/assets/Images/Equipments/loader-wagon.jpg', desc: 'Huge Capacity Forage Loader for Loading forage to your Farm', price: 3300, index: 8 },
    { name: 'Mower', link: '/assets/Images/Equipments/mower.png', desc: 'Wide Blade Mower for mowing the grasses to feed your cattles.', price: 2800, index: 9 },
    { name: 'Slurry Sprayer', link: '/assets/Images/Equipments/slurry.png', desc: 'High Capacity Slurry sprayer for mannuring the fields', price: 2500, index: 10 },
    { name: 'Sugar Harvester', link: '/assets/Images/Equipments/sugar-harvester.png', desc: 'Heavy-duty harvester for unstoppable Sugar production', price: 4000, index: 11 },
    { name: 'Tedder', link: '/assets/Images/Equipments/tedder.png', desc: 'Wide sized tedder for make dry your farm feed forages', price: 2300, index: 12 },
    { name: 'Trailer', link: '/assets/Images/Equipments/trailer.png', desc: 'High Capacity trailer for transportation and distribution', price: 1000, index: 13 },
    { name: 'Baler', link: '/assets/Images/Equipments/baler.png', desc: 'Big Baller for baling grasses and hay for your dairy farm', price: 3500, index: 14 },
    { name: 'Corn Harvester', link: '/assets/Images/Equipments/corn-harvester.png', desc: 'Huge Capacity Harvester for reliable corn harvesting', price: 4200, index: 15 },
    { name: 'Tiller', link: '/assets/Images/Equipments/Tiller.png', desc: 'Large Tiller for tilling the soil to make it better for cultivation', price: 1000, index: 16 },
    { name: 'Harrower', link: '/assets/Images/Equipments/harrower.png', desc: 'Sharp bladed harrower for cultivate the field', price: 800, index: 17 }
  ];
  testimonials = [
    { name: 'Mark Henry', text: 'I’ve been using AgroEquip for several years now, and I can’t recommend them enough. Their equipment is reliable, and the rental process is seamless.' },
    { name: 'Trampez Sher Khan', text: 'As a new farmer, I was overwhelmed by the thought of purchasing equipment. Renting from AgroEquip has been a perfect solution.' },
    { name: 'James Clinton', text: 'I love the seasonal promotions offered by AgroEquip. It allows me to rent high-quality equipment at a fraction of the cost.' },
    { name: 'David Miller', text: 'Renting equipment from AgroEquip has been a game-changer for my farm. The process was simple, and the staff was incredibly helpful in guiding me through the options.' }
  ];
  isBrowser: boolean;
  private intervalId: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private router: Router,
    private authService: AuthService
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
  }

  ngOnInit() {
    if (this.isBrowser) {
      this.intervalId = setInterval(() => this.changeImage(), 3000);
    }
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  changeImage() {
    this.count = (this.count + 1) % 4;
  }

  nextSlide() {
    this.count = (this.count + 1) % 4;
  }

  prevSlide() {
    this.count = (this.count - 1 + 4) % 4;
  }

  signUp() {
    console.log('SignUp button clicked');
    this.router.navigate(['/auth/register']);
  }

  changePane(pane: string) {
    this.activePane = pane;
  }

  onImageError(event: Event) {
    console.error('Image failed to load:', (event.target as HTMLImageElement).src);
  }

  login(){
    this.router.navigate(['/auth/login']);
  }
}